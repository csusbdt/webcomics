
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
