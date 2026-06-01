// 引用地址：https://raw.githubusercontent.com/zirawell/Ad-Cleaner/main/Collection/js/dianping.js

const url = $request.url;
const header = $request.headers;
const resp = {};
const headopt = header["M-SHARK-TRACEID"] || header["m-shark-traceid"];

if (headopt != null) {
  $done({ body:"", headers:"", status: "HTTP/1.1 204 No Content" });
} else{
  $done({});
}