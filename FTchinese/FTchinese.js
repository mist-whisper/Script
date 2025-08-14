// 引用地址：https://raw.githubusercontent.com/chxm1023/Rewrite/main/cloudfront.js

var ddm = JSON.parse($response.body);

if(/paywall/.test($request.url)){
  Object.assign(ddm, {
    "paywall": 0,
    "premium": 1,
    "expire": "4092599349",
    "standard": 1,
    "v": 2099,
    "campaign_code": "",
    "latest_duration": "yearly",
    "addon": 1
  });
}

if(/get_story_more_info/.test($request.url)){
  ddm.paywall = 0;
  ddm.accessright = "1";
}

$done({ body: JSON.stringify(ddm) });