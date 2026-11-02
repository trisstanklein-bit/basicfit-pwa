/* Liquid Glass (réfraction SVG) — d'après https://www.ekino.fr/publications/liquid-glass-in-css-and-svg/
   backdrop-filter: url(#filtre) + <feDisplacementMap> n'est fiable que sur Chromium (Chrome, Edge, Android).
   Ailleurs (Safari / iOS, Firefox) ce script ne fait rien : le flou classique de styles.css reste en place.
   Pour chaque capsule, une carte de déplacement SVG est générée à la taille exacte de l'élément (ResizeObserver). */
(function () {
  "use strict";
  var ud = navigator.userAgentData;
  if (!(ud && ud.brands && ud.brands.some(function (b) { return /Chromium/i.test(b.brand); }))) return;
  if (!window.ResizeObserver || !window.CSS || !CSS.supports("backdrop-filter", "url(#x)")) return;

  var NS = "http://www.w3.org/2000/svg";
  var TARGETS = [
    { sel: ".tabs",          scale: 56, bezel: 24 },
    { sel: ".timer",         scale: 48, bezel: 22 },
    { sel: ".toast",         scale: 44, bezel: 18 },
    { sel: ".update-banner", scale: 44, bezel: 18 }
  ];
  var CA = [1, 0.93, 0.86]; /* aberration chromatique : échelle R / G / B (mettre [1,1,1] pour la couper) */

  var host = document.createElementNS(NS, "svg");
  host.setAttribute("width", "0"); host.setAttribute("height", "0");
  host.setAttribute("aria-hidden", "true"); host.setAttribute("focusable", "false");
  host.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  document.body.appendChild(host);

  /* Carte de déplacement : gris #808080 = aucun décalage ; R pilote x, G pilote y, B est ignoré.
     Deux dégradés (un par axe) fusionnés en « screen », puis un rectangle gris flouté au centre
     qui neutralise l'intérieur : seuls les bords réfractent. */
  function mapSVG(w, h, bz) {
    var r = Math.min(w, h) / 2, ir = Math.max(r - bz, 0);
    return '<svg xmlns="' + NS + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs>' +
      '<linearGradient id="Y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0F0"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<linearGradient id="X" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#F00"/><stop offset="1" stop-color="#000"/></linearGradient>' +
      '<filter id="b1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>' +
      '<filter id="b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="' + (bz / 2.2).toFixed(1) + '"/></filter>' +
      '</defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="#808080"/>' +
      '<g filter="url(#b1)">' +
      '<rect width="' + w + '" height="' + h + '" fill="#000080"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#Y)" style="mix-blend-mode:screen"/>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#X)" style="mix-blend-mode:screen"/>' +
      '<rect x="' + bz + '" y="' + bz + '" width="' + Math.max(w - 2 * bz, 1) + '" height="' + Math.max(h - 2 * bz, 1) + '" rx="' + ir + '" fill="#808080" filter="url(#b2)"/>' +
      '</g></svg>';
  }

  function chan(i, scale) {
    var m = ["1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"][i];
    return '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + (scale * CA[i]).toFixed(1) + '" xChannelSelector="R" yChannelSelector="G" result="d' + i + '"/>' +
           '<feColorMatrix in="d' + i + '" type="matrix" values="' + m + '" result="c' + i + '"/>';
  }

  function build(id, w, h, t) {
    var bz = Math.min(t.bezel, Math.floor(Math.min(w, h) / 2));
    var uri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(mapSVG(w, h, bz));
    return '<filter id="' + id + '" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feImage href="' + uri + '" xlink:href="' + uri + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none" result="map"/>' +
      chan(0, t.scale) + chan(1, t.scale) + chan(2, t.scale) +
      '<feBlend in="c0" in2="c1" mode="screen" result="rg"/><feBlend in="rg" in2="c2" mode="screen"/>' +
      '</filter>';
  }

  TARGETS.forEach(function (t, n) {
    var el = document.querySelector(t.sel);
    if (!el) return;
    var id = "lg-" + n, node = document.createElementNS(NS, "g"), last = "", raf = 0;
    node.setAttribute("id", id + "-wrap"); host.appendChild(node);

    function update() {
      raf = 0;
      var w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) { el.style.removeProperty("--lg-bf"); last = ""; return; }   /* masqué : flou classique */
      var key = w + "x" + h;
      if (key !== last) { node.innerHTML = build(id, w, h, t); last = key; }
      el.style.setProperty("--lg-bf", "url(#" + id + ") blur(2px) var(--lg-tone)");
    }
    new ResizeObserver(function () { if (!raf) raf = requestAnimationFrame(update); }).observe(el);
    update();
  });

  document.documentElement.classList.add("lg-ok");
})();
