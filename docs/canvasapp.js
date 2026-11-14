import "./audio.js";

/////////////////////////////////////////////////////////////////////////////////////
//
// vars
//
/////////////////////////////////////////////////////////////////////////////////////

const updatables       = [];
const drawables        = [];
let touchables         = [];
let dirty              = true;
const ctx              = g_canvas.getContext('2d', { alpha: false });
const bg_color         = window.getComputedStyle(document.body).backgroundColor;

window.g_z             = 10;   // default z-index for ordering draw operations
window.g_delay         = 1/8;  // default duration of a c_delay instance
window.g_dur           = 1/8;  // default duration of a frame of animation
window.g_start_touches = null; // If not null, called when touchables are cleared.

/////////////////////////////////////////////////////////////////////////////////////
//
// helpers
//
/////////////////////////////////////////////////////////////////////////////////////

// to eliminate flash of black
ctx.fillStyle = bg_color;
ctx.fillRect(0, 0, g_canvas.width, g_canvas.height);

//window.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

window.assert = (condition, message) => {
	if (!condition) {
		throw new Error(message || "Assertion failed");
	}
};

window.go_to = page => {
	if (location.pathname.indexOf("/webcomics") === 0) {
		location = "https://csusbdt.github.io/webcomics/" + page + location.search;
	} else {
		location = page + location.search;
	}
};

// window.log = function(...args) {
// 	args.forEach(arg => console.log(arg));
// };

window.add_drawable = function(o) {
	if (!('z_index' in o)) throw new Error(o);
	if (drawables.includes(o)) return;
	dirty = true;
	for (let i = drawables.length; i > 0; --i) {
		if (o.z_index >= drawables[i - 1].z_index) {
			drawables.splice(i, 0, o);
			return;
		}
	}
	drawables.unshift(o);
};

// const clear_drawables = function() {
// 	drawables.length = 0;
// 	dirty = true;
// };

window.remove_drawable = function(o) {
	const i = drawables.indexOf(o);
	if (i !== -1) {
		drawables.splice(i, 1);
		dirty = true;
	}
};

const add_updatable = function(o) {
	if (updatables.includes(o)) return;
	updatables.push(o);
};

// const clear_updatables = function() {
// 	updatables.length = 0;
// };

const remove_updatable = function(o) {
	const i = updatables.indexOf(o);
	if (i !== -1) {
		updatables.splice(i, 1);
	}
};




function stop_stop_sets(...stop_sets) {
	stop_sets.forEach(stop_set => {
		stop_set.forEach(o => {
			if (typeof(o) !== 'function') o.stop();
		});
	});
}

function start_start_sets(...start_sets) {
	start_sets.forEach(start_set => {
		start_set.forEach(o => {
			if (typeof(o) === 'function') {
				o();
			} else if ('play' in o) {
				o.play();
			} else {
				o.start();
			}
		});
	});
}

const add_drawable = function(o) {
	if (!('z_index' in o)) throw new Error(o);
	if (drawables.includes(o)) return;
	dirty = true;
	for (let i = drawables.length; i > 0; --i) {
		if (o.z_index >= drawables[i - 1].z_index) {
			drawables.splice(i, 0, o);
			return;
		}
	}
	drawables.unshift(o);
};

const remove_drawable = function(o) {
	const i = drawables.indexOf(o);
	if (i !== -1) {
		drawables.splice(i, 1);
		dirty = true;
	}
};

// window.clear_drawables = function() {
// 	drawables.length = 0;
// 	dirty = true;
// };

const add_touchable = function(o) {
	if (touchables.includes(o)) return;
	touchables.push(o);
};

// const unshift_touchable = function(o) {
// 	touchables.unshift(o);
// };

window.clear_touchables = function() {
	touchables.length = 0;
};

const remove_touchable = function(o) {
	const i = touchables.indexOf(o);
	if (i !== -1) {
		touchables.splice(i, 1);
	}
};

///////////////////////////////////////////////////////////////////////////////
//
// state
//
///////////////////////////////////////////////////////////////////////////////

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


///////////////////////////////////////////////////////////////////////////////
//
// obj
//
///////////////////////////////////////////////////////////////////////////////

function c_obj(images, z_index, duration) {
	assert(Array.isArray(images));
	assert(z_index !== undefined);
	this.images = images;
	this.z_index = z_index;
	this.duration = duration;
}

c_obj.prototype.draw = function() {
	this.images.forEach(image => ctx.drawImage(image, 0, 0));
};

c_obj.prototype.set_z = z => {
	this.z_index = z;
	return this;
};

c_obj.prototype.start = function() {
	add_drawable(this);
	dirty = true;
	return this;
};

c_obj.prototype.started = function() {
	return drawables.includes(this);
};

