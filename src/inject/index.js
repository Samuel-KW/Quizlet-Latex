class QuizletLatex {
	constructor () {
		this.observeHomepage();
	}

	observeHomepage () {
		const carousel = document.querySelector('.MiniFlashcards');
		const terms = document.querySelector('section.SetPageTerms-termsList');

		this.watchAndLatex(carousel);
	}

	latex (element) {
		MathJax.Hub.Queue(["Typeset", MathJax.Hub,math]);
	}

	watchAndLatex (query) {
		this.observe(query, mutations => {
			console.log(mutations);
		});
	}

	/**
	 * Handle element mutations
	 * @param {string} query HTML element to observe
	 * @param {Function} callback Callback function
	 */
	observe (element, callback) {

		// Create listener
		const observer = new MutationObserver(function () {
			callback.apply(this, arguments);
		});

		const config = {
			childList: true, // direct children
			subtree: true 	 // lower descendants too
		};
		
		// Start observing
		return observer.observe(element, config);
	}

}


window.addEventListener('DOMContentLoaded', () => {

	const Qz = new QuizletLatex();
	window.Qz = Qz;
});