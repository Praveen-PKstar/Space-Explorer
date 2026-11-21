
const journey = document.querySelector(".journey");

if (journey) {
    const scenes = [...journey.querySelectorAll(".scene")];

    const chapterCount = document.getElementById("chapter-count");
    const chapterTitle = document.getElementById("chapter-title");
    const chapterDescription = document.getElementById("chapter-description");
    const progressBar = document.getElementById("progress-bar");

    const depthIndicator = document.getElementById("depth-indicator");
    const depthValue = document.getElementById("depth-value");

    const chapters = [
        ["01 / 09", "THE MILKY WAY", "Our home galaxy. A vast island of stars."],
        ["02 / 09", "THE SOLAR SYSTEM", "Meet the Sun and the eight planets."],
        ["03 / 09", "MOONS AND PLANETS", "Explore distant worlds and their moons."],
        ["04 / 09", "SPACECRAFT", "Travel through space towards Earth."],
        ["05 / 09", "PLANET EARTH", "Our beautiful blue home in space."],
        ["06 / 09", "EARTH SURFACE", "Descend towards the surface of our planet."],
        ["07 / 09", "OCEAN SURFACE", "Reach sea level. The underwater journey begins."],
        ["08 / 09", "UNDERWATER", "Explore the blue world beneath the waves."],
        ["09 / 09", "THE DEEP OCEAN", "Discover the mysterious ocean depths."]
    ];

    let previousChapter = -1;
    let ticking = false;
// ======================================
// REALISTIC UNDERWATER FISH
// ======================================

function createSeaLife() {
    const underwater = document.querySelector(".underwater-visual");
    const deepOcean = document.querySelector(".deep-visual");

    if (!underwater || !deepOcean) return;

    // Prevent duplicate fish
    if (underwater.querySelector(".fish-school")) return;

    const style = document.createElement("style");

    style.textContent = `
        .fish-school,
        .deep-creature-layer {
            position: absolute;
            inset: 0;
            z-index: 10;
            pointer-events: none;
            overflow: hidden;
        }

        .real-fish {
            position: absolute;
            width: 76px;
            height: 38px;
            animation: fishSwim 7s ease-in-out infinite alternate;
            filter: drop-shadow(0 3px 5px rgba(0,0,0,.25));
        }

        .real-fish .fish-body {
            position: absolute;
            left: 12px;
            top: 8px;
            width: 52px;
            height: 25px;
            border-radius: 55% 45% 48% 52%;
            background: linear-gradient(
                180deg,
                var(--fish-light),
                var(--fish-color) 65%,
                var(--fish-dark)
            );
        }

        .real-fish .fish-tail {
            position: absolute;
            left: 0;
            top: 8px;
            width: 20px;
            height: 26px;
            background: var(--fish-color);
            clip-path: polygon(100% 50%, 0 0, 12% 50%, 0 100%);
        }

        .real-fish .fish-fin {
            position: absolute;
            left: 32px;
            top: 1px;
            width: 18px;
            height: 14px;
            background: var(--fish-light);
            clip-path: polygon(0 100%, 50% 0, 100% 100%);
        }

        .real-fish .fish-eye {
            position: absolute;
            left: 55px;
            top: 15px;
            width: 5px;
            height: 5px;
            background: white;
            border-radius: 50%;
            box-shadow: inset 0 0 0 2px #10202a;
        }

        .real-fish .fish-stripe {
            position: absolute;
            left: 28px;
            top: 9px;
            width: 4px;
            height: 23px;
            border-radius: 50%;
            background: rgba(255,255,255,.55);
        }

        @keyframes fishSwim {
            from { translate: -18px 0; }
            to { translate: 22px -12px; }
        }

        /* DEEP OCEAN CREATURES */

        .deep-monster {
            position: absolute;
            filter: drop-shadow(0 0 18px rgba(0,220,255,.25));
            animation: monsterDrift 8s ease-in-out infinite alternate;
        }

        .anglerfish {
            width: 250px;
            height: 170px;
            left: 12%;
            top: 25%;
        }

        .angler-body {
            position: absolute;
            left: 20px;
            top: 45px;
            width: 205px;
            height: 115px;
            border-radius: 55% 48% 48% 55%;
            background: radial-gradient(
                ellipse at 65% 35%,
                #45636c,
                #152b38 55%,
                #050d19 100%
            );
            box-shadow: inset -15px -15px 25px #020710;
        }

        .angler-mouth {
            position: absolute;
            right: 5px;
            top: 88px;
            width: 85px;
            height: 48px;
            border-bottom: 7px solid #a7c2c9;
            border-radius: 0 0 70% 60%;
            transform: rotate(-10deg);
        }

        .angler-teeth {
            position: absolute;
            right: 22px;
            top: 115px;
            width: 60px;
            height: 25px;
            background: repeating-linear-gradient(
                90deg,
                transparent 0 8px,
                #d8f4f5 8px 11px
            );
            clip-path: polygon(0 0, 100% 0, 50% 100%);
        }

        .angler-eye {
            position: absolute;
            right: 62px;
            top: 76px;
            width: 17px;
            height: 17px;
            border-radius: 50%;
            background: #eaff9a;
            box-shadow: 0 0 18px 8px #baff55;
        }

        .angler-antenna {
            position: absolute;
            left: 120px;
            top: 0;
            width: 5px;
            height: 65px;
            background: #718c91;
            transform: rotate(-25deg);
            transform-origin: bottom;
        }

        .angler-light {
            position: absolute;
            left: 95px;
            top: -9px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #caff70;
            box-shadow: 0 0 25px 12px rgba(180,255,90,.65);
        }

        .giant-squid {
            width: 220px;
            height: 280px;
            right: 7%;
            top: 45%;
            animation-delay: -3s;
        }

        .squid-head {
            position: absolute;
            left: 65px;
            top: 0;
            width: 90px;
            height: 115px;
            border-radius: 50% 50% 35% 35%;
            background: linear-gradient(90deg, #351b48, #a34b72, #351b48);
            box-shadow: inset -12px 0 18px #160c29;
        }

        .squid-eye {
            position: absolute;
            left: 45px;
            top: 72px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #e9ffff;
            box-shadow: 0 0 12px #6df7ff;
        }

        .squid-tentacle {
            position: absolute;
            top: 95px;
            width: 13px;
            height: 175px;
            border-radius: 50%;
            background: linear-gradient(90deg, #421b4e, #b44b75, #421b4e);
            transform-origin: top;
        }

        .squid-tentacle:nth-child(3) { left: 62px; transform: rotate(25deg); }
        .squid-tentacle:nth-child(4) { left: 85px; transform: rotate(10deg); }
        .squid-tentacle:nth-child(5) { left: 115px; transform: rotate(-10deg); }
        .squid-tentacle:nth-child(6) { left: 140px; transform: rotate(-25deg); }

        @keyframes monsterDrift {
            from { transform: translateY(-10px) scale(.98); }
            to { transform: translateY(12px) scale(1.03); }
        }
    `;

    document.head.appendChild(style);

    // Create underwater fish school
    const school = document.createElement("div");
    school.className = "fish-school";
    underwater.appendChild(school);

    const fishColors = [
        ["#ffcf5c", "#f08a24", "#9d461b"],
        ["#8de5e8", "#269bb5", "#15516d"],
        ["#ff9baf", "#e64d75", "#812342"],
        ["#d7e98b", "#83aa3d", "#405c20"],
        ["#c5a6ff", "#8254bd", "#40256c"]
    ];

    const positions = [
        [12, 25], [27, 38], [43, 22], [62, 34], [80, 25],
        [18, 55], [35, 65], [55, 52], [72, 67], [88, 52],
        [10, 78], [30, 82], [52, 78], [75, 85], [91, 75]
    ];

    positions.forEach((position, index) => {
        const fish = document.createElement("div");
        fish.className = "real-fish";

        const colors = fishColors[index % fishColors.length];

        fish.style.left = position[0] + "%";
        fish.style.top = position[1] + "%";
        fish.style.transform = `scale(${0.55 + (index % 4) * 0.15})`;
        fish.style.animationDelay = `-${index * 0.7}s`;
        fish.style.animationDuration = `${5 + (index % 4)}s`;

        fish.style.setProperty("--fish-light", colors[0]);
        fish.style.setProperty("--fish-color", colors[1]);
        fish.style.setProperty("--fish-dark", colors[2]);

        fish.innerHTML = `
            <div class="fish-tail"></div>
            <div class="fish-body"></div>
            <div class="fish-fin"></div>
            <div class="fish-stripe"></div>
            <div class="fish-eye"></div>
        `;

        school.appendChild(fish);
    });

    // Add giant deep-ocean creatures
    const monsters = document.createElement("div");
    monsters.className = "deep-creature-layer";

    monsters.innerHTML = `
        <div class="deep-monster anglerfish">
            <div class="angler-antenna"></div>
            <div class="angler-light"></div>
            <div class="angler-body"></div>
            <div class="angler-eye"></div>
            <div class="angler-mouth"></div>
            <div class="angler-teeth"></div>
        </div>

        <div class="deep-monster giant-squid">
            <div class="squid-head"></div>
            <div class="squid-eye"></div>
            <div class="squid-tentacle"></div>
            <div class="squid-tentacle"></div>
            <div class="squid-tentacle"></div>
            <div class="squid-tentacle"></div>
        </div>
    `;

    deepOcean.appendChild(monsters);
}

// Create the sea life only once
createSeaLife();
    function clamp(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }

    function updateJourney() {
        const maxScroll = journey.offsetHeight - window.innerHeight;

        if (maxScroll <= 0 || scenes.length === 0) return;

        // Calculate scroll progress relative to the journey section.
        const rect = journey.getBoundingClientRect();

        const travelled = clamp(
            -rect.top,
            0,
            maxScroll
        );

        const progress = travelled / maxScroll;

        // Camera moves through all nine scenes.
        const cameraPosition = progress * (scenes.length - 1);

        scenes.forEach((scene, index) => {
            const visual = scene.querySelector(".visual");

            if (!visual) return;

            const distance = index - cameraPosition;
            const amount = Math.abs(distance);

            // Fade between neighbouring scenes.
            const opacity = clamp(1 - amount, 0, 1);

            let scale;

            if (distance >= 0) {
                // Incoming scene approaches the camera.
                scale = 0.6 + (1 - distance) * 0.4;
            } else {
                // Previous scene moves away from the camera.
                scale = 1 + amount * 2.5;
            }

            scene.style.opacity = opacity;

            // Later scenes are layered above earlier scenes.
            scene.style.zIndex = index + 1;

            visual.style.transform =
                `translate(-50%, -50%) scale(${scale})`;

            visual.style.filter =
                `blur(${amount * 2}px)`;
        });

        // Update chapter information.
        const activeChapter = Math.min(
            Math.round(cameraPosition),
            chapters.length - 1
        );

        if (activeChapter !== previousChapter) {
            const chapter = chapters[activeChapter];

            chapterCount.textContent = chapter[0];
            chapterTitle.textContent = chapter[1];
            chapterDescription.textContent = chapter[2];

            previousChapter = activeChapter;
        }

        // Update progress bar.
        progressBar.style.transform = `scaleX(${progress})`;

        // Depth meter for the final ocean stages.
        if (cameraPosition >= 6) {
            depthIndicator.classList.add("show");

            const depth = Math.round(
                clamp((cameraPosition - 6) * 500, 0, 1000)
            );

            depthValue.textContent = `${depth} m`;
        } else {
            depthIndicator.classList.remove("show");
            depthValue.textContent = "0 m";
        }
    }

    function requestUpdate() {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            updateJourney();
            ticking = false;
        });
    }

    window.addEventListener("scroll", requestUpdate, {
        passive: true
    });

    window.addEventListener("resize", requestUpdate);

    updateJourney();
}
