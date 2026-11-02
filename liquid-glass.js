/* Liquid Glass — réfraction physique par carte de déplacement SVG.
   Méthode : https://kube.io/blog/liquid-glass-css-svg/ (profil de surface « squircle », loi de Snell–Descartes,
   carte de déplacement + reflet spéculaire) et https://www.ekino.fr/publications/liquid-glass-in-css-and-svg/.
   Chromium uniquement (backdrop-filter:url(#svg)). Ailleurs (Safari / iOS, Firefox) ce script ne fait rien :
   le flou classique de styles.css reste en place. */
(function () {
  "use strict";
  var ud = navigator.userAgentData;
  if (!(ud && ud.brands && ud.brands.some(function (b) { return /Chromium/i.test(b.brand); }))) return;
  if (!window.ResizeObserver || !window.CSS || !CSS.supports("backdrop-filter", "url(#x)")) return;

  var NS = "http://www.w3.org/2000/svg";
  var N_REFRACT = 1.5;        /* indice du verre (air = 1) */
  var SAMPLES = 127;          /* nombre de rayons simulés sur le biseau */
  var LEVEL = 1;              /* niveau de réfraction (1 = physique ; <1 atténue) */
  var SPEC_ANGLE = -60;       /* direction de la lumière, en degrés */
  var SPEC_OPACITY = 0.55, SPEC_WIDTH = 1.8; /* reflet : opacité, largeur en px */
  var TARGETS = [             /* bezel = largeur du biseau (px), thick = épaisseur du verre (px) */
    { sel: ".tabs",          bezel: 22, thick: 46 },
    { sel: ".timer",         bezel: 24, thick: 46 },
    { sel: ".toast",         bezel: 18, thick: 36 },
    { sel: ".update-banner", bezel: 18, thick: 36 }
  ];

  /* Surface « squircle convexe » : hauteur (0..1) selon la distance au bord (0 = bord, 1 = fin du biseau). */
  function surface(x) { return Math.pow(1 - Math.pow(1 - x, 4), 0.25); }

  /* Un rayon vertical frappe la surface : angle d'incidence selon la pente, réfraction (Snell), puis
     décalage latéral au niveau du fond = épaisseur de verre traversée × tan(écart d'angle). */
  var profileCache = {};
  function profile(bezel, thick) {
    var key = bezel + "/" + thick;
    if (profileCache[key]) return profileCache[key];
    var mags = new Float32Array(SAMPLES), max = 0, i, x, x1, x2, slope, t1, t2, d;
    for (i = 0; i < SAMPLES; i++) {
      x = (i + 0.5) / SAMPLES;
      x1 = Math.max(0, x - 0.001); x2 = Math.min(1, x + 0.001);
      slope = (surface(x2) - surface(x1)) / (x2 - x1) * thick / bezel;
      t1 = Math.atan(Math.abs(slope));
      t2 = Math.asin(Math.sin(t1) / N_REFRACT);
      d = surface(x) * thick * Math.tan(t1 - t2);
      mags[i] = d; if (d > max) max = d;
    }
    return (profileCache[key] = { mags: mags, max: Math.max(max, 0.0001) });
  }

  /* Cartes bitmap pour une capsule w×h : déplacement (R = x, G = y, 128 = neutre) et reflet spéculaire. */
  function render(w, h, bezel, thick, dpr) {
    var p = profile(bezel, thick), W = Math.round(w * dpr), H = Math.round(h * dpr);
    var cd = document.createElement("canvas"), cs = document.createElement("canvas");
    cd.width = cs.width = W; cd.height = cs.height = H;
    var id = cd.getContext("2d").createImageData(W, H), is = cs.getContext("2d").createImageData(W, H);
    var dd = id.data, sd = is.data;
    var rad = Math.min(w, h) / 2, hx = w / 2 - rad, hy = h / 2 - rad;
    var la = SPEC_ANGLE * Math.PI / 180, lx = Math.cos(la), ly = Math.sin(la);
    var x, y, o, px, py, qx, qy, ox, oy, len, nx, ny, dist, k, m, f, a;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      o = (y * W + x) * 4;
      px = (x + 0.5) / dpr - w / 2; py = (y + 0.5) / dpr - h / 2;
      qx = Math.abs(px) - hx; qy = Math.abs(py) - hy;
      ox = Math.max(qx, 0); oy = Math.max(qy, 0); len = Math.sqrt(ox * ox + oy * oy);
      dist = -(len + Math.min(Math.max(qx, qy), 0) - rad);          /* distance au bord, > 0 à l'intérieur */
      if (len > 0) { nx = ox / len * (px < 0 ? -1 : 1); ny = oy / len * (py < 0 ? -1 : 1); }
      else if (qx > qy) { nx = px < 0 ? -1 : 1; ny = 0; }
      else { nx = 0; ny = py < 0 ? -1 : 1; }                          /* normale sortante */
      dd[o] = dd[o + 1] = dd[o + 2] = 128; dd[o + 3] = 255;
      if (dist > 0 && dist < bezel) {
        k = Math.min(SAMPLES - 1, Math.floor(dist / bezel * SAMPLES));
        m = p.mags[k] / p.max;                                        /* déplacement normalisé, dirigé vers l'intérieur */
        dd[o] = Math.round(128 - nx * m * 127); dd[o + 1] = Math.round(128 - ny * m * 127);
      }
      if (dist > -0.5 && dist < SPEC_WIDTH) {
        f = 1 - Math.max(dist, 0) / SPEC_WIDTH;
        a = Math.abs(nx * lx + ny * ly) * f * f * SPEC_OPACITY;
        sd[o] = sd[o + 1] = sd[o + 2] = 255; sd[o + 3] = Math.round(a * 255);
      }
    }
    cd.getContext("2d").putImageData(id, 0, 0); cs.getContext("2d").putImageData(is, 0, 0);
    return { disp: cd.toDataURL("image/png"), spec: cs.toDataURL("image/png"), scale: 2 * p.max * LEVEL };
  }

  function build(id, w, h, t, dpr) {
    var bezel = Math.min(t.bezel, Math.floor(Math.min(w, h) / 2));
    var r = render(w, h, bezel, t.thick, dpr), box = ' x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none"';
    return '<filter id="' + id + '" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feImage href="' + r.disp + '" xlink:href="' + r.disp + '"' + box + ' result="map"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + r.scale.toFixed(1) + '" xChannelSelector="R" yChannelSelector="G" result="refr"/>' +
      '<feImage href="' + r.spec + '" xlink:href="' + r.spec + '"' + box + ' result="spec"/>' +
      '<feBlend in="spec" in2="refr" mode="normal"/>' +
      '</filter>';
  }

  var host = document.createElementNS(NS, "svg");
  host.setAttribute("width", "0"); host.setAttribute("height", "0");
  host.setAttribute("aria-hidden", "true"); host.setAttribute("focusable", "false");
  host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  document.body.appendChild(host);

  TARGETS.forEach(function (t, n) {
    var el = document.querySelector(t.sel);
    if (!el) return;
    var id = "lg-" + n, node = document.createElementNS(NS, "g"), last = "", raf = 0;
    host.appendChild(node);
    function update() {
      raf = 0;
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight), dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!w || !h) { el.style.removeProperty("--lg-bf"); last = ""; return; }   /* masqué : flou classique */
      var key = w + "x" + h + "@" + dpr;
      if (key !== last) { node.innerHTML = build(id, w, h, t, dpr); last = key; }
      el.style.setProperty("--lg-bf", "blur(1.5px) url(#" + id + ") var(--lg-tone)");
    }
    new ResizeObserver(function () { if (!raf) raf = requestAnimationFrame(update); }).observe(el);
    update();
  });

  document.documentElement.classList.add("lg-ok");
})();
