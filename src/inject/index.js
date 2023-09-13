
class MasteringPhysics {
	constructor () {
		this.answers = undefined;

		this.hookRequests();

        // Listen to incoming messages
        this.script_key = 'mastering-physics-extension';
        window.addEventListener('message', evt => {
            try {
                if (evt.data.k === this.script_key && evt.data.s !== 0)
                    return this.handleMessage(evt.data.t, evt.data.d);
            } catch (e) { }
        });
	}

    sendMessage(type, data) {
        return window.postMessage({
            k: this.script_key,
            s: 0,
            t: type,
            d: data
        });
    }

    handleMessage(type, data) {

        switch(type) {
            case 0:
                console.log('Server connected.');
                break;

			case 1:
				//this.nextAssignment();
				break;

			case 2:
				//this.nextAssignment();
				this.handleAnswer(data);
				break;

            default:
                console.log(type, data);
        }

    }

	hookRequests () {
		const _open = XMLHttpRequest.prototype.open;
		const that = this;

		XMLHttpRequest.prototype.open = function () {

			const [method, url] = arguments;

			// Listen to response
			this.addEventListener('readystatechange', function () {

				// Made sure request is complete
				if (this.readyState !== 4 || this.status !== 200) return;

				if (url === '/myct/itemView') {

					// Get response as JSON
					let json = JSON.parse(this.responseText);

					switch (json.message) {
						case 'getProblemDocumentSuccess':
							json = JSON.parse(json.data.problemJSON);
							json.activityTitle = that.activity;

							that.answers = json;
							that.handleAnswers(json);
							break;

						case 'solutionSubmitSuccess':
							console.log('solutionSubmitSuccess', json.data);

							if (json.data.isPenalized) {
								console.log('penalized');
							}
							break;

						default:
							console.log(json.message, json.data);
					}
				}
			});

			// Call the original function
			_open.apply(this, arguments);
		};
	}

	handleAnswer(answer) {
		for (const section of answer.sections) {
			const answer = section.answer;
			if (!answer) continue;

			const elem = document.getElementById('part' + section.id);

			if (elem.hasAttribute('finished-loading')) continue;
				elem.setAttribute('finished-loading', true);

			switch (answer.type) {

				case 'solutionMultipleSelect':
					this.handleAnswerMultipleSelect(elem, answer);
					break;

				case 'solutionStringSet':
					this.handleAnswerStringSet(elem, answer);
					break

				case 'solutionAppletVocab':
					this.handleAnswerAppletVocab(elem, answer);
					break;

				case 'solutionNumberUnits':
					this.handleAnswerNumberUnits(elem, answer);
					break;

				case 'solutionMultipleChoiceRadio':
					this.handleAnswerMultipleChoiceRadio(elem, answer);
					break;

				case 'solutionVectorMoment':
					this.handleAnswerVector(elem, answer);
					break;

				case 'solutionSymbolicSet':
					this.handleAnswerSymbolicSet(elem, section);
					break;

				case 'solutionSymbolic':
					this.handleAnswerSymbolic(elem, answer);
					break;

				// Transition text element
				case 'transition':
					break;

				default:
					console.log('Unknown answer type:', answer);
			}
		}
	}

	handleAnswerMultipleSelect(elem, answer) {

		const answers = answer.showAnswer.split(':');
		const options = elem.querySelectorAll('input[type="checkbox"]');

		for (let i = 0; i < answers.length; ++i) {
			const index = Number(answers[i]);
			options[index].parentElement.style.borderLeft = '2px solid green';
		}
	}

	handleAnswerStringSet (elem, answer) {
		// Create answer element
		const parent = document.createElement('div');
		parent.style = `border: 1px solid green; border-radius: 10px; background-color: #f9f9f9; padding: 1em;`;

		const answerHeader = document.createElement('span');
		answerHeader.style = 'font-weight: bold; font-size: 14px;';
		answerHeader.textContent = 'Answer:';

		const answerContent = document.createElement('div');
		answerContent.textContent = answer.showAnswer;

		parent.appendChild(answerHeader);
		parent.appendChild(answerContent);
		elem.appendChild(parent);
	}

	handleAnswerAppletVocab (elem, answer) {

		// Create answer element
		const parent = document.createElement('div');
		parent.style = `border: 1px solid green; border-radius: 10px; background-color: #f9f9f9; padding: 1em;`;

		const answerHeader = document.createElement('span');
		answerHeader.style = 'font-weight: bold; font-size: 14px;';
		answerHeader.textContent = 'Answer:';

		parent.appendChild(answerHeader);

		
		// Create list of all possible words
		const wordList = this.buildList(answer.widgetConfig.widgetVars.wordList);
		const words = {};
		
		for (const line of wordList) {
			const delimIndex = line.indexOf('=');
			const id = line.substring(0, delimIndex);

			const html = line.substring(delimIndex + 1);
			words[id] = html;
		}


		// Get list of answers
		const responseValue = decodeURIComponent(answer.widgetConfig.widgetVars.setResponseValue);
		const answers = []

		for (const ans of responseValue.split(':')) {
			const ids = ans.split('=')[0];

			for (const id of ids.split(','))
				answers.push(words[id]);
		}
		
		// Generate full answer sentence
		const sentenceList = this.buildList(answer.widgetConfig.widgetVars.sentenceList)[0];
		const answerContent = document.createElement('div');

		answerContent.style = `margin: 5px; border: 1px solid #eee; border-radius: 10px; padding: 5px;`;

		let html = sentenceList.slice(2);
		for (const answer of answers)
			html = html.replace('<blank/>', `<span style="line-height: 2em; border: 1px solid #000; border-radius: 3px; background-color: #E1E1E1; font-weight: bold; padding: 4px 6px;">${answer}</span>`);

		answerContent.innerHTML = html;
		
		parent.appendChild(answerContent);
		elem.appendChild(parent);

		this.render(parent);
	}

