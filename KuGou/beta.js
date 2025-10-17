/**
 * KuGou 去广告整合脚本（安全版）
 * 兼容 Loon / Surge / Quantumult X
 * 功能：
 * 1. 去广告（首页、开屏、搜索框、应用内等）
 * 2. IP 位置伪装（可通过参数 city/province/adcode）
 * 3. 支持简写城市名（如“北京”自动补全省份和adcode）
 * 4. 安全处理非 JSON 响应
 * 5. 递归深度保护
 */

const url = $request.url;
let body = $response.body;

// ===== 参数处理 =====
let args = {};
if (typeof $argument !== 'undefined' && $argument) {
  if ($argument.includes('=')) {
    try { args = Object.fromEntries(new URLSearchParams($argument)); } catch {}
  } else {
    args.city = $argument.trim();
  }
}

// 城市映射表
const cityMap = {
  "北京": ["北京市", "110000"],
  "上海": ["上海市", "310000"],
  "广州": ["广东省", "440100"],
  "深圳": ["广东省", "440300"],
  "杭州": ["浙江省", "330100"],
  "成都": ["四川省", "510100"],
  "南京": ["江苏省", "320100"],
  "武汉": ["湖北省", "420100"],
  "重庆": ["重庆市", "500000"],
  "西安": ["陕西省", "610100"]
};

// 默认值
let province = args.province || "上海市";
let city = args.city || "上海";
let adcode = args.adcode || "310000";

// 简写城市自动补全
if (args.city && cityMap[args.city]) {
  [province, adcode] = cityMap[args.city];
}

try {
  // ===== 判断是否为 JSON =====
  if (body && body.trim().startsWith("{")) {
    let obj = JSON.parse(body);

    // ===== 首页标签清理 =====
    if (/^https:\/\/gateway(retry)?\.kugou\.com\/ocean\/v\d\/tab\/list_v\d/.test(url)) {
      const namesToRemove = ["AI帮唱", "长相思2", "K歌", "小说", "游戏"];
      const removeParentIfNameMatches = (node, depth = 0) => {
        if (depth > 20) return node; // 防止递归过深
        if (Array.isArray(node)) {
          return node.map(item => removeParentIfNameMatches(item, depth + 1))
                     .filter(item => !(item && item.name && namesToRemove.includes(item.name)));
        } else if (typeof node === 'object' && node !== null) {
          for (const k in node) node[k] = removeParentIfNameMatches(node[k], depth + 1);
        }
        return node;
      };
      obj = removeParentIfNameMatches(obj);
    }

    // ===== 开屏广告 =====
    else if (/^https?:\/\/ads\.service\.kugou\.com\/v4\/mobile_splash/.test(url)) {
      if (obj.data) {
        obj.data.boot_ads = [];
        obj.data.front_ads = [];
        obj.data.ads = [];
        obj.data.retry_local_ads = [];
        obj.data.retry_ads = [];
        obj.data.least_ads = [];
      }
    } else if (/^https?:\/\/ads\.service\.kugou\.com\/v4\/mobile_splash_sort/.test(url)) {
      if (obj.data) {
        obj.data.ads = [];
        obj.data.retry_local_ads = [];
        obj.data.retry_ads = [];
        obj.data.least_ads = [];
      }
    }

    // ===== 启动配置推广 =====
    else if (/^https?:\/\/gateway\.kugou\.com\/(?:\w+\/)*combo\/startup/.test(url)) {
      if (obj.data?.responses) {
        obj.data.responses = obj.data.responses.filter(
          r => !["overseas_check_v2", "tab_bottom_list"].includes(r.module)
        );
      }
    }

    // ===== IP 位置伪装 =====
    else if (/^https:\/\/gateway\.kugou\.com\/[\w\/.-]+(?=\?appid=)/.test(url)) {
      if (obj.data?.info) {
        obj.data.info.province = province;
        obj.data.info.city = city;
        obj.data.info.adcode = adcode;
      }
    }

    // ===== 搜索框推广 =====
    else if (/^https?:\/\/gateway\.kugou\.com\/searchnofocus\/v1\/search_no_focus_word/.test(url)) {
      if (obj.data) {
        obj.data.ads = [];
        obj.data.fallback = [];
      }
    }

    // ===== 猜你喜欢 =====
    else if (/^https?:\/\/gateway\.kugou\.com\/guessyousearch\/v1\/guess_you_search/.test(url)) {
      if (obj.data) obj.data.words = [];
    }

    // ===== 应用内推广 =====
    else if (/^https?:\/\/gateway\.kugou\.com\/mstc\/musicsymbol\/v1\/system\/profile/.test(url)) {
      if (obj.data) {
        obj.data.task = [];
        obj.data.ads = [];
      }
    }

    // ===== 首页推荐净化 =====
    else if (/^https:\/\/gateway\.kugou\.com\/card\/v1\/pxy\/recommend_stream_v2/.test(url)) {
      if (obj.data?.responses) {
        obj.data.responses = obj.data.responses.filter(r => {
          const m = r.module;
          return !(
            (m && (
              m.startsWith("song_module") ||
              ["realtime_songlist", "follow_newsong_album", "longaudio_picked_show",
               "video_tab", "store_recommend", "perfection_album", "ai_songlist",
               "kroom_kuqun", "ys_recommend_sing", "ad_fx_recommend",
               "longaudio_category", "fx_recommend_star"
              ].includes(m)
            ))
          );
        });
      }
    }

    body = JSON.stringify(obj);
  }
} catch (err) {
  console.log("KuGou_remove_ads.js error:", err, err.stack);
}

// 非 JSON 或空响应直接返回原始 body
$done({ body });