import "../canvasapp.js";

const vols = g_objs([i_vol_0, i_vol_1, i_vol_2, i_vol_3, i_vol_4, i_vol_5, i_vol_6]);

const back          = g_obj(i_back);
const play_opened   = g_obj(i_play_2);
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

let vol_i = null;

if (get("vol_i") === null) {
  vol_i = Math.floor(vols.length / 2); // TODO: get/set global volume
  set("vol_i", vol_i);
}
vol_i = get("vol_i");
vols[vol_i].start();

const start_touchables = _ => {
  if (back.started()) t_back.start();
  if (vol_i + 1 < vols.length) t_vol_up.start();
  if (vol_i     > 0          ) t_vol_dn.start();
  if (play_opened.started()) t_play.start();
  else if (pause_opened.started()) t_pause.start();
};

t_back.starts(go_to.bind(null, "/"));

waiting.start();

const on_ready = _ => {
  waiting.stop();
  play_opening.start();
};

const on_ended = _ => {
  clear_touchables();
  pause_opened.stop();
  pause_closing.start();
  start_touchables();
};

const music = g_music("./el_capitan.mp3", on_ready, on_ended);
music.load();

const max_play_bop_gain  = .6;
const max_play_thud_gain = .8;

const update_volume = _ => {
  music.set_gain(Math.pow(vol_i / vols.length, 2));
  g_play_bop_gain  = Math.pow(vol_i / vols.length * max_play_bop_gain, 2);
  g_play_thud_gain = Math.pow(vol_i / vols.length * max_play_thud_gain, 2);
};

update_volume();

t_vol_up.starts(_ => {
  vols[vol_i++].stop();
  vols[vol_i].start();
  set("vol_i", vol_i);
  update_volume();
  start_touchables();
});

t_vol_dn.starts(_ => {
  vols[vol_i--].stop();
  vols[vol_i].start();
  set("vol_i", vol_i);
  update_volume();
  start_touchables();
});

//let timeupdate = 0;

play_opening.starts(play_opened, start_touchables);
t_play.stops(play_opened).starts(play_closing);
play_closing.starts(music, pause_opening);
pause_opening.starts(pause_opened, start_touchables);
t_pause.stops(pause_opened, music).starts(pause_closing);
pause_closing.starts(play_opening);

if (location.search.indexOf("a") !== -1) {
  back.start();
}

if (location.search.indexOf("d") !== -1) {
  console.log("developer mode enabled");
  document.addEventListener("keydown", (event) => {
    console.log(event.key + "  " + g_music.currentTime);
  });
}



// g_music.volume = Math.pow(vol_i / vols.length, 2);
// g_play_bop_gain  = Math.pow(vol_i / vols.length * max_play_bop_gain, 2);
// g_play_thud_gain = Math.pow(vol_i / vols.length * max_play_thud_gain, 2);




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