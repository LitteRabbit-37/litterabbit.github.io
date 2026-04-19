// Autonomous audio-visualizer for the Parla recorder pill.
// Mirrors the exact formula from Parla's MiniRecorderView (AudioVisualizer):
//   wave        = sin(t*8 + i*0.4) * 0.5 + 0.5
//   centerBoost = 1.0 - distanceFromCenter * 0.4
//   height      = clamp(4 + amplitude * wave * centerBoost * 24, 4, 28)
// Amplitude is held constant here (no mic) to mimic a steady recording.

(function () {
    var bars = document.querySelectorAll(".pill-wave .bar");
    if (bars.length === 0) return;

    var BARS = bars.length;
    var AMPLITUDE = 0.65;
    var start = performance.now();

    function frame(now) {
        var t = (now - start) / 1000;
        for (var i = 0; i < BARS; i++) {
            var phase = i * 0.4;
            var wave = Math.sin(t * 8 + phase) * 0.5 + 0.5;
            var d = Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2);
            var centerBoost = 1.0 - d * 0.4;
            var h = 4 + AMPLITUDE * wave * centerBoost * 24;
            if (h < 4) h = 4;
            if (h > 28) h = 28;
            bars[i].style.height = h + "px";
        }
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
