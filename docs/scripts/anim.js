
function c_anim(image_times, images, user_calibration = 0, z_index = g_z) {
	assert(Array.isArray(image_times)               );
	assert(Array.isArray(images)                    );
	assert(image_times.length === images.length + 1 );
	this.latency      =        // graphics render faster than audio
		g_audio_context.baseLatency   + 
		g_audio_context.outputLatency + 
		user_calibration;
	// The last start time is the animation end time.
	this.image_times  = image_times;
	this.images       = images;
	this.z_index      = z_index;
	this.start_time    = null; // the audio context time when current playout started
	this.index         = null; // null means render time of first image not yet reached
}

c_anim.prototype.start = function() { // start from begining or from paused 
	if (this.ended()) return;
	assert(this.stopped());
	this.start_time = g_get_current_time() + this.latency;
	g_add_updatable(this);
};

c_anim.prototype.update = function() {
	if (this.index === null) {
		// first image has not yet been drawn
		if (g_get_current_time() >= this.start_time + this.image_times[0]) {
			// time to start drawing
			this.index = 0;
			g_add_drawable(this);
		} else {
			// not yet time to draw first image
			return;
		}
	}
	// advance index if the next start time has been reached
	assert(this.index < this.images.length);
	const next_image_draw_time = this.start_time + this.image_times[this.index + 1];
	if (g_get_current_time() >= next_image_draw_time) {
		++this.index;
		g_dirty = true;
		if (this.index === this.images.length) {
			// we reached the end
			this.start_time = null;
			g_remove_drawable(this);
			g_remove_updatable(this);
			// leave index alone to stay in ended state
			return; 
		}
	}
};

c_anim.prototype.draw = function(ctx) {
	assert(this.index !== null);
	assert(this.index < this.images.length);
	const image = this.images[this.index];
	if (Array.isArray(image)) {
		image.forEach(image => ctx.drawImage(image, 0, 0));
	} else {
		ctx.drawImage(image, 0, 0);
	}
};

c_anim.prototype.stop = function() {  // freeze on current image
	if (this.ended()) return;
	if (this.index === this.images.length - 1) { // on the last image
		this.index = this.images.length;         // go into ended state
	}
	this.start_time = null;
	g_remove_updatable(this);
};

c_anim.prototype.ended = function(ctx) {  // finished playing and not startable
	return this.index === this.images.length;
};

c_anim.prototype.started = function() {
	return this.start_time !== null;
};

c_anim.prototype.stopped = function() {
	return this.start_time === null;
};

c_anim.prototype.reset = function() {  // return to begining state
	if (this.started()) this.stop();
	assert(this.start_time === null);
	this.index = null;
};

window.g_anim = function(image_times, images, user_calibration = 0, z_index) {
	return new c_anim(image_times, images, user_calibration, z_index);
};


