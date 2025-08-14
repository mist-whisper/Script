if (
  $request?.method === "GET" &&
  $response?.statusCode === 302 &&
  $response.headers?.Location?.includes(".apple.com")
) {
  const tokenData = getUrlParamValue($request.url, "tokenData");
  if (tokenData) {
    try {
      const tokenDataObj = JSON.parse(decodeURIComponent(tokenData));
      $response.headers.Location = tokenDataObj.url;
    } catch (e) {
      console.log("tokenData decode error:", e);
    }
  }
}

$done({ headers: $response.headers });

function getUrlParamValue(url, key) {
  if (!url.includes("?")) return null;
  return Object.fromEntries(
    url
      .split("?")[1]
      .split("&")
      .map((pair) => pair.split("="))
  )[key];
}