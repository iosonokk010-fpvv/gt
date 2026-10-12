/* video-view.js — [data-youtube] / [data-view] のカードをクリックで大きく表示。
   data-youtube があれば YouTube プレーヤー（音声つき）、なければ data-view の動画ファイル。main.js とは独立。 */
(function () {
  var cards = document.querySelectorAll("[data-youtube], [data-view]");
  if (!cards.length) return;
  var box = document.createElement("div");
  box.className = "vv-overlay";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML = '<button class="vv-close" type="button" aria-label="Close">&times;</button><div class="vv-frame"></div>';
  document.body.appendChild(box);
  var frame = box.querySelector(".vv-frame");
  function ytSrc(v) {
    // 動画ID or youtu.be / youtube.com の URL どちらでもOK
    var m = String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)?([A-Za-z0-9_-]{11})/);
    return m ? "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&modestbranding=1&playsinline=1" : "";
  }
  function open(card) {
    var v = card.getAttribute("data-youtube");
    if (v) {
      frame.innerHTML = '<iframe src="' + ytSrc(v) + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>';
    } else {
      frame.innerHTML = '<video controls playsinline autoplay></video>';
      var vid = frame.querySelector("video"); vid.src = card.getAttribute("data-view");
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
    }
    box.classList.add("is-open");
    document.documentElement.classList.add("vv-lock");
  }
  function close() {
    frame.innerHTML = "";
    box.classList.remove("is-open");
    document.documentElement.classList.remove("vv-lock");
  }
  cards.forEach(function (card) {
    card.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); open(card); });
  });
  box.addEventListener("click", function (e) { e.stopPropagation(); if (e.target === box || e.target.classList.contains("vv-close")) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && box.classList.contains("is-open")) close(); });
})();
