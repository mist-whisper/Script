// 引用地址：https://raw.githubusercontent.com/fmz200/wool_scripts/refs/heads/main/Scripts/xiaohongshu/xiaohongshu.js

/**
 * @author fmz200
 * @function 小红书去广告、净化、解除下载限制、画质增强等
 * @date 2025-05-06 17:27:00
 * @quote @RuCu6
 */

const $ = new Env('小红书');
const url = $request.url;
let rsp_body = $response.body;
if (!rsp_body) {
  $done({});
}
let obj = JSON.parse(rsp_body);

if (url.includes("/search/banner_list")) {
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
  // 搜索栏
  obj.data.queries = [];
  obj.data.hint_word = {};
}

if (url.includes("/search/notes?")) {
  // 搜索结果
  if (obj.data.items?.length > 0) {
    obj.data.items = obj.data.items.filter((i) => i.model_type === "note");
  }
}

if (url.includes("/system_service/config?")) {
  // 整体配置
  const item = ["app_theme", "loading_img", "splash", "store"];
  if (obj.data) {
    for (let i of item) {
      delete obj.data[i];
    }
  }
}

if (url.includes("/system_service/splash_config")) {
  // 开屏广告
  if (obj?.data?.ads_groups?.length > 0) {
    for (let i of obj.data.ads_groups) {
      i.start_time = 3818332800; // Unix 时间戳 2090-12-31 00:00:00
      i.end_time = 3818419199;   // Unix 时间戳 2090-12-31 23:59:59
      if (i?.ads?.length > 0) {
        for (let ii of i.ads) {
          ii.start_time = 3818332800;
          ii.end_time = 3818419199;
        }
      }
    }
  }
}

if (url.includes("/note/imagefeed?") || url.includes("/note/feed?")) {
  // 信息流 图片：先做原有的“去水印+下载按钮+画质增强”
  if (obj?.data?.length > 0 && obj.data[0]?.note_list?.length > 0) {
    // 1）逐条处理水印、下载按钮
    for (let item of obj.data[0].note_list) {
      if (item?.media_save_config) {
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
        item.media_save_config.disable_weibo_cover = true;
      }
      if (item?.share_info?.function_entries?.length > 0) {
        const addItem = { type: "video_download" };
        let func = item.share_info.function_entries[0];
        if (func?.type !== "video_download") {
          item.share_info.function_entries.unshift(addItem);
        }
      }
    }
    // 2）把本页所有 note 里的 images_list 合并到一个大数组
    let allImages = [];
    for (const noteItem of obj.data[0].note_list) {
      if (Array.isArray(noteItem.images_list) && noteItem.images_list.length > 0) {
        // 画质增强：把这条 note 的 images_list 暂存、替换后再放回
        const orig = noteItem.images_list;
        noteItem.images_list = imageEnhance(JSON.stringify(orig));
        // 收集原始列表到大缓存里（后面保存时要用）
        allImages = allImages.concat(orig);
      }
    }
    // 把整页的 allImages 数组写入缓存
    $.setdata(JSON.stringify(allImages), "fmz200.xiaohongshu.feed.rsp");
    console.log(`已缓存这一页共 ${allImages.length} 张图片/Live 图`);
  }
}

if (url.includes("/note/live_photo/save")) {
  console.log('原body：' + rsp_body);
  const rsp = $.getdata("fmz200.xiaohongshu.feed.rsp");
  console.log("读取缓存key：fmz200.xiaohongshu.feed.rsp");
  if (rsp == null || rsp.length === 0) {
    console.log('保存失败');
    $done({ body: rsp_body });
  }
  const cache_body = JSON.parse(rsp);
  let new_data = [];
  for (const images of cache_body) {
    if (images.live_photo_file_id) {
      const item = {
        file_id: images.live_photo_file_id,
        video_id: images.live_photo.media.video_id,
        url: images.live_photo.media.stream.h265[0].master_url
      };
      new_data.push(item);
    }
  }
  if (new_data.length === 0) {
    console.log('live图保存为静态照片');
    $done({ body: rsp_body });
  }
  if (obj.data.datas) {
    replaceUrlContent(obj.data.datas, new_data);
  } else {
    obj = { "code": 0, "success": true, "msg": "成功", "data": { "datas": new_data } };
  }
  console.log('新body：' + JSON.stringify(obj));
}

