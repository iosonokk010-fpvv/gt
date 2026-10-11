/* video-view.js — [data-view] の動画をクリックで大きく表示（音声つき・コントロールつき）。main.js とは独立。 */
(function () {
  var cards = document.querySelectorAll("[data-view]");
  if (!cards.length) return;
  var box = document.createElement("div");
  box.className = "vv-overlay";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML = '<button class="vv-close" type="button" aria-label="Close">&times;</button><video class="vv-video" controls playsinline></video>';
  document.body.appendChild(box);
  var vid = box.querySelector(".vv-video");
  function open(src, poster) {
    vid.src = src; if (poster) vid.poster = poster;
    vid.muted = false; vid.currentTime = 0;
    box.classList.add("is-open");
    document.documentElement.classList.add("vv-lock");
    var p = vid.play(); if (p && p.catch) p.catch(function () {});
  }
  function close() {
    vid.pause(); vid.removeAttribute("src"); vid.load();
    box.classList.remove("is-open");
    document.documentElement.classList.remove("vv-lock");
  }
  cards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      open(card.getAttribute("data-view"), card.getAttribute("data-poster"));
    });
  });
  box.addEventListener("click", function (e) { e.stopPropagation(); if (e.target === box || e.target.classList.contains("vv-close")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
})();
