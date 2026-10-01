(() => {
    "use strict";

    /* ==========================================================================
       CONFIG & SUITES DATA
       ========================================================================== */
    const CONFIG = {
        discord: "jorgevvv",
        github: "https://github.com/lab2SecurityProjectsR",
        testPlace: "https://www.roblox.com/games/107695139582162/Server-Anti-Cheat-Moderation-Suite",
        pages: ["home", "work", "pricing", "contact"],
        suites: [
            {
                name: "Sentinel Anti-Cheat Engine",
                badge: "SENTINEL // ANTI-CHEAT",
                counter: "SYSTEM 01 OF 03",
                desc: "Server-side mathematical physics validator against speed hacks, fly tools, teleports, and raycasted noclip. Clamps velocity strictly with gravity decay curves and dispatches incident telemetry to Discord webhooks.",
                vectors: [
                    "Speed Hack Clamping",
                    "Delta Raycast Noclip",
                    "Gravity Decay Clamping",
                    "Zero Client-Trust",
                    "Discord Incident Telemetry"
                ],
                math: "ΔPos = (Pos2 - Pos1); if ΔPos.Magnitude / Δt > MaxVelocity then RollbackTo(Pos1)",
                repo: "https://github.com/lab2SecurityProjectsR/roblox-anticheat-suite",
                simMode: "VECTOR: SPEED_HACK",
                simSequence: [
                    { type: "threat", text: "[CLIENT] Injected Humanoid.WalkSpeed = 120 (Normal: 16 studs/s)" },
                    { type: "threat", text: "[PHYSICS] Trajectory delta: Displaced 48.2 studs in 0.016s window" },
                    { type: "defense", text: "[THRESHOLD] Exceeded bounds: Max Velocity = 16.0 studs/s + 0.4 grace" },
                    { type: "defense", text: "[ROLLBACK] Clamping Position back to server-verified coordinate" },
                    { type: "telemetry", text: "[DISCORD] Incident payload serialized: Webhook alert dispatched" },
                    { type: "ready", text: "[STATUS] Exploiter neutralized without server stutter (<0.2ms overhead)" }
                ]
            },
            {
                name: "Sentinel Staff Admin & Threat Feed",
                badge: "SENTINEL // STAFF CONSOLE",
                counter: "SYSTEM 02 OF 03",
                desc: "Enterprise moderation suite with two-way spectate toggle, live in-game threat telemetry, hashed credentials, and zero-trust server-side UI injection.",
                vectors: [
                    "Live Telemetry",
                    "Spectate Toggle",
                    "Zero-Trust UI Injection",
                    "Cross-Server Bans",
                    "Incident Audit Logging"
                ],
                math: "IntegrityHash = sha256(UserId .. Salt .. SessionEpoch); Authorize(AdminRank >= 2)",
                repo: "https://github.com/lab2SecurityProjectsR/roblox-AdminPanel",
                simMode: "VECTOR: REMOTE_PAYLOAD_TAMPERING",
                simSequence: [
                    { type: "threat", text: "[CLIENT] Non-admin client fired ModerationActionRemote with fake admin flag" },
                    { type: "threat", text: "[AUTH_CHECK] Evaluating caller credentials against hashed server salt..." },
                    { type: "defense", text: "[DENIED] Caller UserId not in staff whitelist: Remote dropped instantly" },
                    { type: "defense", text: "[THREAT_FEED] Live intrusion alert flashed across active staff HUDs" },
                    { type: "telemetry", text: "[DISCORD] Security incident logged: Exploiter marked for shadow-ban" },
                    { type: "ready", text: "[STATUS] Admin remotes secure. Zero client trust preserved." }
                ]
            },
            {
                name: "Transactional Anti-Dupe Inventory",
                badge: "ANTI-DUPE // ATOMIC ENGINE",
                counter: "SYSTEM 03 OF 03",
                desc: "Atomic transactional inventory and equipment framework with drop physics, slot loadout state machines, and data persistence.",
                vectors: [
                    "Atomic Transactions",
                    "Session Mutex Locks",
                    "Drop Physics",
                    "Data Persistence",
                    "Race Condition Protection"
                ],
                math: "LockSession(UUID, TTL); if not AcquireMutex(PlayerId) then AbortTransaction()",
                repo: "https://github.com/lab2SecurityProjectsR/inventory-logic-NoGoodUi",
                simMode: "VECTOR: DUPLICATION_RACE_CONDITION",
                simSequence: [
                    { type: "threat", text: "[CLIENT] Fired 40 concurrent DropItem remotes in single physics frame" },
                    { type: "threat", text: "[RACE_ATTEMPT] Exploiter attempting to duplicate legendary weapon item" },
                    { type: "defense", text: "[MUTEX] DataSessionManager locked Slot_04: First transaction acquired" },
                    { type: "defense", text: "[DROP_39] Mutex busy: Remaining 39 requests aborted without execution" },
                    { type: "telemetry", text: "[AUDIT] Exactly 1 item dropped to world. Inventory state verified." },
                    { type: "ready", text: "[STATUS] Zero duplication possible. Atomic integrity 100%." }
                ]
            }
        ]
    };

    /* ==========================================================================
       SCENE & NAVIGATION ENGINE (TACTICAL DOCK)
       ========================================================================== */
    const scenes = Array.from(document.querySelectorAll(".scene"));
    const dockItems = Array.from(document.querySelectorAll(".dock-item"));
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

        // Update Dock Items
        dockItems.forEach((btn, idx) => btn.classList.toggle("active", idx === index));

        // Update Canvas Radar Focus
        radarBg.scene = index;

        if (pushHistory) {
            history.pushState(null, "", "#" + CONFIG.pages[index]);
        }

        exitTimer = setTimeout(() => {
            oldScene.classList.remove("exit");
        }, 500);
    }

    // Trigger buttons with [data-go]
    document.querySelectorAll("[data-go]").forEach(btn => {
        btn.addEventListener("click", () => {
            goToScene(parseInt(btn.dataset.go, 10));
        });
    });

    // Popstate (Browser back/forward)
    window.addEventListener("popstate", () => {
        goToScene(getPageIndexFromHash(), false);
    });

    // Mouse Wheel Navigation
    window.addEventListener("wheel", (e) => {
        if (wheelLocked || Math.abs(e.deltaY) < 20) return;
        const dir = e.deltaY > 0 ? 1 : -1;
        if (canSceneScrollInternally(dir)) return;

        wheelLocked = true;
        goToScene(currentScene + dir);
        setTimeout(() => { wheelLocked = false; }, 160);
    }, { passive: true });

    // Touch Swipe Navigation (Mobile Ergonomics)
    let touchStartX = null;
    window.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0]?.clientY;
        touchStartX = e.touches[0]?.clientX;
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
        if (touchStartY === null || touchStartX === null) return;
        const deltaY = touchStartY - e.changedTouches[0].clientY;
        const deltaX = touchStartX - e.changedTouches[0].clientX;
        
        // Only trigger scene shift on decisive vertical swipe if not scrollable
        if (Math.abs(deltaY) > 85 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
            const dir = deltaY > 0 ? 1 : -1;
            if (!canSceneScrollInternally(dir)) {
                goToScene(currentScene + dir);
            }
        }
        touchStartY = null;
        touchStartX = null;
    }, { passive: true });

    // Keyboard Shortcuts (1-4 keys & Arrows)
    window.addEventListener("keydown", (e) => {
        if (["1", "2", "3", "4"].includes(e.key)) {
            goToScene(parseInt(e.key, 10) - 1);
        } else if (e.key === "ArrowDown" || e.key === "PageDown") {
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
       HERO LIVE TELEMETRY SIMULATOR
       ========================================================================== */
    const heroConsole = document.getElementById("heroConsole");
    const btnSimulateTelemetry = document.getElementById("btnSimulateTelemetry");

    const telemetryPool = [
        "[INSPECTOR] Player_718 delta position check: 14.8 studs/s [OK]",
        "[ALERT] High-velocity vector injected (WalkSpeed: 85 studs/s)",
        "[ROLLBACK] Velocity clamped to 16.0 studs/s. Teleported to last safe ground pos.",
        "[RAYCAST] Trajectory swept between frames: 0 barrier penetration",
        "[MUTEX] Inventory SessionLock granted for Player_901",
        "[DISCORD] Real-time incident report dispatched to webhook channel"
    ];

    if (btnSimulateTelemetry && heroConsole) {
        btnSimulateTelemetry.addEventListener("click", () => {
            const randomEntry = telemetryPool[Math.floor(Math.random() * telemetryPool.length)];
            const div = document.createElement("div");
            div.className = "hud-line highlight";
            div.textContent = randomEntry;
            heroConsole.appendChild(div);
            heroConsole.scrollTop = heroConsole.scrollHeight;

            btnSimulateTelemetry.style.transform = "scale(0.96)";
            setTimeout(() => { btnSimulateTelemetry.style.transform = ""; }, 120);
        });
    }

    /* ==========================================================================
       SECURITY SUITES INSPECTOR & THREAT SIMULATOR
       ========================================================================== */
    const suiteTabs = Array.from(document.querySelectorAll(".suite-tab"));
    const suiteBadge = document.getElementById("suiteBadge");
    const suiteCounter = document.getElementById("suiteCounter");
    const suiteName = document.getElementById("suiteName");
    const suiteDesc = document.getElementById("suiteDesc");
    const suiteVectors = document.getElementById("suiteVectors");
    const suiteMath = document.getElementById("suiteMath");
    const suiteRepoBtn = document.getElementById("suiteRepoBtn");

    const simMode = document.getElementById("simMode");
    const simDisplay = document.getElementById("simDisplay");
    const btnRunSimulation = document.getElementById("btnRunSimulation");
    const simBtnLabel = document.getElementById("simBtnLabel");

    let currentSuiteIndex = 0;
    let simulationRunning = false;

    function renderSuite(index) {
        currentSuiteIndex = index;
        const suite = CONFIG.suites[index];

        suiteTabs.forEach((tab, idx) => {
            tab.classList.toggle("active", idx === index);
            tab.setAttribute("aria-selected", idx === index ? "true" : "false");
        });

        suiteBadge.textContent = suite.badge;
        suiteCounter.textContent = suite.counter;
        suiteName.textContent = suite.name;
        suiteDesc.textContent = suite.desc;
        suiteMath.textContent = suite.math;
        suiteRepoBtn.href = suite.repo;

        // Vectors
        suiteVectors.innerHTML = "";
        suite.vectors.forEach(v => {
            const span = document.createElement("span");
            span.className = "v-tag";
            span.textContent = v;
            suiteVectors.appendChild(span);
        });

        // Reset Simulator
        simMode.textContent = suite.simMode;
        simDisplay.innerHTML = `<div class="sim-row">[READY] System idle. Standby for vector injection...</div>`;
    }

    suiteTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            renderSuite(parseInt(tab.dataset.suite, 10));
        });
    });

    if (btnRunSimulation) {
        btnRunSimulation.addEventListener("click", () => {
            if (simulationRunning) return;
            simulationRunning = true;
            simBtnLabel.textContent = "RUNNING THREAT MITIGATION...";
            btnRunSimulation.style.opacity = "0.7";

            const suite = CONFIG.suites[currentSuiteIndex];
            simDisplay.innerHTML = `<div class="sim-row">[SIMULATION INITIATED] Target: ${suite.simMode}</div>`;

            let step = 0;
            const interval = setInterval(() => {
                if (step >= suite.simSequence.length) {
                    clearInterval(interval);
                    simulationRunning = false;
                    simBtnLabel.textContent = "EXECUTE ATTACK SIMULATION";
                    btnRunSimulation.style.opacity = "1";
                    return;
                }

                const item = suite.simSequence[step];
                const div = document.createElement("div");
                div.className = `sim-row active-${item.type}`;
                div.textContent = item.text;
                simDisplay.appendChild(div);
                simDisplay.scrollTop = simDisplay.scrollHeight;

                step++;
            }, 550);
        });
    }

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
       TACTICAL SERVER TOPOLOGY & DEFENSE LATTICE ENGINE (OPTION 1 - SELECTED)
       ========================================================================== */
    const radarBg = (() => {
        const canvas = document.getElementById("space");
        if (!canvas) return { set scene(v) {}, static() {} };

        const ctx = canvas.getContext("2d", { alpha: false });
        let W = 0, H = 0, dpr = 1;
        let isRunning = false, rafId = 0;
        let sceneIndex = 0;

        // Interaction state
        let mouseX = -1000, mouseY = -1000;
        let targetMx = -1000, targetMy = -1000;

        // Topology entities
        let nodes = [];
        let packets = [];
        let shockwaves = [];

        const NODE_TYPES = [
            { type: "validator", color: "#00E5FF", label: "VALIDATOR" },
            { type: "firewall", color: "#00FF88", label: "FIREWALL" },
            { type: "mutex", color: "#A78BFA", label: "MUTEX_LOCK" },
            { type: "shard", color: "#38BDF8", label: "ROBLOX_SHARD" }
        ];

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Generate distributed server nodes
            const nodeCount = Math.min(75, Math.max(35, Math.floor((W * H) / 19000)));
            nodes = Array.from({ length: nodeCount }, (_, i) => {
                const typeObj = NODE_TYPES[i % NODE_TYPES.length];
                const hasLabel = i < 8; // Top hub nodes display telemetry labels
                return {
                    id: i,
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: (Math.random() - 0.5) * 0.45,
                    vy: (Math.random() - 0.5) * 0.45,
                    baseRadius: hasLabel ? 4 : 2.5,
                    radius: hasLabel ? 4 : 2.5,
                    color: typeObj.color,
                    type: typeObj.type,
                    label: hasLabel ? `${typeObj.label}_0${(i % 4) + 1}` : null,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.02 + Math.random() * 0.03,
                    connectedNodes: []
                };
            });

            // Pre-seed network data packets
            packets = Array.from({ length: Math.min(22, Math.floor(nodes.length * 0.35)) }, () => createPacket());
        }

        function createPacket() {
            if (nodes.length < 2) return null;
            const fromIdx = Math.floor(Math.random() * nodes.length);
            let toIdx = (fromIdx + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
            
            // Pick a close neighbor if possible
            const fromNode = nodes[fromIdx];
            let minDist = 240;
            for (let i = 0; i < nodes.length; i++) {
                if (i === fromIdx) continue;
                const dx = nodes[i].x - fromNode.x;
                const dy = nodes[i].y - fromNode.y;
                const dist = Math.hypot(dx, dy);
                if (dist < minDist) {
                    minDist = dist;
                    toIdx = i;
                }
            }

            return {
                from: fromIdx,
                to: toIdx,
                t: Math.random(),
                speed: 0.008 + Math.random() * 0.012,
                color: Math.random() < 0.3 ? "#00FF88" : "#00E5FF"
            };
        }

        function triggerShockwave(x, y, color = "#00E5FF", maxRadius = 32) {
            shockwaves.push({
                x,
                y,
                r: 2,
                maxR: maxRadius,
                alpha: 0.7,
                color
            });
        }

        function draw(staticMode = false) {
            // Dark Obsidian Backdrop
            ctx.fillStyle = "#05070A";
            ctx.fillRect(0, 0, W, H);

            // Subtle tactical coordinate cross grid in background
            ctx.strokeStyle = "rgba(0, 229, 255, 0.03)";
            ctx.lineWidth = 1;
            const gridSize = 120;
            const crossSize = 4;
            for (let x = gridSize; x < W; x += gridSize) {
                for (let y = gridSize; y < H; y += gridSize) {
                    ctx.beginPath();
                    ctx.moveTo(x - crossSize, y);
                    ctx.lineTo(x + crossSize, y);
                    ctx.moveTo(x, y - crossSize);
                    ctx.lineTo(x, y + crossSize);
                    ctx.stroke();
                }
            }

            // Smooth mouse interpolation
            mouseX += (targetMx - mouseX) * 0.08;
            mouseY += (targetMy - mouseY) * 0.08;

            // Update & move nodes
            const maxLinkDistance = Math.min(155, W * 0.2);
            nodes.forEach(n => {
                if (!staticMode) {
                    n.x += n.vx;
                    n.y += n.vy;
                    n.pulse += n.pulseSpeed;

                    // Screen boundaries bounce with damping
                    if (n.x < 20) { n.x = 20; n.vx *= -1; }
                    else if (n.x > W - 20) { n.x = W - 20; n.vx *= -1; }
                    if (n.y < 20) { n.y = 20; n.vy *= -1; }
                    else if (n.y > H - 20) { n.y = H - 20; n.vy *= -1; }

                    // Mouse proximity influence (repulsion / excitation)
                    const mdx = n.x - mouseX;
                    const mdy = n.y - mouseY;
                    const mdist = Math.hypot(mdx, mdy);
                    if (mdist < 140 && mdist > 1) {
                        const force = (1 - mdist / 140) * 0.45;
                        n.x += (mdx / mdist) * force;
                        n.y += (mdy / mdist) * force;
                    }
                }
                n.connectedNodes = [];
            });

            // Draw encrypted network links between close nodes
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n2.x - n1.x;
                    const dy = n2.y - n1.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < maxLinkDistance) {
                        n1.connectedNodes.push(j);
                        n2.connectedNodes.push(i);

                        const alpha = (1 - dist / maxLinkDistance) * 0.24;
                        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    }
                }

                // Interactive cursor tether line
                const cdx = mouseX - n1.x;
                const cdy = mouseY - n1.y;
                const cdist = Math.hypot(cdx, cdy);
                if (cdist < 170) {
                    const cursorAlpha = (1 - cdist / 170) * 0.42;
                    ctx.strokeStyle = `rgba(0, 255, 136, ${cursorAlpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(n1.x, n1.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.stroke();
                }
            }

            // Draw & advance data packets traveling along links
            if (!staticMode) {
                packets.forEach((p, idx) => {
                    if (!p) { packets[idx] = createPacket(); return; }
                    p.t += p.speed;

                    const nFrom = nodes[p.from];
                    const nTo = nodes[p.to];

                    if (!nFrom || !nTo || p.t >= 1) {
                        if (nTo) {
                            triggerShockwave(nTo.x, nTo.y, p.color, 24);
                        }
                        packets[idx] = createPacket();
                        return;
                    }

                    // Linear interpolation along edge
                    const px = nFrom.x + (nTo.x - nFrom.x) * p.t;
                    const py = nFrom.y + (nTo.y - nFrom.y) * p.t;

                    // Packet head
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                });
            }

            // Draw expanding defense shockwaves
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.r += 0.8;
                sw.alpha -= 0.022;

                if (sw.alpha <= 0 || sw.r >= sw.maxR) {
                    shockwaves.splice(i, 1);
                    continue;
                }

                ctx.strokeStyle = sw.color === "#00FF88" 
                    ? `rgba(0, 255, 136, ${sw.alpha})` 
                    : `rgba(0, 229, 255, ${sw.alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Render Server Nodes
            nodes.forEach(n => {
                const breathing = Math.sin(n.pulse) * 0.8;
                const r = Math.max(1.8, n.baseRadius + breathing);

                // Outer aura ring for hub nodes
                if (n.label) {
                    ctx.strokeStyle = n.color === "#00FF88" ? "rgba(0, 255, 136, 0.35)" : "rgba(0, 229, 255, 0.35)";
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Node core
                ctx.fillStyle = n.color;
                ctx.shadowColor = n.color;
                ctx.shadowBlur = n.label ? 12 : 6;
                ctx.beginPath();
                ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Hub telemetry label
                if (n.label) {
                    ctx.font = '8px "JetBrains Mono", monospace';
                    ctx.fillStyle = "rgba(241, 245, 249, 0.45)";
                    ctx.fillText(n.label, n.x + 8, n.y + 3);
                }
            });

            // Ambient corner defense telemetry glow
            const glowX = sceneIndex === 1 ? W * 0.25 : (sceneIndex === 2 ? W * 0.8 : W * 0.72);
            const ambientGlow = ctx.createRadialGradient(glowX, H * 0.5, 0, glowX, H * 0.5, 340);
            ambientGlow.addColorStop(0, "rgba(0, 229, 255, 0.07)");
            ambientGlow.addColorStop(0.5, "rgba(0, 255, 136, 0.02)");
            ambientGlow.addColorStop(1, "transparent");
            ctx.fillStyle = ambientGlow;
            ctx.fillRect(0, 0, W, H);

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

        // Mouse & Pointer listeners
        window.addEventListener("pointermove", (e) => {
            targetMx = e.clientX;
            targetMy = e.clientY;
        }, { passive: true });

        window.addEventListener("pointerleave", () => {
            targetMx = -1000;
            targetMy = -1000;
        });

        // Trigger EMP pulse on click
        window.addEventListener("pointerdown", (e) => {
            triggerShockwave(e.clientX, e.clientY, "#00E5FF", 56);
            // Spawn rapid response packet from nearby node
            const closest = nodes.reduce((prev, curr) => {
                const dPrev = Math.hypot(prev.x - e.clientX, prev.y - e.clientY);
                const dCurr = Math.hypot(curr.x - e.clientX, curr.y - e.clientY);
                return dCurr < dPrev ? curr : prev;
            }, nodes[0]);

            if (closest) {
                triggerShockwave(closest.x, closest.y, "#00FF88", 38);
            }
        });

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
                sceneIndex = v;
                // Pulse central hub on scene transition
                triggerShockwave(W * 0.5, H * 0.5, "#00FF88", 64);
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
    renderSuite(0);
    const initialIndex = getPageIndexFromHash();
    if (initialIndex > 0) {
        goToScene(initialIndex, false);
    } else {
        syncLocationHash(0);
    }

})();
