const $ = new Env("蜜雪冰城");
const CK_NAME = "mxbc_data";
const BASE_URL = "https://mxsa.mxbc.net";
const ACTIVITY_HOST = "76177.activity-12.m.duiba.com.cn";

/**
 * 核心配置
 */
const config = {
    notify: $.isNode() ? require('./sendNotify') : '',
    isDebug: ($.isNode() ? process.env.IS_DEBUG : $.getdata('is_debug')) === 'true',
    userCookies: $.toObj($.isNode() ? process.env[CK_NAME] : $.getdata(CK_NAME)) || [],
    statusIcons: { "true": "✅", "false": "⛔️" },
    headers: {
        app: "mxbc",
        appchannel: "xiaomi",
        appversion: "3.0.3",
        "Access-Token": "",
        Host: "mxsa.mxbc.net",
        "User-Agent": "okhttp/4.4.1"
    },
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCtypUdHZJKlQ9L...（完整私钥）`
};

/**
 * HTTP请求封装
 */
const http = {
    async request(options) {
        try {
            if (typeof options === 'string') options = { url: options };
            
            // 处理URL
            options.url = options.url.startsWith('/') 
                ? `${BASE_URL}${options.url}`
                : options.url;

            // 合并请求头
            options.headers = { ...config.headers, ...options.headers };
            
            // 发送请求
            const response = await Request({
                ...options,
                headers: options.headers,
                timeout: 10000
            });

            debugLog(response, options.url);
            return response;
        } catch (error) {
            handleError(`请求失败: ${error.message}`);
            return null;
        }
    },

    get(url, params) {
        return this.request({ url, method: 'GET', params });
    },

    post(url, data) {
        return this.request({ url, method: 'POST', body: data });
    }
};

/**
 * 核心业务逻辑
 */
class MXBCService {
    constructor(user) {
        this.user = user;
        this.session = null;
    }

    // 用户初始化
    async init() {
        config.headers["Access-Token"] = this.user.token;
        if (!await this.checkStatus()) return false;
        
        const { point: initialPoints } = await this.getUserInfo();
        await this.executeSignIn();
        await this.handleActivityFlow();
        
        const { userName, point: finalPoints } = await this.getUserInfo();
        this.logResult(userName, initialPoints, finalPoints);
        return true;
    }

    // 执行签到
    async executeSignIn() {
        const params = this.generateBaseParams();
        const res = await http.post('/api/v1/customer/signin', params);
        
        if (![0, 5020].includes(res?.code)) {
            throw new Error(`签到失败: ${res?.msg}`);
        }
        
        const message = res.data?.ruleValuePoint 
            ? `获得${res.data.ruleValuePoint}雪王币`
            : res.msg;
        this.log(`签到: ${config.statusIcons[res.code === 0]} ${message}`);
    }

    // 处理活动流程
    async handleActivityFlow() {
        const loginUrl = await this.getLoginUrl();
        await this.obtainActivityToken(loginUrl);
        await this.accessActivityShop();
    }

    // 获取用户信息
    async getUserInfo() {
        const params = this.generateBaseParams();
        const res = await http.post('/api/v1/customer/info', params);
        
        return {
            userName: res.data.mobilePhone,
            point: res.data.customerPoint,
            level: res.data.customerLevel
        };
    }

    // 工具方法
    generateBaseParams() {
        const timestamp = Date.now().toString();
        const query = `appId=d82be6bbc1da11eb9dd000163e122ecb&t=${timestamp}`;
        
        return {
            appId: "d82be6bbc1da11eb9dd000163e122ecb",
            t: timestamp,
            sign: this.generateSignature(query)
        };
    }

    generateSignature(content) {
        const { KEYUTIL, KJUR, hextob64u } = loadCryptoModules();
        const key = KEYUTIL.getKey(config.privateKey);
        const signature = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
        
        signature.init(key);
        signature.updateString(content);
        return hextob64u(signature.sign());
    }

    // 日志处理
    log(message) {
        $.log(message);
        $.notifyMsg.push(message);
    }

    logResult(userName, initial, final) {
        const gained = final - initial;
        this.log(`用户 ${userName} 本次获得雪王币: ${gained}`);
        this.log(`当前余额: ${final} 雪王币`);
    }
}

/**
 * 工具函数
 */
function loadCryptoModules() {
    // 实现模块加载逻辑（保持原有核心逻辑）
    // ...
}

function handleError(message) {
    $.ckStatus = false;
    $.log(`⛔️ ${message}`);
    $.notifyMsg.push(message);
}

function debugLog(data, tag = 'DEBUG') {
    if (config.isDebug) {
        console.log(`\n----- ${tag} -----`);
        console.log(typeof data === 'string' ? data : JSON.stringify(data));
        console.log(`----- ${tag} -----\n`);
    }
}

/**
 * 主程序入口
 */
!(async () => {
    try {
        if (typeof $request !== 'undefined') {
            // 处理Cookie获取逻辑
            // ...
            return;
        }

        await loadCryptoModules();
        
        if (!config.userCookies.length) {
            throw new Error("未找到有效账户信息");
        }

        $.log(`检测到 ${config.userCookies.length} 个账户`);
        
        for (const [index, user] of config.userCookies.entries()) {
            $.log(`\n🚀 开始处理用户: ${user.userName || index + 1}`);
            const service = new MXBCService(user);
            await service.init();
        }
    } catch (error) {
        handleError(`主程序错误: ${error.message}`);
    } finally {
        $.done({ ok: 1 });
    }
})();
