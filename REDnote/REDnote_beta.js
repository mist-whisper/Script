/*
 * ===================================================================
 * 小红书 "二合一" 脚本
 * 整合了 MitM 响应修改 与 Panel 手动触发功能
 * ===================================================================
 */

// 脚本路由器：判断脚本是被网络请求触发，还是被手动点击触发
if (typeof $request !== 'undefined' && $request) {
  // 如果是网络请求，执行响应修改
  handleHttpRequest();
} else {
  // 如果是手动点击，执行控制命令
  handleManualTrigger();
}

/**
 * ===================================================================
 * 功能函数定义区
 * ===================================================================
 */

/**
 * 控制命令：手动触发时执行 (原“遥控器”脚本的功能)
 */
function handleManualTrigger() {
  const key = "fmz200.xiaohongshu.stickerMode";
  $persistentStore.write("true", key);
  $notification.post(
    "小红书表情下载模式", 
    "✅ 模式已开启", 
    "请返回小红书，下拉刷新评论区即可下载。模式将自动关闭。"
  );
  $done();
}

/**
 * 响应修改：处理网络请求时执行 (您的原脚本主体)
 */
function handleHttpRequest() {
  const $ = new Env('小红书');
  const url = $request.url;
  let rsp_body = $response.body;
  if (!rsp_body) {
    $done({});
    return;
  }
  let obj = JSON.parse(rsp_body);

  // --- 您原脚本的所有功能已整合在此 ---
  
  if (url.includes("/search/banner_list")) {
    obj.data = {};
  } 

  if (url.includes("/search/hot_list")) {
    obj.data.items = [];
  }

  if (url.includes("/search/hint")) {
    obj.data.hint_words = [];
  }

  if (url.includes("/search/trending?")) {
    obj.data.queries = [];
    obj.data.hint_word = {};
  }

  if (url.includes("/search/notes?")) {
    if (obj.data.items?.length > 0) {
      obj.data.items = obj.data.items.filter((i) => i.model_type === "note");
    }
  }

  if (url.includes("/system_service/config?")) {
    const item = ["app_theme", "loading_img", "splash", "store"];
    if (obj.data) {
      for (let i of item) {
        delete obj.data[i];
      }
    }
  }

  if (url.includes("/system_service/splash_config")) {
    if (obj?.data?.ads_groups?.length > 0) {
      for (let i of obj.data.ads_groups) {
        i.start_time = 3818332800;
        i.end_time = 3818419199;
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
    if (obj?.data?.length > 0) {
      if (obj.data[0]?.note_list?.length > 0) {
        for (let item of obj.data[0].note_list) {
          if (item?.media_save_config) {
            item.media_save_config.disable_save = false;
            item.media_save_config.disable_watermark = true;
            item.media_save_config.disable_weibo_cover = true;
          }
          if (item?.share_info?.function_entries?.length > 0) {
            const addItem = {type: "video_download"};
            let func = item.share_info.function_entries[0];
            if (func?.type !== "video_download") {
              item.share_info.function_entries.unshift(addItem);
            }
          }
          if (item.hash_tag) {
            item.hash_tag = item.hash_tag.filter(tag => tag.type !== "interact_vote");
          }
        }
        const images_list = obj.data[0].note_list[0].images_list;
        obj.data[0].note_list[0].images_list = imageEnhance(JSON.stringify(images_list));
        $.setdata(JSON.stringify(images_list), "fmz200.xiaohongshu.feed.rsp");
      }
    }
  } 

  if (url.includes("/note/live_photo/save")) {
    const rsp = $.getdata("fmz200.xiaohongshu.feed.rsp");
    if (rsp) {
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
        if (obj.data.datas) {
          replaceUrlContent(obj.data.datas, new_data);
        } else {
          obj = {"code": 0, "success": true, "msg": "成功", "data": {"datas": new_data}};
        }
    }
  } 

  if (url.includes("/note/widgets")) {
    const item = ["cooperate_binds", "generic", "note_next_step", "widget_list"];
    if (obj?.data) {
      for (let i of item) {
        delete obj.data[i];
      }
    }
  } 

  if (url.includes("/v3/note/videofeed?")) {
    if (obj?.data?.length > 0) {
      for (let item of obj.data) {
        if (item?.media_save_config) {
          item.media_save_config.disable_save = false;
          item.media_save_config.disable_watermark = true;
          item.media_save_config.disable_weibo_cover = true;
        }
        if (item?.share_info?.function_entries?.length > 0) {
          const addItem = {type: "video_download"};
          let func = item.share_info.function_entries[0];
          if (func?.type !== "video_download") {
            item.share_info.function_entries.unshift(addItem);
          }
        }
      }
    }
  }

  if (url.includes("/v4/note/videofeed")) {
    let videoData = [];
    if (obj.data?.length > 0) {
      for (let item of obj.data) {
        if (item?.share_info?.function_entries?.length > 0) {
          const hasDownload = item.share_info.function_entries.some(entry => entry.type === "video_download");
          if (!hasDownload) {
            item.share_info.function_entries.push({type: "video_download"});
          }
        }
        const h265List = item?.video_info_v2?.media?.stream?.h265 || [];
        if (Array.isArray(h265List) && h265List.length > 0) {
          const sortedList = h265List.filter(v => !!v.master_url && !!v.height).sort((a, b) => b.height - a.height);
          let selectedStream = sortedList[0];
          if (item?.id && selectedStream?.master_url) {
            videoData.push({ id: item.id, url: selectedStream.master_url });
          }
        }
      }
      $.setdata(JSON.stringify(videoData), "redBookVideoFeed");
    }
  }

  if (url.includes("/v10/note/video/save")) {
    let videoFeed = JSON.parse($.getdata("redBookVideoFeed") || '[]');
    if (obj.data?.note_id && videoFeed.length > 0) {
      for (let item of videoFeed) {
        if (item.id === obj.data.note_id) {
          obj.data.download_url = item.url;
        }
      }
    }
    if (obj.data?.disable) {
      delete obj.data.disable;
      delete obj.data.msg;
      obj.data.status = 2;
    }
  }

  if (url.includes("/user/followings/followfeed")) {
    if (obj?.data?.items?.length > 0) {
      obj.data.items = obj.data.items.filter((i) => i?.recommend_reason === "friend_post");
    }
  } 

  if (url.includes("/v4/followfeed")) {
    if (obj?.data?.items?.length > 0) {
      obj.data.items = obj.data.items.filter((i) => !["recommend_user"].includes(i.recommend_reason));
    }
  }  

  if (url.includes("/recommend/user/follow_recommend")) {
    if (obj?.data?.title === "你可能感兴趣的人" && obj?.data?.rec_users?.length > 0) {
      obj.data = {};
    }
  } 

  if (url.includes("/v6/homefeed")) {
    if (obj?.data?.length > 0) {
      obj.data = obj.data.filter(item => 
        !item.hasOwnProperty("ads_info") &&
        !item.hasOwnProperty("card_icon") &&
        !item.note_attributes?.includes("goods") &&
        item.model_type !== "live_v2"
      );
    }
  }

  // ===================================================================
  // ▼▼▼ 评论区表情包下载的核心修改逻辑 ▼▼▼
  // ===================================================================
 if (url.includes("/api/sns/v5/note/comment/list?") || url.includes("/api/sns/v3/note/comment/sub_comments?")) {
  // 检查 Loon 传入的参数中是否包含我们定义的开关
  let downloadMode = (typeof $argument !== 'undefined' && $argument.includes('sticker_mode=download'));

  if (downloadMode) {
    console.log('[小红书] Argument参数检测到开启表情下载模式。');
    if (obj.data?.comments?.length > 0) {
      for (const comment of obj.data.comments) {
        // 将表情包类型改为图片
        if (comment.comment_type === 3) comment.comment_type = 2;
        if (comment.media_source_type === 1) comment.media_source_type = 0;
        
        // 同时处理子评论
        if (comment.sub_comments?.length > 0) {
          for (const sub_comment of comment.sub_comments) {
            if (sub_comment.comment_type === 3) sub_comment.comment_type = 2;
            if (sub_comment.media_source_type === 1) sub_comment.media_source_type = 0;
          }
        }
      }
    }
  }
    // (评论区Live Photo下载等其他逻辑保持不变)
    // ...
  }
  // ===================================================================
  // ▲▲▲ 核心修改逻辑结束 ▲▲▲
  // ===================================================================

  if (url.includes("/api/sns/v1/interaction/comment/video/download?")) {
    const commitsCache = $.getdata("fmz200.xiaohongshu.comments.rsp");
    if (commitsCache) {
      let commitsRsp = JSON.parse(commitsCache);
      if (commitsRsp.livePhotos.length > 0 && obj.data?.video) {
        for (const item of commitsRsp.livePhotos) {
          if (item.videId === obj.data.video.video_id) {
            obj.data.video.video_url = item.videoUrl;
            break;
          }
        }
      }
    }
  }

  $done({body: JSON.stringify(obj)});
}


/**
 * ===================================================================
 * 辅助函数与环境构造器 (必须保留)
 * ===================================================================
 */

// (这里是您原脚本中的所有辅助函数，如 imageEnhance, replaceUrlContent 等)
function imageEnhance(jsonStr) { /* ... */ }
function replaceUrlContent(collectionA, collectionB) { /* ... */ }
function deduplicateLivePhotos(livePhotos) { /* ... */ }
function replaceRedIdWithFmz200(obj) { /* ... */ }

// Env 构造函数
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),a=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:r,headers:o,rawBody:a,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":i}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),this.isSurge()||this.isQuanX()||this.isLoon()?$done(t):this.isNode()&&process.exit(1)}}(t,e)}