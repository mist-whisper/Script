// BiliBili 配置读取与交互设置

//  工具函数
function readConfig(key, defaultVal = "") {
  const val = $persistentStore.read(key);
  return val !== null && val !== undefined ? val : defaultVal;
}

function writeConfig(key, val) {
  return $persistentStore.write(val, key);
}

//  初始化默认配置
const defaults = {
  // DailyBonus
  "@bilibili_daily_bonus.Settings.exec": "5",
  "@bilibili_daily_bonus.Settings.charge_mid": "",
  "@bilibili_daily_bonus.Settings.bp_num": "5",

  // Modified - Switch
  "@BiliBili.Modified.Settings.Switch": "true",

  // Modified - Skin & Animation
  "@BiliBili.Modified.Settings.Skin.user_equip": "1682863365001",
  "@BiliBili.Modified.Settings.Skin.load_equip": "32263",

  // Modified - Private
  "@BiliBili.Modified.Settings.Private.vip": "false",
  "@BiliBili.Modified.Settings.Private.coin": "",
  "@BiliBili.Modified.Settings.Private.bcoin": "",
  "@BiliBili.Modified.Settings.Private.follower": "",
  "@BiliBili.Modified.Settings.Private.level": "",
  "@BiliBili.Modified.Settings.Private.like": "",
};

// 初始化所有配置项
for (const [key, def] of Object.entries(defaults)) {
  if ($persistentStore.read(key) === null) {
    writeConfig(key, def);
  }
}

//  主逻辑
async function main() {
  const menu = [
    "🪙 设置每日任务（投币/充电）",
    " 设置皮肤与动画",
    " 设置用户信息（大会员、粉丝等）",
    " 查看当前配置",
  ];

  const idx = await $input("选择操作：", "BiliBili 配置", "", menu.join("\n"));
  if (idx === undefined) return $done();

  if (idx.includes("每日任务")) {
    const exec = await $input("每日投币次数", "设置", readConfig("@bilibili_daily_bonus.Settings.exec"));
    const mid = await $input("充电用户UID（留空为自己）", "设置", readConfig("@bilibili_daily_bonus.Settings.charge_mid"));
    const bp = await $input("充电B币数量", "设置", readConfig("@bilibili_daily_bonus.Settings.bp_num"));

    writeConfig("@bilibili_daily_bonus.Settings.exec", exec);
    writeConfig("@bilibili_daily_bonus.Settings.charge_mid", mid);
    writeConfig("@bilibili_daily_bonus.Settings.bp_num", bp);

    $notify("每日任务配置已保存", "", `投币：${exec} | 充电B币：${bp}`);
  }

  else if (idx.includes("皮肤")) {
    const skin = await $input("皮肤ID", "设置皮肤", readConfig("@BiliBili.Modified.Settings.Skin.user_equip"));
    const load = await $input("加载动画ID", "设置加载动画", readConfig("@BiliBili.Modified.Settings.Skin.load_equip"));
    const enable = await $input("是否启用修改功能（true/false）", "总开关", readConfig("@BiliBili.Modified.Settings.Switch"));

    writeConfig("@BiliBili.Modified.Settings.Skin.user_equip", skin);
    writeConfig("@BiliBili.Modified.Settings.Skin.load_equip", load);
    writeConfig("@BiliBili.Modified.Settings.Switch", enable);

    $notify("皮肤与动画配置已保存", "", `皮肤ID: ${skin} | 加载动画: ${load}`);
  }

  else if (idx.includes("用户信息")) {
    const vip = await $input("是否模拟大会员（true/false）", "设置", readConfig("@BiliBili.Modified.Settings.Private.vip"));
    const coin = await $input("硬币数", "设置", readConfig("@BiliBili.Modified.Settings.Private.coin"));
    const bcoin = await $input("B币数", "设置", readConfig("@BiliBili.Modified.Settings.Private.bcoin"));
    const follower = await $input("粉丝数", "设置", readConfig("@BiliBili.Modified.Settings.Private.follower"));
    const level = await $input("用户等级（≤6）", "设置", readConfig("@BiliBili.Modified.Settings.Private.level"));
    const like = await $input("被赞次数", "设置", readConfig("@BiliBili.Modified.Settings.Private.like"));

    writeConfig("@BiliBili.Modified.Settings.Private.vip", vip);
    writeConfig("@BiliBili.Modified.Settings.Private.coin", coin);
    writeConfig("@BiliBili.Modified.Settings.Private.bcoin", bcoin);
    writeConfig("@BiliBili.Modified.Settings.Private.follower", follower);
    writeConfig("@BiliBili.Modified.Settings.Private.level", level);
    writeConfig("@BiliBili.Modified.Settings.Private.like", like);

    $notify("用户数据配置已保存", "", `VIP: ${vip} | 等级: ${level} | 粉丝: ${follower}`);
  }

  else if (idx.includes("查看")) {
    const content = Object.entries(defaults)
      .map(([k, _]) => `${k}: ${readConfig(k)}`)
      .join("\n");
    $notify("当前配置：", "", content);
  }

  $done();
}

main();
