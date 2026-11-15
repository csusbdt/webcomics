
window.g_updatables    = [];
window.g_drawables     = [];
window.g_touchables    = [];

window.dirty           = true;
const ctx              = g_canvas.getContext('2d', { alpha: false });
const bg_color         = window.getComputedStyle(document.body).backgroundColor;

window.g_z             = 10;   // default z-index for ordering draw operations
window.g_delay         = 1/8;  // default duration of a c_delay instance
window.g_dur           = 1/8;  // default duration of a frame of animation
window.g_start_touches = null; // If not null, called when touchables are cleared.

window.g_audio_context = new (window.AudioContext || window.webkitAudioContext)();

function unlock_audio_on_touch() {
  const resume_handler = () => {
    if (g_audio_context && g_audio_context.state !== 'running') {
      g_audio_context.resume();
    }
    window.removeEventListener('pointerdown', resume_handler);
    window.removeEventListener('touchstart' , resume_handler);
  };
  window.addEventListener('pointerdown', resume_handler, { once: true });
  window.addEventListener('touchstart' , resume_handler, { once: true });
}

function resume_audio() {
	if (g_audio_context.state === "suspended" || g_audio_context.state === "interrupted") {
		g_audio_context.resume().catch(() => {
			// iOS blocked auto-resume; wait for the next user touch
			setTimeout(() => unlock_audio_on_touch());
		});
	}
}

window.addEventListener('pointerup', resume_audio, { capture: true });

window.g_play_success   = null;
window.g_play_fail      = null;

// window.addEventListener('pageshow', e => { 
// 	if (e.persisted) window.location.reload();
// });

// document.addEventListener('visibilitychange', _ => {
// 	if (document.visibilityState === 'visible') window.location.reload();
// });

// const events = ["pagehide", "pageshow", "load"];

// const eventLogger = (event) => {
//   switch (event.type) {
//     case "pagehide":
//     case "pageshow": {
//       let isPersisted = event.persisted ? "persisted" : "not persisted";
//       console.log(`Event: ${event.type} - ${isPersisted}`);
//       break;
//     }
//     default:
//       console.log(`Event: ${event.type}`);
//       break;
//   }
// };

// events.forEach((eventName) => window.addEventListener(eventName, eventLogger));



// async function request_wake_lock() {
// 	if ("wakeLock" in navigator) {
// 		try {
// 			await navigator.wakeLock.request('screen');
// 		}
// 	}
	
// }


// function reinitializePage() {
//   console.log('Page is active again — running fresh initialization logic...');
//   // Put your data fetching, state reset, or UI update code here
	
// }

// // Triggers when restored from iOS/Chrome Back/Forward cache
// window.addEventListener('pageshow', (event) => {
//   if (event.persisted) {
//     reinitializePage();
//   }
// });

// // Triggers when switching back to the tab or resuming the browser app
// document.addEventListener('visibilitychange', () => {
//   if (document.visibilityState === 'visible') {
//     reinitializePage();
//   }
// });


// to eliminate flash of black
ctx.fillStyle = bg_color;
ctx.fillRect(0, 0, g_canvas.width, g_canvas.height);

// to insert artificial delays in sy
//window.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

window.assert = (condition, message) => {
	if (!condition) {
		throw new Error(message || "Assertion failed");
	}
};

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
	dirty = true;
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
// 	dirty = true;
// };

window.g_remove_drawable = function(o) {
	const i = g_drawables.indexOf(o);
	if (i !== -1) {
		g_drawables.splice(i, 1);
		dirty = true;
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


window.g_t = g_audio_context.currentTime;
let previous_time = g_t;

function animation_loop() {
	g_t      = g_audio_context.currentTime;
	const dt = g_t - previous_time;
	g_updatables.slice().forEach(o => o.update(dt));
	previous_time = g_t;
	if (dirty) {
		ctx.fillStyle = bg_color;
		ctx.fillRect(0, 0, g_canvas.width, g_canvas.height);
		g_drawables.forEach(o => o.draw(ctx));
		dirty = false;	
	}
	requestAnimationFrame(animation_loop);
}

addEventListener('load', requestAnimationFrame.bind(null, animation_loop));
