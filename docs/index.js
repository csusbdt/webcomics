import "./scripts/init.js";
import "./scripts/image.js";
import "./scripts/sfx.js";
import "./scripts/touch.js";

g_image(g_el_capitan).start();

const t_el_capitan = g_touch(g_el_capitan).start();

t_el_capitan.starts(go_to.bind(null, "/el_capitan/"));