c_obj.prototype.stopped = function() {
	return !drawables.includes(this);
};

c_obj.prototype.stop = function() {
	remove_drawable(this);
	return this;
};

window.g_obj = function(images, z_index = g_z, duration = g_dur) {
	if (Array.isArray(images)) return new c_obj(images, z_index, duration);
	else return new c_obj([images], z_index, duration);
};

window.g_objs = function(images, z_index = g_z, duration = g_dur) {
	assert(Array.isArray(images));
	return images.map(image => new c_obj([image], z_index, duration));
};

///////////////////////////////////////////////////////////////////////////////
//
// once
//
///////////////////////////////////////////////////////////////////////////////

function c_once(objs, z_index = g_z) {
	assert(Array.isArray(objs));
	this.objs = objs;
	this.z_index = z_index;
	this.start_set = [];
	this.stop_set  = [];
	this.elapsed_time = 0;
}

c_once.prototype.starts = function(...os) {
	os.forEach(o => {
		if (!this.start_set.includes(o)) this.start_set.push(o);
	});
	return this;
};

c_once.prototype.stops = function(...os) {
	os.forEach(o => {
		if (!this.stop_set.includes(o)) this.stop_set.push(o)
	});
	return this;
};

c_once.prototype.started = function() {
	return drawables.includes(this);
};

c_once.prototype.start = function() {
	this.objs_index = 0;
	this.elapsed_time = 0;
	add_drawable(this);
	add_updatable(this);
	dirty = true;
	return this;
};

c_once.prototype.draw = function(ctx) {
	this.objs[this.objs_index].draw(ctx, 0, 0);
};

c_once.prototype.update = function(dt) {
	this.elapsed_time += dt;
	if (this.elapsed_time > this.objs[this.objs_index].duration) {
		this.elapsed_time = 0;
		++this.objs_index;
		dirty = true;
		if (this.objs_index === this.objs.length) {
			this.objs_index = 0;
			remove_drawable(this);
			remove_updatable(this);
			stop_stop_sets(this.stop_set);
			start_start_sets(this.start_set);
		}
	}
};

window.g_once = function(objs, z_index = g_z) {
	if (Array.isArray(objs)) {
		return new c_once(objs, z_index);
	} else {
		return new c_once([objs], z_index);
	}
};

///////////////////////////////////////////////////////////////////////////////
//
// loop
//
///////////////////////////////////////////////////////////////////////////////

function c_loop(objs, z_index) {
	this.objs = objs;
	this.z_index = z_index;
	this.frame_index  = 0;
	this.elapsed_time = 0;
}

c_loop.prototype.start = function() {
	add_drawable(this);
	add_updatable(this);
	return this;
};

c_loop.prototype.pause = function() {
	remove_updatable(this);
	return this;
};

c_loop.prototype.stop = function() {
	this.elapsed_time = 0;
	remove_drawable(this);
	remove_updatable(this);
	return this;
};

c_loop.prototype.paused = function() {
	return drawables.includes(this) && !updatables.includes(this);
};

c_loop.prototype.started = function() {
	return drawables.includes(this)&& updatables.includes(this);
};

c_loop.prototype.stopped = function() {
	return !drawables.includes(this) && !updatables.includes(this);
};

c_loop.prototype.draw = function(ctx) {
	this.objs[this.frame_index].draw(ctx, 0, 0);
};

c_loop.prototype.update = function(dt) {
	// if (this.objs.length === 1) {
	// 	// ensure an initial draw after start
	// 	if (this.elapsed_time === 0) {
	// 		this.elapsed_time = dt;
	// 		dirty = true;
	// 	}
	// 	return;
	// }
	this.elapsed_time += dt;
	if (this.elapsed_time > this.objs[this.frame_index].duration) {
		this.elapsed_time = 0;
		++this.frame_index;
		dirty = true;
		if (this.frame_index === this.objs.length) {
			this.frame_index = 0;
		}
	}
};

window.g_loop = function(objs, z_index = g_z) {
	if (Array.isArray(objs)) {
		return new c_loop(objs, z_index);
	} else {
		return new c_loop([objs], z_index);
	}
};

///////////////////////////////////////////////////////////////////////////////
//
// touch
//
///////////////////////////////////////////////////////////////////////////////

function c_touch(images) {
	this.images       = images;
	this.start_set    = [];
	this.stop_set     = [];
	this.sfx          = null;
}

c_touch.prototype.set_sfx = function(sfx) {
	this.sfx = sfx;
	return this;
};

c_touch.prototype.starts = function(...os) {
	os.forEach(o => this.start_set.push(o));
	return this;
};

c_touch.prototype.stops = function(...os) {
	os.forEach(o => this.stop_set.push(o));
	return this;
};

