import "../canvasapp.js";

const vols = g_objs([i_vol_0, i_vol_1, i_vol_2, i_vol_3, i_vol_4, i_vol_5, i_vol_6]);

const back          = g_obj(i_back);
const play_opened   = g_obj(i_play_2).start();
const pause_opened  = g_obj(i_pause_2);

const play_opening  = g_once(g_objs([i_play_1]));
const play_closing  = g_once(g_objs([i_play_1, i_blank]));
const pause_opening = g_once(g_objs([i_pause_1]));
const pause_closing = g_once(g_objs([i_pause_1, i_blank]));

const waiting       = g_loop(g_objs([i_wait_0, i_wait_1, i_wait_2, i_wait_3]));

const t_back        = g_touch(i_back   );
const t_play        = g_touch(i_play_2 );
const t_pause       = g_touch(i_pause_2);
const t_vol_up      = g_touch(i_vol_up );
const t_vol_dn      = g_touch(i_vol_dn );

g_start_touches = _ => {
  if (back.started()) t_back.start();
  if (vol_i + 1 < vols.length) t_vol_up.start();
  if (vol_i     > 0          ) t_vol_dn.start();
  if (play_opened.started()) t_play.start();
  else if (pause_opened.started()) t_pause.start();
};

t_back.starts(go_to.bind(null, "/../"));

// volume

let vol_i = null;

t_vol_up.starts(_ => {
  vols[vol_i++].stop();
  vols[vol_i].start();
  set("vol_i", vol_i);
  music.set_volume(vol_i, vols.length);
});

t_vol_dn.starts(_ => {
  vols[vol_i--].stop();
  vols[vol_i].start();
  set("vol_i", vol_i);
  music.set_volume(vol_i, vols.length);
});

t_vol_dn.stops(vols[vol_i--]);

// music

const on_playing = e => {
  waiting.stop();
    pause_opening.start();
    g_start_touches();
};

const on_end = e => {
	clear_touchables();
    pause_opened.stop();
    play_opening.start();
};

let timeupdate = 0;

const on_timeupdate = e => {
  timeupdate = e;
};

const music = g_music("el_capitan.mp3", 3, 1, on_playing, on_end, on_timeupdate);

t_play.stops(play_opened).starts(play_closing);
play_closing.starts(waiting, music);
pause_opening.starts(pause_opened, g_start_touches);
t_pause.stops(pause_opened, music).starts(pause_closing);
pause_closing.starts(play_opening);
play_opening.starts(play_opened, g_start_touches);

if (location.search.indexOf("a") !== -1) {
  log("links enabled");
  back.start();
}

if (location.search.indexOf("d") !== -1) {
  log("developer mode enabled");
  document.addEventListener("keydown", (event) => {
    log(event.key + "  " + timeupdate);
  });
}

if (get("vol_i") === null) {
  vol_i = Math.floor(vols.length / 2);
  set("vol_i", vol_i);
}
vol_i = get("vol_i");
vols[vol_i].start();
music.set_volume(vol_i, vols.length);
g_start_touches();


/*
let lookAhead = 25.0; // How frequently to check (in milliseconds)
let scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)
let nextNoteTime = 0.0; // When the next note is due
let tempo = 120.0; // Beats per minute

function scheduler() {
  // While there are notes to play before the next interval, schedule them
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    scheduleNote(nextNoteTime);
    advanceNote();
  }
}

function advanceNote() {
  // Calculate time between beats based on tempo
  const secondsPerBeat = 60.0 / tempo;
  nextNoteTime += secondsPerBeat; // Advance the timeline precisely
}

function scheduleNote(time) {
  // Assume 'clickBuffer' was pre-loaded via decodeAudioData
  playSoundAt(clickBuffer, time);
}

// Start the scheduler loop on the main thread
// Web Audio API handles the precise delivery on its own thread!
setInterval(scheduler, lookAhead);

*/