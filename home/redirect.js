// The demo used to live at the site root. Links made then ("…/#/v/…", "…/#/share") now open the demo at demo/.
(function () {
  function go() { if (location.hash.indexOf('#/') === 0) location.replace('demo/' + location.hash); }
  go();
  window.addEventListener('hashchange', go);
})();
