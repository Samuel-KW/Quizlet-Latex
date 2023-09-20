class QuizletLatex {
	constructor () {

		// Obtain set ID and gamemode from URL
		[, this.id, this.mode] = window.location.pathname.split('/');

		// Handle different gamemodes
		this.handleMode(this.mode);
	}

	handleMode (mode) {
		console.log(mode);

		const ignored = ['sets', 'notes', 'upload', 'latest', 'courses', 'autosaved', 'study-path', 'explanations'];
		if (!mode || ignored.includes(mode)) return;;

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

			case 'spell':
				this.observeSpell();
				break;

			case 'test':
				this.observeTest();
				break;

			case 'match':
				this.observeMatch();
				break;

			default:
				this.observeHomepage();
		}
	}

	observeMatch () {
		const carousel = document.getElementById('__next');
		this.watchAndLatex(carousel);
	}

	observeTest () {
		this.waitUntil('#AssistantModeTarget').then(carousel => {
			this.watchAndLatex(carousel);
		});
	}

	observeSpell () {
		const carousel = document.getElementById('AssistantModeTarget');
		this.watchAndLatex(carousel);
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
		this.waitUntil('div[data-testid="Card"]').then(elem => {
			const carousel = elem
				.parentElement
				.parentElement
				.parentElement
				.parentElement
				.parentElement;

			this.watchAndLatex(carousel);
		});
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

	/**
	 * Wait until an element exists
	 * @param {string} query HTML element to observe
	 * @param {Function} callback Callback function
	 */
	waitUntil (selector) {

		return new Promise(resolve => {

			if (document.querySelector(selector))
				return resolve(document.querySelector(selector));
	
			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});
	
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

}

MathJax.typeset();

const Qz = new QuizletLatex();
window.Qz = Qz;
