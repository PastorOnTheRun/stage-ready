/* Family Church Students skin for Charge! Games (the games under /games/ load live from
   https://pastorontherun.github.io/charge-games/; this file and skin.css are the only church-specific parts). */
(function () {
  var games = document.currentScript.src.replace(/skin\.js(\?.*)?$/, ""), site = games.replace(/games\/$/, "");
  window.ChargeSkin = {
    id: "fcs",
    ns: "fcsgames",                     // own rooms + saved scores: never shares a room or a save with the public Charge site
    brand: "Family Church Students",
    css: games + "skin.css?v=1",
    logo: { dark: site + "assets/logos/students-internal-white.svg", light: site + "assets/logos/students-internal-color.svg" },
    home: { href: site, label: "← Stage Ready" }
  };
})();
