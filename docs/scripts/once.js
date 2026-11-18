
function c_once(images, durations = g_dur, z_index = g_z) {
	this.images       = Array.isArray(images) ? images : [ images ];
	this.durations    = Array.isArray(durations) ? durations : images.map(_ => durations);
	this.z_index      = z_index;
	this.start_set    = [];
	this.stop_set     = [];
	this.elapsed_time = null;
	this.index        = null;
}

c_once.prototype.started = function() {
	return this.index !== null;
};

c_once.prototype.stopped = function() {
	return this.index === null;
};

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

c_once.prototype.start = function() {
	this.index = 0;
	this.elapsed_time = 0;
	g_add_drawable(this);
	g_add_updatable(this);
	return this;
};

c_once.prototype.draw = function(ctx) {
	const image = this.images[ this.index ];
	if (Array.isArray(image)) {
		image.forEach(i => ctx.drawImage(i, 0, 0));
	} else {
		ctx.drawImage(image, 0, 0);
	}
};

c_once.prototype.update = function(dt) {
	assert(this.elapsed_time !== null);
	this.elapsed_time += dt;
	const duration = this.durations[ this.index ];
	if (this.elapsed_time >= duration) {
		this.elapsed_time -= duration;
		++this.index;
		g_dirty = true;
		if (this.index === this.images.length) {
			this.index = null;
			this.elapsed_time = null;
			g_remove_drawable(this);
			g_remove_updatable(this);
			g_stop_stop_sets(this.stop_set);
			g_start_start_sets(this.start_set);
		}
	}
};

window.g_once = function(images, durations, z_index) {
	return new c_once(images, durations, z_index);
};
