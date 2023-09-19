const loadScript = src => new Promise((resolve, reject) => {
	const script = document.createElement('script');
	script.src = src;
	
	script.onload = () => resolve(script);
	script.onerror = () => reject(script);

	(document.head || document.documentElement).appendChild(script);
});

(async () => {
	const instant = await loadScript(chrome.runtime.getURL('src/inject/instant.js'));
	const MathJax = await loadScript(chrome.runtime.getURL('src/inject/mathjax.js'));
	const script = await loadScript(chrome.runtime.getURL('src/inject/index.js'));
	
	instant.remove();
	MathJax.remove();
	script.remove();
})();

