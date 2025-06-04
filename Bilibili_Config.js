// BiliBili 配置助手

// 工具函数
function readConfig(key, defaultVal = "") {
  const val = $persistentStore.read(key);
  return val !== null && val !== undefined ? val : defaultVal;
}

function writeConfig(key, val) {
  return $persistentStore.write(val, key);
}

// 默认值初始化
const defaults = {
  // DailyBonus
  "exec": "5",
  "charge_mid": "",
  "bp_num": "5",

  // Modified - Switch
  "Settings.Switch": "true",

  // Modified - Skin & Animation
  "Skin.user_equip": "1682863365001",
  "Skin.load_equip": "32263",

  // Modified - Private
  "Private.vip": "false",
  "Private.coin": "",
  "Private.bcoin": "",
  "Private.follower": "",
  "Private.level": "",
  "Private.like": "",
};

// 初始化默认值
for (const [key, def] of Object.entries(defaults)) {
  if ($persistentStore.read(key) === null) {
    writeConfig(key, def);
  }
}

// 皮肤选项
const skinOptions = [
  { key: "2529", label: "初音未来-日版" },
  { key: "2530", label: "初音未来-夜版" },
  { key: "32264", label: "EveOneCat2" },
  { key: "33459", label: "有栖mana" },
  { key: "34813", label: "嘉然装扮2.0(1)" },
  { key: "39859", label: "眠眠兔" },
  { key: "50605", label: "铃芽之旅" },
  { key: "52484", label: "JDG坚定信仰" },
  { key: "1682863365001", label: "小猫咪金的没烦恼" },
];

// 加载动画选项
const loadOptions = [
  { key: "2531", label: "初音未来13周年" },
  { key: "32263", label: "EveOneCat2" },
  { key: "33460", label: "有栖mana" },
  { key: "49391", label: "提摩西小队第二弹" },
  { key: "1680172285001", label: "豆豆摇头晃脑" }
];

// 菜单选择器
async function selectFromList(title, options) {
  const menu = options.map(opt => opt.label).join("\n");
  const input = await $input(`请选择 ${title}`, title, "", menu);
  const found = options.find(opt => opt.label === input);
  return found ? found.key : null;
}

// 主入口
async function main() {
  const menu = [
    "🪙 设置每日任务（投币/充电）",
    "🎨 设置皮肤与动画",
    "👑 设置用户信息（大会员、粉丝等）",
    "🔍 查看当前配置",
  ];

  const idx = await $input("选择操作：", "BiliBili 配置中心", "", menu.join("\n"));
  if (idx === undefined) return $done();

  if (idx.includes("每日任务")) {
    const exec = await $input("每日投币次数", "设置", readConfig("exec"));
    const mid = await $input("充电用户UID（留空为自己）", "设置", readConfig("charge_mid"));
    const bp = await $input("充电B币数量", "设置", readConfig("bp_num"));

    writeConfig("exec", exec);
    writeConfig("charge_mid", mid);
    writeConfig("bp_num", bp);

    $notify("✅ 每日任务配置已保存", "", `投币：${exec} | 充电B币：${bp}`);
  }

  else if (idx.includes("皮肤")) {
    const selectedSkin = await selectFromList("皮肤", skinOptions);
    const selectedLoad = await selectFromList("加载动画", loadOptions);
    const enable = await $input("是否启用修改功能（true/false）", "总开关", readConfig("Settings.Switch"));

    if (selectedSkin) writeConfig("Skin.user_equip", selectedSkin);
    if (selectedLoad) writeConfig("Skin.load_equip", selectedLoad);
    writeConfig("Settings.Switch", enable);

    $notify("🎨 皮肤与动画配置已保存", "", `皮肤ID: ${selectedSkin} | 动画ID: ${selectedLoad}`);
  }

  else if (idx.includes("用户信息")) {
    const vip = await $input("是否模拟大会员（true/false）", "设置", readConfig("Private.vip"));
    const coin = await $input("硬币数", "设置", readConfig("Private.coin"));
    const bcoin = await $input("B币数", "设置", readConfig("Private.bcoin"));
    const follower = await $input("粉丝数", "设置", readConfig("Private.follower"));
    const level = await $input("用户等级（≤6）", "设置", readConfig("Private.level"));
    const like = await $input("被赞次数", "设置", readConfig("Private.like"));

    writeConfig("Private.vip", vip);
    writeConfig("Private.coin", coin);
    writeConfig("Private.bcoin", bcoin);
    writeConfig("Private.follower", follower);
    writeConfig("Private.level", level);
    writeConfig("Private.like", like);

    $notify("👑 用户信息配置已保存", "", `VIP: ${vip} | 等级: ${level} | 粉丝: ${follower}`);
  }

  else if (idx.includes("查看")) {
    const content = Object.entries(defaults)
      .map(([k, _]) => `${k}: ${readConfig(k)}`)
      .join("\n");
    $notify("📦 当前配置：", "", content);
  }

  $done();
}

main();
