// -----------------------------------------------------------------------------
// displacementSlider: day/night slider with displacement + resize effect
// -----------------------------------------------------------------------------
const displacementSlider = function (opts) {
    // --- shaders GLSL
    const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;
    const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D currentImage;
    uniform sampler2D nextImage;
    uniform float dispFactor;
    void main() {
      vec2 uv = vUv;
      float intensity = 0.3;
      vec4 orig1 = texture2D(currentImage, uv);
      vec4 orig2 = texture2D(nextImage,   uv);
      vec4 _c = texture2D(currentImage, vec2(uv.x, uv.y + dispFactor * (orig2 * intensity)));
      vec4 _n = texture2D(nextImage,    vec2(uv.x, uv.y + (1.0 - dispFactor) * (orig1 * intensity)));
      gl_FragColor = mix(_c, _n, dispFactor);
    }
  `;

    // --- setup renderer
    const parent = opts.parent;
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    parent.appendChild(renderer.domElement);

    // --- texture
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    const [imgA, imgB] = opts.images;
    const texA = loader.load(imgA.src + "?v=" + Date.now());
    const texB = loader.load(imgB.src + "?v=" + Date.now());
    [texA, texB].forEach((tex) => {
        tex.magFilter = tex.minFilter = THREE.LinearFilter;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });

    // --- scene & ortho camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 1000);
    camera.position.z = 1;

    // --- material & mesh
    const mat = new THREE.ShaderMaterial({
        uniforms: {
            dispFactor: { value: 0.0 },
            currentImage: { value: texA },
            nextImage: { value: texB },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
    });
    const geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // --- dynamic resizing to maintain ratio & cover
    const onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1) renderer update
        renderer.setSize(width, height);

        // 2) ortho camera update
        camera.left = -width / 2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = -height / 2;
        camera.updateProjectionMatrix();

        // 3) calculating ratios for distortion-free "cover
        const imgRatio = imgA.naturalWidth / imgA.naturalHeight;
        const containerRatio = width / height;
        let scaleX, scaleY;
        if (containerRatio >= imgRatio) {
            scaleX = width;
            scaleY = width / imgRatio;
        } else {
            scaleX = height * imgRatio;
            scaleY = height;
        }

        // 4) apply the scale
        mesh.scale.set(scaleX, scaleY, 1);
    };

    window.addEventListener("resize", onResize);
    onResize(); // initial call

    // --- animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };
    animate();

    // --- transition method (0 → day, 1 → night)
    let isAnimating = false;
    this.goToSlide = (i) => {
        if (isAnimating) return;
        isAnimating = true;

        mat.uniforms.nextImage.value = i === 0 ? texA : texB;
        mat.uniforms.nextImage.needsUpdate = true;

        TweenLite.to(mat.uniforms.dispFactor, 1, {
            value: 1,
            ease: "Expo.easeInOut",
            onComplete: () => {
                mat.uniforms.currentImage.value = i === 0 ? texA : texB;
                mat.uniforms.currentImage.needsUpdate = true;
                mat.uniforms.dispFactor.value = 0;
                isAnimating = false;
            },
        });
    };
};

// -----------------------------------------------------------------------------
// initialization on loading + toggle binding + icon
// -----------------------------------------------------------------------------
window.addEventListener("load", () => {
    const sliderEl = document.getElementById("slider");
    const imgs = sliderEl.querySelectorAll("img");
    if (imgs.length < 2) return;

    const slider = new displacementSlider({
        parent: sliderEl,
        images: [imgs[0], imgs[1]],
    });

    const themeToggleInput = document.getElementById("themeToggle");
    const dockIcon = document.querySelector(".dock-icon.theme-button");

    const applyTheme = (isDark) => {
        const theme = isDark ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        themeToggleInput.checked = isDark;
    };

    const savedTheme = localStorage.getItem("theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const isDarkInit = savedTheme ? savedTheme === "dark" : !prefersLight;

    applyTheme(isDarkInit);
    slider.goToSlide(isDarkInit ? 1 : 0);

    themeToggleInput.addEventListener("change", () => {
        const isDark = themeToggleInput.checked;
        applyTheme(isDark);
        slider.goToSlide(isDark ? 1 : 0);
    });

    dockIcon.addEventListener("click", (e) => {
        e.preventDefault();
        const isDark = !themeToggleInput.checked;
        applyTheme(isDark);
        slider.goToSlide(isDark ? 1 : 0);
    });
});
