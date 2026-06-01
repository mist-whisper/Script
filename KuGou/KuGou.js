/**
 * @name Kugou_remove_ads
 * @description 酷狗音乐 去广告脚本 (Surge / Loon / Quantumult X 通用)
 * @author wish
 * @update 2025-10-12
 *
 * 🚀 功能：
 *   - 移除开屏广告、前台广告、弹窗广告等
 *   - 关闭激励广告、隐藏热启动页
 *   - 保留正常配置字段，防止客户端异常
 *
 * 🧩 支持平台：
 *   ✅ Surge
 *   ✅ Loon
 *   ✅ Quantumult X
 */

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);

  if (obj?.data) {
    // === 可扩展的广告字段清单 ===
    const adKeys = [
      "boot_ads",        // 启动广告
      "front_ads",       // 前台广告
      "discard",         // 废弃广告
      "vip_ads",         // 会员广告（预留）
      "banner_ads",      // 轮播广告（预留）
      "popup_ads",       // 弹窗广告（预留）
      "recommend_ads",   // 推荐广告（预留）
      "homepage_ads"     // 首页广告（预留）
    ];

    // === 批量清空广告数组 ===
    adKeys.forEach(key => {
      if (obj.data[key]) obj.data[key] = [];
    });

    // === 若 config 存在，调整广告策略 ===
    const cfg = obj.data.config || {};

    // 隐藏热启动页广告
    if (cfg.hot_boot_page_hide_exp)
      cfg.hot_boot_page_hide_exp.hide = 1;

    // 禁用激励开屏广告
    if (cfg.incentive_splash_exp)
      cfg.incentive_splash_exp.is_incentive = 0;

    // 可选：减少广告请求频率
    if (cfg.front_request_interval) cfg.front_request_interval = 3600;
    if (cfg.boot_display_interval) cfg.boot_display_interval = 3600;

    obj.data.config = cfg;
  }

  $done({ body: JSON.stringify(obj) });

} catch (err) {
  console.log("❌ Kugou_remove_ads 解析失败:", err);
  $done({});
}