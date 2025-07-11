(function () {
    const startDate = new Date("2025-07-11T00:00:00");

    function updateCounter() {
        const now = new Date();
        let distance = now.getTime() - startDate.getTime();

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        distance -= days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(distance / (1000 * 60 * 60));
        distance -= hours * (1000 * 60 * 60);
        const minutes = Math.floor(distance / (1000 * 60));
        distance -= minutes * (1000 * 60);
        const seconds = Math.floor(distance / 1000);

        document.getElementById("days").innerText = days;
        document.getElementById("hours").innerText = hours.toString().padStart(2, "0");
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, "0");
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, "0");
    }

    setInterval(updateCounter, 1000);
    updateCounter();

    // GLITCH
    function randomChar() {
        const chars = "0123456789#@%&?!<>/\\№:;|+-*~";
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function glitchSpan(spanId) {
        const span = document.getElementById(spanId);
        if (!span) return;
        if (span.classList.contains("glitching")) return;

        const original = span.innerText;
        span.classList.add("glitching");
        let iterations = 0;
        const maxIterations = 8 + Math.floor(Math.random() * 3);
        const length = original.length;

        const interval = setInterval(() => {
            span.innerText = Array.from({ length })
                .map(() => randomChar())
                .join("");
            iterations++;
            if (iterations > maxIterations) {
                clearInterval(interval);
                span.innerText = original;
                span.classList.remove("glitching");
            }
        }, 250);
    }

    ["days", "hours", "minutes", "seconds"].forEach((id) => {
        document.getElementById(id).addEventListener("mouseenter", () => glitchSpan(id));
    });
})();
