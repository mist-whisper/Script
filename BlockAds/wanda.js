let body = $response.body;
let obj = JSON.parse(body);

if (obj && obj.data && obj.data.objects) {
  // 处理 OpenAPP-&-FlashAD
  if (Array.isArray(obj.data.objects["OpenAPP-&-FlashAD"])) {
    obj.data.objects["OpenAPP-&-FlashAD"] = [];
  }
  // 处理 InTheaters-&-BoxAD
  if (Array.isArray(obj.data.objects["InTheaters-&-BoxAD"])) {
    obj.data.objects["InTheaters-&-BoxAD"] = [];
  }
}

$done({ body: JSON.stringify(obj) });