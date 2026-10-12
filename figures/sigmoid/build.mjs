// Fig: the sigmoid as a cam plotter. A carriage slides by the score z; a groove cut to y = σ(z)
// pushes a follower across a 0..1 scale. Build: node figures/sigmoid/build.mjs [--light]
// Writes public/figures/sigmoid[-light].html (served by the site as /figures/sigmoid.html).
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../public/figures");
const theme = process.argv.includes("--light") ? "light" : "dark";

// ---- model: the only maths the figure uses -------------------------------------------------
const sigma = (z) => 1 / (1 + Math.exp(-z));
const S = 11;            // world units per unit of score z (carriage travel)
const Y0 = -30, W = 60;  // groove: y = Y0 + W·σ(u); so p = 0 sits at y = -30 and p = 1 at y = +30
const Z_MAX = 6.5;       // carriage travel limit, in score units
const camY = (u) => Y0 + W * sigma(u);

// ---- world (x along the rails, y across, z up) ----------------------------------------------
const WIDTH = 640, HEIGHT = 420;
const PLATE = { x: -190, y: -88, w: 380, d: 176, r: 10 };
const PLATE_H = 12, FOOT_H = 5;
const RAILS = [-52, 46];                       // rail y (each 6 deep), tops at z = 4
const RAIL_TOP = 4;
const CAR = { x: -112, y: -62, w: 224, d: 124, r: 4 }; // carriage, local x (moves along x)
const CAR_TOP = 12;
const CAM = { x: -105, y: -42, w: 210, d: 84, r: 2 };  // engraved cam inlay on the carriage top
const CAM_TOP = CAR_TOP + 0.6;
const STRIP = { x: -104, y: 47, w: 208, d: 9, r: 1 };   // score ruler along the carriage front
const BEAM = { x: -9, y: -80, w: 32, d: 160, r: 2 };    // fixed bridge over the carriage
// The bridge stands tall so its shadow on the view falls well clear of the steep middle of the groove.
const BEAM_Z = 64, BEAM_TOP = 71;
const POSTS = [{ x: -9, y: -82, w: 32, d: 12, r: 2 }, { x: -9, y: 70, w: 32, d: 12, r: 2 }];
const SLIDE = { x: -9, y: -7, w: 20, d: 14, r: 2 };     // follower block, local y (moves along y)
const SLIDE_TOP = BEAM_TOP + 8;
const SCALE = { x: 12, y: -40, w: 9, d: 80, r: 1 };     // p ruler on the beam, 0..1 along y
const STOPS = [-44, 37];                                 // hard stops on the beam, 7 deep each
const KNOB = [172, 0];

