/**
 * @title   Remove Banner & Asset Components
 * @purpose 在 mtop.cainiao.app.e2e.engine.page.fetch.cn 接口中移除 banner 和 asset
 */

let obj = JSON.parse($response.body);

// 删除轮播图组件
if (obj.data && obj.data.data && obj.data.data.banner) {
  delete obj.data.data.banner;
}

// 删除裹酱积分 / 绿色回收特惠寄件组件（asset）
if (obj.data && obj.data.data && obj.data.data.asset) {
  delete obj.data.data.asset;
}

// 返回修改后的 body
$done({ body: JSON.stringify(obj) });