if (url.includes("/v3/note/videofeed?")) {
  // 信息流 视频
  if (obj?.data?.length > 0) {
    for (let item of obj.data) {
      if (item?.media_save_config) {
        // 水印
        item.media_save_config.disable_save = false;
        item.media_save_config.disable_watermark = true;
        item.media_save_config.disable_weibo_cover = true;
      }
      if (item?.share_info?.function_entries?.length > 0) {
        // 下载限制
        const addItem = { type: "video_download" };
        let func = item.share_info.function_entries[0];
        if (func?.type !== "video_download") {
          // 添加下载按钮
          item.share_info.function_entries.unshift(addItem);
        }
      }
    }
  }
}

if (url.includes("/v4/note/videofeed")) {
  // 信息流 视频
  let newDatas = [];
  let unlockDatas = [];
  if (obj?.data?.length > 0) {
    for (let item of obj.data) {
      // 检查 function_entries 是否存在 “video_download”
      let found = false;
      for (let entry of item.share_info.function_entries) {
        if (entry.type === "video_download") {
          found = true;
          break;
        }
      }
      if (!found) {
        item.share_info.function_entries.push({ "type": "video_download" });
      }
      // 存储无水印视频链接
      if (item?.id && item.video_info_v2?.media?.stream?.h265?.length > 0 && item.video_info_v2.media.stream.h265[0].master_url) {
        let myData = {
          id: item.id,
          url: item.video_info_v2.media.stream.h265[0].master_url
        };
        newDatas.push(myData);
      }
    }
    $.setdata(JSON.stringify(newDatas), "redBookVideoFeed"); // 持久化存储普通视频
  }
  // 处理“禁止保存”的情况
  let videoFeedUnlock = { notSave: "fmz200" }; // 脚本本身强制解禁
  if (videoFeedUnlock?.notSave === "fmz200") {
    if (obj?.data?.length > 0) {
      for (let item of obj.data) {
        if (item?.id && item.video_info_v2?.media?.stream?.h265?.length > 0 && item.video_info_v2.media.stream.h265[0].master_url) {
          let myData = {
            id: item.id,
            url: item.video_info_v2.media.stream.h265[0].master_url
          };
          unlockDatas.push(myData);
        }
      }
    }
    $.setdata(JSON.stringify(unlockDatas), "redBookVideoFeedUnlock"); // 持久化存储“禁止保存”视频
  }
}

if (url.includes("/v10/note/video/save")) {
  // 视频保存请求
  let videoFeed = JSON.parse($.getdata("redBookVideoFeed")); // 普通视频缓存
  let videoFeedUnlock = JSON.parse($.getdata("redBookVideoFeedUnlock")); // 禁止保存视频缓存
  if (obj?.data?.note_id !== "" && videoFeed?.length > 0) {
    for (let item of videoFeed) {
      if (item.id === obj.data.note_id) {
        obj.data.download_url = item.url;
      }
    }
  }
  if (obj?.data?.note_id !== "" && videoFeedUnlock?.length > 0) {
    if (obj?.data?.disable === true && obj?.data?.msg !== "") {
      delete obj.data.disable;
      delete obj.data.msg;
      obj.data.download_url = "";
      obj.data.status = 2;
      for (let item of videoFeedUnlock) {
        if (item.id === obj.data.note_id) {
          obj.data.download_url = item.url;
        }
      }
    }
  }
  videoFeedUnlock = { notSave: "fmz200" };
  $.setdata(JSON.stringify(videoFeedUnlock), "redBookVideoFeedUnlock");
}

if (url.includes("/user/followings/followfeed")) {
  // 关注页信息流 可能感兴趣的人
  if (obj?.data?.items?.length > 0) {
    // 白名单：只保留 recommend_reason === "friend_post"
    obj.data.items = obj.data.items.filter((i) => i?.recommend_reason === "friend_post");
  }
}

