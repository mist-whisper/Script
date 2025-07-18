/**
 * @author fmz200
 * @function 小红书去广告、净化、解除下载限制、画质增强等（在原脚本结构上做优化）
 * @date 2025-06-01
 * @quote @RuCu6
 */

const $ = new Env('小红书');
const url = $request.url;
let rsp_body = $response.body;

// —— ① 如果没有响应体，直接结束脚本 —— 
if (!rsp_body) {
  $done({});
}

// —— ② 尝试解析 JSON，若失败则直接返回原始 body —— 
let obj;
try {
  obj = JSON.parse(rsp_body);
} catch (e) {
  console.log(`解析 JSON 失败：${e}，返回原始 Body`);
  $done({ body: rsp_body });
}

if (url.includes("/search/banner_list")) {
  // 去除 banner 广告
  obj.data = {};
}

if (url.includes("/search/hot_list")) {
  // 热搜列表
  obj.data.items = [];
}

if (url.includes("/search/hint")) {
  // 搜索栏填充词
  obj.data.hint_words = [];
}

if (url.includes("/search/trending?")) {
  // 搜索栏趋势词
  obj.data.queries = [];
  obj.data.hint_word = {};
}

if (url.includes("/search/notes?")) {
  // 搜索结果，仅保留 model_type = "note"
  if (Array.isArray(obj.data?.items) && obj.data.items.length > 0) {
    obj.data.items = obj.data.items.filter((i) => i?.model_type === "note");
  }
}

if (url.includes("/system_service/config?")) {
  // 系统配置，删除无关字段
  const item = ["app_theme", "loading_img", "splash", "store"];
  if (obj.data) {
    for (let i of item) {
      delete obj.data[i];
    }
  }
}

if (url.includes("/system_service/splash_config")) {
  // 开屏广告：将所有广告时间调到 2090 年，基本等于“永不展示”
  if (Array.isArray(obj.data?.ads_groups)) {
    for (let i of obj.data.ads_groups) {
      i.start_time = 3818332800; // 2090-12-31 00:00:00
      i.end_time = 3818419199;   // 2090-12-31 23:59:59
      if (Array.isArray(i.ads)) {
        for (let ii of i.ads) {
          ii.start_time = 3818332800;
          ii.end_time = 3818419199;
        }
      }
    }
  }
}

// —— ③ 在“笔记详情”页也做缓存，以支持在详情直接保存 Live 图时命中 —— 
if (url.includes("/note/detail")) {
  try {
    const detailImages = obj.data?.images_list;
    if (Array.isArray(detailImages) && detailImages.length > 0) {
      $.setval(JSON.stringify(detailImages), "fmz200.xiaohongshu.feed.rsp");
      console.log(`详情页缓存：共 ${detailImages.length} 张图片/Live 图`);
    }
  } catch (e) {
    console.log(`在 /note/detail 缓存时出错：${e}`);
  }
}

if (url.includes("/note/imagefeed?") || url.includes("/note/feed?")) {
  // —— ④ 信息流图片 —— 去水印 + 增加下载按钮 + 缓存所有 note 的 images_list —— 
  try {
    const firstPage = obj.data;
    if (Array.isArray(firstPage) && firstPage.length > 0) {
      const noteList = firstPage[0]?.note_list;
      if (Array.isArray(noteList) && noteList.length > 0) {
        // 4.1) 去水印、加下载按钮
        for (let item of noteList) {
          if (item?.media_save_config) {
            item.media_save_config.disable_save = false;
            item.media_save_config.disable_watermark = true;
            item.media_save_config.disable_weibo_cover = true;
          }
          if (Array.isArray(item.share_info?.function_entries) && item.share_info.function_entries.length > 0) {
            const addItem = { type: "video_download" };
            let func = item.share_info.function_entries[0];
            if (func?.type !== "video_download") {
              item.share_info.function_entries.unshift(addItem);
            }
          }
        }
        // 4.2) 合并本页所有 note 的 images_list 到一个大数组
        let allImages = [];
        for (let noteItem of noteList) {
          const imagesArr = noteItem?.images_list;
          if (Array.isArray(imagesArr) && imagesArr.length > 0) {
            // 画质增强
            try {
              noteItem.images_list = imageEnhance(JSON.stringify(imagesArr));
            } catch (e) {
              console.log(`imageEnhance 画质增强失败：${e}`);
            }
            // 收集原始列表，后续保存 Live 图时会用到
            allImages = allImages.concat(imagesArr);
          }
        }
        if (allImages.length > 0) {
          $.setval(JSON.stringify(allImages), "fmz200.xiaohongshu.feed.rsp");
          console.log(`Feed 页缓存：共 ${allImages.length} 张图片/Live 图`);
        }
      }
    }
  } catch (e) {
    console.log(`在 /note/imagefeed? 缓存时出错：${e}`);
  }
}

