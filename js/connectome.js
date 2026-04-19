(function () {
    var canvas = document.getElementById("connectome");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");

    // =========================================================================
    // TUNABLE CONSTANTS
    // =========================================================================
    var REFRAC_FRAMES       = 45;    // absolute refractory period (~0.75s at 60fps)
    var EULER_DT            = 0.5;   // Izhikevich integration timestep (ms)
    var EULER_STEPS         = 2;     // integration steps per frame
    var SYNAPSE_DECAY       = 0.75;  // synaptic current decay per frame (lower = faster decay)
    var EXCIT_CURRENT_MIN   = 3;     // excitatory signal current range
    var EXCIT_CURRENT_MAX   = 8;
    var INHIB_CURRENT_MIN   = 15;    // inhibitory signal current range
    var INHIB_CURRENT_MAX   = 25;
    var STIM_EXCIT_MIN      = 8;     // excitatory stimulation wave current
    var STIM_EXCIT_MAX      = 14;
    var STIM_INHIB_MIN      = 20;    // inhibitory stimulation wave current
    var STIM_INHIB_MAX      = 30;
    var HOVER_CURRENT       = 12;    // current injected on hover
    var SPACE_CURRENT_MIN   = 15;    // Space burst current per node
    var SPACE_CURRENT_MAX   = 25;
    var IDLE_INTERVAL_MIN   = 1200;  // spontaneous firing interval (ms)
    var IDLE_INTERVAL_MAX   = 3200;
    var IDLE_BURST_CHANCE   = 0.2;   // chance of strong burst vs sub-threshold
    var IDLE_BURST_MIN      = 10;    // strong burst current
    var IDLE_BURST_MAX      = 18;
    var IDLE_NOISE_MIN      = 3;     // sub-threshold noise current
    var IDLE_NOISE_MAX      = 7;
    var TRAIL_FADE          = 0.008; // trail alpha decay per frame
    var MICRO_FLASH_CHANCE  = 0.05;  // chance of micro-node flash per frame

    // =========================================================================
    // Utilities
    // =========================================================================
    var seed = 42;
    function srand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function resetSeed() { seed = 42; }
    function css(name) { return getComputedStyle(document.documentElement).getPropertyValue("--" + name).trim(); }

    // =========================================================================
    // Nodes
    // =========================================================================
    var NODES = [
        { type: "main", label: "LitteRabbit", sub: "", href: null, color: "#e8b882", pct: [0.50, 0.45] },
        { type: "main", label: "LitteLang", sub: "AI Code Translation", href: "LitteLang.html", color: "#b8de8a", pct: [0.73, 0.18] },
        { type: "main", label: "LitteManag", sub: "Management System", href: "LitteManag.html", color: "#9ab4e0", pct: [0.84, 0.62] },
        { type: "main", label: "Studio B++", sub: "Display Brightness", href: "StudioBrightnessPlusPlus.html", color: "#e8a070", pct: [0.22, 0.74] },
        { type: "main", label: "LitteCheat", sub: "Mod Menus", href: "LitteCheat.html", color: "#82e0b4", pct: [0.14, 0.30] },
        { type: "inter", color: "#d0b89a", pct: [0.61, 0.29] },
        { type: "inter", color: "#d0b89a", pct: [0.71, 0.42] },
        { type: "inter", color: "#d0b89a", pct: [0.35, 0.61] },
        { type: "inter", color: "#d0b89a", pct: [0.31, 0.38] },
        { type: "inter", color: "#c4a888", pct: [0.81, 0.37] },
        { type: "inter", color: "#c4a888", pct: [0.17, 0.54] },
        { type: "inter", color: "#b89878", pct: [0.56, 0.73] },
        { type: "inter", color: "#b89878", pct: [0.43, 0.23] },
        { type: "inter", color: "#a88a70", pct: [0.89, 0.23] },
        { type: "inter", color: "#a88a70", pct: [0.09, 0.69] },
        { type: "inter", color: "#a88a70", pct: [0.62, 0.87] },
        { type: "inter", color: "#c4a888", pct: [0.40, 0.48] },
        { type: "inter", color: "#c4a888", pct: [0.58, 0.52] },
        { type: "inter", color: "#b89878", pct: [0.48, 0.68] },
        { type: "inter", color: "#b89878", pct: [0.75, 0.78] },
        { type: "inter", color: "#a88a70", pct: [0.28, 0.18] },
        { type: "inter", color: "#a88a70", pct: [0.90, 0.50] },
        { type: "inter", color: "#b89878", pct: [0.08, 0.42] },
        { type: "inter", color: "#c4a888", pct: [0.52, 0.12] },
        { type: "inter", color: "#a88a70", pct: [0.35, 0.85] },
        { type: "inhib", color: "#c06a55", pct: [0.55, 0.35] },
        { type: "inhib", color: "#c06a55", pct: [0.65, 0.60] },
        { type: "inhib", color: "#c06a55", pct: [0.30, 0.50] },
        { type: "inhib", color: "#c06a55", pct: [0.45, 0.78] },
        { type: "inhib", color: "#b06048", pct: [0.78, 0.45] },
        { type: "main", label: "Parla", sub: "Voice to Text", href: "parla.html", color: "#d4b870", pct: [0.52, 0.84] },
    ];

    var CONNECTIONS = [
        [0,16],[0,17],[0,5],[0,6],[0,7],[0,8],
        [16,8],[16,7],[17,5],[17,6],
        [5,1],[6,2],[7,3],[8,4],
        [12,1],[9,2],[10,4],[14,3],
        [0,11],[0,12],[0,18],
        [1,9],[9,2],[4,10],[10,3],
        [1,23],[23,12],[2,19],[19,11],
        [3,14],[14,24],[4,22],[22,20],
        [5,12],[6,11],[7,10],[8,5],
        [9,13],[10,14],[11,15],[12,5],
        [11,7],[13,1],[14,3],[15,2],
        [13,21],[21,6],[15,19],[18,11],
        [20,23],[20,4],[22,10],[24,3],
        [1,4],[2,3],
        [16,12],[17,11],[18,7],[16,17],
        [5,23],[6,21],[8,22],[7,24],
        [25,0],[25,5],[25,17],[25,12],
        [26,6],[26,2],[26,11],[26,17],
        [27,8],[27,4],[27,10],[27,16],
        [28,7],[28,3],[28,18],[28,24],
        [29,9],[29,1],[29,13],[29,21],
        [0,25],[0,26],[0,27],
        [5,25],[6,26],[7,27],[8,27],
        [11,28],[9,29],[17,26],[16,25],
        [30,0],[30,3],[30,18],[30,15],[30,24],[30,28],[30,17],
    ];

    // =========================================================================
    // State
    // =========================================================================
    var W, H, mouse = { x: -9999, y: -9999 }, hoveredNode = null;
    var signals = [], trails = [], stimWaves = [];
    var lastIdleFire = 0, spikeCount = 0, spikeWindow = [], easterEggShown = false;
    var microNodes = [], microConns = [], microFlashes = [];
    var dendrites = [], eurekaAlpha = 0;

    // Izhikevich neuron model parameters
    // dv/dt = 0.04v² + 5v + 140 - u + I
    // du/dt = a(bv - u)
    // if v >= 30: v = c, u = u + d
    function initNodeState(n) {
        n.v = -65;   // membrane potential (mV)
        n.u = -14;   // recovery variable
        n.I = 0;     // synaptic input current (decays)

        if (n.type === "inhib") {
            // Fast Spiking (FS) — fires rapidly, no adaptation
            n.a = 0.1;  n.b = 0.2;  n.c = -65;  n.d = 2;
        } else if (n.type === "main") {
            // Regular Spiking (RS) — standard excitatory
            n.a = 0.02; n.b = 0.2;  n.c = -65;  n.d = 8;
        } else {
            // Mix of RS and Intrinsically Bursting (IB)
            var burst = Math.random() < 0.3;
            n.a = 0.02; n.b = 0.2;
            n.c = burst ? -55 : -65;
            n.d = burst ? 4 : 8;
        }

        n.flashAlpha = 0;
        n.firedRecently = false;
        n.refrac = 0; // absolute refractory period (frames)
    }

    // =========================================================================
    // Layout
    // =========================================================================
    function resize() {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W; canvas.height = H;
        for (var i = 0; i < NODES.length; i++) {
            var n = NODES[i];
            n.x = W * n.pct[0]; n.y = H * n.pct[1];
            if (i === 0) n.r = Math.max(36, Math.min(W, H) * 0.05);
            else if (n.type === "main") n.r = Math.max(20, Math.min(W, H) * 0.028);
            else if (n.type === "inhib") n.r = Math.max(7, Math.min(W, H) * 0.012);
            else n.r = Math.max(5, Math.min(W, H) * 0.008);
            if (n.v === undefined) initNodeState(n);
        }
        generateMicroNodes(); generateDendrites();
    }

    function generateMicroNodes() {
        resetSeed(); microNodes = []; microConns = [];
        var count = Math.min(140, Math.max(60, Math.floor(W * H / 10000)));
        for (var i = 0; i < count; i++)
            microNodes.push({ x: srand() * W, y: srand() * H, r: 0.6 + srand() * 1.6, opacity: 0.03 + srand() * 0.06, flash: 0 });
        var thresh = Math.min(W, H) * 0.11;
        for (var i = 0; i < microNodes.length; i++)
            for (var j = i + 1; j < microNodes.length; j++) {
                var dx = microNodes[i].x - microNodes[j].x, dy = microNodes[i].y - microNodes[j].y;
                if (dx * dx + dy * dy < thresh * thresh) microConns.push([i, j]);
            }
    }

    function generateDendrites() {
        resetSeed(); for (var i = 0; i < 500; i++) srand();
        dendrites = [];
        for (var ni = 0; ni < NODES.length; ni++) {
            var n = NODES[ni], branches = [];
            var cnt = n.type === "main" ? (5 + Math.floor(srand() * 3)) : (2 + Math.floor(srand() * 3));
            for (var b = 0; b < cnt; b++) {
                var angle = (b / cnt) * Math.PI * 2 + (srand() - 0.5) * 0.9;
                var len = n.r * (n.type === "main" ? (1.5 + srand() * 2.5) : (2 + srand() * 4));
                var ex = n.x + Math.cos(angle) * len, ey = n.y + Math.sin(angle) * len;
                var branch = { segs: [{ x1: n.x, y1: n.y, x2: ex, y2: ey }], tips: [{ x: ex, y: ey }] };
                if (srand() > 0.3) {
                    var fl = len * (0.25 + srand() * 0.45);
                    var fa1 = angle + 0.3 + srand() * 0.5, fa2 = angle - 0.3 - srand() * 0.5;
                    branch.segs.push(
                        { x1: ex, y1: ey, x2: ex + Math.cos(fa1) * fl, y2: ey + Math.sin(fa1) * fl },
                        { x1: ex, y1: ey, x2: ex + Math.cos(fa2) * fl, y2: ey + Math.sin(fa2) * fl }
                    );
                    branch.tips = [
                        { x: ex + Math.cos(fa1) * fl, y: ey + Math.sin(fa1) * fl },
                        { x: ex + Math.cos(fa2) * fl, y: ey + Math.sin(fa2) * fl }
                    ];
                }
                branches.push(branch);
            }
            dendrites.push(branches);
        }
    }

    // =========================================================================
    // Bézier
    // =========================================================================
    function getCP(a, b) {
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        var dx = b.x - a.x, dy = b.y - a.y, off = 0.20;
        return { c1x: mx - dy * off, c1y: my + dx * off, c2x: mx + dy * off, c2y: my - dx * off };
    }
    function bezPt(t, ax, ay, c1x, c1y, c2x, c2y, bx, by) {
        var u = 1 - t;
        return { x: u*u*u*ax + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*bx, y: u*u*u*ay + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*by };
    }

    // =========================================================================
    // Signals, trails, firing
    // =========================================================================
    function spawnSignal(ci, fromIdx) {
        var c = CONNECTIONS[ci], fwd = c[0] === fromIdx, dest = fwd ? c[1] : c[0];
        var fromNode = NODES[fromIdx], isInhib = fromNode.type === "inhib";
        signals.push({
            conn: ci, t: fwd ? 0 : 1, dir: fwd ? 1 : -1,
            speed: 0.004 + Math.random() * 0.005,
            color: isInhib ? "#c06a55" : NODES[dest].color,
            life: 1, dest: dest, inhibitory: isInhib, lastTrailT: fwd ? 0 : 1,
        });
    }

    function fireNode(ni) {
        var n = NODES[ni];
        // Izhikevich reset + absolute refractory
        n.v = n.c;
        n.u = n.u + n.d;
        n.I = 0;
        n.refrac = REFRAC_FRAMES;
        n.flashAlpha = 1;
        n.firedRecently = true;
        setTimeout(function () { n.firedRecently = false; }, 2000);

        spikeWindow.push(Date.now());

        for (var i = 0; i < CONNECTIONS.length; i++) {
            var c = CONNECTIONS[i];
            if (c[0] === ni || c[1] === ni) spawnSignal(i, ni);
        }

        // Easter egg check
        if (!easterEggShown) {
            var allFired = true;
            for (var i = 0; i < 5; i++) if (!NODES[i].firedRecently) { allFired = false; break; }
            if (allFired) {
                easterEggShown = true;
                eurekaAlpha = 1.5;
                setTimeout(function () {
                    var el = document.getElementById("origin-story");
                    if (el) el.classList.remove("hidden");
                }, 800);
            }
        }
    }

    function injectCurrent(ni, amount) {
        var n = NODES[ni];
        if (n.refrac > 0) return; // absolute refractory — ignore all input
        n.I += amount;
    }

    // =========================================================================
    // Stimulation wave (click in empty space)
    // =========================================================================
    function spawnStimWave(x, y, inhibitory) {
        stimWaves.push({
            x: x, y: y, radius: 0, maxRadius: Math.max(W, H) * 0.5,
            speed: inhibitory ? 3 : 4, alpha: 0.6, stimulated: {},
            inhibitory: !!inhibitory,
        });
    }

    // =========================================================================
    // Update
    // =========================================================================
    function update() {
        var now = Date.now();

        // Izhikevich integration (Euler, ~0.5ms steps, 4 steps per frame)
        var dt = EULER_DT;
        var steps = EULER_STEPS;
        for (var i = 0; i < NODES.length; i++) {
            var n = NODES[i];
            if (n.refrac > 0) {
                // Absolute refractory — hold at reset, ignore everything
                n.refrac--;
                n.I = 0;
                n.v = n.c;
            } else {
                for (var st = 0; st < steps; st++) {
                    if (n.v >= 30) { fireNode(i); break; }
                    n.v += dt * (0.04 * n.v * n.v + 5 * n.v + 140 - n.u + n.I);
                    n.u += dt * n.a * (n.b * n.v - n.u);
                }
                if (n.v > 35) n.v = 35;
                if (n.v < -90) n.v = -90;
                n.I *= SYNAPSE_DECAY;
            }
            n.flashAlpha = Math.max(0, n.flashAlpha - 0.025);
        }

        // Signals + trail spawning
        for (var i = signals.length - 1; i >= 0; i--) {
            var sg = signals[i];
            sg.t += sg.dir * sg.speed; sg.life -= 0.003;

            if (Math.abs(sg.t - sg.lastTrailT) > 0.05) {
                var c = CONNECTIONS[sg.conn], a = NODES[c[0]], b = NODES[c[1]], cp = getCP(a, b);
                var p = bezPt(sg.t, a.x, a.y, cp.c1x, cp.c1y, cp.c2x, cp.c2y, b.x, b.y);
                trails.push({ x: p.x, y: p.y, alpha: 0.4, color: sg.color });
                sg.lastTrailT = sg.t;
            }

            var arrived = (sg.dir > 0 && sg.t >= 1) || (sg.dir < 0 && sg.t <= 0);
            if (arrived) {
                injectCurrent(sg.dest, sg.inhibitory ? -(INHIB_CURRENT_MIN + Math.random() * (INHIB_CURRENT_MAX - INHIB_CURRENT_MIN)) : (EXCIT_CURRENT_MIN + Math.random() * (EXCIT_CURRENT_MAX - EXCIT_CURRENT_MIN)));
                signals.splice(i, 1);
            } else if (sg.life <= 0) { signals.splice(i, 1); }
        }

        // Trails fade
        for (var i = trails.length - 1; i >= 0; i--) {
            trails[i].alpha -= TRAIL_FADE;
            if (trails[i].alpha <= 0) trails.splice(i, 1);
        }

        // Stim waves
        for (var i = stimWaves.length - 1; i >= 0; i--) {
            var w = stimWaves[i];
            w.radius += w.speed; w.alpha -= 0.005;
            for (var j = 0; j < NODES.length; j++) {
                if (w.stimulated[j]) continue;
                var dx = NODES[j].x - w.x, dy = NODES[j].y - w.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= w.radius && dist >= w.radius - w.speed * 2) {
                    w.stimulated[j] = true;
                    injectCurrent(j, w.inhibitory ? -(STIM_INHIB_MIN + Math.random() * (STIM_INHIB_MAX - STIM_INHIB_MIN)) : (STIM_EXCIT_MIN + Math.random() * (STIM_EXCIT_MAX - STIM_EXCIT_MIN)));
                }
            }
            if (w.alpha <= 0 || w.radius > w.maxRadius) stimWaves.splice(i, 1);
        }

        // Micro flashes
        if (Math.random() < MICRO_FLASH_CHANCE && microNodes.length > 0) {
            microNodes[Math.floor(Math.random() * microNodes.length)].flash = 0.8;
        }
        for (var i = 0; i < microNodes.length; i++) {
            if (microNodes[i].flash > 0) microNodes[i].flash -= 0.015;
        }

        // Spontaneous synaptic noise
        if (now - lastIdleFire > IDLE_INTERVAL_MIN + Math.random() * (IDLE_INTERVAL_MAX - IDLE_INTERVAL_MIN)) {
            lastIdleFire = now;
            var ri = Math.floor(Math.random() * NODES.length);
            injectCurrent(ri, Math.random() < IDLE_BURST_CHANCE ? (IDLE_BURST_MIN + Math.random() * (IDLE_BURST_MAX - IDLE_BURST_MIN)) : (IDLE_NOISE_MIN + Math.random() * (IDLE_NOISE_MAX - IDLE_NOISE_MIN)));
        }

        // Spike rate
        while (spikeWindow.length > 0 && spikeWindow[0] < now - 5000) spikeWindow.shift();
        spikeCount = spikeWindow.length;

        if (eurekaAlpha > 0) eurekaAlpha -= 0.015;
    }

    // =========================================================================
    // Drawing
    // =========================================================================
    function drawMicroTissue() {
        var lc = css("conn-micro-line"), nc = css("conn-micro");
        ctx.strokeStyle = lc; ctx.lineWidth = 0.35;
        for (var i = 0; i < microConns.length; i++) {
            var a = microNodes[microConns[i][0]], b = microNodes[microConns[i][1]];
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        for (var i = 0; i < microNodes.length; i++) {
            var m = microNodes[i];
            var flashBoost = m.flash > 0 ? m.flash * 0.5 : 0;
            ctx.beginPath(); ctx.arc(m.x, m.y, m.r + flashBoost * 3, 0, Math.PI * 2);
            ctx.fillStyle = m.flash > 0 ? "#ffffff" : nc;
            ctx.globalAlpha = m.opacity + flashBoost; ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function drawTrails() {
        for (var i = 0; i < trails.length; i++) {
            var tr = trails[i];
            ctx.beginPath(); ctx.arc(tr.x, tr.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = tr.color; ctx.globalAlpha = tr.alpha * 0.5; ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function drawStimWaves() {
        for (var i = 0; i < stimWaves.length; i++) {
            var w = stimWaves[i];
            var waveColor = w.inhibitory ? "#c06a55" : "#e8b882";
            ctx.beginPath(); ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.strokeStyle = waveColor; ctx.globalAlpha = w.alpha * 0.3;
            ctx.lineWidth = 2; ctx.stroke();
            if (w.radius > 10) {
                ctx.beginPath(); ctx.arc(w.x, w.y, w.radius - 5, 0, Math.PI * 2);
                ctx.globalAlpha = w.alpha * 0.15; ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
    }

    function drawEurekaFlash() {
        if (eurekaAlpha <= 0) return;
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = Math.min(eurekaAlpha, 1) * 0.25;
        ctx.fillRect(0, 0, W, H);
        // All nodes flash
        for (var i = 0; i < NODES.length; i++) {
            var n = NODES[i];
            var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 8);
            grad.addColorStop(0, n.color); grad.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 8, 0, Math.PI * 2);
            ctx.fillStyle = grad; ctx.globalAlpha = Math.min(eurekaAlpha, 1) * 0.5; ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function drawDendrites(ni) {
        var n = NODES[ni], isHov = hoveredNode === ni, branches = dendrites[ni];
        if (!branches) return;
        var nPot = Math.max(0, (n.v + 70) / 100);
        var potA = n.type === "main" ? 0.08 + nPot * 0.3 : 0.04 + nPot * 0.5;
        ctx.strokeStyle = n.color; ctx.globalAlpha = isHov ? 0.4 : potA; ctx.lineWidth = isHov ? 1 : 0.5;
        for (var b = 0; b < branches.length; b++) {
            var br = branches[b];
            for (var s = 0; s < br.segs.length; s++) {
                ctx.beginPath(); ctx.moveTo(br.segs[s].x1, br.segs[s].y1);
                ctx.lineTo(br.segs[s].x2, br.segs[s].y2); ctx.stroke();
            }
            ctx.fillStyle = n.color;
            for (var t = 0; t < br.tips.length; t++) {
                ctx.beginPath(); ctx.arc(br.tips[t].x, br.tips[t].y, isHov ? 2.5 : 1, 0, Math.PI * 2); ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    function drawConnection(ci) {
        var c = CONNECTIONS[ci], a = NODES[c[0]], b = NODES[c[1]], cp = getCP(a, b);
        var isHov = hoveredNode === c[0] || hoveredNode === c[1];
        var potMax = Math.max(0, Math.max((a.v + 70) / 100, (b.v + 70) / 100));
        var isInhib = a.type === "inhib" || b.type === "inhib";

        ctx.strokeStyle = isHov ? css("conn-line-hover") : (isInhib ? "rgba(192,106,85,0.22)" : css("conn-line"));
        ctx.globalAlpha = isHov ? 1 : (0.3 + potMax * 0.7);
        ctx.lineWidth = isHov ? 2 : (1.2 + potMax * 0.8);
        ctx.beginPath(); ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(cp.c1x, cp.c1y, cp.c2x, cp.c2y, b.x, b.y); ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.fillStyle = isHov ? css("conn-line-hover") : css("conn-line");
        ctx.globalAlpha = isHov ? 0.5 : (0.15 + potMax * 0.3);
        for (var t = 0.25; t <= 0.75; t += 0.25) {
            var p = bezPt(t, a.x, a.y, cp.c1x, cp.c1y, cp.c2x, cp.c2y, b.x, b.y);
            ctx.beginPath(); ctx.arc(p.x, p.y, isHov ? 1.6 : 0.8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function drawSignals() {
        for (var i = 0; i < signals.length; i++) {
            var s = signals[i], c = CONNECTIONS[s.conn], a = NODES[c[0]], b = NODES[c[1]], cp = getCP(a, b);
            var p = bezPt(s.t, a.x, a.y, cp.c1x, cp.c1y, cp.c2x, cp.c2y, b.x, b.y);
            var alpha = Math.min(s.life, 1);

            var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
            grad.addColorStop(0, s.color); grad.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
            ctx.fillStyle = grad; ctx.globalAlpha = alpha * 0.3; ctx.fill();

            ctx.beginPath(); ctx.arc(p.x, p.y, s.inhibitory ? 1.8 : 2, 0, Math.PI * 2);
            ctx.fillStyle = s.color; ctx.globalAlpha = alpha; ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function drawNode(n, idx) {
        var isHov = hoveredNode === idx, isMain = n.type === "main";
        // Normalize v from [-90,30] to [0,1] for visuals
        var pot = Math.max(0, (n.v + 70) / 100);
        var glowR = n.r * (isHov ? 3.5 : (1.4 + pot * 2));
        if (glowR < 1) glowR = 1;

        if (n.flashAlpha > 0) {
            var fg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
            fg.addColorStop(0, n.color); fg.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
            ctx.fillStyle = fg; ctx.globalAlpha = n.flashAlpha * 0.4; ctx.fill(); ctx.globalAlpha = 1;
        }

        var grad = ctx.createRadialGradient(n.x, n.y, n.r * 0.2, n.x, n.y, glowR);
        grad.addColorStop(0, n.color); grad.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.globalAlpha = isHov ? 0.28 : Math.max(0, 0.03 + pot * 0.18);
        ctx.fill(); ctx.globalAlpha = 1;

        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = isHov ? css("conn-node-fill-hover") : css("conn-node-fill"); ctx.fill();

        // Potential arc — reflects membrane potential
        var isHyper = n.v < -72;
        var isRefractory = n.refrac > 0;
        if (isRefractory) {
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2, 0, Math.PI * 2);
            ctx.strokeStyle = "#c06a55"; ctx.globalAlpha = 0.3; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
        } else if (pot > 0.02) {
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(pot, 1));
            ctx.strokeStyle = n.color; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
        } else if (isHyper) {
            var hyperPot = Math.min(1, (Math.abs(n.v) - 72) / 18);
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 2, -Math.PI / 2, -Math.PI / 2 - Math.PI * 2 * hyperPot, true);
            ctx.strokeStyle = "#5a7a8c"; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
        }

        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.strokeStyle = n.color; ctx.lineWidth = isHov ? 2.5 : (isMain ? 1.5 : 0.7); ctx.stroke();

        if (isHov && isMain) {
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r - 4, 0, Math.PI * 2);
            ctx.strokeStyle = n.color; ctx.globalAlpha = 0.3; ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
        }


        // Main node labels
        if (!isMain) return;
        ctx.textAlign = "center";
        ctx.font = Math.max(11, n.r * 0.5) + "px 'Fragment Mono', monospace";
        ctx.fillStyle = n.color;
        ctx.fillText(n.label, n.x, n.y + n.r + 18);

        // Membrane potential — always visible inside node
        ctx.font = Math.max(7, n.r * 0.28) + "px 'Fragment Mono', monospace";
        ctx.textBaseline = "middle";
        if (n.refrac > 0) {
            ctx.fillStyle = "#c06a55";
            ctx.globalAlpha = 0.6;
            ctx.fillText("REF", n.x, n.y);
        } else {
            var mV = Math.round(n.v);
            ctx.fillStyle = isHyper ? "#5a7a8c" : (pot > 0.6 ? n.color : css("conn-text"));
            ctx.globalAlpha = 0.45;
            ctx.fillText(mV + "mV", n.x, n.y);
        }
        ctx.globalAlpha = 1;

        // Subtitle on hover
        if (isHov && n.sub) {
            ctx.font = Math.max(9, n.r * 0.38) + "px 'Fragment Mono', monospace";
            ctx.fillStyle = css("conn-text"); ctx.globalAlpha = 0.5;
            ctx.fillText(n.sub, n.x, n.y + n.r + 34); ctx.globalAlpha = 1;
        }
    }

    function drawHUD() {
        var rate = (spikeCount / 5).toFixed(1);
        var activeCount = 0, refracCount = 0;
        for (var i = 0; i < NODES.length; i++) {
            if (NODES[i].v > -60) activeCount++;
            if (NODES[i].refrac > 0) refracCount++;
        }
        var x = 16, y = H - 70;
        ctx.font = "10px 'Fragment Mono', monospace";
        ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = css("conn-text"); ctx.globalAlpha = 0.25;
        ctx.fillText("--- NETWORK MONITOR ---", x, y);
        ctx.globalAlpha = 0.4;
        ctx.fillText("Firing rate:  " + rate + " spikes/s", x, y + 14);
        ctx.fillText("Active:       " + activeCount + " / " + NODES.length, x, y + 28);
        ctx.fillText("Refractory:   " + refracCount, x, y + 42);
        ctx.globalAlpha = 1;
    }

    // =========================================================================
    // Hit test
    // =========================================================================
    function hitTest(mx, my) {
        for (var i = 0; i < NODES.length; i++) {
            if (NODES[i].type !== "main") continue;
            var dx = mx - NODES[i].x, dy = my - NODES[i].y;
            if (dx * dx + dy * dy < (NODES[i].r + 12) * (NODES[i].r + 12)) return i;
        }
        return null;
    }

    // =========================================================================
    // Render
    // =========================================================================
    function render() {
        update();
        ctx.clearRect(0, 0, W, H);
        drawMicroTissue();
        drawTrails();
        for (var i = 0; i < NODES.length; i++) drawDendrites(i);
        for (var i = 0; i < CONNECTIONS.length; i++) drawConnection(i);
        drawStimWaves();
        drawSignals();
        for (var i = 0; i < NODES.length; i++) drawNode(NODES[i], i);
        drawEurekaFlash();
        drawHUD();
        requestAnimationFrame(render);
    }

    // =========================================================================
    // Events
    // =========================================================================
    var lastFireTime = 0;

    canvas.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX; mouse.y = e.clientY;
        var hit = hitTest(mouse.x, mouse.y);
        hoveredNode = hit;
        canvas.style.cursor = hit !== null ? "pointer" : "default";
        if (hit !== null && Date.now() - lastFireTime > 400) {
            lastFireTime = Date.now(); injectCurrent(hit, HOVER_CURRENT);
        }
    });

    canvas.addEventListener("mouseleave", function () { hoveredNode = null; });

    // Right-click = inhibitory wave
    canvas.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        spawnStimWave(e.clientX, e.clientY, true);
    });

    canvas.addEventListener("click", function (e) {
        var hit = hitTest(e.clientX, e.clientY);
        if (hit !== null) {
            if (NODES[hit].href) window.location.href = NODES[hit].href;
        } else {
            // Click empty space = stimulation wave
            spawnStimWave(e.clientX, e.clientY);
        }
    });

    document.addEventListener("click", function (e) {
        var el = document.getElementById("origin-story");
        if (!el || el.classList.contains("hidden")) return;
        var card = el.querySelector(".origin-card");
        if (card && !card.contains(e.target)) { el.classList.add("hidden"); easterEggShown = false; }
    });

    // Space = global burst
    document.addEventListener("keydown", function (e) {
        if (e.code === "Space" && document.activeElement === document.body) {
            e.preventDefault();
            for (var i = 0; i < NODES.length; i++) injectCurrent(i, SPACE_CURRENT_MIN + Math.random() * (SPACE_CURRENT_MAX - SPACE_CURRENT_MIN));
            spawnStimWave(W / 2, H / 2);
        }
    });

    canvas.addEventListener("touchstart", function (e) {
        var t = e.touches[0], hit = hitTest(t.clientX, t.clientY);
        if (hit !== null) {
            injectCurrent(hit, HOVER_CURRENT);
            if (NODES[hit].href) setTimeout(function () { window.location.href = NODES[hit].href; }, 400);
        } else { spawnStimWave(t.clientX, t.clientY); }
    }, { passive: true });

    window.addEventListener("resize", resize);

    resize(); render();
})();
