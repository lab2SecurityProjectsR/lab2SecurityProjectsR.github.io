(() => {
    "use strict";

    /* ==========================================================================
       CONFIG & PROJECT DATA
       ========================================================================== */
    const CONFIG = {
        discord: "paco289319",
        github: "https://github.com/lab2SecurityProjectsR",
        testPlace: "https://www.roblox.com/games/10768468868",
        pages: ["home", "work", "pricing", "contact"],
        projects: [
            {
                name: "Sentinel Anti-Cheat Engine",
                desc: "Server-side mathematical physics validator against speed, flight, teleports, and raycasted noclip with real-time Discord webhook incident telemetry.",
                copy: "Authoritative heartbeat position delta calculation, gravity decay curves, and token-bucket remote sanitization.",
                badge: "SENTINEL // ANTI-CHEAT",
                tags: ["Physics Validation", "Delta Raycasting", "Discord Webhooks", "Zero False Positives"],
                link: "https://github.com/lab2SecurityProjectsR/roblox-anticheat-suite"
            },
            {
                name: "JV Admin Console",
                desc: "Enterprise staff moderation console with dynamic two-way spectate toggle, live threat feed, real-time player telemetry, and zero-trust server-side injection.",
                copy: "Injected strictly to authenticated admins via hashed credentials. Full bans, kicks, server ping, and incident auditing.",
                badge: "JV CONSOLE // STAFF TOOLS",
                tags: ["Live Telemetry", "Spectate Toggle", "Zero-Trust Injection", "Ban Engine"],
                link: "https://github.com/lab2SecurityProjectsR/roblox-anticheat-suite"
            },
            {
                name: "Anti-Dupe Inventory Suite",
                desc: "Atomic transactional inventory and equipment framework with drop physics, slot loadout state machines, and data persistence.",
                copy: "Impossibility of item duplication through server verification, secure hotbar switching, and drop cooldowns.",
                badge: "ANTI-DUPE // ATOMIC ENGINE",
                tags: ["Atomic Transactions", "Data Persistence", "State Machines", "Drop Physics"],
                link: "https://github.com/lab2SecurityProjectsR"
            }
        ]
    };

    /* ==========================================================================
       SCENE & NAVIGATION ENGINE (DECK SLIDER)
       ========================================================================== */
    const scenes = Array.from(document.querySelectorAll(".scene"));
    const dots = Array.from(document.querySelectorAll(".dot-hit"));
    const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

    let currentScene = 0;
    let wheelLocked = false;
    let touchStartY = null;
    let exitTimer = 0;

    function getPageIndexFromHash() {
        const hash = location.hash.slice(1).toLowerCase();
        const index = CONFIG.pages.indexOf(hash);
        return index >= 0 ? index : 0;
    }

    function syncLocationHash(index) {
        const targetHash = "#" + CONFIG.pages[index];
        if (location.hash !== targetHash) {
            history.replaceState(null, "", targetHash);
        }
    }

    function canSceneScrollInternally(dir) {
        const activeScene = scenes[currentScene];
        if (!activeScene || activeScene.scrollHeight <= activeScene.clientHeight + 4) {
            return false;
        }
        return dir > 0
            ? activeScene.scrollTop + activeScene.clientHeight < activeScene.scrollHeight - 4
            : activeScene.scrollTop > 4;
    }

    function goToScene(index, pushHistory = true) {
        index = Math.max(0, Math.min(CONFIG.pages.length - 1, index));
        if (index === currentScene) {
            if (pushHistory) syncLocationHash(index);
            return;
        }

        clearTimeout(exitTimer);
        const oldScene = scenes[currentScene];
        const nextScene = scenes[index];

        scenes.forEach(s => s.classList.remove("exit"));
        oldScene.classList.remove("active");

        if (!prefersReducedMotion.matches) {
            oldScene.classList.add("exit");
        }

        nextScene.classList.add("active");
        currentScene = index;
        nextScene.scrollTop = 0;

        // Update Rail Navigation Dots
        dots.forEach((d, idx) => d.classList.toggle("active", idx === index));

        // Update Canvas Radar Focus
        radarBg.scene = index;

        if (pushHistory) {
            history.pushState(null, "", "#" + CONFIG.pages[index]);
        }

        exitTimer = setTimeout(() => {
            oldScene.classList.remove("exit");
        }, 580);
    }

    // Trigger buttons
    document.querySelectorAll("[data-go]").forEach(btn => {
        btn.addEventListener("click", () => {
            goToScene(parseInt(btn.dataset.go, 10));
        });
    });

    // Popstate (Browser back/forward buttons)
    window.addEventListener("popstate", () => {
        goToScene(getPageIndexFromHash(), false);
    });

    // Mouse Wheel Navigation
    window.addEventListener("wheel", (e) => {
        if (wheelLocked || Math.abs(e.deltaY) < 18) return;
        const dir = e.deltaY > 0 ? 1 : -1;
        if (canSceneScrollInternally(dir)) return;

        wheelLocked = true;
        goToScene(currentScene + dir);
        setTimeout(() => { wheelLocked = false; }, 140);
    }, { passive: true });

    // Touch Swipe Navigation (Mobile)
    window.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0]?.clientY;
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
        if (touchStartY === null) return;
        const delta = touchStartY - e.changedTouches[0].clientY;
        const dir = delta > 0 ? 1 : -1;

        if (Math.abs(delta) > 45 && !canSceneScrollInternally(dir)) {
            goToScene(currentScene + dir);
        }
        touchStartY = null;
    }, { passive: true });

    // Keyboard Arrow Keys
    window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "PageDown") {
            if (!canSceneScrollInternally(1)) {
                e.preventDefault();
                goToScene(currentScene + 1);
            }
        } else if (e.key === "ArrowUp" || e.key === "PageUp") {
            if (!canSceneScrollInternally(-1)) {
                e.preventDefault();
                goToScene(currentScene - 1);
            }
        } else if (e.key === "Home") {
            e.preventDefault();
            goToScene(0);
        } else if (e.key === "End") {
            e.preventDefault();
            goToScene(CONFIG.pages.length - 1);
        }
    });

    /* ==========================================================================
       WORK / PROJECT SHOWCASE CONTROLLER
       ========================================================================== */
    const cardStage = document.getElementById("cardStage");
    const countEl = document.getElementById("count");
    const detailName = document.getElementById("detailName");
    const detailDesc = document.getElementById("detailDesc");
    const detailTags = document.getElementById("detailTags");
    const cardName = document.getElementById("cardName");
    const cardCopy = document.getElementById("cardCopy");
    const cardBadge = document.getElementById("cardBadge");
    const playBtn = document.getElementById("playBtn");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    let projectIndex = 0;
    let projectBusy = false;

    function renderProject() {
        const proj = CONFIG.projects[projectIndex];
        countEl.textContent = String(projectIndex + 1).padStart(2, "0") + " / " + String(CONFIG.projects.length).padStart(2, "0");
        
        detailName.textContent = proj.name;
        detailDesc.textContent = proj.desc;
        
        // Tags
        detailTags.innerHTML = "";
        proj.tags.forEach(tag => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = tag;
            detailTags.appendChild(span);
        });

        cardName.textContent = proj.name;
        cardCopy.textContent = proj.copy;
        cardBadge.textContent = proj.badge;
        playBtn.href = proj.link;
    }

    function changeProject(dir) {
        if (projectBusy) return;
        projectBusy = true;

        if (prefersReducedMotion.matches) {
            projectIndex = (projectIndex + dir + CONFIG.projects.length) % CONFIG.projects.length;
            renderProject();
            projectBusy = false;
            return;
        }

        cardStage.className = "card-stage " + (dir > 0 ? "exit-left" : "exit-right");

        setTimeout(() => {
            projectIndex = (projectIndex + dir + CONFIG.projects.length) % CONFIG.projects.length;
            renderProject();
            cardStage.className = "card-stage " + (dir > 0 ? "enter-right" : "enter-left");

            setTimeout(() => {
                cardStage.className = "card-stage";
                projectBusy = false;
            }, 490);
        }, 260);
    }

    if (prevBtn) prevBtn.addEventListener("click", () => changeProject(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => changeProject(1));

    /* ==========================================================================
       DISCORD COPY TOAST CONTROLLER
       ========================================================================== */
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMsg");
    let toastTimer = 0;

    function copyDiscordTag(e) {
        if (e) e.preventDefault();
        navigator.clipboard.writeText(CONFIG.discord).then(() => {
            toastMsg.textContent = `DISCORD COPIED: ${CONFIG.discord}`;
            toast.classList.add("show");
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }).catch(() => {
            prompt("Copy Discord Username:", CONFIG.discord);
        });
    }

    const btnDiscordTop = document.getElementById("btnDiscordTop");
    const btnDiscordMain = document.getElementById("btnDiscordMain");
    if (btnDiscordTop) btnDiscordTop.addEventListener("click", copyDiscordTag);
    if (btnDiscordMain) btnDiscordMain.addEventListener("click", copyDiscordTag);

    /* ==========================================================================
       CYBER DEFENSE & ORBITAL THREAT RADAR CANVAS
       ========================================================================== */
    const radarBg = (() => {
        const canvas = document.getElementById("space");
        if (!canvas) return { set scene(v) {}, static() {} };

        const ctx = canvas.getContext("2d", { alpha: false });
        let W = 0, H = 0, dpr = 1;
        let packets = [], nodes = [], scene = 0;
        let isRunning = false, rafId = 0;
        let mx = 0, my = 0, tmx = 0, tmy = 0;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Orbiting encrypted data packets
            packets = Array.from({ length: Math.min(180, Math.floor(W * H / 5800)) }, () => ({
                angle: Math.random() * Math.PI * 2,
                radius: Math.pow(Math.random(), 0.7) * Math.max(W, H) * 0.52 + 45,
                speed: (0.0008 + Math.random() * 0.0022) * (Math.random() < 0.5 ? -1 : 1),
                depth: 0.3 + Math.random() * 0.7,
                length: 4 + Math.random() * 14,
                color: Math.random() < 0.2 ? "#00FF88" : (Math.random() < 0.15 ? "#8B5CF6" : "#00E5FF")
            }));

            // Static background network nodes
            nodes = Array.from({ length: 60 }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                alpha: 0.06 + Math.random() * 0.22,
                size: Math.random() < 0.8 ? 1.5 : 2.5
            }));
        }

        function draw(staticMode = false) {
            // Dark obsidian gradient background
            ctx.fillStyle = "#05070A";
            ctx.fillRect(0, 0, W, H);

            // Smooth parallax mouse interpolation
            mx += (tmx - mx) * 0.04;
            my += (tmy - my) * 0.04;

            // Defensive focal radar coordinates per scene
            const focalXFactors = [0.72, 0.76, 0.68, 0.74];
            const cx = W * (focalXFactors[scene] || 0.72) + mx;
            const cy = H * 0.5 + my;

            // Draw background network nodes & grid
            nodes.forEach(n => {
                ctx.globalAlpha = n.alpha;
                ctx.fillStyle = "#00E5FF";
                ctx.fillRect(n.x, n.y, n.size, n.size);
            });

            ctx.globalAlpha = 1;

            // Draw orbiting data packets
            ctx.save();
            ctx.translate(cx, cy);

            packets.forEach(p => {
                if (!staticMode) p.angle += p.speed;
                const x = Math.cos(p.angle) * p.radius;
                const y = Math.sin(p.angle) * p.radius * (0.24 + 0.18 * p.depth);
                const tangent = Math.atan2(Math.cos(p.angle) * p.radius * (0.24 + 0.18 * p.depth), -Math.sin(p.angle) * p.radius);
                const alpha = Math.max(0.04, (1 - p.radius / (Math.max(W, H) * 0.58)) * 0.55) * p.depth;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(tangent);
                ctx.strokeStyle = p.color === "#00FF88" 
                    ? `rgba(0, 255, 136, ${alpha})` 
                    : (p.color === "#8B5CF6" ? `rgba(139, 92, 246, ${alpha})` : `rgba(0, 229, 255, ${alpha})`);
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-p.length * 0.5, 0);
                ctx.lineTo(p.length, 0);
                ctx.stroke();
                ctx.restore();
            });

            ctx.restore();

            // Central Core Cyber Shield Glow
            const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
            coreGradient.addColorStop(0, "#05070A");
            coreGradient.addColorStop(0.32, "#07101E");
            coreGradient.addColorStop(0.44, "rgba(0, 229, 255, 0.45)");
            coreGradient.addColorStop(0.50, "rgba(0, 229, 255, 0.08)");
            coreGradient.addColorStop(1, "transparent");

            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, 220, 0, Math.PI * 2);
            ctx.fill();

            if (isRunning && !staticMode) {
                rafId = requestAnimationFrame(() => draw(false));
            }
        }

        function start() {
            if (isRunning || document.hidden) return;
            if (prefersReducedMotion.matches) {
                draw(true);
                return;
            }
            isRunning = true;
            rafId = requestAnimationFrame(() => draw(false));
        }

        function stop() {
            isRunning = false;
            cancelAnimationFrame(rafId);
        }

        window.addEventListener("pointermove", (e) => {
            tmx = (e.clientX / W - 0.5) * 32;
            tmy = (e.clientY / H - 0.5) * 24;
        }, { passive: true });

        window.addEventListener("resize", () => {
            resize();
            if (prefersReducedMotion.matches) draw(true);
        });

        document.addEventListener("visibilitychange", () => {
            document.hidden ? stop() : start();
        });

        resize();
        start();

        return {
            set scene(v) {
                scene = v;
                if (prefersReducedMotion.matches) draw(true);
            },
            static() {
                draw(true);
            }
        };
    })();

    /* ==========================================================================
       INITIALIZATION
       ========================================================================== */
    renderProject();
    const initialIndex = getPageIndexFromHash();
    if (initialIndex > 0) {
        goToScene(initialIndex, false);
    } else {
        syncLocationHash(0);
    }

})();