if (url.includes("/v4/followfeed")) {
  // 关注列表
  if (obj?.data?.items?.length > 0) {
    // 剔除 recommend_reason 为 "recommend_user" 的条目
    obj.data.items = obj.data.items.filter((i) => !["recommend_user"].includes(i.recommend_reason));
  }
}

if (url.includes("/recommend/user/follow_recommend")) {
  // 用户详情页 你可能感兴趣的人
  if (obj?.data?.title === "你可能感兴趣的人" && obj?.data?.rec_users?.length > 0) {
    obj.data = {};
  }
}

if (url.includes("/v6/homefeed")) {
  if (obj?.data?.length > 0) {
    let newItems = [];
    for (let item of obj.data) {
      if (item?.model_type === "live_v2") {
        // 信息流-直播 (保留或根据需求处理)
      } else if (item?.hasOwnProperty("ads_info")) {
        // 信息流-赞助 (过滤掉)
      } else if (item?.hasOwnProperty("card_icon")) {
        // 信息流-带货 (过滤掉)
      } else if (item?.note_attributes?.includes("goods")) {
        // 信息流-商品 (过滤掉)
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
  const item = ["cooperate_binds", "generic", "note_next_step"];
  if (obj?.data) {
    for (let i of item) {
      delete obj.data[i];
    }
  }
}

if (url.includes("/api/sns/v5/note/comment/list?") || url.includes("/api/sns/v3/note/comment/sub_comments?")) {
  replaceRedIdWithFmz200(obj.data);
  let livePhotos = [];
  let note_id = "";
  if (obj.data?.comments?.length > 0) {
    note_id = obj.data.comments[0].note_id;
    for (const comment of obj.data.comments) {
      // 处理 一级评论
      if (comment.comment_type === 3) {
        comment.comment_type = 2; // emoji -> live_photo
        console.log(`修改评论类型：3->2`);
      }
      if (comment.media_source_type === 1) {
        comment.media_source_type = 0; // 修改媒体类型: 1->0
        console.log(`修改媒体类型：1->0`);
      }
      if (comment.pictures?.length > 0) {
        console.log("comment_id: " + comment.id);
        for (const picture of comment.pictures) {
          if (picture.video_id) {
            const picObj = JSON.parse(picture.video_info);
            if (picObj.stream?.h265?.[0]?.master_url) {
              console.log("video_id：" + picture.video_id);
              const videoData = {
                videId: picture.video_id,
                videoUrl: picObj.stream.h265[0].master_url
              };
              livePhotos.push(videoData);
            }
          }
        }
      }
      // 处理二级评论（sub_comments）
      if (comment.sub_comments?.length > 0) {
        for (const sub_comment of comment.sub_comments) {
          if (sub_comment.comment_type === 3) {
            sub_comment.comment_type = 2;
            console.log(`修改评论类型1：3->2`);
          }
          if (sub_comment.media_source_type === 1) {
            sub_comment.media_source_type = 0;
            console.log(`修改媒体类型1：1->0`);
          }
          if (sub_comment.pictures?.length > 0) {
            console.log("comment_id1: " + comment.id);
            for (const picture of sub_comment.pictures) {
              if (picture.video_id) {
                const picObj = JSON.parse(picture.video_info);
                if (picObj.stream.h265?.[0]?.master_url) {
                  console.log("video_id1：" + picture.video_id);
                  const videoData = {
                    videId: picture.video_id,
                    videoUrl: picObj.stream.h265[0].master_url
                  };
                  livePhotos.push(videoData);
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
    const commitsCache = $.getdata("fmz200.xiaohongshu.comments.rsp");
    console.log("读取缓存val：" + commitsCache);
    if (!commitsCache) {
      commitsRsp = { noteId: note_id, livePhotos: livePhotos };
    } else {
      commitsRsp = JSON.parse(commitsCache);
      console.log("缓存note_id：" + commitsRsp.noteId);
      if (commitsRsp.noteId === note_id) {
        console.log("增量数据");
        commitsRsp.livePhotos = deduplicateLivePhotos(commitsRsp.livePhotos.concat(livePhotos));
      } else {
        console.log("更换数据");
        commitsRsp = { noteId: note_id, livePhotos: livePhotos };
      }
    }
    console.log("写入缓存val：" + JSON.stringify(commitsRsp));
    $.setdata(JSON.stringify(commitsRsp), "fmz200.xiaohongshu.comments.rsp");
  }
}

if (url.includes("/api/sns/v1/interaction/comment/video/download?")) {
  const commitsCache = $.getdata("fmz200.xiaohongshu.comments.rsp");
  console.log("读取缓存val：" + commitsCache);
  console.log("目标video_id：" + obj.data.video.video_id);
  if (commitsCache) {
    let commitsRsp = JSON.parse(commitsCache);
    if (commitsRsp.livePhotos.length > 0 && obj.data?.video) {
      for (const item of commitsRsp.livePhotos) {
        // 匹配 video_id
        if (item.videId === obj.data.video.video_id) {
          console.log("匹配到无水印链接：" + item.videoUrl);
          obj.data.video.video_url = item.videoUrl;
          break;
        }
      }
    }
  } else {
    console.log(`没有[${obj.data?.video.video_id}]的无水印地址`);
  }
}

$done({ body: JSON.stringify(obj) });

// —— 各种辅助函数 ——

// 画质增强：根据用户配置替换 URL 参数
function imageEnhance(jsonStr) {
  if (!jsonStr) {
    console.error("jsonStr is undefined or null");
    return [];
  }

  const imageQuality = $.getdata("fmz200.xiaohongshu.imageQuality");
  console.log(`Image Quality: ${imageQuality}`);
  if (imageQuality === "original") {
    // 原始分辨率，PNG
    console.log("画质修改为-原始分辨率");
    jsonStr = jsonStr.replace(/\?imageView2\/2[^&]*(?:&redImage\/frame\/0)/, "?imageView2/0/format/png&redImage/frame/0");
  } else {
    // 高像素输出（默认）
    console.log("画质修改为-高像素输出");
    const regex1 = /imageView2\/2\/w\/\d+\/format/g;
    jsonStr = jsonStr.replace(regex1, `imageView2/2/w/2160/format`);

    const regex2 = /imageView2\/2\/h\/\d+\/format/g;
    jsonStr = jsonStr.replace(regex2, `imageView2/2/h/2160/format`);
  }
  console.log('图片画质增强完成✅');

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parsing error: ", e);
    return [];
  }
}

// 替换下载 URL
function replaceUrlContent(collectionA, collectionB) {
  console.log('替换无水印的URL');
  collectionA.forEach(itemA => {
    const matchingItemB = collectionB.find(itemB => itemB.file_id === itemA.file_id);
    if (matchingItemB) {
      itemA.url = itemA.url.replace(/(.*)\.mp4/, `${matchingItemB.url.match(/(.*)\.mp4/)[1]}.mp4`);
      itemA.author = "@fmz200";
    }
  });
}

// 去重 Live Photo 列表
function deduplicateLivePhotos(livePhotos) {
  const seen = new Map();
  livePhotos = livePhotos.filter(item => {
    if (seen.has(item.videId)) {
      return false;
    }
    seen.set(item.videId, true);
    return true;
  });
  return livePhotos;
}

// 递归替换 red_id 字段为 fmz200
function replaceRedIdWithFmz200(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(item => replaceRedIdWithFmz200(item));
  } else if (typeof obj === 'object' && obj !== null) {
    if ('red_id' in obj) {
      obj.fmz200 = obj.red_id; // 新属性 fmz200
      delete obj.red_id;       // 删除 red_id
    }
    Object.keys(obj).forEach(key => {
      replaceRedIdWithFmz200(obj[key]);
    });
  }
}

/**
 * Env 脚本环境适配（Surge/QuanX/Loon/Node.js 等）
 * @class Env
 */
function Env(t) {
  this.name = t;
  this.log = function (t) { console.log(`${this.name}, ${t}`); };
  this.getdata = (t) => {
    try {
      return $persistentStore.read(t);
    } catch (e) {
      return null;
    }
  };
  this.setdata = (t, e) => {
    try {
      return $persistentStore.write(t, e);
    } catch (e) {
      return false;
    }
  };
  // 其他环境方法（HTTP 请求、通知等）略
}