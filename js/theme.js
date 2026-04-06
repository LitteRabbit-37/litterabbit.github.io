(function () {
    const themeToggleInput = document.getElementById("themeToggle");

    const savedTheme = localStorage.getItem("theme");
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const initialTheme = savedTheme || (prefersLight ? "light" : "dark");

    document.documentElement.setAttribute("data-theme", initialTheme);

    if (themeToggleInput) {
        themeToggleInput.checked = initialTheme === "dark";

        themeToggleInput.addEventListener("change", () => {
            const newTheme = themeToggleInput.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
})();
