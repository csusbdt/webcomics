
function c_music(file, on_ready, on_ended, gain = 1, offset = 0, duration = null) {
  assert(on_ready !== undefined);
  assert(on_ended !== undefined);
  this.file      = file;
  this.on_ready  = on_ready;
  this.on_ended  = on_ended;
  this.offset    = offset;
  this.duration  = duration;
  this.gain_node = g_audio_context.createGain();
  this.gain_node.gain.value = gain;
  this.gain_node.connect(g_audio_context.destination);
  this.audio_buffer  = null;
  this.buffer_source = null;
  this.time_started  = null;
  this.time_played   = 0;
}

c_music.prototype.load = async function() {
  assert(this.audio_buffer === null);
  const response     = await fetch(this.file);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const array_buffer = await response.arrayBuffer();
  this.audio_buffer  = await g_audio_context.decodeAudioData(array_buffer);
  if (this.duration === null) this.duration = this.audio_buffer.duration;
  assert(this.duration <= this.audio_buffer.duration - this.offset);
  this.on_ready();
};

c_music.prototype.start = function() { // start from begining or from paused 
  assert(this.time_started  === null);
  assert(this.audio_buffer  !== null);
  assert(this.buffer_source === null);
  assert(this.offset + this.time_played < this.duration);
  request_wake_lock();
  this.buffer_source = g_audio_context.createBufferSource();
  this.buffer_source.onended = _ => {
	this.time_started  = null;
	this.time_played   = 0;
    this.buffer_source = null;
	this.on_ended();
	release_wake_lock();
  };
  this.buffer_source.buffer = this.audio_buffer;
  this.buffer_source.connect(this.gain_node);
  this.buffer_source.start(0, this.offset + this.time_played, this.duration - this.time_played);	  
  this.time_started = g_audio_context.currentTime;
};

c_music.prototype.time = function() {
	if (this.time_started === null) return 0;
	return this.time_played + g_audio_context.currentTime - this.time_started;
};

c_music.prototype.stop = function() {  // pause
  assert(this.time_started !== null);
  this.time_played += g_audio_context.currentTime - this.time_started;
  this.time_started = null;
  this.buffer_source.onended = null;
  this.buffer_source.stop();
  this.buffer_source.disconnect();
  this.buffer_source = null;
  release_wake_lock();
};

c_music.prototype.set_gain = function(gain) {
  assert(gain >= 0 && gain <= 1);
  this.gain_node.gain.setTargetAtTime(gain, g_audio_context.currentTime, 0.015);
  return this;
};

window.g_music = function(file, on_ready, on_ended, gain, offset, duration) {
  return new c_music(file, on_ready, on_ended, gain, offset, duration);
};

