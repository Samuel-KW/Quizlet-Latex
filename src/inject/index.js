class QuizletLatex {
	constructor () {

		// Obtain set ID and gamemode from URL
		[, this.id, this.mode] = window.location.pathname.split('/');

		// Handle different gamemodes
		this.handleMode(this.mode);
	}

	handleMode (mode) {
		console.log(mode);

		switch(mode) {
			case 'flashcards':
				this.observeFlashcards();
				break;

			case 'learn':
				this.observeLearn();
				break;

			case 'write':
				this.observeWrite();
				break;

			case 'study-path':
				break;

			default:
				this.observeHomepage();
		}
	}

	observeWrite () {
		const carousel = document.getElementById('AssistantModeTarget');
		this.watchAndLatex(carousel);
	}

	observeLearn () {
		const carousel = document.getElementById('AssistantModeTarget');
		this.watchAndLatex(carousel);
	}

	observeFlashcards () {
		const carousel = document.querySelector('div[data-testid="Card"]')
							.parentElement
							.parentElement
							.parentElement
							.parentElement
							.parentElement;

		this.watchAndLatex(carousel);
	}

	observeHomepage () {
		const carousel = document.querySelector('.MiniFlashcards');
		this.watchAndLatex(carousel);
	}

	watchAndLatex (query) {
		this.observe(query, mutations => {
			const hasMath = mutations.find(mutation => {
				const nodes = [...mutation.addedNodes];
				const hasMathJax = nodes.find(node => !node.nodeName.startsWith('MJX'));

				return !hasMathJax;
			});

			hasMath && this.latex(query);
		});
	}

	latex (element) {
		return MathJax.typeset([element]);
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

MathJax.typeset();

const Qz = new QuizletLatex();
window.Qz = Qz;
