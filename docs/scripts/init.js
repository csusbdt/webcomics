//import "./clock.js";

window.assert = (condition, message) => {
	if (!condition) {
		throw new Error(message || "Assertion failed");
	}
};

//window.artificial_delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

window.g_updatables    = [];
window.g_drawables     = [];
window.g_touchables    = [];

//window.dirty           = true;
const ctx              = g_canvas.getContext('2d', { alpha: false });
const bg_color         = window.getComputedStyle(document.body).backgroundColor;

// to eliminate flash of black
ctx.fillStyle = bg_color;
ctx.fillRect(0, 0, g_canvas.width, g_canvas.height);

window.g_z             = 10;   // default z-index for ordering draw operations
window.g_delay         = 1/8;  // default duration of a c_delay instance
window.g_dur           = 1/8;  // default duration of a frame of animation
window.g_start_touches = null; // If not null, called when touchables are cleared.

window.g_play_success   = null;
window.g_play_fail      = null;

///////////////////////////////////////////////////////////////////////////////////
//
// clock 
//
///////////////////////////////////////////////////////////////////////////////////

let is_paused            = false;
let is_unlocked          = false;
let fallback_start       = performance.now();
let accumulated_fallback = 0;

window.g_audio_context  = new window.AudioContext();

// set capture to true to run before ui event handlers 
window.addEventListener('pointerup', async () => {
  is_unlocked = true;
  is_paused   = false;
  if (g_audio_context.state === "suspended" || g_audio_context.state === "interrupted") {
	  await g_audio_context.resume();
  }
}, { capture: true, once: true });

window.g_get_current_time = function () {
  if (is_unlocked) {
    return g_audio_context.currentTime;
  }
  if (is_paused) {
    return accumulated_fallback;
  }
  return accumulated_fallback + (performance.now() - fallback_start) / 1000;
};

async function pause() {
  console.log("pause");
  if (is_paused) {
	  return;
  }
  is_paused = true;
  if (!is_unlocked) {
    accumulated_fallback += (performance.now() - fallback_start) / 1000;
  } else {
    assert(g_audio_context.state === 'running');
	await g_audio_context.suspend();
  }
}

async function resume() {
  console.log("resume");
  if (!is_paused) return;
  is_paused = false;
  if (is_unlocked) {
	  await g_audio_context.resume();
  } else {
	  fallback_start = performance.now();
  }
}

///////////////////////////////////////////////////////////////////////////////////
//
// If music is playing, request a wait lock 
//
// TODO: test on phone
//
///////////////////////////////////////////////////////////////////////////////////

let wake_lock = null;

window.request_wake_lock = async function() {
  if ('wakeLock' in navigator && document.visibilityState === 'visible') {
    try {
      wake_lock = await navigator.wakeLock.request('screen');
    } catch (err) {
      // assumption: Low Power Mode is active
    }
  }
};

window.release_wake_lock = function() {
  if (wake_lock !== null) {
    wake_lock.release().catch(() => {});
    wake_lock = null;
  }
};

///////////////////////////////////////////////////////////////////////////////////
//
// animation loop 
//
///////////////////////////////////////////////////////////////////////////////////

let loop_id       = null;
let previous_time = 0;
window.g_dirty    = true;

function animation_loop() {
	let t = g_get_current_time();
	const dt      = Math.min(t - previous_time, g_dur);
	previous_time = t;
	g_updatables.forEach(o => o.update(dt));
	if (g_dirty) {
		ctx.fillStyle = bg_color;
		ctx.fillRect(0, 0, g_canvas.width, g_canvas.height);
		g_drawables.forEach(o => o.draw(ctx));
		g_dirty = false;	
	}
	loop_id = requestAnimationFrame(animation_loop);
}

// TODO: do in different event.
addEventListener('load', _ => loop_id = requestAnimationFrame(animation_loop));

window.addEventListener('resize', () => g_dirty = true);

document.addEventListener('visibilitychange', _ => {
	// assumption: switching tabs or returning from another app
	if (document.visibilityState === 'visible') {
		resume();
	} else {
		assert(document.visibilityState === 'hidden');
		pause();
	}
});

// TODO: figure out what to do with animation loop on pageshow, pagehide

window.addEventListener('pageshow', e => { 
	// assumption: returning via browser Back/Forward cache (bfcache)
	if (e.persisted) {
		resume();
	}
});

window.addEventListener('pagehide', (event) => {
  // User is navigating away from the document or closing it.
  if (event.persisted) {
    // the page is being frozen in the back/forward cache (bfcache) 
    // and might be restored later via pageshow
	if (!is_unlocked) {
	  // i think need to adjust accumulated_fallback
	} else {
	  // audio context is frozen, so leave alone
	}
  } else {
    g_audio_context.close().catch(() => {});
	cancelAnimation(loop_id);
  }
});

window.go_to = page => {
	if (location.pathname.indexOf("/webcomics") === 0) {
		location = "https://csusbdt.github.io/webcomics/" + page + location.search;
	} else {
		location = page + location.search;
	}
};

// window.log = function(...args) {
// 	args.forEach(arg => console.log(arg));
// };

window.g_add_drawable = function(o) {
	if (!('z_index' in o)) throw new Error(o);
	if (g_drawables.includes(o)) return;
	g_dirty = true;
	for (let i = g_drawables.length; i > 0; --i) {
		if (o.z_index >= g_drawables[i - 1].z_index) {
			g_drawables.splice(i, 0, o);
			return;
		}
	}
	g_drawables.unshift(o);
};

// window.g_clear_drawables = function() {
// 	g_drawables.length = 0;
// 	g_dirty = true;
// };

window.g_remove_drawable = function(o) {
	const i = g_drawables.indexOf(o);
	if (i !== -1) {
		g_drawables.splice(i, 1);
		g_dirty = true;
	}
};

window.g_add_updatable = function(o) {
	if (g_updatables.includes(o)) return;
	g_updatables.push(o);
};

// window.g_clear_updatables = function() {
// 	g_updatables.length = 0;
// };

window.g_remove_updatable = function(o) {
	const i = g_updatables.indexOf(o);
	if (i !== -1) {
		g_updatables.splice(i, 1);
	}
};


window.g_add_touchable = function(o) {
	if (g_touchables.includes(o)) return;
	g_touchables.push(o);
};

// window.g_unshift_touchable = function(o) {
// 	touchables.unshift(o);
// };

window.g_clear_touchables = function() {
	g_touchables.length = 0;
};

window.g_remove_touchable = function(o) {
	const i = g_touchables.indexOf(o);
	if (i !== -1) {
		g_touchables.splice(i, 1);
	}
};



window.g_stop_stop_sets = function(...stop_sets) {
	stop_sets.forEach(stop_set => {
		stop_set.forEach(o => {
			if (typeof(o) !== 'function') o.stop();
		});
	});
}

window.g_start_start_sets = function(...start_sets) {
	start_sets.forEach(start_set => {
		start_set.forEach(o => {
			if (typeof(o) === 'function') {
				o();
			} else if ('play' in o) {
				o.play();
			} else {
				o.start();
			}
		});
	});
}





