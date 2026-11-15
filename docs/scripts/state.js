let state = null;

const initial_state = {
	version: '0'
};

const save_state = _ => {
	localStorage.setItem('webcomics', JSON.stringify(state));
};

if (localStorage.getItem('webcomics') === null) {
	state = structuredClone(initial_state);
	save_state();		
} else {
	state = JSON.parse(localStorage.getItem('webcomics'));
	if (state.version !== initial_state.version) {
		state = structuredClone(initial_state);
		save_state();		
		location.replace(window.location.origin); 
	}
}

window.get_page = (page) => {
	return page in state ? state[page] : null;
};

window.get = (key) => {
	const page = window.location.pathname;
	if (page in state && key in state[page]) {
		return state[page][key];
	} else {
		return null;
	}
};

window.set = (key, value = true) => {
	const page = window.location.pathname;
	if (!(page in state)) state[page] = {};	
	state[page][key] = value;
	save_state();
};