if (url.includes("/note/live_photo/save")) {
  // —— ⑤ Live Photo 保存 —— 根据缓存替换 URL，否则回退 —— 
  console.log('触发 /note/live_photo/save，原 body：' + rsp_body);
  const rawCache = $.getval("fmz200.xiaohongshu.feed.rsp") || "";
  if (!rawCache) {
    console.log('保存失败：缓存为空');
    $done({ body: rsp_body });
  }
  let cache_body = [];
  try {
    cache_body = JSON.parse(rawCache);
  } catch (e) {
    console.log(`缓存 JSON 解析失败：${e}`);
    $done({ body: rsp_body });
  }
  // 从缓存中提取所有带 live_photo_file_id 的记录
  const new_data = [];
  for (const images of cache_body) {
    const fid = images?.live_photo_file_id;
    const vid = images?.live_photo?.media?.video_id;
    const h265url = images?.live_photo?.media?.stream?.h265?.[0]?.master_url;
    if (fid && vid && h265url) {
      new_data.push({
        file_id: fid,
        video_id: vid,
        url: h265url
      });
    }
  }
  if (new_data.length === 0) {
    console.log('Live 图保存为静态照片：缓存中无 live_photo_file_id 或结构已变');
    $done({ body: rsp_body });
  }
  if (Array.isArray(obj.data?.datas) && obj.data.datas.length > 0) {
    // 如果服务器本身返回了 data.datas，就在其中替换
    let matched = false;
    for (let itemA of obj.data.datas) {
      const matchB = new_data.find(itemB => itemB.file_id === itemA.file_id);
      if (matchB) {
        itemA.url = matchB.url;
        itemA.author = "@fmz200";
        matched = true;
      }
    }
    if (!matched) {
      console.log('保存失败：未找到与返回体中 file_id 对应的 Live 图 URL');
      $done({ body: rsp_body });
    }
  } else {
    // 服务器没返回 datas，自建响应体
    obj = {
      code: 0,
      success: true,
      msg: "成功",
      data: {
        datas: new_data
      }
    };
    console.log('保存成功：自建响应体，返回所有 LiveItems');
  }
  console.log('保存后新 body：' + JSON.stringify(obj));
}

if (url.includes("/v3/note/videofeed?")) {
  // —— ⑥ 信息流视频 v3 —— 去水印 + 加下载按钮 —— 
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    for (let item of obj.data) {
      if (item?.media_save_config) {
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
        item.media_save_config.disable_weibo_cover = true;
      }
      if (Array.isArray(item.share_info?.function_entries) && item.share_info.function_entries.length > 0) {
        const addItem = { type: "video_download" };
        let func = item.share_info.function_entries[0];
        if (func?.type !== "video_download") {
          item.share_info.function_entries.unshift(addItem);
        }
      }
    }
  }
}

