// 引用地址：https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/XMLYVIP.js

const _0x1fe1 = [
  "undefined", "headers", "Cookie", "match", "trim",
  "<p[^>]*>([^<]+)<\/p>", "body", "GET",
  "https://wxpusher.zjiecode.com/api/message/8FJwxZdmJM52OhTPS8qZcvMdqzM6qvV4",
  "Host", "wxpusher.zjiecode.com", "User-Agent",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  "Sec-Fetch-Dest", "document"
];

const isQX   = typeof $task !== _0x1fe1[0];
const isLoon = typeof $loon !== _0x1fe1[0]
             || (typeof $httpClient !== _0x1fe1[0] && !isQX);

function httpGet(req, callback) {
  if (isQX) {
    $task.fetch(req)
      .then(r => callback(null, { status: r.statusCode }, r.body))
      .catch(e => callback(e));
  } else {
    $httpClient.get(req, callback);
  }
}

if (typeof $request !== _0x1fe1[0]) {
  const req = {
    url:    _0x1fe1[8],
    method: _0x1fe1[7],
    headers: {
      [_0x1fe1[9]]:  _0x1fe1[10],
      [_0x1fe1[11]]: _0x1fe1[12],
      [_0x1fe1[13]]: _0x1fe1[14],
      [_0x1fe1[15]]: _0x1fe1[16]
    }
  };

  httpGet(req, (err, resp, body) => {
    if (err) {
      console.log("喜马拉雅会员异常❌：" + err);
      return $done({});
    }
    const html = body;
    const m = html.match(new RegExp(_0x1fe1[5]));
    const ck = m ? m[1].trim() : null;
    if (ck) {
      const hds = $request.headers;
      hds[_0x1fe1[2]] = ck;
      console.log("喜马拉雅激活会员成功，尽情享受会员听书🌹");
      $done({ headers: hds });
    } else {
      console.log("喜马拉雅会员未生效❌，或已过期");
      $done({});
    }
  });
} else {
  $done({});
}