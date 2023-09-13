
// Inject MathJax
const MathJax = document.createElement('script');
MathJax.src = chrome.runtime.getURL('src/inject/mathjax.js');
MathJax.onload = () => {

	const script = document.createElement('script');
	script.src = chrome.runtime.getURL('src/inject/index.js');
	script.onload = () => script.remove();
	(document.head || document.documentElement).appendChild(script);

	MathJax.remove();
}
(document.head || document.documentElement).appendChild(MathJax);

