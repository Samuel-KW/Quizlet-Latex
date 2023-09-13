
// Inject script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/inject/index.js');
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);