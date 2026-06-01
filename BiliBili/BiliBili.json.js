(() => {
  $done(o($response, $request, globalThis.$argument) || {});

  function o({ body: e }, { url: t }, i) {
    let a = {
      "/resource/show/tab/v2?": l,
      "/v2/splash": s,
      "/feed/index?": b,
      "/feed/index/story?": r,
      "/account/mine": f,
      "/account/myinfo?": _
    };

    try {
      e = JSON.parse(e);
      if (!e?.data) return null;
      let c = typeof i == "string"
        ? JSON.parse(i)
        : (typeof i == "object" && i !== null ? i : {});
      for (let n in a) {
        if (t.includes(n)) {
          return { body: JSON.stringify(a[n](e, c)) };
        }
      }
      return null;
    } catch (c) {
      console.log(c.toString());
      return null;
    }
  }

  // —— 首页 tab 定制 ——
  function l(e) {
    e.data.tab = [
      { pos: 1, id: 731, name: "直播", tab_id: "直播tab", uri: "bilibili://live/home" },
      { pos: 2, id: 477, name: "推荐", tab_id: "推荐tab", uri: "bilibili://pegasus/promo", default_selected: 1 },
      { pos: 3, id: 478, name: "热门", tab_id: "热门tab", uri: "bilibili://pegasus/hottopic" },
      { pos: 4, id: 545, name: "动画", tab_id: "bangumi", uri: "bilibili://pgc/home" },
      { pos: 5, id: 151, name: "影视", tab_id: "film", uri: "bilibili://pgc/cinema-tab" }
    ];
    e.data.top = [
      { pos: 1, id: 176, name: "消息", tab_id: "消息Top", uri: "bilibili://link/im_home", icon: "http://i0.hdslb.com/bfs/archive/d43047538e72c9ed8fd8e4e34415fbe3a4f632cb.png" }
    ];
    e.data.bottom = [
      {
        pos: 1,
        id: 177,
        name: "首页",
        tab_id: "home",
        uri: "bilibili://main/home/",
        icon: "http://i0.hdslb.com/bfs/archive/63d7ee88d471786c1af45af86e8cb7f607edf91b.png",
        icon_selected: "http://i0.hdslb.com/bfs/archive/e5106aa688dc729e7f0eafcbb80317feb54a43bd.png"
      },
      {
        pos: 2,
        id: 179,
        name: "动态",
        tab_id: "dynamic",
        uri: "bilibili://following/home/",
        icon: "http://i0.hdslb.com/bfs/archive/86dfbe5fa32f11a8588b9ae0fccb77d3c27cedf6.png",
        icon_selected: "http://i0.hdslb.com/bfs/archive/25b658e1f6b6da57eecba328556101dbdcb4b53f.png"
      },
      {
        pos: 5,
        id: 181,
        name: "我的",
        tab_id: "我的Bottom",
        uri: "bilibili://user_center/",
        icon: "http://i0.hdslb.com/bfs/archive/4b0b2c49ffeb4f0c2e6a4cceebeef0aab1c53fe1.png",
        icon_selected: "http://i0.hdslb.com/bfs/archive/a54a8009116cb896e64ef14dcf50e5cade401e00.png"
      }
    ];
    return e;
  }

  // —— 启动页去广告 ——
  function s(e) {
    ["show", "event_list"].forEach(i => {
      if (e.data[i]) {
        e.data[i] = [];
      }
    });
    return e;
  }

  // —— 推荐首页去广告 ——
  function b(e) {
    if (Array.isArray(e.data.items)) {
      let t = new Set(["small_cover_v2", "large_cover_single_v9", "large_cover_v1"]);
      e.data.items = e.data.items.filter(i =>
        !i.banner_item &&
        !i.ad_info &&
        i.card_goto === "av" &&
        t.has(i.card_type)
      );
    }
    return e;
  }

  // —— 推荐页 Story 去广告 ——
  function r(e) {
    if (Array.isArray(e.data.items)) {
      e.data.items = e.data.items.reduce((t, i) => {
        if (
          !i.ad_info &&
          !i.card_goto?.startsWith("ad")
        ) {
          delete i.story_cart_icon;
          delete i.free_flow_toast;
          t.push(i);
        }
        return t;
      }, []);
    }
    return e;
  }

  // —— “我的”页面定制 —— 
  function f(e, t) {
    let i = {
      // 只保留“离线缓存”、“历史记录”、“我的收藏”，删除“稍后再看”和“推荐服务”
      sections_v2: [
        {
          items: [
            {
              id: 396,
              title: "离线缓存",
              uri: "bilibili://user_center/download",
              icon: "http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png",
              common_op_item: {}
            },
            {
              id: 397,
              title: "历史记录",
              uri: "bilibili://user_center/history",
              icon: "http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png",
              common_op_item: {}
            },
            {
              id: 3072,
              title: "我的收藏",
              uri: "bilibili://user_center/favourite",
              icon: "http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png",
              common_op_item: {}
            }
          ],
          style: 1,
          button: {}
        },
        {
          // “更多服务” 部分，仅保留“设置”，删除“联系客服”
          title: "更多服务",
          items: [
            {
              id: 410,
              title: "设置",
              uri: "bilibili://user_center/setting",
              icon: "http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png",
              common_op_item: {}
            }
          ],
          style: 2,
          button: {}
        }
      ],

      // iPad 版本同步更新：只保留“离线缓存”、“历史记录”、“我的收藏”，移除“稍后再看”
      ipad_sections: [
        {
          id: 747,
          title: "离线缓存",
          uri: "bilibili://user_center/download",
          icon: "http://i0.hdslb.com/bfs/feed-admin/9bd72251f7366c491cfe78818d453455473a9678.png",
          mng_resource: { icon_id: 0, icon: "" }
        },
        {
          id: 748,
          title: "历史记录",
          uri: "bilibili://user_center/history",
          icon: "http://i0.hdslb.com/bfs/feed-admin/83862e10685f34e16a10cfe1f89dbd7b2884d272.png",
          mng_resource: { icon_id: 0, icon: "" }
        },
        {
          id: 749,
          title: "我的收藏",
          uri: "bilibili://user_center/favourite",
          icon: "http://i0.hdslb.com/bfs/feed-admin/6ae7eff6af627590fc4ed80c905e9e0a6f0e8188.png",
          mng_resource: { icon_id: 0, icon: "" }
        }
      ],

      // iPad 版的其他区块保持不变
      ipad_upper_sections: [
        {
          id: 752,
          title: "创作首页",
          uri: "/uper/homevc",
          icon: "http://i0.hdslb.com/bfs/feed-admin/d20dfed3b403c895506b1c92ecd5874abb700c01.png",
          mng_resource: { icon_id: 0, icon: "" }
        }
      ],
      ipad_recommend_sections: [
        {
          id: 755,
          title: "我的关注",
          uri: "bilibili://user_center/myfollows",
          icon: "http://i0.hdslb.com/bfs/feed-admin/fdd7f676030c6996d36763a078442a210fc5a8c0.png",
          mng_resource: { icon_id: 0, icon: "" }
        },
        {
          id: 756,
          title: "我的消息",
          uri: "bilibili://link/im_home",
          icon: "http://i0.hdslb.com/bfs/feed-admin/e1471740130a08a48b02a4ab29ed9d5f2281e3bf.png",
          mng_resource: { icon_id: 0, icon: "" }
        }
      ],

      // iPad “更多服务” 同步，只保留“设置”，移除“我的客服”
      ipad_more_sections: [
        {
          id: 764,
          title: "设置",
          uri: "bilibili://user_center/setting",
          icon: "http://i0.hdslb.com/bfs/feed-admin/34e8faea00b3dd78977266b58d77398b0ac9410b.png",
          mng_resource: { icon_id: 0, icon: "" }
        }
      ]
    };

    // 覆盖“我的”页面原始返回
    Object.keys(i).forEach(a => {
      if (e.data[a]) {
        e.data[a] = i[a];
      }
    });

    // 如果传参中有 showUperCenter，就插入“创作中心”模块（可选）
    if (t.showUperCenter && e.data.sections_v2) {
      e.data.sections_v2.splice(1, 0, {
        title: "创作中心",
        items: [
          {
            id: 171,
            title: "创作中心",
            uri: "bilibili://uper/homevc",
            icon: "http://i0.hdslb.com/bfs/archive/d3aad2d07538d2d43805f1fa14a412d7a45cc861.png",
            need_login: 1,
            global_red_dot: 0,
            display: 1,
            is_up_anchor: !0
          },
          {
            id: 533,
            title: "数据中心",
            uri: "https://member.bilibili.com/york/data-center?navhide=1&from=profile",
            icon: "http://i0.hdslb.com/bfs/feed-admin/367204ba56004b1a78211ba27eef5b4cc53a35.png",
            need_login: 1,
            global_red_dot: 0,
            display: 1
          },
          {
            id: 707,
            title: "直播中心",
            uri: "https://live.bilibili.com/p/html/live-app-anchor-center/index.html?is_live_webview=1#/",
            icon: "http://i0.hdslb.com/bfs/feed-admin/48e17ccd0ce0cfc9c7826422d5e47ce98f064c2a.png",
            need_login: 1,
            display: 1
          },
          {
            id: 2647,
            title: "直播数据",
            uri: "https://live.bilibili.com/p/html/live-app-data/index.html?source_tag=0&foreground=pink&is_live_webview=1&hybrid_set_header=2#/",
            icon: "https://i0.hdslb.com/bfs/legacy/0566b128c51d85b7ec545f318e1fd437d172dfea.png",
            display: 1
          }
        ],
        style: 1,
        button: {
          text: "发布",
          url: "bilibili://uper/user_center/archive_selection",
          icon: "http://i0.hdslb.com/bfs/archive/205f47675eaaca7912111e0e9b1ac94cb985901f.png",
          style: 1
        },
        type: 1,
        up_title: "创作中心"
      });
    }

    // 删除无用字段，并注入 VIP 信息
    delete e.data.answer;
    delete e.data.live_tip;
    delete e.data.vip_section;
    delete e.data.vip_section_v2;
    delete e.data.modular_vip_section;
    e.data.vip_type = 2;
    e.data.vip = d();

    return e;
  }

  // —— 获取“我的信息”时注入 VIP ——
  function _(e) {
    e.data.vip = d();
    return e;
  }

  // —— 模拟 VIP 信息 ——
  function d() {
    let img = p();
    return {
      status: 1,
      type: 2,
      vip_pay_type: 0,
      due_date: 90052704e5,
      tv_vip_status: 1,
      tv_vip_pay_type: 0,
      tv_due_date: 90052704e5,
      role: 15,
      theme_type: 0,
      nickname_color: "#FB7299",
      avatar_subscript: 1,
      avatar_subscript_url: "",
      avatar_icon: { icon_resource: {} },
      label: {
        path: "",
        text: "百年大会员",
        label_theme: "hundred_annual_vip",
        text_color: "#FFFFFF",
        bg_style: 1,
        bg_color: "#FB7299",
        border_color: "",
        use_img_label: !0,
        image: img,
        img_label_uri_hans: "",
        img_label_uri_hant: "",
        img_label_uri_hans_static: img,
        img_label_uri_hant_static: img
      }
    };
  }

  // —— 根据日期返回不同 VIP 图标 ——
  function p() {
    let e = new Date(),
      t = e.getMonth() + 1,
      i = e.getDate();
    switch (`${t}/${i}`) {
      case "6/1":
        return "https://i0.hdslb.com/bfs/bangumi/kt/629e28d4426f1b44af1131ade99d27741cc61d4b.png";
      default:
        return "https://i0.hdslb.com/bfs/vip/52f60c8bdae8d4440edbb96dad72916022adf126.png";
    }
  }
})();