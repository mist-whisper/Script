let body = $response.body;
let obj = JSON.parse(body);

if (obj?.data) {
  obj.data.primeActive = true;
  obj.data.vipType = "keepPrime";
  obj.data.availableFeatures = [
    "audioGuide",
    "run",
    "easyrun",
    "advancedRun"
  ];
  obj.data.expiresAt = "2099-12-31T23:59:59Z";
}

$done({ body: JSON.stringify(obj) });