c_touch.prototype.start = function() {
	add_touchable(this);
	return this;
};

c_touch.prototype.stop = function() {
	remove_touchable(this);
	return this;
};

// c_touch.prototype.start_first = function() {
// 	touchables.unshift(this);
// }

c_touch.prototype.touch = function(p) {
	for (let i = 0; i < this.images.length; ++i) {
		const image = this.images[i];
		if (g_click_test(this.images[i], p)) {
			clear_touchables();
			stop_stop_sets(this.stop_set);
			start_start_sets(this.start_set);
			return true;
		}
	}
	return false;
};

window.g_touch = function(images) {
	return Array.isArray(images) ? new c_touch(images) : new c_touch([images]);
};

// window.g_touches = function(images) {
// 	if (!Array.isArray(images)) images = [images];
// 	return images.map(image => new c_touch([ image ], dx, dy));
// };

///////////////////////////////////////////////////////////////////////////////
//
// input
//
///////////////////////////////////////////////////////////////////////////////

const on_touch = p => {
	for (let i = 0; i < touchables.length; ++i) {
		const touchable = touchables[i];
		if (touchable.touch(p)) {
			if (touchable.sfx === null) {
				if (g_play_success) g_play_success();
			} else {
				touchable.sfx();
			}
			return;
		}
	}
	if (g_play_fail) g_play_fail();
};

const pointerup = e => {
	e.preventDefault();
	e.stopImmediatePropagation();
	g_canvas.style.cursor = 'default';
	on_touch(canvas_coords(e));
};

// Make sure the audio system can capture the event first.
window.addEventListener('pointerup', pointerup, { capture: false });


///////////////////////////////////////////////////////////////////////////////
//
// main
//
///////////////////////////////////////////////////////////////////////////////

const click_test_canvas  = document.createElement('canvas');
click_test_canvas.width  = g_canvas.width  / 4;
click_test_canvas.height = g_canvas.height / 4;
const click_test_ctx     = click_test_canvas.getContext("2d", { willReadFrequently: true });

// Convert screen coords to 1920x1020 canvas coords.
const canvas_coords = e => {
    const canvas_rect = g_canvas.getBoundingClientRect();
	const canvas_width_in_screen_pixels  = canvas_rect.width;
	const canvas_height_in_screen_pixels = canvas_rect.height;
	const x_in_screen_pixels = e.offsetX;
	const y_in_screen_pixels = e.offsetY;
	const mouse_x_in_canvas_pixels = x_in_screen_pixels / canvas_width_in_screen_pixels  * g_canvas.width;
	const mouse_y_in_canvas_pixels = y_in_screen_pixels / canvas_height_in_screen_pixels * g_canvas.height;
	return {
		x: mouse_x_in_canvas_pixels,
		y: mouse_y_in_canvas_pixels
	};
};

// pixel-based click detection
window.g_click_test = (images, p) => {
	if (images === null) return false;
	if (!Array.isArray(images)) images = [images];
	const w = click_test_canvas.width;
	const h = click_test_canvas.height;
    click_test_ctx.clearRect(0, 0, w, h);
	for (let i = 0; i < images.length; ++i) {
		click_test_ctx.drawImage(images[i], 0, 0, w, h);
	}
	const int_x = Math.floor(p.x / 4);
    const int_y = Math.floor(p.y / 4);
	const pixel = click_test_ctx.getImageData(int_x, int_y, 1, 1).data;
	return (pixel[0] + pixel[1] + pixel[2] != 0);
};

window.g_t = g_audio_context.currentTime;
let previous_time = g_t;

function animation_loop() {
	g_t      = g_audio_context.currentTime;
	const dt = g_t - previous_time;
	updatables.slice().forEach(o => o.update(dt));
	previous_time = g_t;
	if (dirty) {
		ctx.fillStyle = bg_color;
		ctx.fillRect(0, 0, g_canvas.width, g_canvas.height);
		drawables.forEach(o => o.draw(ctx));
		dirty = false;	
	}
	requestAnimationFrame(animation_loop);
}

addEventListener('load', requestAnimationFrame.bind(null, animation_loop));




// The last start time is the animation end time.
function c_anim(start_times, images, user_calibration = 0, z_index = g_z) {
	assert(Array.isArray(start_times)                         );
	assert(Array.isArray(images)                              );
	assert(start_times.length === images.length + 1 );
	this.end_time     = start_times[start_times.length - 1];
	this.start_times  = start_times;
	this.images       = images;
	this.z_index      = z_index;
	this.latency      =            // graphics render faster than audio
		g_audio_context.baseLatency   + 
		g_audio_context.outputLatency + 
		user_calibration;
	this.elapsed_time  = 0;    // amount of time played out from the source buffer
	this.start_time    = null; // the audio context time when current playout started
	this.index         = null; // null means render time of first image not yet reached
	this.start_set     = [];
	this.stop_set      = [];
}

