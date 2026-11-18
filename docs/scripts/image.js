// TODO: get rid of duration

function c_image(images, z_index = g_z, duration = g_dur) {
	if (!Array.isArray(images)) images = [ images ];
	this.images = images;
	this.z_index = z_index;
	this.duration = duration;
}

c_image.prototype.draw = function(ctx) {
	this.images.forEach(image => ctx.drawImage(image, 0, 0));
};

// c_image.prototype.set_z = z => {
// 	this.z_index = z;
// 	return this;
// };

c_image.prototype.start = function() {
	g_add_drawable(this);
	return this;
};

c_image.prototype.stop = function() {
	g_remove_drawable(this);
	return this;
};

c_image.prototype.started = function() {
	return g_drawables.includes(this);
};

c_image.prototype.stopped = function() {
	return !g_drawables.includes(this);
};

window.g_image = function(images, z_index, duration) {
	return new c_image(images, z_index, duration);
};

// return an array of c_image
window.g_images = function(images, z_index, duration) {
	if (!Array.isArray(images)) images = [ images ];
	return images.map(image => {
		if (Array.isArray(image)) {
			return image.map(i => new c_image(i, z_index, duration));
		} else {
			return new c_image(image, z_index, duration);
		}
	});
};
