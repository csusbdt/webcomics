import "./canvasapp.js";

const el_capitan = g_obj(i_el_capitan).start();

const t_el_capitan = g_touch(i_el_capitan).start();

t_el_capitan.starts(go_to.bind(null, "/el_capitan/"));

/*
const left          = g_obj(i_left);
const right         = g_obj(i_right);
const avail         = g_obj(i_available);

const t_left        = g_touch(i_left);
const t_right       = g_touch(i_right);
const t_avail       = g_touch(i_available);
const t_dt          = g_touch(i_dt);

g_start_touches = _ => {
    if (get("node") === "") {
        left.start();
        right.start();
        t_left.start();
        t_right.start();
    } else if (get("node") === "left") {
        avail.start();
        t_avail.start();
    } else if (get("node") === "right") {
        avail.start();
        t_avail.start();
    }
};

t_left.stops (left, right);
t_right.stops(left, right);
t_avail.stops(avail);

t_left.starts (set.bind(null, "node", "left"  ));
t_right.starts(set.bind(null, "node", "right" ));
t_avail.starts(set.bind(null, "node", ""      ));

if (get("node") === null) set("node", ""); 
g_start_touches();

*/