	handleAnswerNumberUnits (elem, answer) {
		
		// Create answer element
		const parent = document.createElement('div');
		parent.style = `border: 1px solid green; border-radius: 10px; background-color: #f9f9f9; padding: 1em;`;

		const answerHeader = document.createElement('span');
		answerHeader.style = 'font-weight: bold; font-size: 14px;';
		answerHeader.textContent = 'Answer:';

		const answerContent = document.createElement('div');
		answerContent.innerHTML = answer.solveFor + '<span style="padding: 0 5px">=</span>' + answer.showAnswer;

		parent.appendChild(answerHeader);
		parent.appendChild(answerContent);
		elem.appendChild(parent);

		this.render(parent);
	}

	handleAnswerSymbolic (elem, answer) {

		// Create answer element
		const parent = document.createElement('div');
		parent.style = `border: 1px solid green; border-radius: 10px; background-color: #f9f9f9; padding: 1em;`;

		const answerHeader = document.createElement('span');
		answerHeader.style = 'font-weight: bold; font-size: 14px;';
		answerHeader.textContent = 'Answer:';

		const answerContent = document.createElement('div');
		answerContent.innerHTML = answer.showAnswer + answer.units;

		parent.appendChild(answerHeader);
		parent.appendChild(answerContent);
		elem.appendChild(parent);

		this.render(parent);
	}

	handleAnswerSymbolicSet (elem, section) {

		// Create answer element
		const parent = document.createElement('div');
		parent.style = `border: 1px solid green; border-radius: 10px; background-color: #f9f9f9; padding: 1em;`;

		const answer = document.createElement('div');
		answer.style = 'border: 1px solid #eee; border-radius: 10px; padding: 5px;';

		const answerHeader = document.createElement('span');
		answerHeader.style = 'font-weight: bold; font-size: 14px;';
		answerHeader.textContent = 'Answer:';

		const answerContent = document.createElement('div');
		answerContent.innerHTML = section.answer.solveFor + '<span style="padding: 0 5px">=</span>' + section.answer.showAnswer;

		answer.appendChild(answerHeader);
		answer.appendChild(answerContent);
		parent.appendChild(answer);

		// Create followup element
		if (section.followup) {
			const followup = document.createElement('div');
			followup.style.border = '';
	
			const followupContent = document.createElement('div');
			followupContent.innerHTML = section.followup;
	
			followup.appendChild(followupContent);
			parent.appendChild(followup);
		}
		
		elem.appendChild(parent);

		this.render(parent);	
	}

	render (parent) {
		const texElems = parent.querySelectorAll('.type-specific[type="tex"]');
		for (let i = 0; i < texElems.length; ++i) {
			const elem = texElems[i];

			let contents = elem.textContent;
			contents = contents.replace(/&amp;/g, '&');
			contents = contents.replace(/&gt;/g, '>');
			contents = contents.replace(/&lt;/g, '<');

			const span = MathJax.HTML.Element(
				'span',
				{ origExp: contents },
				[ '\\(' + contents + '\\)' ]
			);

			elem.parentElement.appendChild(span);
			elem.remove();
		}

		MathJax.Hub.Queue(['Typeset', MathJax.Hub, parent]);
	}

	handleAnswerSort (elem, answer) {
		console.log(elem, answer);
	}

	handleAnswerMultipleChoiceRadio (elem, answer) {
		const options = elem.querySelectorAll('input[type="radio"]');
		for (let i = 0; i < options.length; ++i) {
			if (options[i].value === answer.showAnswer) {
				options[i].parentElement.style.borderLeft = '2px solid green';
			}
		}
	}

	handleAnswerVector (elem, answer) {
		console.log(elem, answer);
		
		const values = decodeURIComponent(answer.widgetConfig.widgetVars.setResponseValue);
		const regex = /(.+?)_vec=([\d.-]+?),([\d.-]+?),([\d.-]+?),([\d.-]+?):/g
		
		const info = this.getVectorInfo(values.matchAll(regex));

		elem.appendChild(this.createVectorDrawing(info));
		elem.style.borderLeft = '1px solid green';
	}

