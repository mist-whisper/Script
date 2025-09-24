const method = $request.method;
const url = $request.url;
const status = $response.status;
let headers = $response.headers;
let body = $response.body;

const notifiTitle = "百度防跳转优化+禁止视频自动播放";

try {
  if (method === "GET" && status === 302 && headers?.Location) {
    let loc = headers.Location;

    // ① 修复 boxer.baidu.com 跳转
    if (loc.includes("boxer.baidu.com")) {
      let real = getUrlParamValue(loc, "url") || getUrlParamValue(loc, "src");
      if (real) {
        headers.Location = decodeURIComponent(real);
        console.log(`修复 boxer 跳转成功 → ${headers.Location}`);
      } else {
        console.log("boxer 未解析出真实地址，保持原样");
      }
    }

    // ② 阻止贴吧跳转 App Store → 停留在当前页面
    else if (/tieba\.baidu\.com/.test(url) && /apple\.com/.test(loc)) {
      delete headers.Location; // 移除跳转地址
      console.log("阻止贴吧跳转 App Store → 停留原页面");
    }

    // ③ 普通百度搜索跳 App Store 的 tokenData 修复
    else if (loc.includes(".apple.com")) {
      let tokenData = getUrlParamValue(url, "tokenData");
      if (tokenData) {
        try {
          let tokenDataObj = JSON.parse(decodeURIComponent(tokenData));
          if (tokenDataObj.url) {
            headers.Location = tokenDataObj.url;
            console.log(`修复搜索跳转成功 → ${headers.Location}`);
          }
        } catch (e) {
          console.log(`解析 tokenData 出错: ${e}`);
        }
      } else {
        console.log("无 tokenData，保持原始 Location");
      }
    }
  }

  // ④ 搜索结果页禁止视频自动播放（注入 JS）
  else if (/www\.baidu\.com\/s\?/.test(url) && body) {
    let injectJS = `
      <script>
      (function() {
        function stopAutoPlay(v) {
          if (!v) return;
          v.autoplay = false;
          v.removeAttribute('autoplay');
          v.pause();
        }
        document.querySelectorAll('video').forEach(stopAutoPlay);
        const observer = new MutationObserver(mutations => {
          mutations.forEach(m => {
            m.addedNodes.forEach(node => {
              if (node.tagName === 'VIDEO') stopAutoPlay(node);
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      })();
      </script>
    `;
    body = body.replace(/<\/body>/i, injectJS + "</body>");
    console.log("已注入脚本，禁止视频自动播放");
  } else {
    console.log(`请求无需处理: method=${method}, status=${status}, url=${url}`);
  }
} catch (err) {
  console.log(`脚本异常: ${err}`);
}

$done({ headers, body });

function getUrlParamValue(url, queryName) {
  if (!url.includes("?")) return null;
  return Object.fromEntries(
    url
      .substring(url.indexOf("?") + 1)
      .split("&")
      .map(pair => pair.split("="))
  )[queryName];
}