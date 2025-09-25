const instance = {};

chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    const url = new URL(details.url);
    if (url.hostname === "x.com" || url.hostname === "twitter.com") {
      url.hostname = instance.value || "twitt.jp";
      chrome.tabs.update(details.tabId, { url: url.href });
    }
  },
  { urls: ["<all_urls>"] },
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const url = new URL(details.url);
    if (url.hostname === "twitt.jp") {
      if (details.statusCode === 301 || details.statusCode === 302) {
        const locationHeader = details.responseHeaders.find(header => header.name.toLowerCase() === 'location');
        if (locationHeader) {
          const locationUrl = new URL(locationHeader.value);
          instance.value = locationUrl.hostname;
        }
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const url = new URL(details.url);
    if (url.hostname === instance.value) {
      if (!details.statusCode || details.statusCode === 429) {
        url.hostname = "twitt.jp";
        chrome.tabs.update(details.tabId, { url: url.href });
      }
    }
  },
  { urls: ["<all_urls>"] }
);
