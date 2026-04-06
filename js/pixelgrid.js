(function () {
    // Staggered reveal of pixel art rows
    var rows = document.querySelectorAll(".pixel-art pre");
    rows.forEach(function (row, i) {
        setTimeout(function () {
            row.classList.add("visible");
        }, 80 * i);
    });

    // Slide-in title
    var h1 = document.querySelector(".hero h1");
    if (h1) {
        setTimeout(function () {
            h1.classList.add("visible");
        }, rows.length * 80 + 100);
    }
})();