if (url.includes("/v4/note/videofeed")) {
  // —— ⑦ 信息流视频 v4 —— 缓存无水印 H.265 链接 + 加下载按钮 —— 
  let newDatas = [];
  let unlockDatas = [];
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    for (let item of obj.data) {
      // 检查是否已有 “video_download” 按钮
      let found = false;
      for (let entry of item.share_info.function_entries) {
        if (entry.type === "video_download") {
          found = true;
          break;
        }
      }
      if (!found) {
        item.share_info.function_entries.push({ type: "video_download" });
      }
      // 提取无水印 H.265 链接
      const vid = item?.id;
      const h265url = item?.video_info_v2?.media?.stream?.h265?.[0]?.master_url;
      if (vid && h265url) {
        newDatas.push({ id: vid, url: h265url });
        // 如果 media_save_config.disable_save === true，则认为是“禁止保存”模式，放到 unlockDatas
        if (item?.media_save_config?.disable_save === true) {
          unlockDatas.push({ id: vid, url: h265url });
        }
      }
    }
    if (newDatas.length > 0) {
      $.setval(JSON.stringify(newDatas), "redBookVideoFeed");
      console.log(`v4 cache: 普通视频 ${newDatas.length} 条`);
    }
    if (unlockDatas.length > 0) {
      $.setval(JSON.stringify(unlockDatas), "redBookVideoFeedUnlock");
      console.log(`v4 cache: 禁止保存视频 ${unlockDatas.length} 条`);
    }
  }
}

if (url.includes("/v10/note/video/save")) {
  // —— ⑧ 视频保存 v10 —— 从缓存中取无水印链接进行替换 —— 
  const vid = obj.data?.note_id;
  if (!vid) {
    console.log("视频保存失败：响应体缺少 note_id");
    $done({ body: rsp_body });
  }
  const normalRaw = $.getval("redBookVideoFeed") || "[]";
  const unlockRaw = $.getval("redBookVideoFeedUnlock") || "[]";
  let normalArr = [], unlockArr = [];
  try {
    normalArr = JSON.parse(normalRaw);
    unlockArr = JSON.parse(unlockRaw);
  } catch {
    console.log("解析视频缓存失败");
  }
  let foundDL = false;
  // 先从普通缓存里找
  if (Array.isArray(normalArr)) {
    for (let rec of normalArr) {
      if (rec.id === vid) {
        obj.data.download_url = rec.url;
        foundDL = true;
        break;
      }
    }
  }
  // 如果普通缓存没找到，且服务器返回 disable = true，则从 unlock 缓存里找
  if (!foundDL && obj?.data?.disable === true) {
    for (let rec of unlockArr) {
      if (rec.id === vid) {
        delete obj.data.disable;
        delete obj.data.msg;
        obj.data.status = 2;
        obj.data.download_url = rec.url;
        foundDL = true;
        break;
      }
    }
    if (!foundDL) {
      console.log(`视频保存失败：未在 unlock 缓存中找到 note_id=${vid}`);
    }
  }
  if (!foundDL) {
    console.log(`视频保存失败：note_id=${vid} 未在任何缓存命中`);
  }
  // 重置 unlock 缓存（下次再遇到新的“禁止保存”视频时才会覆盖）
  $.setval("", "redBookVideoFeedUnlock");
}

if (url.includes("/user/followings/followfeed")) {
  // —— ⑨ 关注页：只保留 recommend_reason = "friend_post" —— 
  if (Array.isArray(obj.data?.items) && obj.data.items.length > 0) {
    obj.data.items = obj.data.items.filter((i) => i?.recommend_reason === "friend_post");
  }
}

if (url.includes("/v4/followfeed")) {
  // —— ⑩ 关注列表：剔除 recommend_reason = "recommend_user" —— 
  if (Array.isArray(obj.data?.items) && obj.data.items.length > 0) {
    obj.data.items = obj.data.items.filter((i) => !["recommend_user"].includes(i?.recommend_reason));
  }
}

if (url.includes("/recommend/user/follow_recommend")) {
  // —— ⑪ 详情页“你可能感兴趣的人”：清空 —— 
  if (obj.data?.title === "你可能感兴趣的人" && Array.isArray(obj.data?.rec_users) && obj.data.rec_users.length > 0) {
    obj.data = {};
  }
}

if (url.includes("/v6/homefeed")) {
  // —— ⑫ 首页信息流 v6：去广告/带货/商品，只保留直播 & 普通笔记 —— 
  if (Array.isArray(obj.data) && obj.data.length > 0) {
    let newItems = [];
    for (let item of obj.data) {
      if (item?.model_type === "live_v2") {
        // 保留直播
      } else if (item?.hasOwnProperty("ads_info")) {
        // 过滤广告
      } else if (item?.hasOwnProperty("card_icon")) {
        // 过滤带货
      } else if (Array.isArray(item?.note_attributes) && item.note_attributes.includes("goods")) {
        // 过滤商品
      } else {
        if (item?.related_ques) {
          delete item.related_ques;
        }
        newItems.push(item);
      }
    }
    obj.data = newItems;
  }
}

