window.g_is_music_started = false;

let audio_context = null;

const init_audio = _ => {
	if (!audio_context) {
		audio_context = new (window.AudioContext || window.webkitAudioContext)();
	}
	if (audio_context.state === 'suspended') {
		audio_context.resume();
	}
};

/////////////////////////////////////////////////////////////////////////////////////
//
// c_sfx
//
/////////////////////////////////////////////////////////////////////////////////////

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
// c_music
//
/////////////////////////////////////////////////////////////////////////////////////

// ffmpeg -i input.mp3 -ar 32000 -c:a libmp3lame -q:a 4 el_capitan.mp3
// fmpeg -i el_capitan_org.mp3 -ar 22050 -c:a libmp3lame -q:a 6 el_capitan.mp3

function c_music(file, start_time, volume, on_playing, on_end, on_timeupdate) {
	init_audio();
	this.audio_element = new Audio();
	this.stream_source = audio_context.createMediaElementSource(this.audio_element);	
	this.on_end = on_end;
	this.on_playing = on_playing;
	this.on_timeupdate = on_timeupdate;
	this.audio_element.volume = volume;
	this.start_time = start_time;
	this.audio_element.currentTime = start_time;
    fetch(file)
        .then(response => response.blob())
        .then(blob => {
            this.audio_element.src = URL.createObjectURL(blob);
         })
         .catch(e => log(e));
	if (this.on_playing !== null) {
		this.audio_element.addEventListener('playing', e => {
			this.on_playing(); 
		});
	}
	this.audio_element.addEventListener('ended', e => {
		if (this.on_end !== null) {
			g_is_music_started = false;
			this.audio_element.currentTime = this.start_time;
			if (this.on_end !== null) this.on_end();
		}
	});
	if (this.on_timeupdate !== null) {
		this.audio_element.addEventListener('timeupdate', _ => {
			this.on_timeupdate(audio_context.currentTime);
		});
	}
	this.audio_element.addEventListener('error', e => {
		if (this.on_end !== null) {
			g_is_music_started = false;
			this.on_end();
		}
		g_log('c_music error', file);
	});
}

c_music.prototype.set_volume = function(v, max_v) {
	assert(max_v !== undefined);
	this.audio_element.volume = Math.pow(v / max_v, 2); ;
};

c_music.prototype.start = function() {
	g_is_music_started = true;
	this.stream_source.connect(audio_context.destination);
	this.audio_element.play();
};

c_music.prototype.stop = function() {
	g_is_music_started = false;
	this.audio_element.pause();
};

// c_music.prototype.rewind = function() {
// 	this.audio_element.pause();
// 	this.audio_element.currentTime = this.start_time;	
// };

window.g_music = function(
	file, 
	start_time    = 0    ,
	volume        = 1.0  ,
	on_playing    = null ,
	on_end        = null ,
	on_timeupdate = null
) {
	return new c_music(file, start_time, volume, on_playing, on_end, on_timeupdate);
};

/////////////////////////////////////////////////////////////////////////////////////
//
// sfx
//
/////////////////////////////////////////////////////////////////////////////////////

window.g_play_bop_duration = 150;
window.g_play_bop = _ => {
	init_audio();
	const oscillator = audio_context.createOscillator();
	const gainNode   = audio_context.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(audio_context.destination);	
	const now        = audio_context.currentTime;
	const duration   = 0.15;	
	oscillator.type  = 'sine'; 
	oscillator.frequency.setValueAtTime(300, now);
	oscillator.frequency.exponentialRampToValueAtTime(900, now + duration);
	gainNode.gain.setValueAtTime(0.4, now);
	gainNode.gain.setValueAtTime(0.4, now + 0.03);
	gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
	oscillator.start(now);
	oscillator.stop(now + duration);
}

window.g_play_thud_duration = 150;
window.g_play_thud = _ => {
	init_audio();	
	const oscillator = audio_context.createOscillator();
	const gainNode   = audio_context.createGain();
	const startTime  = audio_context.currentTime;
	const endTime    = startTime + 0.15;	
	oscillator.type         = 'sine';
	oscillator.frequency.setValueAtTime(130, startTime);
	oscillator.frequency.exponentialRampToValueAtTime(30, endTime);
	gainNode.gain.setValueAtTime(1.0, startTime);
	gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
	oscillator.connect(gainNode);
	gainNode.connect(audio_context.destination);
	oscillator.start(startTime);
	oscillator.stop(endTime);
};

window.g_play_boin_duration = 450;
window.g_play_boin = _ => {
	init_audio();
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

window.g_play_dit_duration = 80;
window.g_play_dit = _ => {
	init_audio();
	const oscillator = audio_context.createOscillator();
	const gainNode   = audio_context.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(audio_context.destination);	
	const now        = audio_context.currentTime;
	const duration   = 0.08;	
	oscillator.type  = 'triangle'; 
	oscillator.frequency.setValueAtTime(400, now);
	oscillator.frequency.exponentialRampToValueAtTime(250, now + duration);
	gainNode.gain.setValueAtTime(0.3, now);
	gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
	oscillator.start(now);
	oscillator.stop(now + duration);
}

window.g_play_tink_duration = 400;
window.g_play_tink = _ => {
	init_audio();
	const oscillator = audio_context.createOscillator();
	const gainNode = audio_context.createGain();
	oscillator.connect(gainNode);
	gainNode.connect(audio_context.destination);
	const now = audio_context.currentTime;
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
