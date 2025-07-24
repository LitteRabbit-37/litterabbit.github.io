// Header
const navbarLogo = document.getElementById("navbar-logo-name");

// Main buttons
const whyBtn = document.getElementById("why-btn");
const appsBtn = document.getElementById("apps-btn");
const twiBtn = document.getElementById("twi-btn");

// Modal
const whyModal = document.getElementById("why-modal");
const closeWhyModal = document.getElementById("close-why-modal");

// Our application
const ourApp = document.getElementById("ourApp-modal");
const closeOurAppModal = document.getElementById("close-ourApp-modal");

// --- Modal OUR APP ---
appsBtn.addEventListener("click", () => {
    ourApp.style.display = "flex";
});

closeOurAppModal.addEventListener("click", () => {
    setTimeout(() => {
        ourApp.style.display = "none";
    }, 240);
});

// --- Modal WHY ---
whyBtn.addEventListener("click", () => {
    whyModal.style.display = "flex";
});

closeWhyModal.addEventListener("click", () => {
    setTimeout(() => {
        whyModal.style.display = "none";
    }, 240);
});

// --- Logo animation "🐰Twi!" ---
twiBtn.addEventListener("click", () => {
    navbarLogo.classList.add("bunny-animate");
    setTimeout(() => navbarLogo.classList.remove("bunny-animate"), 800);
});

particlesJS("particles-js", {
    particles: {
        number: {
            value: 199,
            density: {
                enable: true,
                value_area: 1420,
            },
        },
        color: {
            value: "#5b34ea",
        },
        shape: {
            type: "circle",
            stroke: {
                width: 0,
                color: "#000000",
            },
            polygon: {
                nb_sides: 5,
            },
            image: {
                src: "img/github.svg",
                width: 100,
                height: 100,
            },
        },
        opacity: {
            value: 0.5,
            random: false,
            anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
            },
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false,
            },
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: "#808080",
            opacity: 0.4,
            width: 1,
        },
        move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
            },
        },
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: {
                enable: true,
                mode: "grab",
            },
            onclick: {
                enable: true,
                mode: "push",
            },
            resize: true,
        },
        modes: {
            grab: {
                distance: 100,
                line_linked: {
                    opacity: 1,
                },
            },
            bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3,
            },
            repulse: {
                distance: 200,
            },
            push: {
                particles_nb: 4,
            },
            remove: {
                particles_nb: 2,
            },
        },
    },
    retina_detect: true,
});

// --- Main Title animation ---
document.querySelectorAll(".main-title span").forEach((wordSpan) => {
    const word = wordSpan.textContent;
    wordSpan.innerHTML = "";
    [...word].forEach((letter) => {
        const letterSpan = document.createElement("span");
        letterSpan.className = "letter";
        letterSpan.textContent = letter === " " ? "\u00A0" : letter;
        wordSpan.appendChild(letterSpan);
    });
});

function randomChar() {
    const chars = "#@{}$%&?!<>/\\№:;|+-*~";
    return chars[Math.floor(Math.random() * chars.length)];
}

const glitchIntervals = new WeakMap();

// Flag for cooldown
document.querySelectorAll(".main-title span").forEach((wordSpan) => {
    let isGlitching = false;
    let cooldown = false;

    wordSpan.addEventListener("mouseenter", () => {
        // If already in progress OR in cooldown, nothing is launched
        if (isGlitching || cooldown) return;

        isGlitching = true;

        wordSpan.querySelectorAll(".letter").forEach((letter, i) => {
            if (glitchIntervals.has(letter)) {
                clearInterval(glitchIntervals.get(letter));
                glitchIntervals.delete(letter);
                letter.textContent = letter.dataset.original || letter.textContent;
            }
            letter.dataset.original = letter.textContent;
            let iterations = 0;
            const maxIterations = 7 + Math.floor(Math.random() * 3);

            const interval = setInterval(() => {
                letter.textContent = randomChar();
                iterations++;
                if (iterations > maxIterations) {
                    clearInterval(interval);
                    letter.textContent = letter.dataset.original;
                    glitchIntervals.delete(letter);

                    // When the last letter is processed we reset the flags
                    if (i === wordSpan.querySelectorAll(".letter").length - 1) {
                        // To prevent multiple glitches at the same time
                        cooldown = true;
                        setTimeout(() => {
                            cooldown = false;
                        }, 400); // Cooldown
                        isGlitching = false;
                    }
                }
            }, 80 + i * 50);

            glitchIntervals.set(letter, interval);
        });
    });
});