if (url.includes("/note/widgets")) {
  // —— ⑬ Widgets：删除不需要的字段 —— 
  const item = ["cooperate_binds", "generic", "note_next_step"];
  if (obj?.data) {
    for (let i of item) {
      delete obj.data[i];
    }
  }
}

if (url.includes("/api/sns/v5/note/comment/list?") || url.includes("/api/sns/v3/note/comment/sub_comments?")) {
  // —— ⑭ 评论列表 & 子评论：提取 Live 图缓存 —— 
  replaceRedIdWithFmz200(obj.data);
  let livePhotos = [];
  let note_id = "";
  if (Array.isArray(obj.data?.comments) && obj.data.comments.length > 0) {
    note_id = obj.data.comments[0]?.note_id || "";
    for (const comment of obj.data.comments) {
      // 一级评论
      if (comment.comment_type === 3) {
        comment.comment_type = 2; // 3→2
        console.log(`修改评论类型：3->2`);
      }
      if (comment.media_source_type === 1) {
        comment.media_source_type = 0; // 1→0
        console.log(`修改媒体类型：1->0`);
      }
      if (Array.isArray(comment.pictures)) {
        console.log("comment_id: " + comment.id);
        for (const picture of comment.pictures) {
          if (picture.video_id) {
            const picObj = JSON.parse(picture.video_info);
            const urlH265 = picObj.stream?.h265?.[0]?.master_url;
            if (urlH265) {
              console.log("video_id：" + picture.video_id);
              livePhotos.push({
                videId: picture.video_id,
                videoUrl: urlH265
              });
            }
          }
        }
      }
      // 二级子评论
      if (Array.isArray(comment.sub_comments)) {
        for (const sub_comment of comment.sub_comments) {
          if (sub_comment.comment_type === 3) {
            sub_comment.comment_type = 2;
            console.log(`修改子评论类型：3->2`);
          }
          if (sub_comment.media_source_type === 1) {
            sub_comment.media_source_type = 0;
            console.log(`修改子评论媒体类型：1->0`);
          }
          if (Array.isArray(sub_comment.pictures)) {
            console.log("comment_id (子)： " + comment.id);
            for (const picture of sub_comment.pictures) {
              if (picture.video_id) {
                const picObj = JSON.parse(picture.video_info);
                const urlH265 = picObj.stream?.h265?.[0]?.master_url;
                if (urlH265) {
                  console.log("video_id(子)：" + picture.video_id);
                  livePhotos.push({
                    videId: picture.video_id,
                    videoUrl: urlH265
                  });
                }
              }
            }
          }
        }
      }
    }
  }
  console.log("本次note_id：" + note_id);
  if (livePhotos.length > 0) {
    let commitsRsp;
    const commitsCache = $.getval("fmz200.xiaohongshu.comments.rsp") || "";
    console.log("读取评论缓存 val：" + commitsCache);
    if (!commitsCache) {
      commitsRsp = { noteId: note_id, livePhotos: livePhotos };
    } else {
      try {
        const oldCache = JSON.parse(commitsCache);
        if (oldCache.noteId === note_id) {
          console.log("增量合并评论 Live 图");
          commitsRsp = {
            noteId: note_id,
            livePhotos: deduplicateLivePhotos(oldCache.livePhotos.concat(livePhotos))
          };
        } else {
          console.log("切换 note_id，重写评论缓存");
          commitsRsp = { noteId: note_id, livePhotos: livePhotos };
        }
      } catch {
        console.log("旧评论缓存解析失败，直接覆盖");
        commitsRsp = { noteId: note_id, livePhotos: livePhotos };
      }
    }
    console.log("写入评论缓存 val：" + JSON.stringify(commitsRsp));
    $.setval(JSON.stringify(commitsRsp), "fmz200.xiaohongshu.comments.rsp");
  }
}

