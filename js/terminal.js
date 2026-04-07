(function () {
    // =========================================================================
    // Games database — edit this to add/remove mods
    //
    // Fields:
    //   name      — Display name
    //   desc      — Short description
    //   tags      — Array: Singleplayer, Open Source, Mod Menu, QoL, Trainer,
    //               Dev-Approved, Unity, Unreal, Godot, etc.
    //   version   — Semver string
    //   status    — Stable | Beta | In Development | Archived
    //   license   — AGPL-3.0 | GPL-3.0 | MIT | Apache-2.0
    //   github    — Repo URL
    // =========================================================================
    var GAMES = {
        "phantom-DFB": {
            name: "Dead from Behind",
            desc: "Mod menu adding extra features: ESP, Aimbot. Built with permission from the developer.",
            tags: ["Singleplayer", "Open Source", "Mod Menu", "Dev-Approved"],
            version: "1.0.0",
            status: "Stable",
            license: "AGPL-3.0",
            github: "https://github.com/LitteRabbit-37/Phantom-DFB",
        },
    };

    // =========================================================================
    // Terminal engine
    // =========================================================================
    var output = document.getElementById("terminal-output");
    var input = document.getElementById("terminal-input");
    var history = [];
    var histIdx = -1;

    function esc(s) {
        var d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    }

    function print(html, cls) {
        var line = document.createElement("div");
        line.className = "t-line" + (cls ? " " + cls : "");
        line.innerHTML = html;
        output.appendChild(line);
    }

    function printText(text, cls) {
        print(esc(text), cls);
    }

    function printBlank() {
        print("&nbsp;");
    }

    function scrollBottom() {
        var body = document.getElementById("terminal-body");
        body.scrollTop = body.scrollHeight;
    }

    function prompt(cmd) {
        print('<span class="prompt">$</span> ' + esc(cmd));
    }

    // =========================================================================
    // Commands
    // =========================================================================
    var COMMANDS = {};

    COMMANDS.help = function () {
        print('<span class="hl">Available commands:</span>');
        printBlank();
        print('  <span class="hl">list</span>            List all available mods');
        print('  <span class="hl">info</span> &lt;mod&gt;      Show details about a mod');
        print('  <span class="hl">open</span> &lt;mod&gt;      Open mod GitHub page');
        print('  <span class="hl">whoami</span>          About LitteCheat');
        print('  <span class="hl">clear</span>           Clear terminal');
        print('  <span class="hl">exit</span>            Return home');
        print('  <span class="hl">help</span>            Show this message');
    };

    COMMANDS.list = function () {
        print('<span class="hl">Available mods:</span>');
        printBlank();
        var keys = Object.keys(GAMES);
        for (var i = 0; i < keys.length; i++) {
            var g = GAMES[keys[i]];
            var statusMap = { "Stable": "hl", "Beta": "warn", "In Development": "warn", "Archived": "muted" };
            var cls = statusMap[g.status] || "muted";
            var tag = g.status === "Stable" ? "STABLE" : g.status === "Beta" ? "BETA" : g.status === "Archived" ? "ARCHIVED" : "WIP";
            print('  <span class="' + cls + '">[' + tag + ']</span> <span class="name">' + esc(g.name) + "</span>");
            print('         <span class="muted">id: ' + esc(keys[i]) + " &middot; v" + esc(g.version) + " &middot; " + esc(g.license || "MIT") + "</span>");
        }
        printBlank();
        print('<span class="muted">Use: info &lt;id&gt; for details</span>');
    };

    COMMANDS.info = function (args) {
        var id = args[0];
        if (!id) {
            print('<span class="err">Usage: info &lt;mod-id&gt;</span>');
            print('<span class="muted">Run "list" to see available mod IDs</span>');
            return;
        }
        var g = GAMES[id];
        if (!g) {
            print('<span class="err">Unknown mod: ' + esc(id) + "</span>");
            print('<span class="muted">Run "list" to see available mod IDs</span>');
            return;
        }
        printBlank();
        print('<span class="hl">  ' + esc(g.name) + "</span>  v" + esc(g.version));
        print('  <span class="muted">─────────────────────────────────</span>');
        printBlank();
        print("  " + esc(g.desc));
        printBlank();
        print('  <span class="meta-key">█░ Status:</span>   ' + esc(g.status));
        print('  <span class="meta-key">█░ License:</span>  ' + esc(g.license || "MIT"));
        print('  <span class="meta-key">█░ Tags:</span>     ' + esc(g.tags.join(", ")));
        print('  <span class="meta-key">█░ GitHub:</span>   <a href="' + esc(g.github) + '" target="_blank">' + esc(g.github) + "</a>");
        printBlank();
    };

    COMMANDS.open = function (args) {
        var id = args[0];
        if (!id) {
            print('<span class="err">Usage: open &lt;mod-id&gt;</span>');
            return;
        }
        var g = GAMES[id];
        if (!g) {
            print('<span class="err">Unknown mod: ' + esc(id) + "</span>");
            return;
        }
        print("Opening " + esc(g.github) + " ...");
        window.open(g.github, "_blank");
    };

    COMMANDS.whoami = function () {
        printBlank();
        print('<span class="hl">LitteCheat</span>');
        print("Solo game mod menus & quality-of-life cheats.");
        print("Open source. Developer-approved.");
        printBlank();
        print('<span class="meta-key">█░ Author:</span>    LitteRabbit');
        print('<span class="meta-key">█░ Category:</span>  Mod Menus');
        print('<span class="meta-key">█░ Platform:</span>  PC');
        print('<span class="meta-key">█░ License:</span>   AGPL-3.0 (default)');
        printBlank();
    };

    COMMANDS.clear = function () {
        output.innerHTML = "";
    };

    COMMANDS.exit = function () {
        print("Bye.");
        setTimeout(function () {
            window.location.href = "index.html";
        }, 400);
    };

    // Easter eggs
    COMMANDS.sudo = function () {
        print('<span class="err">Nice try.</span>');
    };

    COMMANDS.rm = function () {
        print('<span class="err">Permission denied. This is a read-only terminal.</span>');
    };

    COMMANDS.ls = COMMANDS.list;
    COMMANDS.cat = COMMANDS.info;
    COMMANDS.cd = function (args) {
        if (!args[0] || args[0] === ".." || args[0] === "~") {
            COMMANDS.exit();
        } else {
            print('<span class="err">No such directory: ' + esc(args[0]) + "</span>");
        }
    };

    // =========================================================================
    // Input handling
    // =========================================================================
    function exec(raw) {
        var parts = raw.trim().split(/\s+/);
        var cmd = parts[0];
        var args = parts.slice(1);

        prompt(raw);

        if (!cmd) {
            return;
        }

        if (COMMANDS[cmd]) {
            COMMANDS[cmd](args);
        } else {
            print('<span class="err">Command not found: ' + esc(cmd) + '</span>  <span class="muted">Type "help" for available commands.</span>');
        }

        printBlank();
        scrollBottom();
    }

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            var val = input.value;
            if (val.trim()) {
                history.unshift(val);
            }
            histIdx = -1;
            input.value = "";
            exec(val);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (histIdx < history.length - 1) {
                histIdx++;
                input.value = history[histIdx];
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (histIdx > 0) {
                histIdx--;
                input.value = history[histIdx];
            } else {
                histIdx = -1;
                input.value = "";
            }
        } else if (e.key === "Tab") {
            e.preventDefault();
            var val = input.value.trim();
            var parts = val.split(/\s+/);
            if (parts.length === 1) {
                // autocomplete command
                var matches = Object.keys(COMMANDS).filter(function (c) {
                    return c.indexOf(parts[0]) === 0;
                });
                if (matches.length === 1) input.value = matches[0] + " ";
            } else if (parts.length === 2 && (parts[0] === "info" || parts[0] === "open" || parts[0] === "cat")) {
                // autocomplete mod id
                var matches = Object.keys(GAMES).filter(function (g) {
                    return g.indexOf(parts[1]) === 0;
                });
                if (matches.length === 1) input.value = parts[0] + " " + matches[0];
            }
        }
    });

    // Focus input when clicking anywhere on terminal
    document.getElementById("terminal-body").addEventListener("click", function () {
        input.focus();
    });

    // Keep focus on input
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            window.location.href = "index.html";
            return;
        }
        if (document.activeElement !== input && !e.ctrlKey && !e.metaKey && !e.altKey) {
            input.focus();
        }
    });

    // =========================================================================
    // Boot sequence
    // =========================================================================
    function boot() {
        print('<span class="muted">LitteCheat v1.0.0 — Terminal Interface</span>');
        print('<span class="muted">Type "help" for available commands.</span>');
        printBlank();
        COMMANDS.whoami();
        scrollBottom();
        input.focus();
    }

    // Wait for pixel art animation to finish, then boot
    setTimeout(boot, 9 * 80 + 300);
})();
