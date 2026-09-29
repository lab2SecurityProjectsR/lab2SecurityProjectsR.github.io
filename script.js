/* ==========================================================================
   JV // LAB2 SECURITY PROJECTS - INTERACTION & CLIENT CONTROLLER
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambient Cursor Spotlight Effect
    const spotlight = document.getElementById("cursorSpotlight");
    if (spotlight) {
        window.addEventListener("mousemove", (e) => {
            spotlight.style.left = `${e.clientX}px`;
            spotlight.style.top = `${e.clientY}px`;
        });
    }

    // 2. Interactive Code Terminal Tab Switcher
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");

            // Update active button state
            tabButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            // Update active code pane
            tabPanes.forEach((pane) => {
                if (pane.id === targetId) {
                    pane.classList.add("active");
                } else {
                    pane.classList.remove("active");
                }
            });
        });
    });

    // 3. Discord Clipboard Copy with Feedback Toast
    const toast = document.getElementById("toastNotification");
    const toastMsg = document.getElementById("toastMessage");
    let toastTimeout = null;

    function showToast(message) {
        if (!toast) return;
        toastMsg.textContent = message;
        toast.classList.add("show");

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 3200);
    }

    const copyButtons = document.querySelectorAll(".copy-discord-btn");
    copyButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const discordHandle = btn.getAttribute("data-discord") || "jorgevvv";

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(discordHandle).then(() => {
                    showToast(`Discord handle copied: ${discordHandle}`);
                }).catch(() => {
                    fallbackCopyText(discordHandle);
                });
            } else {
                fallbackCopyText(discordHandle);
            }
        });
    });

    function fallbackCopyText(text) {
        const tempInput = document.createElement("input");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand("copy");
            showToast(`Discord handle copied: ${text}`);
        } catch (err) {
            showToast(`Discord: ${text}`);
        }
        document.body.removeChild(tempInput);
    }

    // 4. Navbar Sticky Elevation on Scroll
    const navbar = document.getElementById("mainNavbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 30) {
            navbar.style.borderBottomColor = "rgba(56, 189, 248, 0.28)";
            navbar.style.background = "rgba(7, 10, 19, 0.92)";
        } else {
            navbar.style.borderBottomColor = "rgba(56, 189, 248, 0.12)";
            navbar.style.background = "rgba(7, 10, 19, 0.75)";
        }
    });
});