c_anim.prototype.start = function() {
	assert(this.start_time === null);
	this.start_time = g_t;
	add_updatable(this);
	return this;
};

c_anim.prototype.update = function(dt) {
	if (this.index === null) {
		if (this.start_time + this.delay + this.start_times[0] < g_t) return;
		this.index = 0;
		add_drawable(this);
	}
	while (this.start_time + this.latency + this.start_times[this.index + 1] < g_t) {
		assert(this.index < this.images.length);
		++this.index;
		dirty = true;
		if (this.index === this.images.length) { 
			// we reached the end
			this.stop(); 
			return; 
		}
	}
};

c_anim.prototype.draw = function(ctx) {
	assert(this.index !== null);
	const image = this.images[this.index];
	if (Array.isArray(image)) {
		image.forEach(image => ctx.drawImage(image, 0, 0));
	} else {
		ctx.drawImage(image, 0, 0);
	}
};

c_anim.prototype.stop = function() {
	assert(this.start_time !== null);
	this.elapsed_time += g_t - this.start_time;
	this.start_time = null;
	if (this.elapsed_time >= this.end_time) {
		this.elapsed_time = 0; 
		this.index = null;
	}
	remove_drawable(this);
	remove_updatable(this);
	stop_stop_sets(this.stop_set);
	start_start_sets(this.start_set);
	return this;
};

c_anim.prototype.reset = function() {
	assert("reset not implemented");
};

c_anim.prototype.starts = function(...os) {
	os.forEach(o => {
		if (!this.start_set.includes(o)) this.start_set.push(o);
	});
	return this;
};

c_anim.prototype.stops = function(...os) {
	os.forEach(o => {
		if (!this.stop_set.includes(o)) this.stop_set.push(o)
	});
	return this;
};

c_anim.prototype.started = function() {
	return updatables.includes(this);
};

c_anim.prototype.stopped = function() {
	return !updatables.includes(this);
};

window.g_anim = function(start_times, images, user_calibration = 0, z_index) {
	return new c_anim(start_times, images, user_calibration, z_index);
};












/*


///////////////////////////////////////////////////////////////////////////////
//
// delay
//
///////////////////////////////////////////////////////////////////////////////

function c_delay(t) {
	this.t = t;
	this.start_set = [];
	this.stop_set  = [];
	this.elapsed_time = 0;
}

c_delay.prototype.starts = function(...os) {
	os.forEach(o => this.start_set.push(o));
	return this;
};

c_delay.prototype.stops = function(...os) {
	os.forEach(o => this.stop_set.push(o));
	return this;
};

c_delay.prototype.start = function() {
	this.elapsed_time = 0;
	add_updatable(this);
	return this;
};

c_delay.prototype.update = function(dt) {
	this.elapsed_time += dt;
	if (this.elapsed_time > this.t) {
		remove_updatable(this);
		stop_stop_sets(this.stop_set);
		start_start_sets(this.start_set);
	}
};

window.g_delay = function(t = default_delay) {
	return new c_delay(t);
};


///////////////////////////////////////////////////////////////////////////////
//
// number
//
///////////////////////////////////////////////////////////////////////////////

let digit_images = [];
if (typeof i_0 !== 'undefined') {
	digit_images = [ i_0, i_1, i_2, i_3, i_4, i_5, i_6, i_7, i_8, i_9 ];
}

function c_number(num = 0, x = 0, y = 0, duration = default_duration, z_index = default_z, s = 1) {
	assert(i_0 !== undefined);
    this.num = num;
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.z_index = z_index;
    this.s = s;
}

c_number.prototype.set = function(num) {
    this.num = num;
    dirty = true;
};

c_number.prototype.inc = function() {
    this.set(this.num + 1);
};

c_number.prototype.start = function() {
	add_drawable(this);
	dirty = true;
	return this;
};

c_number.prototype.stop = function() {
	remove_drawable(this);
	return this;
};

c_number.prototype.draw = function(ctx, dx = 0, dy = 0) {
    const digits = String(this.num).split('').map(Number);
    digits.forEach(d => {
        ctx.drawImage(
            digit_images[d],
    		this.x + dx, 
    		this.y + dy, 
    		digit_images[d].width  * this.s, 
    		digit_images[d].height * this.s
        );
        dx += this.s * 40;
    });
};

window.g_number = function(num = 0, x = 0, y = 0, duration = default_duration, z_index = default_z, s = 1) {
    return new c_number(num, x, y, duration, z_index, s);
};

*/
