/////////////////////////////////////////////////////////////////////////////////////
//
// audio_context
//
/////////////////////////////////////////////////////////////////////////////////////

window.g_audio_context = new (window.AudioContext || window.webkitAudioContext)();

function resume_audio() {
	if (g_audio_context.state === "suspended") {
		g_audio_context.resume(); // .then(() => {  });
	}
}

window.addEventListener('pointerup', resume_audio, { capture: true });


/////////////////////////////////////////////////////////////////////////////////////
//
// c_music
//
/////////////////////////////////////////////////////////////////////////////////////

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
  this.buffer_source = g_audio_context.createBufferSource();
  this.buffer_source.onended = _ => {
	this.time_started  = null;
	this.time_played   = 0;
    this.buffer_source = null;
	this.on_ended();
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
};

c_music.prototype.set_gain = function(gain) {
  assert(gain >= 0 && gain <= 1);
  this.gain_node.gain.setTargetAtTime(gain, g_audio_context.currentTime, 0.015);
  return this;
};

window.g_music = function(file, on_ready, on_ended, gain, offset, duration) {
  return new c_music(file, on_ready, on_ended, gain, offset, duration);
};

/////////////////////////////////////////////////////////////////////////////////////
//
// c_sfx
//
/////////////////////////////////////////////////////////////////////////////////////

// in case i want to use sound files for ui sounds

// use the following to define c_sfx.
// By converting all your SFX assets to Mono and 22.05 kHz, 
// a 2-second sound effect drops from roughly 700 KB down to 176 KB of raw RAM.
// ffmpeg -i input.wav -c:a libmp3lame -q:a 3 -ac 1 -ar 22050 sfx_output.mp3

// async function load_sound(url) {
// 	const response     = await fetch(url);
// 	const array_buffer = await response.arrayBuffer();
// 	const audio_buffer = await audio_context.decodeAudioData(array_buffer);
// 	return audio_buffer;
// }

// function play_sound(audio_buffer, t = 0) {
// 	const source = audio_context.createBufferSource();
// 	source.buffer = audio_buffer;
// 	source.connect(audio_context.destination);
// 	source.start(t);
// }

/////////////////////////////////////////////////////////////////////////////////////
//
// sfx
//
/////////////////////////////////////////////////////////////////////////////////////

window.g_play_bop_gain     = .4;
window.g_play_bop_duration = 150;
window.g_play_bop = _ => {
	const oscillator = g_audio_context.createOscillator();
	const gainNode   = g_audio_context.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(g_audio_context.destination);	
	const now        = g_audio_context.currentTime;
	const duration   = 0.15;	
	oscillator.type  = 'sine'; 
	oscillator.frequency.setValueAtTime(300, now);
	oscillator.frequency.exponentialRampToValueAtTime(900, now + duration);
	// gainNode.gain.setValueAtTime(0.4, now);
	// gainNode.gain.setValueAtTime(0.4, now + 0.03);
	gainNode.gain.setValueAtTime(g_play_bop_gain, now);
	gainNode.gain.setValueAtTime(g_play_bop_gain, now + 0.03);
	gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
	oscillator.start(now);
	oscillator.stop(now + duration);
}

window.g_play_thud_gain     = 1;
window.g_play_thud_duration = 150;
window.g_play_thud = _ => {
	const oscillator = g_audio_context.createOscillator();
	const gainNode   = g_audio_context.createGain();
	const startTime  = g_audio_context.currentTime;
	const endTime    = startTime + 0.15;	
	oscillator.type         = 'sine';
	oscillator.frequency.setValueAtTime(130, startTime);
	oscillator.frequency.exponentialRampToValueAtTime(30, endTime);
//	gainNode.gain.setValueAtTime(1.0, startTime);
	gainNode.gain.setValueAtTime(g_play_thud_gain, startTime);
	gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
	oscillator.connect(gainNode);
	gainNode.connect(g_audio_context.destination);
	oscillator.start(startTime);
	oscillator.stop(endTime);
};

// TODO: implement gain
//window.g_play_boin_gain     = .3;
window.g_play_boin_duration = 450;
window.g_play_boin = _ => {
	//init_audio();
	const osc1  = audio_context.createOscillator();
	const osc2  = audio_context.createOscillator();
	const osc3  = audio_context.createOscillator();
	const gain1 = audio_context.createGain();
	const gain2 = audio_context.createGain();
	const gain3 = audio_context.createGain();
	osc1.connect(gain1);
	osc2.connect(gain2);
	osc3.connect(gain3);
	gain1.connect(audio_context.destination);	
	gain2.connect(audio_context.destination);	
	gain3.connect(audio_context.destination);	
	const now = audio_context.currentTime;
	osc1.type = 'sine';
	osc1.frequency.setValueAtTime(523.25, now); // C5 note
	gain1.gain.setValueAtTime(0.2, now);
	gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
	osc1.start(now);
	osc1.stop(now + 0.05);
	const time2 = now + 0.05;
	osc2.type = 'sine';
	osc2.frequency.setValueAtTime(659.25, time2); // E5 note
	gain2.gain.setValueAtTime(0.2, time2);
	gain2.gain.exponentialRampToValueAtTime(0.0001, time2 + 0.05);
	osc2.start(time2);
	osc2.stop(time2 + 0.05);
	const time3 = now + 0.10;
	const duration3 = 0.35;  
	osc3.type = 'sine';
	osc3.frequency.setValueAtTime(783.99, time3); 
	osc3.frequency.exponentialRampToValueAtTime(1046.50, time3 + 0.10);
	gain3.gain.setValueAtTime(0.3, time3);
	gain3.gain.exponentialRampToValueAtTime(0.0001, time3 + duration3);
	osc3.start(time3);
	osc3.stop(time3 + duration3);
};

// TODDO: implement gain similar to above
window.g_play_dit_duration = 80;
window.g_play_dit = _ => {
	//init_audio();
	const oscillator = g_audio_context.createOscillator();
	const gainNode   = g_audio_context.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(g_audio_context.destination);	
	const now        = g_audio_context.currentTime;
	const duration   = 0.08;	
	oscillator.type  = 'triangle'; 
	oscillator.frequency.setValueAtTime(400, now);
	oscillator.frequency.exponentialRampToValueAtTime(250, now + duration);
	gainNode.gain.setValueAtTime(0.3, now);
	gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
	oscillator.start(now);
	oscillator.stop(now + duration);
}

// TODDO: implement gain similar to above
window.g_play_tink_duration = 400;
window.g_play_tink = _ => {
	//init_audio();
	const oscillator = g_audio_context.createOscillator();
	const gainNode = g_audio_context.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(g_audio_context.destination);
	const now = g_audio_context.currentTime;
	oscillator.type = 'sine'; 
	oscillator.frequency.setValueAtTime(587.33, now); // D5 note
	oscillator.frequency.setValueAtTime(880.00, now + 0.1); // A5 note
	gainNode.gain.setValueAtTime(0.3, now); 
	gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4); 
	oscillator.start(now);
	oscillator.stop(now + 0.4);
};

window.g_play_success   = g_play_bop;
window.g_play_fail      = g_play_thud;