	getVectorInfo (regex) {

		let maxX = -Infinity,
			maxY = -Infinity;

		let minX = Infinity,
			minY =  Infinity;
		
		let	sumX = 0,
			sumY = 0;

		const vectors = []

		for (let vec of regex) {
			let [, name, x0, y0, x1, y1] = vec;
			[x0, y0, x1, y1] = [+x0, -y0, +x1, -y1];

			// Update SVG bounds
			if 		(x0 > maxX || x1 > maxX) maxX = Math.max(x0, x1);
			else if (x0 < minX || x1 < minX) minX = Math.min(x0, x1);
			
			if 		(y0 > maxY || y1 > maxY) maxY = Math.max(y0, y1);
			else if (y0 < minY || y1 < minY) minY = Math.min(y0, y1);
		
			sumX += x0 + x1;
			sumY += y0 + y1;

			vectors.push([name, x0, y0, x1, y1]);
		}

		sumX /= vectors.length * 2;
		sumY /= vectors.length * 2;

		const width  = maxX - minX,
			  height = maxY - minY;

		return {
			center: { x: sumX, y: sumY },
			min: { x: minX, y: minY },
			max: { x: maxX, y: maxY },
			width, height,
			vectors
		};
	}

	createVectorDrawing (vectorData, padding=0.25) {

		const vectors = vectorData.vectors;

		// Create an SVG element
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const { min } = vectorData;


		const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

		const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
		marker.setAttribute('id', 'arrowhead');
		marker.setAttribute('markerWidth', '5');
		marker.setAttribute('markerHeight', '3.5');
		marker.setAttribute('refX', '0');
		marker.setAttribute('refY', '1.75');
		marker.setAttribute('orient', 'auto');

		const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('points', '0 0, 5 1.75, 0 3.5');
		polygon.setAttribute('fill', '#AAA');

		marker.appendChild(polygon);
		defs.appendChild(marker);
		svg.appendChild(defs);

		// Set the width and height of the SVG canvas
		svg.setAttribute('width', '400'); 
		svg.setAttribute('height', '300');

		// SVG canvas padding
		const paddingX = vectorData.width * padding;
		const paddingY = vectorData.height * padding;

		// SVG canvas width and height
		const width = vectorData.width + (paddingX * 2);
		const height = vectorData.height + (paddingY * 2);

		// Set the SVG canvas viewbox
		svg.setAttribute('viewBox', `${min.x - paddingX} ${min.y - paddingY} ${width} ${height}`); 

		// Line colors
		let colors = [ "#000", "#a9b500", "#d48217", "#38349e", "#0e80ad", "#ad2317", "#971c9c", "#32a852", "#752eab" ];

		// Loop through the list of vectors and draw each one
		for (const vector of vectors) {
			const [ name, x0, y0, x1, y1 ] = vector;

			// Create a line element for the vector
			const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			
			// Set the position of the line
			line.setAttribute('x1', x0);
			line.setAttribute('y1', y0);
			line.setAttribute('x2', x1);
			line.setAttribute('y2', y1);

			// Set the stroke style
			line.setAttribute('stroke', name == 'SUM' ? '#6e6e6e' : colors.pop()); 
			line.setAttribute('stroke-width', '0.2');
			line.setAttribute('marker-end', 'url(#arrowhead)');

			// Create a text element to display the vector's name
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

			// Position the text in the middle of the vector
			text.setAttribute('x', ((x0 + x1) / 2)); 
			text.setAttribute('y', ((y0 + y1) / 2));

			// Set font style
			text.setAttribute('font-size', '1');
			text.setAttribute('text-anchor', 'middle');
			
			// Set the vector name
			text.textContent = name;

			// Append the line and text elements to the SVG
			svg.appendChild(line);
			svg.appendChild(text);
		}		
	  
		return svg;
	}

	buildList (str) {
		let listStr = decodeURIComponent(str.replace(/\+/g, ' '));
	
		// Remove previously required font size tags from string
		listStr = listStr.replace(/<font size="\d+">/gi, '');
		listStr = listStr.replace(/<\/font>/gi, '');

		// Split on the colons to identify individual list items, but maintain colons in the content
		const itemMatches = listStr.split(/\:\d+=/);
		const idMatches = listStr.match(/\:\d+=/g);
		const cleanedList = [];

		for (let i = 0; i < itemMatches.length; i++) {
			if (i === 0) {
				cleanedList.push(itemMatches[i]);
			} else {
				const idMatch = idMatches[i - 1].substring(1);
				cleanedList.push(idMatch + itemMatches[i]);
			}
		}

		return cleanedList;
	}

	get currentPos () {
		const pos_elem = document.querySelector('span.pos')
		return pos_elem.textContent.split('of').map(e => Number(e));
	}

	get currentQuestion () {
		return this.currentPos[0];
	}

	get totalQuestions () {
		return this.currentPos[1];
	}

	get activity () {
		const title = document.title.split(':')[1].trim();
		const elem = document.querySelector('a.return-assignment-link').textContent.split('-')[0].trim();

		return title || elem;
	}

	prevAssignment () {
		return document.getElementById('prev-item-link').click();
	}

	nextAssignment () {
		return document.getElementById('next-item-link').click();
	}

	handleAnswers (answers) {
		console.log('Got question data:', answers.config.assignmentProblemID);
        this.sendMessage(1, answers);
	}
}


const MP = new MasteringPhysics();
window.MP = MP;