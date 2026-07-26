/* =========================================================
   KAHO KOBAYASHI — Portfolio · interactions
   Lightweight, dependency-free. Every feature degrades safely.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Language toggle ---------- */
  function applyLang(lang) {
    var html = document.documentElement;
    html.classList.remove("lang-ja", "lang-en");
    html.classList.add(lang === "ja" ? "lang-ja" : "lang-en");
    html.setAttribute("lang", lang === "ja" ? "ja" : "en");
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem("kk-lang", lang); } catch (e) {}
  }
  // Current lang was set inline in <head>; reflect it on the toggle.
  var current = document.documentElement.classList.contains("lang-ja") ? "ja" : "en";
  applyLang(current);
  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ---------- Header scrolled + scroll progress ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 12);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".nav-overlay a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") document.body.classList.remove("nav-open");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal, .reveal-mask"));
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var items = group.querySelectorAll(".reveal");
    for (var i = 0; i < items.length; i++) items[i].style.transitionDelay = Math.min(i * 0.05, 0.5) + "s";
  });
  function showAll() { revealEls.forEach(function (el) { el.classList.add("in"); }); }
  if (reduceMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 3500);
  }

  /* ---------- Horizontal sliders (buttons + drag) ---------- */
  document.querySelectorAll(".slider").forEach(function (wrapper) {
    var grid = wrapper.querySelector(".scroll-grid");
    if (!grid) return;
    var prev = wrapper.querySelector(".prev-btn");
    var next = wrapper.querySelector(".next-btn");
    var step = function () { var f = grid.querySelector(".gallery-item"); return (f ? f.offsetWidth : 320) + 20; };
    if (prev) prev.addEventListener("click", function () { grid.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { grid.scrollBy({ left: step(), behavior: "smooth" }); });
    var down = false, startX = 0, startLeft = 0, moved = false;
    grid.addEventListener("mousedown", function (e) { down = true; moved = false; startX = e.pageX; startLeft = grid.scrollLeft; grid.classList.add("dragging"); });
    window.addEventListener("mouseup", function () { down = false; grid.classList.remove("dragging"); });
    grid.addEventListener("mouseleave", function () { down = false; grid.classList.remove("dragging"); });
    grid.addEventListener("mousemove", function (e) { if (!down) return; var w = e.pageX - startX; if (Math.abs(w) > 4) moved = true; grid.scrollLeft = startLeft - w; });
    grid.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- Before / After slider ---------- */
  document.querySelectorAll(".ba-wrapper").forEach(function (wrapper) {
    var after = wrapper.querySelector(".ba-after");
    var divider = wrapper.querySelector(".ba-divider");
    var handle = wrapper.querySelector(".ba-handle");
    if (!after || !divider || !handle) return;
    var dragging = false;
    function setPos(clientX) {
      var rect = wrapper.getBoundingClientRect();
      var pct = Math.max(0.04, Math.min(0.96, (clientX - rect.left) / rect.width));
      var p = pct * 100;
      after.style.clipPath = "inset(0 " + (100 - p) + "% 0 0)";
      divider.style.left = p + "%"; handle.style.left = p + "%";
    }
    setPos(wrapper.getBoundingClientRect().left + wrapper.offsetWidth / 2);
    wrapper.addEventListener("mousedown", function (e) { e.preventDefault(); dragging = true; setPos(e.clientX); });
    window.addEventListener("mousemove", function (e) { if (dragging) setPos(e.clientX); });
    window.addEventListener("mouseup", function () { dragging = false; });
    wrapper.addEventListener("touchstart", function (e) { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    wrapper.addEventListener("touchmove", function (e) { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
    wrapper.addEventListener("touchend", function () { dragging = false; });
  });

  /* ---------- Contact form (mailto fallback) ---------- */
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = form.getAttribute("data-mailto") || "iosonokk010@gmail.com";
      var name = (form.querySelector("[name=name]") || {}).value || "";
      var email = (form.querySelector("[name=email]") || {}).value || "";
      var msg = (form.querySelector("[name=message]") || {}).value || "";
      var subject = encodeURIComponent("Portfolio inquiry — " + name);
      var body = encodeURIComponent(msg + "\n\n— " + name + " (" + email + ")");
      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    });
  }

  /* =========================================================
     Particle field — lightweight canvas 2D "misty wave"
     ========================================================= */
  var canvas = document.querySelector(".hero__canvas");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var W = 0, H = 0, cols = 0, rows = 0, gapX = 0, gapY = 0;
    var mouseX = 0.5, mouseY = 0.5, tMouseX = 0.5, tMouseY = 0.5;
    var running = true, t = 0;

    function isMobile() { return window.innerWidth < 760; }

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = isMobile() ? 26 : 54;
      rows = isMobile() ? 16 : 22;
      gapX = W / (cols - 1);
      gapY = (H * 0.9) / (rows - 1);
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener("mousemove", function (e) {
      tMouseX = e.clientX / window.innerWidth;
      tMouseY = e.clientY / window.innerHeight;
    }, { passive: true });

    // Pause when hero is offscreen to save battery/CPU.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { running = en[0].isIntersecting; })
        .observe(canvas);
    }

    function draw() {
      requestAnimationFrame(draw);
      if (!running) return;
      t += 0.012;
      mouseX += (tMouseX - mouseX) * 0.05;
      mouseY += (tMouseY - mouseY) * 0.05;
      ctx.clearRect(0, 0, W, H);

      var offY = H * 0.06;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var px = x * gapX;
          var py = y * gapY + offY;
          // layered sine waves => flowing "mountain mist"
          var wave = Math.sin(x * 0.32 + t) * 12
                   + Math.cos(y * 0.28 - t * 0.8) * 10
                   + Math.sin((x + y) * 0.18 + t * 1.3) * 8;
          // depth from wave -> size & opacity (fake 3D)
          var depth = (wave + 30) / 60; // ~0..1
          py += wave;
          // subtle mouse parallax, stronger for "closer" points
          px += (mouseX - 0.5) * 26 * depth;
          py += (mouseY - 0.5) * 20 * depth;

          var r = 0.7 + depth * 1.8;
          var alpha = 0.10 + depth * 0.42;
          // teal-to-sand tint by column
          var mix = x / cols;
          var cr = Math.round(95 + mix * 90);
          var cg = Math.round(131 + mix * 40);
          var cb = Math.round(119 - mix * 20);
          ctx.beginPath();
          ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + alpha + ")";
          ctx.arc(px, py, r, 0, 6.2832);
          ctx.fill();
        }
      }
    }
    draw();
  }
})();

