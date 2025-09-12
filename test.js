// Surge / Loon JavaScript 脚本示例
let body = $response.body;
let obj = JSON.parse(body);

// 重构 data，将有效格子组合成数组
obj.data.places = [];

if (obj.data.fourPlace) obj.data.places.push(obj.data.fourPlace);
if (obj.data.firstPlace) obj.data.places.push(obj.data.firstPlace);

// 删除原来的单独字段
delete obj.data.fourPlace;
delete obj.data.firstPlace;
delete obj.data.secendPlace;
delete obj.data.thirdPlace;

// 输出修改后的 JSON
$done({body: JSON.stringify(obj)});