let body = $response.body;
let obj = JSON.parse(body);

// 直接清空广告相关数组
if (obj?.data?.objects) {
  obj.data.objects["NewHome-&-HBTips"] = [];
  obj.data.objects["NewHome-&-Home_Banner"] = [];
  obj.data.objects["NewHome-&-MiddleAD"] = [];
  obj.data.objects["NewHome-&-FilmAD"] = [];

  // 可选：如果 "Transformers" 里也有广告，可以根据实际需求过滤
  // 例如只保留 title/commendName 不含“会员”“活动”“票价”等的项
  if (Array.isArray(obj.data.objects["NewHome-&-Transformers"])) {
    obj.data.objects["NewHome-&-Transformers"] = obj.data.objects["NewHome-&-Transformers"].filter(item => {
      // 这里可自定义过滤条件
      // 例如只保留 title/commendName 不含“会员”“活动”“票价”等
      const adKeywords = ["会员", "活动", "票价", "卡券", "专区"];
      let name = item.title || item.commendName || "";
      return !adKeywords.some(k => name.includes(k));
    });
  }
}

$done({body: JSON.stringify(obj)});