/* =========================================================
   2026.07 MOTION UPGRADE — kinetic layer
   Curtain transitions · char-split type · ghost parallax ·
   custom cursor · magnetic buttons · smart header.
   Dependency-free; every feature degrades safely.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var html = document.documentElement;

  /* ---------- Char splitting (kinetic typography) ---------- */
  function splitChars(el) {
    var count = 0;
    (function walk(node) {
      var children = [].slice.call(node.childNodes);
      children.forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          var text = child.textContent;
          for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if (c === " " || c === "\n" || c === "\t") {
              frag.appendChild(document.createTextNode(" "));
            } else {
              var s = document.createElement("span");
              s.className = "ch";
              s.textContent = c;
              s.style.setProperty("--i", Math.min(count, 22));
              count++;
              frag.appendChild(s);
            }
          }
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("ch")) {
          walk(child);
        }
      });
    })(el);
    return count;
  }

  if (!reduceMotion) {
    var splitTargets = document.querySelectorAll(
      ".hero__title .reveal-mask, .page-hero__title .reveal-mask, .sec-head__title.reveal-mask"
    );
    [].forEach.call(splitTargets, function (mask) {
      var inner = mask.querySelector(":scope > span") || mask.firstElementChild;
      if (!inner) return;
      if (splitChars(inner) > 0) mask.classList.add("split");
    });
  }

  /* ---------- Intro curtain + page transitions ---------- */
  var curtain = document.querySelector(".curtain");
  var brand = document.querySelector(".curtain__brand");
  if (brand && !reduceMotion) splitChars(brand);

  function finishCurtain() { html.classList.add("is-done"); html.classList.remove("is-holding"); }

  if (curtain && !reduceMotion) {
    if (!window.__kkCurtain) {
      var seen = false;
      try { seen = sessionStorage.getItem("kk-seen") === "1"; } catch (e) {}
      if (seen) html.classList.add("is-fast");
      try { sessionStorage.setItem("kk-seen", "1"); } catch (e) {}
      html.classList.add("is-holding");
      var liftDelay = seen ? 320 : 1050;
      setTimeout(function () {
        html.classList.add("is-loaded");
        html.classList.remove("is-holding");
      }, liftDelay);
      setTimeout(finishCurtain, liftDelay + 950);
    }
    setTimeout(finishCurtain, 3200); // hard safety

    // Exit transition on internal navigation
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href)) return;
      if (!/\.html(#.*)?$/.test(href)) return;
      e.preventDefault();
      html.classList.remove("is-done");
      html.classList.add("is-exiting");
      setTimeout(function () { window.location.href = href; }, 500);
    });

    // Restore state when returning via back/forward cache
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) {
        html.classList.remove("is-exiting");
        html.classList.add("is-loaded");
        finishCurtain();
      }
    });
  } else {
    html.classList.add("is-loaded");
    finishCurtain();
  }

  /* ---------- Ghost word parallax (one gated rAF) ---------- */
  var plxEls = [].slice.call(document.querySelectorAll("[data-plx]"));
  if (plxEls.length && !reduceMotion && "IntersectionObserver" in window) {
    var visible = new Set();
    var plxIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target);
      });
    }, { rootMargin: "12% 0px" });
    plxEls.forEach(function (el) { plxIO.observe(el); });

    var ticking = false;
    function plxFrame() {
      ticking = false;
      var vh = window.innerHeight;
      visible.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
        var dir = el.getAttribute("data-plx") === "r" ? -1 : 1;
        el.style.transform = "translate3d(" + (p * 90 * dir) + "px," + (p * 24) + "px,0)";
      });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(plxFrame); }
    }, { passive: true });
    plxFrame();
  }

  /* ---------- Custom cursor + magnetic buttons (fine pointers) ---------- */
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");
  if (fine && dot && ring && !reduceMotion) {
    html.classList.add("has-cursor");
    var mx = -100, my = -100, dx = -100, dy = -100, rx = -100, ry = -100;
    var cursorRunning = false;
    function cursorFrame() {
      dx += (mx - dx) * 0.6;
      dy += (my - dy) * 0.6;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = "translate3d(" + dx + "px," + dy + "px,0)";
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0)";
      if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.2) {
        requestAnimationFrame(cursorFrame);
      } else { cursorRunning = false; }
    }
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!cursorRunning) { cursorRunning = true; requestAnimationFrame(cursorFrame); }
    }, { passive: true });
    document.addEventListener("mouseleave", function () {
      dot.classList.add("is-hidden"); ring.classList.add("is-hidden");
    });
    document.addEventListener("mouseenter", function () {
      dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden");
    });
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      if (!t.closest) return;
      var view = t.closest(".work-card, .figure, .gallery-item, .shorts__item, .showreel");
      var link = t.closest("a, button, .chips span, .ba-wrapper");
      ring.classList.toggle("is-view", !!view);
      ring.classList.toggle("is-link", !view && !!link);
    }, { passive: true });

    // Magnetic pull on buttons
    [].forEach.call(document.querySelectorAll(".btn, .nav-btn"), function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transition = "transform .18s cubic-bezier(.22,1,.36,1)";
        b.style.transform = "translate3d(" + x + "px," + y + "px,0)";
      });
      b.addEventListener("mouseleave", function () {
        b.style.transform = "";
        setTimeout(function () { b.style.transition = ""; }, 240);
      });
    });
  }

  /* ---------- Smart header (hide down / show up) ---------- */
  var header2 = document.querySelector(".site-header");
  if (header2 && !reduceMotion) {
    var lastY = window.scrollY || 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      if (y > 160 && y > lastY + 6) header2.classList.add("is-hidden");
      else if (y < lastY - 6 || y <= 160) header2.classList.remove("is-hidden");
      lastY = y;
    }, { passive: true });
  }
})();
