/* video-lazy.js — 画面に入った動画だけ読み込み＆再生、外れたら一時停止。
   動画ファイル自体は無加工（再圧縮なし）。main.js とは独立。 */
(function () {
  var vids = [].slice.call(document.querySelectorAll("video[data-autoplay]"));
  if (!vids.length) return;
  function play(v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if (!("IntersectionObserver" in window)) { vids.forEach(play); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) play(v);
      else if (!v.paused) v.pause();
    });
  }, { rootMargin: "300px 0px" });
  vids.forEach(function (v) { io.observe(v); });
})();