// Two layouts share one model: a wide one, and a phone close-up that frames the carriage travel and
// bridge (the plate's far ends are cropped) so the groove and scale stay readable at 390 px.
const VARIANTS = {
  wide: { width: WIDTH, height: HEIGHT, box: PLATE, pad: 26 },
  phone: { width: 390, height: 400, box: { x: -128, y: -88, w: 256, d: 176 }, pad: 4 },
};
let P;
const fitFor = (v) => k.fitProjection(
  [...k.boxCorners(v.box, -PLATE_H - FOOT_H, 0), [0, 0, SLIDE_TOP + 4], [BEAM.x + BEAM.w, BEAM.y, SLIDE_TOP], [BEAM.x, BEAM.y + BEAM.d, SLIDE_TOP]],
  v.width, v.height, { pad: v.pad, azimuth: 38, elevation: 40 },
);
const at = (p) => k.iso(p, P);
const Sd = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const screws = (plan, inset, z, size = 0.5) => {
  const pts = k.corners(plan, inset);
  return L(pts.map(([x, y]) => k.ring(x, y, 1.9, z, P, 14)).join(""), { tone: "lo" }) + D(pts.map(([x, y]) => at([x, y, z])), { size });
};

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = k.corners(PLATE, 24).sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P));
  for (const [x, y] of feet) {
    out.push(Sd(k.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(Sd(k.cylinder(x, y, 6, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(Sd(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  out.push(screws(PLATE, 11, 0));
  // label plate, front left, three engraved rule lines
  const tag = { x: -176, y: 60, w: 46, d: 20, r: 1.5 };
  out.push(Sd(k.slabOf(tag, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([66, 70, 74].map((y, i) => k.lineOnTop([tag.x + 5, y], [tag.x + (i === 2 ? 26 : 40), y], 0.6, P)).join(""), { tone: "faint", free: "end" }));
  out.push(D([[tag.x + 2.4, tag.y + 2.4], [tag.x + tag.w - 2.4, tag.y + tag.d - 2.4]].map(([x, y]) => at([x, y, 0.6])), { size: 0.4 }));
  return out.join("");
}

function rails() {
  const out = [];
  for (const y of RAILS) {
    const rail = { x: -176, y, w: 352, d: 6, r: 1 };
    out.push(Sd(k.slabOf(rail, 0, RAIL_TOP, P, 3, 0.4), { tone: "mid" }));
    out.push(D([-170, -60, 60, 170].map((x) => at([x, y + 3, RAIL_TOP])), { size: 0.4 }));
  }
  for (const x of [-182, 176]) { // end stops for the carriage
    out.push(Sd(k.slabOf({ x, y: -58, w: 6, d: 112, r: 1.2 }, 0, 9, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 3, -50, 9]), at([x + 3, 48, 9])], { size: 0.45 }));
  }
  // lead-screw bearing and hand wheel at the right end
  out.push(Sd(k.slabOf({ x: 160, y: -9, w: 14, d: 18, r: 2 }, 0, 14, P, 4, 0.6), { tone: "mid" }));
  out.push(Sd(k.cylinder(KNOB[0] - 5, KNOB[1], 3, 14, 3, P, 20), { tone: "mid" }));
  out.push(Sd(k.cylinder(KNOB[0] - 5, KNOB[1], 9, 17, 5, P, 40, 0.5), { tone: "mid" }));
  out.push(L(k.knurl(KNOB[0] - 5, KNOB[1], 9, 17, 22, 44, P), { tone: "lo" }));
  out.push(L(k.ring(KNOB[0] - 5, KNOB[1], 6, 22, P, 32), { tone: "faint" }));
  out.push(D([at([KNOB[0] - 5, KNOB[1], 22])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

function carriage() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CAR, 4), RAIL_TOP, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(Sd(k.slabOf(CAR, RAIL_TOP, CAR_TOP - RAIL_TOP, P, 5, 0.6), { tone: "mid" }));
  out.push(screws(CAR, 6, CAR_TOP, 0.45));
  // cam inlay: the groove is the curve itself
  out.push(Sd(k.slabOf(CAM, CAR_TOP, 0.6, P, 3), { tone: "hi", crease: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(CAM, 2), CAM_TOP, P, 3), { tone: "faint" }));
  const us = Array.from({ length: 121 }, (_, i) => -9.4 + (18.8 * i) / 120);
  const wall = (dy) => k.onTop(us.map((u) => [u * S, camY(u) + dy]), CAM_TOP, P);
  out.push(L(k.lineOnTop([CAM.x + 2, Y0], [CAM.x + CAM.w - 2, Y0], CAM_TOP, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([CAM.x + 2, Y0 + W], [CAM.x + CAM.w - 2, Y0 + W], CAM_TOP, P), { tone: "faint" }));
  out.push(L(k.lineOnTop([0, CAM.y + 2], [0, CAM.y + CAM.d - 2], CAM_TOP, P), { tone: "faint" }));
  out.push(L(wall(-1.6) + wall(1.6), { tone: "hi" }));
  out.push(D([at([-9.4 * S, camY(-9.4), CAM_TOP]), at([9.4 * S, camY(9.4), CAM_TOP])], { size: 0.9, tone: "mid" }));
  // score ruler: a tick every 0.5, a major every 1, zero mark bright
  out.push(Sd(k.slabOf(STRIP, CAR_TOP, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(-6.5 * S, 6.5 * S, S / 2, 2, STRIP.y + 0.8, CAR_TOP + 0.6, [2.2, 4.2], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.lineOnTop([0, STRIP.y + 0.8], [0, STRIP.y + 6.4], CAR_TOP + 0.6, P), { tone: "hi" }));
  for (const u of [-5, 5]) out.push(k.faceTextSvg(k.topMatrix([u * S, STRIP.y + 7.6], CAR_TOP + 0.6, P), u > 0 ? "+5" : "−5", { size: 2.6, tone: "lo", anchor: "middle" }));
  // handle on the front edge
  const h = [CAR.x + CAR.w - 14, CAR.y + CAR.d + 3];
  out.push(Sd(k.slabOf({ x: h[0] - 2, y: CAR.y + CAR.d - 1, w: 4, d: 4, r: 1 }, RAIL_TOP + 2, 3, P, 2), { tone: "mid", crease: "none" }));
  out.push(Sd(k.cylinder(h[0], h[1] + 1, 3.2, RAIL_TOP + 1, 6, P, 20), { tone: "mid" }));
  out.push(L(k.knurl(h[0], h[1] + 1, 3.2, RAIL_TOP + 1, RAIL_TOP + 7, 18, P), { tone: "lo" }));
  return out.join("");
}

const post = (plan) => Sd(k.slabOf(plan, 0, BEAM_Z, P, 4, 0.6), { tone: "mid" }) + screws(plan, 3.2, 0, 0.4);

function stylus() { // hangs from the follower through the beam's slot down into the groove
  return Sd(k.cylinder(0, 0, 1.3, CAM_TOP, BEAM_Z - CAM_TOP + 2, P, 16), { tone: "hi", crease: "none", lit: true })
    + Sd(k.cylinder(0, 0, 2.6, CAM_TOP, 2.2, P, 20), { tone: "hi", lit: true });
}

function beam() {
  const out = [Sd(k.slabOf(BEAM, BEAM_Z, BEAM_TOP - BEAM_Z, P, 4, 0.6), { tone: "mid" })];
  // slot the stylus runs in
  out.push(L(k.planOutline({ x: -2.2, y: -50, w: 4.4, d: 100, r: 2.2 }, BEAM_TOP, P, 6), { tone: "lo" }));
  out.push(D([[BEAM.x + 4, BEAM.y + 4], [BEAM.x + 4, BEAM.y + BEAM.d - 4], [BEAM.x + BEAM.w - 4, BEAM.y + 4], [BEAM.x + BEAM.w - 4, BEAM.y + BEAM.d - 4]].map(([x, y]) => at([x, y, BEAM_TOP])), { size: 0.45 }));
  // p scale: tick every 0.1, majors at 0, 0.5 and 1
  out.push(Sd(k.slabOf(SCALE, BEAM_TOP, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const t = k.topTicks(Y0, Y0 + W, W / 10, 5, SCALE.x + 0.8, BEAM_TOP + 0.6, [2.4, 4.6], P, "y");
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([SCALE.x + 7, Y0 + 0.9], BEAM_TOP + 0.6, P, "y"), "0", { size: 2.8, tone: "mid", anchor: "middle" }));
  out.push(k.faceTextSvg(k.topMatrix([SCALE.x + 7, Y0 + W + 0.9], BEAM_TOP + 0.6, P, "y"), "1", { size: 2.8, tone: "mid", anchor: "middle" }));
  // hard stops: the follower would hit these at exactly 0 or 1, which σ never reaches
  for (const y of STOPS) {
    out.push(Sd(k.slabOf({ x: -9, y, w: 18, d: 7, r: 1.2 }, BEAM_TOP, 7, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([0, y + 3.5, BEAM_TOP + 7])], { size: 0.45 }));
  }
  return out.join("");
}

function follower() {
  const out = [Sd(k.slabOf(SLIDE, BEAM_TOP, SLIDE_TOP - BEAM_TOP, P, 4, 0.6), { tone: "hi", crease: "lo" })];
  out.push(Sd(k.slabOf({ x: 11, y: -1.2, w: 9, d: 2.4, r: 0.6 }, BEAM_TOP + 1.2, 1.2, P, 2), { tone: "hi", lit: true })); // index tab over the scale
  out.push(D([[-6, -4], [-6, 4], [6, -4], [6, 4]].map(([x, y]) => at([x, y, SLIDE_TOP])), { size: 0.4, tone: "lo" }));
  out.push(Sd(k.cylinder(0, 0, 3.4, SLIDE_TOP, 2.4, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(0, 0, 3.4, SLIDE_TOP, SLIDE_TOP + 2.4, 20, P), { tone: "lo" }));
  return out.join("");
}

function pointer() { // fixed index on the front post, reading the score ruler
  return Sd(k.slabOf({ x: -1.4, y: 57, w: 2.8, d: 13, r: 0.6 }, CAR_TOP + 2, 1.2, P, 2), { tone: "mid" })
    + D([at([0, 58, CAR_TOP + 2])], { size: 0.6, tone: "lit" });
}

const z0 = 1.7;
const makeSvg = (name) => {
  const v = VARIANTS[name];
  P = fitFor(v);
  return k.figureSvg({
  width: v.width, height: v.height, className: "v-" + name,
  label: "A cam plotter. A carriage on two rails slides left and right by the score z. Cut into its top is a groove shaped like the sigmoid curve. A follower on a fixed bridge has a pin in the groove, so as the carriage moves the follower is pushed across a scale from 0 to 1. Hard stops sit just outside 0 and 1; the follower never reaches them.",
  body: [
    base(), rails(), post(POSTS[0]),
    `<g data-part="carriage" transform="${k.translateAlong(P, [-z0 * S, 0, 0])}">${carriage()}</g>`,
    `<g data-part="stylus" transform="${k.translateAlong(P, [0, camY(z0), 0])}">${stylus()}</g>`,
    beam(),
    `<g data-part="follower" transform="${k.translateAlong(P, [0, camY(z0), 0])}">${follower()}</g>`,
    post(POSTS[1]), pointer(),
  ],
  }).replace("<svg", `<svg data-p='${JSON.stringify(P)}'`);
};
const svg = makeSvg("wide") + makeSvg("phone");

const live = `
const S = ${S}, Y0 = ${Y0}, W = ${W}, Z_MAX = ${Z_MAX};
const sigma = (z) => 1 / (1 + Math.exp(-z));
const stage = document.querySelector(".iso-stage");
const views = [...stage.querySelectorAll("svg")].map((el) => ({
  el, P: JSON.parse(el.dataset.p), carriage: el.querySelector('[data-part="carriage"]'),
  parts: [el.querySelector('[data-part="stylus"]'), el.querySelector('[data-part="follower"]')],
}));
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let z = ${z0}, target = z, clock = 0, last = 0, frame = 0, touring = !still.matches, visible = false, idle = 0;
function draw() {
  const p = sigma(z);
  for (const v of views) {
    if (!v.el.getClientRects().length) continue; // only the visible layout
    v.carriage.setAttribute("transform", translateAlong(v.P, [-z * S, 0, 0]));
    for (const g of v.parts) g.setAttribute("transform", translateAlong(v.P, [0, Y0 + W * p, 0]));
  }
  const text = "z = " + (z < 0 ? "−" : "+") + Math.abs(z).toFixed(2) + "  →  p = σ(z) = " + p.toFixed(3);
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", z.toFixed(2));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { clock += dt; target = 6.2 * Math.sin(clock * 0.42); }
  z = still.matches ? target : z + (target - z) * (1 - Math.exp(-dt / 0.3));
  if (Math.abs(target - z) < 0.0005) z = target;
  draw();
  frame = visible && (touring || z !== target) ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clamp(next, -Z_MAX, Z_MAX);
  clearTimeout(idle); idle = setTimeout(() => { touring = !still.matches; clock = Math.asin(clamp(z / 6.2, -1, 1)) / 0.42; run(); }, 4000);
  run();
};
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
const shown = () => views.find((v) => v.el.getClientRects().length) || views[0];
const fromX = (clientX) => { const b = shown().el.getBoundingClientRect(); return -(clamp((clientX - b.left) / b.width, 0.08, 0.92) - 0.5) / 0.42 * Z_MAX; };
stage.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons) steer(fromX(e.clientX)); });
stage.addEventListener("pointerdown", (e) => steer(fromX(e.clientX)));
addEventListener("resize", draw);
stage.addEventListener("keydown", (e) => {
  const step = e.shiftKey ? 2 : 0.5;
  let to = null;
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") to = target + step;
  if (e.key === "ArrowDown" || e.key === "ArrowRight") to = target - step;
  if (e.key === "Home") to = -Z_MAX;
  if (e.key === "End") to = Z_MAX;
  if (e.key === "0") to = 0;
  if (to === null) return;
  e.preventDefault(); steer(to);
});
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Sigmoid cam",
  hint: "Drag sideways to move the carriage",
  readout: `z = +${z0.toFixed(2)}  →  p = σ(z) = ${sigma(z0).toFixed(3)}`,
  keys: [
    { mark: "lit", label: "Pin and index: the probability p it reads off" },
    { mark: "raised", label: "Cam inlay: the groove is cut to the curve p = σ(z)" },
  ],
  caption:
    "The carriage slides by the score z, as far as you like along its rails. The pin can only follow the groove, and the groove is the sigmoid: steep near z = 0, almost flat beyond |z| ≈ 5. So any score lands between the stops at 0 and 1, and the pin never touches either one: σ(−6.5) = 0.0015, σ(+6.5) = 0.9985.",
  body: `<style>.iso-stage{touch-action:pan-y}.iso-stage svg.v-phone{display:none}@media (max-width:560px){.iso-stage svg.v-wide{display:none}.iso-stage svg.v-phone{display:block}}</style><div class="iso-stage" tabindex="0" role="slider" aria-label="Sigmoid cam: up and down arrows change the score z; the carriage moves the other way under the pin" aria-valuemin="${-Z_MAX}" aria-valuemax="${Z_MAX}" aria-valuenow="${z0}">${svg}</div>`,
});

mkdirSync(OUT, { recursive: true });
const name = theme === "light" ? "sigmoid-light.html" : "sigmoid.html";
writeFileSync(join(OUT, name), k.pageHtml({ title: "Sigmoid cam", theme, body, script: kitScript() + live }));
console.log("wrote public/figures/" + name);