if (url.includes("/api/sns/v1/interaction/comment/video/download?")) {
  // —— ⑮ 评论区 Live 图下载替换 —— 
  const commitsCache = $.getval("fmz200.xiaohongshu.comments.rsp") || "";
  console.log("读取评论缓存 val：" + commitsCache);
  const vid = obj.data?.video?.video_id;
  console.log("目标 video_id：" + vid);
  if (!vid) {
    console.log("评论 Live 图下载失败：缺少 video.video_id");
    $done({ body: rsp_body });
  }
  if (!commitsCache) {
    console.log(`评论 Live 图下载失败：缓存为空，无法替换 video_id=${vid}`);
    $done({ body: rsp_body });
  }
  let cacheObj = {};
  try {
    cacheObj = JSON.parse(commitsCache);
  } catch {
    console.log("评论缓存 JSON 解析失败");
    $done({ body: rsp_body });
  }
  const matched = cacheObj.livePhotos.find(x => x.videId === vid);
  if (matched) {
    obj.data.video.video_url = matched.videoUrl;
    console.log(`评论 Live 图下载成功：video_id=${vid} URL 已替换`);
  } else {
    console.log(`评论 Live 图下载失败：缓存中找不到 video_id=${vid}`);
  }
}

$done({ body: JSON.stringify(obj) });

//
// —— 各种辅助函数 ——
//

/**
 * imageEnhance：对传入的 images_list（JSON 字符串）进行“高像素输出”或“原始PNG”替换
 */
function imageEnhance(jsonStr) {
  if (!jsonStr) {
    console.error("imageEnhance 收到空字符串");
    return [];
  }
  let modStr = jsonStr;
  try {
    const imageQuality = $.getval("fmz200.xiaohongshu.imageQuality");
    console.log(`Image Quality: ${imageQuality}`);
    if (imageQuality === "original") {
      // 原始分辨率：PNG
      console.log("画质修改为 - 原始分辨率(PNG)");
      modStr = modStr.replace(
        /\?imageView2\/2[^&]*(?:&redImage\/frame\/0)/,
        "?imageView2/0/format/png&redImage/frame/0"
      );
    } else {
      // 高像素输出 2160p
      console.log("画质修改为 - 高像素输出(2160p)");
      modStr = modStr.replace(/imageView2\/2\/w\/\d+\/format/g, "imageView2/2/w/2160/format");
      modStr = modStr.replace(/imageView2\/2\/h\/\d+\/format/g, "imageView2/2/h/2160/format");
    }
    console.log('图片画质增强完成✅');
    return JSON.parse(modStr);
  } catch (e) {
    console.error(`imageEnhance 异常：${e}`);
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }
}

/**
 * replaceUrlContent：替换无水印 URL
 */
function replaceUrlContent(collectionA, collectionB) {
  console.log('替换无水印的 URL');
  collectionA.forEach(itemA => {
    const matchingItemB = collectionB.find(itemB => itemB.file_id === itemA.file_id);
    if (matchingItemB) {
      itemA.url = itemA.url.replace(/(.*)\.mp4/, `${matchingItemB.url.match(/(.*)\.mp4/)[1]}.mp4`);
      itemA.author = "@fmz200";
    }
  });
}

/**
 * deduplicateLivePhotos：根据 videId 进行去重
 */
function deduplicateLivePhotos(livePhotos) {
  const seen = new Map();
  return livePhotos.filter(item => {
    if (!item?.videId) return false;
    if (seen.has(item.videId)) return false;
    seen.set(item.videId, true);
    return true;
  });
}

/**
 * replaceRedIdWithFmz200：递归替换 red_id → fmz200
 */
function replaceRedIdWithFmz200(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(item => replaceRedIdWithFmz200(item));
  } else if (obj && typeof obj === 'object') {
    if ('red_id' in obj) {
      obj.fmz200 = obj.red_id;
      delete obj.red_id;
    }
    Object.keys(obj).forEach(key => {
      replaceRedIdWithFmz200(obj[key]);
    });
  }
}

function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }
