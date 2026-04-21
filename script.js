document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = document.querySelector(".scene");
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorOutline = document.querySelector(".cursor-outline");
  const interactiveEls = document.querySelectorAll(
    "a, button, .btn, .work-piece, .stack-item, .brand, .site-nav a"
  );

  const parallaxLayers = document.querySelectorAll("[data-depth]");
  const revealEls = document.querySelectorAll(
    ".section-head, .about-copy, .about-aside, .work-piece, .stack-item, .contact-copy, .contact-links"
  );
  const meterFills = document.querySelectorAll(".meter-fill");

  const heroTitle = document.querySelector(".hero-title");
  const heroDesc = document.querySelector(".hero-desc");

  // =========================
  // SMOOTH SCROLL
  // =========================
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // =========================
  // CUSTOM CURSOR
  // =========================
  if (cursorDot && cursorOutline && !reducedMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let outlineX = mouseX;
    let outlineY = mouseY;

    let cursorScale = 1;
    let outlineScale = 1;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    const renderCursor = () => {
      const lerp = 0.18;

      dotX += (mouseX - dotX) * 0.45;
      dotY += (mouseY - dotY) * 0.45;

      outlineX += (mouseX - outlineX) * lerp;
      outlineY += (mouseY - outlineY) * lerp;

      cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${cursorScale})`;
      cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%) scale(${outlineScale})`;

      requestAnimationFrame(renderCursor);
    };

    renderCursor();

    interactiveEls.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorScale = 1.8;
        outlineScale = 1.6;
      });

      el.addEventListener("mouseleave", () => {
        cursorScale = 1;
        outlineScale = 1;
      });
    });

    // extra effect: grow on scroll indicator hover / stage hover
    const hoverBoostTargets = document.querySelectorAll(".stage, .hero, .works-scene");
    hoverBoostTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        outlineScale = Math.max(outlineScale, 1.15);
      });
      el.addEventListener("mouseleave", () => {
        outlineScale = 1;
      });
    });
  }

  // =========================
  // 3D PARALLAX ENGINE
  // =========================
  if (scene && !reducedMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const maxMove = 22; // px base movement
    const maxRotate = 6; // degrees

    const handlePointerMove = (e) => {
      const rect = scene.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1;  // -1 to 1
      const normY = (y / rect.height) * 2 - 1; // -1 to 1

      targetX = normX;
      targetY = normY;
    };

    const resetMotion = () => {
      targetX = 0;
      targetY = 0;
    };

    scene.addEventListener("mousemove", handlePointerMove);
    scene.addEventListener("mouseleave", resetMotion);

    const animateScene = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // move scene itself slightly
      scene.style.transform = `rotateX(${currentY * -maxRotate}deg) rotateY(${currentX * maxRotate}deg)`;

      // move layers based on depth
      parallaxLayers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || "0");
        const moveX = currentX * maxMove * depth;
        const moveY = currentY * maxMove * depth;

        layer.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth * 80}px)`;
      });

      requestAnimationFrame(animateScene);
    };

    animateScene();
  }

  // =========================
  // REVEAL ON SCROLL
  // =========================
  revealEls.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = reducedMotion
      ? "none"
      : "opacity 0.7s ease, transform 0.7s ease";
    el.style.transitionDelay = `${Math.min(index * 70, 500)}ms`;
  });

  if (!reducedMotion && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }

  // =========================
  // HERO TEXT MOTION
  // =========================
  if (heroTitle && !reducedMotion) {
    const words = heroTitle.querySelectorAll(".word");

    words.forEach((word, i) => {
      word.style.display = "inline-block";
      word.style.transition = "transform 0.2s ease, text-shadow 0.2s ease";
      word.addEventListener("mouseenter", () => {
        word.style.transform = `translateY(-4px) rotate(${i % 2 === 0 ? -2 : 2}deg)`;
        word.style.textShadow = "3px 3px 0 #000";
      });
      word.addEventListener("mouseleave", () => {
        word.style.transform = "translateY(0) rotate(0deg)";
        word.style.textShadow = "none";
      });
    });
  }

  if (heroDesc && !reducedMotion) {
    heroDesc.addEventListener("mouseenter", () => {
      heroDesc.style.transform = "translateY(-2px)";
    });
    heroDesc.addEventListener("mouseleave", () => {
      heroDesc.style.transform = "translateY(0)";
    });
    heroDesc.style.transition = "transform 0.2s ease";
  }

  // =========================
  // METER FILL ANIMATION
  // =========================
  meterFills.forEach((fill) => {
    const target = Number(fill.dataset.fill || 0);
    fill.style.width = "0%";
    fill.style.display = "block";
    fill.style.height = "100%";
    fill.style.background = "#000";
    fill.style.transition = reducedMotion ? "none" : "width 1s cubic-bezier(0.2, 0.8, 0.2, 1)";
  });

  const meterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const fill = entry.target.querySelector(".meter-fill");
        if (fill) {
          const target = Number(fill.dataset.fill || 0);
          requestAnimationFrame(() => {
            fill.style.width = `${target}%`;
          });
        }

        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll(".meter").forEach((meter) => meterObserver.observe(meter));

  // =========================
  // WORK PIECE INTERACTION
  // =========================
  const workPieces = document.querySelectorAll(".work-piece");

  workPieces.forEach((piece, index) => {
    piece.style.transformStyle = "preserve-3d";
    piece.style.transition = reducedMotion
      ? "none"
      : "transform 0.2s ease, box-shadow 0.2s ease";

    piece.addEventListener("mousemove", (e) => {
      if (reducedMotion) return;

      const rect = piece.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rx = ((y / rect.height) - 0.5) * -10;
      const ry = ((x / rect.width) - 0.5) * 10;

      piece.style.transform = `translate3d(0, 0, ${index * 8}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });

    piece.addEventListener("mouseleave", () => {
      piece.style.transform = `translate3d(0, 0, ${index * 8}px) rotateX(0deg) rotateY(0deg)`;
    });

    piece.addEventListener("click", () => {
      piece.style.transform = `translate3d(0, -6px, ${index * 8 + 10}px) rotateX(0deg) rotateY(0deg) scale(1.02)`;
      setTimeout(() => {
        piece.style.transform = `translate3d(0, 0, ${index * 8}px) rotateX(0deg) rotateY(0deg)`;
      }, 160);
    });
  });

  // =========================
  // NAV ACTIVE STATE ON SCROLL
  // =========================
  const navLinks = document.querySelectorAll(".site-nav a");
  const sections = [...document.querySelectorAll("main section[id]")];

  if ("IntersectionObserver" in window) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { threshold: 0.45 }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }
});