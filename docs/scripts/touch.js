// const click_test_canvas  = document.createElement('canvas');
// click_test_canvas.width  = g_canvas.width  / 4;
// click_test_canvas.height = g_canvas.height / 4;

// const COLS = 1920;
// const ROWS = 1080;

// function createHitMaskFromCanvas(canvas) {
//   const ctx = canvas.getContext('2d', { willReadFrequently: true });
//   const imageData = ctx.getImageData(0, 0, COLS, ROWS).data;
//   const hitMask = new Uint8Array(COLS * ROWS);

//   // imageData has 4 bytes per pixel: [R, G, B, Alpha]
//   for (let i = 0, p = 3; i < hitMask.length; i++, p += 4) {
//     // Store 1 if pixel is visible (alpha > 0), otherwise 0
//     hitMask[i] = imageData[p] > 0 ? 1 : 0;
//   }

//   return hitMask;
// }







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
	if (!Array.isArray(images)) images = [ images ];
	const w = click_test_canvas.width;
	const h = click_test_canvas.height;
    click_test_ctx.clearRect(0, 0, w, h);
	for (let i = 0; i < images.length; ++i) {
		click_test_ctx.drawImage(images[i], 0, 0, w, h);
	}
	const int_x = Math.floor(p.x / 4);
    const int_y = Math.floor(p.y / 4);
	const pixel = click_test_ctx.getImageData(int_x, int_y, 1, 1).data;
	return (pixel[0] + pixel[1] + pixel[2] + pixel[3] !== 0);
};

function c_touch(images, sfx = null) {
	if (!Array.isArray(images)) images = [ images ];
	this.images       = images;
	this.start_set    = [];
	this.stop_set     = [];
	this.sfx          = sfx;
}

// c_touch.prototype.set_sfx = function(sfx) {
// 	this.sfx = sfx;
// 	return this;
// };

c_touch.prototype.starts = function(...os) {
	os.forEach(o => this.start_set.push(o));
	return this;
};

c_touch.prototype.stops = function(...os) {
	os.forEach(o => this.stop_set.push(o));
	return this;
};

c_touch.prototype.start = function() {
	g_add_touchable(this);
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
			g_clear_touchables();
			g_stop_stop_sets(this.stop_set);
			g_start_start_sets(this.start_set);
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
	for (let i = 0; i < g_touchables.length; ++i) {
		const touchable = g_touchables[i];
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
