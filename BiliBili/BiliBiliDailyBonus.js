/*
 * 哔哩哔哩每日任务脚本
 * 环境变量配置说明：
 * 环境变量名称：BILIBILI_COOKIE
 * 作用：存储哔哩哔哩账号的 COOKIE 信息，用于身份验证和任务执行
 * 支持格式：
 *   1. 纯 COOKIE 字符串
 *      格式：DedeUserID=xxx; SESSDATA=xxx; bili_jct=xxx; ...
 *   2. JSON 格式字符串（包含 cookieStr 字段）
 *      格式：{"cookieStr": "DedeUserID=xxx; SESSDATA=xxx; bili_jct=xxx; ...", ...}
 *      原始抓取值示例：{"_uuid":"xxxxx","b_nut":"xxxx","buvid3":"XXXXXX","buvid4":"XXXXX","buvid_fp":"XXXXX","DedeUserID":"XXXX","DedeUserID__ckMd5":"XXXXX","SESSDATA":"XXXXX","bili_jct":"XXXXXX","sid":"XXXXXX"},"cookieStr":"XXXXX; DedeUserID__ckMd5=XXXXXX; SESSDATA=XXXXXX; bili_jct=XXXXX; sid=XXXXX","key":"XXXXXXX","user":{},"watch":{},"share":{},"coins":{},"score":{}}
 * 获取方式：登录 bilibili.com 后，使用浏览器开发者工具（F12 -> Network），刷新页面，复制请求头中的 Cookie 字段内容，或直接复制完整 JSON 数据（如果提供）。
 * 配置注意：在青龙面板或其他运行环境中设置 BILIBILI_COOKIE 时，确保值无多余引号或格式错误。如果使用 JSON 格式，脚本会自动从中提取 cookieStr 字段作为有效 COOKIE 字符串。
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 引入青龙通知模块
let notify;
try {
    notify = require('./sendNotify');
    console.log("通知模块加载成功");
} catch (error) {
    console.error("无法加载通知模块，通知功能将不可用", error);
    notify = {
        sendNotify: async (title, content) => {
            console.log(`通知未发送（模块未加载）：${title} - ${content}`);
        }
    };
}

// 数据文件路径
const dataFilePath = './bilibili_data.json';

// 确保数据文件目录存在
if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
}

// 日志记录函数
function log(message) {
    console.log(message);
}

// 错误日志记录函数
function logError(message, error) {
    console.error(`错误: ${message}`, error);
}

// 将对象转为查询字符串
function queryString(obj) {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join('&');
}

// 获取当前时间戳（秒）
function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// 获取格式化时间
function getFormattedTime() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

// 从文件读取数据
function getData(key, defaultValue = {}) {
    try {
        if (fs.existsSync(dataFilePath)) {
            const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
            return data[key] || defaultValue;
        }
    } catch (error) {
        logError("读取数据文件失败", error);
    }
    return defaultValue;
}

// 将数据写入文件
function setData(key, value) {
    try {
        let data = {};
        if (fs.existsSync(dataFilePath)) {
            data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        }
        data[key] = value;
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        logError("写入数据文件失败", error);
        return false;
    }
}

// 将 COOKIE 字符串转为对象
function cookieStringToObject(cookieStr) {
    const obj = {};
    cookieStr.split("; ").forEach(val => {
        const [key, value] = val.split("=");
        if (key && value) obj[key] = value;
    });
    return obj;
}

// 从环境变量获取 COOKIE
function getCookieFromEnv() {
    let cookieStr = process.env.BILIBILI_COOKIE || '';
    if (!cookieStr) {
        log("未找到环境变量 BILIBILI_COOKIE，请配置后再运行脚本");
        throw new Error("未配置 COOKIE");
    }
    // 尝试解析 JSON 格式的 COOKIE 数据，增加容错性
    try {
        if (cookieStr.startsWith('{') || cookieStr.includes('cookieStr')) {
            const parsed = JSON.parse(cookieStr);
            if (parsed.cookieStr) {
                cookieStr = parsed.cookieStr;
                log("从 JSON 格式中提取 COOKIE 字符串");
            } else {
                log("JSON 格式中未找到 cookieStr 字段，使用原始值");
            }
        }
    } catch (error) {
        log("环境变量格式可能不是 JSON，使用原始值", error.message);
    }
    log("从环境变量成功加载 COOKIE");
    return { cookieStr, cookieObj: cookieStringToObject(cookieStr) };
}

// 全局配置
let config = {
    cookieStr: "",
    cookieObj: {},
    user: {},
    tasks: {
        watch: { num: 0, time: "" },
        share: { num: 0, time: "" },
        coins: { num: 0, time: "" }
    }
};
let videos = [];

// 检查任务是否需要执行
function shouldExecuteTask(taskKey) {
    const task = config.tasks[taskKey];
    const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
    return !task.time || task.num === 0 || today > task.time.split(' ')[0];
}

// 检查任务是否全部完成
function areTasksCompleted() {
    return config.tasks.watch.num > 0 && config.tasks.share.num > 0 && config.tasks.coins.num >= 50;
}

// HTTP 请求封装
async function httpRequest(options) {
    try {
        const response = await axios({
            url: options.url,
            method: options.method || 'GET',
            headers: options.headers || {},
            data: options.body || null
        });
        return response.data;
    } catch (error) {
        logError(`请求失败: ${options.url}`, error.message);
        throw error;
    }
}

// 主程序
async function main() {
    log("=== 哔哩哔哩每日任务脚本开始运行 ===");
    log(`时间: ${getFormattedTime()}`);

    try {
        // 加载 COOKIE
        const { cookieStr, cookieObj } = getCookieFromEnv();
        config.cookieStr = cookieStr;
        config.cookieObj = cookieObj;

        // 加载历史数据
        const savedConfig = getData("bilibili_tasks", config);
        config = { ...config, ...savedConfig };

        // 获取用户信息
        const userValid = await getUserInfo();
        if (!userValid) {
            log("用户验证失败，脚本结束");
            await notify.sendNotify('哔哩哔哩每日任务失败', '用户验证失败，可能是 COOKIE 无效');
            return;
        }

        // 检查任务状态
        await checkTaskStatus();

        // 设置投币次数（默认5次）
        const maxCoinTimes = 5;
        const remainingCoinTimes = Math.max(0, maxCoinTimes - (config.tasks.coins.num / 10));

        // 执行每日任务
        if (shouldExecuteTask("watch") || shouldExecuteTask("share") || remainingCoinTimes > 0) {
            await getVideoList();
            if (videos.length > 0) {
                const video = videos[Math.floor(Math.random() * videos.length)];
                const videoData = JSON.parse(video.card || "{}");
                const bvid = video.desc?.bvid || "";
                const aid = video.desc?.rid || 0;
                const cid = videoData.cid || 0;

                // 观看任务
                if (shouldExecuteTask("watch")) {
                    await watchVideo(aid, bvid, cid);
                }

                // 分享任务
                if (shouldExecuteTask("share")) {
                    const shortLink = encodeURIComponent(videoData.short_link_v2?.replace(/\\\//g, '/') || "");
                    await shareVideo(aid, cid, shortLink);
                }

                // 投币任务
                if (remainingCoinTimes > 0) {
                    log("开始执行投币任务");
                    for (let i = 0; i < remainingCoinTimes; i++) {
                        if (config.user.money < 1) {
                            log("硬币不足，无法继续投币");
                            break;
                        }
                        await throwCoin(aid, bvid);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒避免频繁请求
                    }
                }
            } else {
                log("获取视频列表失败，无法执行任务");
            }
        } else {
            log("今日任务已完成，无需重复执行");
        }

        // 保存数据
        setData("bilibili_tasks", config);

        // 输出任务总结并发送通知
        log("=== 任务总结 ===");
        log(`用户: ${config.user.uname || "未知"}`);
        log(`观看任务: ${config.tasks.watch.num > 0 ? "已完成" : "未完成"} (${config.tasks.watch.time || "无记录"})`);
        log(`分享任务: ${config.tasks.share.num > 0 ? "已完成" : "未完成"} (${config.tasks.share.time || "无记录"})`);
        log(`投币任务: 已投 ${config.tasks.coins.num / 10} 次 (${config.tasks.coins.time || "无记录"})`);
        log("=== 哔哩哔哩每日任务脚本运行结束 ===");

        // 发送通知
        const isCompleted = areTasksCompleted();
        const notifyTitle = '哔哩哔哩每日任务结果';
        const notifyContent = `用户: ${config.user.uname || "未知"}\n` +
                              `任务状态: ${isCompleted ? "✅ 全部完成" : "❌ 未全部完成"}\n` +
                              `观看: ${config.tasks.watch.num > 0 ? "已完成" : "未完成"} (${config.tasks.watch.time || "无记录"})\n` +
                              `分享: ${config.tasks.share.num > 0 ? "已完成" : "未完成"} (${config.tasks.share.time || "无记录"})\n` +
                              `投币: 已投 ${config.tasks.coins.num / 10} 次 (${config.tasks.coins.time || "无记录"})`;
        await notify.sendNotify(notifyTitle, notifyContent);
    } catch (error) {
        logError("脚本运行过程中发生错误", error);
        await notify.sendNotify('哔哩哔哩每日任务失败', `脚本运行错误: ${error.message}`);
    }
}

// 获取用户信息
async function getUserInfo() {
    log("获取用户信息...");
    try {
        const response = await httpRequest({
            url: 'https://api.bilibili.com/x/web-interface/nav',
            headers: { "Cookie": config.cookieStr }
        });
        if (response.code === 0 && response.data) {
            config.user = response.data;
            log(`用户: ${config.user.uname}, ID: ${config.user.mid}`);
            log(`等级: ${config.user.level_info.current_level}, 经验: ${config.user.level_info.current_exp}/${config.user.level_info.next_exp}`);
            log(`硬币余额: ${Math.floor(config.user.money || 0)}`);
            return true;
        } else {
            log("获取用户信息失败，可能是 COOKIE 无效");
            return false;
        }
    } catch (error) {
        logError("获取用户信息失败", error);
        return false;
    }
}

// 检查任务状态
async function checkTaskStatus() {
    log("检查任务状态...");
    try {
        const response = await httpRequest({
            url: 'https://api.bilibili.com/x/member/web/exp/reward',
            headers: { "Cookie": config.cookieStr }
        });
        if (response.code === 0) {
            config.tasks.watch.num = response.data.watch ? 1 : 0;
            config.tasks.share.num = response.data.share ? 1 : 0;
            config.tasks.coins.num = response.data.coins || 0;

            const currentDate = getFormattedTime();
            if (!config.tasks.watch.time && response.data.watch) config.tasks.watch.time = currentDate;
            if (!config.tasks.share.time && response.data.share) config.tasks.share.time = currentDate;
            if (!config.tasks.coins.time && response.data.coins > 0) config.tasks.coins.time = currentDate;

            log(`观看任务状态: ${response.data.watch ? "已完成" : "未完成"}`);
            log(`分享任务状态: ${response.data.share ? "已完成" : "未完成"}`);
            log(`投币任务状态: 已投 ${response.data.coins / 10} 次`);
        } else {
            log("检查任务状态失败: " + (response.message || "未知错误"));
        }
    } catch (error) {
        logError("检查任务状态失败", error);
    }
}

// 获取视频列表
async function getVideoList() {
    log("获取视频列表...");
    try {
        const uid = config.cookieObj.DedeUserID || 0;
        const response = await httpRequest({
            url: `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?uid=${uid}&type_list=8&from=&platform=web`,
            headers: { "Cookie": config.cookieStr }
        });
        if (response.data && response.data.cards) {
            videos = response.data.cards;
            log(`成功获取视频列表，数量: ${videos.length}`);
        } else {
            log("获取视频列表失败");
        }
    } catch (error) {
        logError("获取视频列表失败", error);
    }
}

// 观看视频
async function watchVideo(aid, bvid, cid) {
    log(`执行观看任务 (视频ID: ${bvid})...`);
    try {
        const body = {
            aid,
            cid,
            bvid,
            mid: config.user.mid || 0,
            csrf: config.cookieObj.bili_jct || "",
            played_time: 1,
            real_played_time: 1,
            realtime: 1,
            start_ts: getTimestamp(),
            type: 3,
            dt: 2,
            play_type: 0,
            from_spmid: 0,
            spmid: 0,
            auto_continued_play: 0,
            refer_url: "https%3A%2F%2Ft.bilibili.com%2F",
            bsource: ""
        };
        const response = await httpRequest({
            url: 'https://api.bilibili.com/x/click-interface/web/heartbeat',
            method: 'POST',
            headers: {
                "Cookie": config.cookieStr,
                "Referrer": `https://www.bilibili.com/video/${bvid}`
            },
            body: queryString(body)
        });
        if (response.code === 0) {
            config.tasks.watch.num = 1;
            config.tasks.watch.time = getFormattedTime();
            log("观看任务完成");
        } else {
            log("观看任务失败: " + (response.message || "未知错误"));
        }
    } catch (error) {
        logError("观看任务失败", error);
    }
}

// 分享视频
async function shareVideo(aid, cid, shortLink) {
    log("执行分享任务...");
    try {
        const body = {
            aid,
            cid,
            share_source: "PC_WEB",
            share_target_id: shortLink,
            share_title: encodeURIComponent("哔哩哔哩"),
            share_subtitle: encodeURIComponent("我在哔哩哔哩发现一个不错的视频，分享给你看看～"),
            share_cover: "",
            from: "dynamic",
            share_type: 1,
            share_channel: "COPY",
            share_key: getTimestamp() + Math.random().toString(36).substr(2, 15),
            ts: getTimestamp(),
            platform: "pc",
            buvid: config.cookieObj.buvid3 || "unknown",
            mid: config.user.mid || 0,
            guest_mid: 0,
            biz_type: 0,
            page_type: 9,
            app_key: "",
            build: 0,
            mobi_app: "web",
            share_from: "",
            share_from_mid: 0,
            share_from_uname: "",
            topic_id: 0,
            share_from_extra: "",
            csrf: config.cookieObj.bili_jct || ""
        };
        const response = await httpRequest({
            url: 'https://api.bilibili.com/x/web-interface/share/add',
            method: 'POST',
            headers: {
                "Cookie": config.cookieStr,
                "Referrer": "https://t.bilibili.com/"
            },
            body: queryString(body)
        });
        if (response.code === 0) {
            config.tasks.share.num = 1;
            config.tasks.share.time = getFormattedTime();
            log("分享任务完成");
        } else {
            log("分享任务失败: " + (response.message || "未知错误"));
        }
    } catch (error) {
        logError("分享任务失败", error);
    }
}

// 投币
async function throwCoin(aid, bvid) {
    log(`执行投币任务 (视频ID: ${bvid})...`);
    try {
        const body = {
            aid,
            bvid,
            multiply: 1,
            select_like: 1,
            cross_domain: true,
            csrf: config.cookieObj.bili_jct || ""
        };
        const response = await httpRequest({
            url: 'https://api.bilibili.com/x/web-interface/coin/add',
            method: 'POST',
            headers: {
                "Cookie": config.cookieStr,
                "Referrer": `https://www.bilibili.com/video/${bvid}`
            },
            body: queryString(body)
        });
        if (response.code === 0) {
            config.tasks.coins.num += 10; // 每次投币记为10经验
            config.tasks.coins.time = getFormattedTime();
            config.user.money -= 1; // 投币减少硬币余额
            log("投币成功");
        } else {
            log("投币失败: " + (response.message || "未知错误"));
        }
    } catch (error) {
        logError("投币任务失败", error);
    }
}

// 运行主程序
main();
