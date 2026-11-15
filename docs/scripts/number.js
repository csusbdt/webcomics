
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
