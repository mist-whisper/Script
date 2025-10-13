const url = $request.url;
let body = $response.body;

try {
  if (body) {
    let obj = JSON.parse(body);

    // ======= 首页标签清理 =======
    if (/^https:\/\/gateway(retry)?\.kugou\.com\/ocean\/v\d\/tab\/list_v\d/.test(url)) {
      const namesToRemove = ["AI帮唱", "长相思2", "K歌", "小说", "游戏"];

      const removeParentIfNameMatches = (node) => {
        if (Array.isArray(node)) {
          return node
            .map(removeParentIfNameMatches)
            .filter(item => !(item && item.name && namesToRemove.includes(item.name)));
        } else if (typeof node === 'object' && node !== null) {
          for (const k in node) node[k] = removeParentIfNameMatches(node[k]);
          return node;
        }
        return node;
      };

      obj = removeParentIfNameMatches(obj);
    }

    // ======= 开屏广告 =======
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

    // ======= 启动配置推广 =======
    else if (/^https?:\/\/gateway\.kugou\.com\/(?:\w+\/)*combo\/startup/.test(url)) {
      if (obj.data?.responses) {
        obj.data.responses = obj.data.responses.filter(
          r => !["overseas_check_v2", "tab_bottom_list"].includes(r.module)
        );
      }
    }

    // ======= IP 位置伪装 =======
    else if (/^https:\/\/gateway\.kugou\.com\/[\w\/.-]+(?=\?appid=)/.test(url)) {
      if (obj.data?.info) {
        obj.data.info.province = "上海市";
        obj.data.info.city = "上海";
        obj.data.info.adcode = "310000";
      }
    }

    // ======= 搜索框推广 =======
    else if (/^https?:\/\/gateway\.kugou\.com\/searchnofocus\/v1\/search_no_focus_word/.test(url)) {
      if (obj.data) {
        obj.data.ads = [];
        obj.data.fallback = [];
      }
    }

    // ======= 猜你喜欢 =======
    else if (/^https?:\/\/gateway\.kugou\.com\/guessyousearch\/v1\/guess_you_search/.test(url)) {
      if (obj.data) obj.data.words = [];
    }

    // ======= 应用内推广 =======
    else if (/^https?:\/\/gateway\.kugou\.com\/mstc\/musicsymbol\/v1\/system\/profile/.test(url)) {
      if (obj.data) {
        obj.data.task = [];
        obj.data.ads = [];
      }
    }

    // ======= 首页推荐净化 =======
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
  console.log("KuGou_remove_ads.js error:", err);
}

$done({ body });