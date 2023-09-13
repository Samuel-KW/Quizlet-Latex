// Inject script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/inject/index.js');
script.onload = function () {
	sendMessage(0, 'Script has started.');
	this.remove();
};
(document.head || document.documentElement).appendChild(script);


// Listen to incoming messages
const script_key = 'mastering-physics-extension';

window.addEventListener('message', recieveMessage);
function recieveMessage(evt) {
	try {
		if (evt.data.k === script_key && evt.data.s !== 1)
			return handleMessage(evt.data.t, evt.data.d);
	} catch (e) { }
}

function sendMessage(type, data) {
	return window.postMessage({
		k: script_key,
		s: 1,
		t: type,
		d: data
	});
}

function handleMessage(type, data) {
	switch(type) {
		case 0:
			console.log('Client connected.');
			break;

		case 1:
			updateStorage(data);
			break;

		default:
			console.log(type, data);
	}
}

function updateStorage (data) {
	console.log('Saving', data.title, 'to storage.')
	const title = data.activityTitle;

	chrome.storage.local.get(title, activity => {

		activity = activity[title] || {};

		// More information exists saved on storage
		let prevData = activity[data.id];
		if (prevData && prevData.state.isFinished) {
			
			console.log('Better data already exists.');
			sendMessage(2, prevData);

			// Don't override good informtion
			return;

		} else {

			// Set new value
			activity[data.id] = data;

			// Delete excess activity title
			delete activity[data.id].activityTitle;
		}

		chrome.storage.local.set({ [title]: activity }, () => {
			console.log('Finished saving data.');
			sendMessage(1, data.id);
		});
	});
}

/* Outgoing
0 server connected
1 received data confirmation
2 previous answer
*/





