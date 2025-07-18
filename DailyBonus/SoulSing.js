// 引用地址：https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/SoulSing.js
//2025/5/5

const isQX = typeof $task !== "undefined";
const isLoon = typeof $loon !== "undefined";
const isRequest = typeof $request !== "undefined";

const notify = (title, subtitle, message) => {
  if (typeof $notify !== "undefined") {
    $notify(title, subtitle, message);
  } else if (typeof $notification !== "undefined") {
    $notification.post(title, subtitle, message);
  }
};

const log = (msg) => console.log(msg);

const getVal = (key) => {
  if (typeof $prefs !== "undefined") return $prefs.valueForKey(key);
  if (typeof $persistentStore !== "undefined") return $persistentStore.read(key);
  return null;
};
const setVal = (key, val) => {
  if (typeof $prefs !== "undefined") return $prefs.setValueForKey(val, key);
  if (typeof $persistentStore !== "undefined") return $persistentStore.write(val, key);
  return null;
};

if (isRequest) {
  const headers = $request.headers;
  const url = $request.url;

  setVal("soul_sign_url", url);
  setVal("soul_sign_headers", JSON.stringify(headers));

  notify("参数获取成功🎉", "", "请求参数已保存");
  $done({});
} else {
  const url = getVal("soul_sign_url");
  const headersRaw = getVal("soul_sign_headers");

  if (!url || !headersRaw) {
    notify("Soul金币签到失败❌", "", "未找到请求参数");
    $done();
  } else {
    const headers = JSON.parse(headersRaw);
    const request = { url: url, method: "GET", headers: headers };

    const handleResponse = (body) => {
      try {
        const json = JSON.parse(body);
        const msg = json?.data?.msg || "无 msg";
        const title = json?.data?.signRewardMsg?.title;

        notify("Soul金币签到结果", msg, title || "");
        log("响应内容:\n" + body);
      } catch (e) {
        notify("解析失败", "", e.toString());
      } finally {
        $done();
      }
    };

    if (isQX) {
      $task.fetch(request).then(
        (resp) => handleResponse(resp.body),
        (err) => {
          notify("请求失败", "", JSON.stringify(err));
          $done();
        }
      );
    } else if (isLoon) {
      $httpClient.get(request, (err, resp, data) => {
        if (err) {
          notify("请求失败", "", JSON.stringify(err));
          $done();
        } else {
          handleResponse(data);
        }
      });
    } else {
      notify("不支持的运行环境", "", "");
      $done();
    }
  }
}
