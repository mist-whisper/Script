// Loon - HTTP-RESPONSE
// 匹配接口：https://api.xiaoyuzhoufm.com/v1/membership/platform

let body = $response.body;
let obj = JSON.parse(body);

// 判断 data 是否存在并清空会员相关内容
if (obj?.data) {
  obj.data.messages = [];
  obj.data.memberType = "NONE";
  obj.data.showRenewal = false;
  obj.data.button = null;
  obj.data.link = "";
}

$done({ body: JSON.stringify(obj) });