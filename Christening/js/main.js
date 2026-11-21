document.addEventListener("DOMContentLoaded", () => {
  // Replace with your deployed Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyz1HxjiS_hDeL63wwlUeGjgBd5-2LhFaUz_LLiRWWoWYvVB_znUP8blteahtKf7nXd/exec";

  // 0. Smart fallback resolver for images
  function resolveSmartImages() {
    const imgs = document.querySelectorAll("img[data-candidates]");
    imgs.forEach((img) => {
      const list = (img.getAttribute("data-candidates") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!list.length) return;

      let idx = 0;
      const tryNext = () => {
        idx += 1;
        if (idx < list.length) {
          img.src = list[idx];
        } else {
          img.removeEventListener("error", tryNext);
        }
      };

      img.addEventListener("error", tryNext);
      img.src = list[0];
    });
  }
  resolveSmartImages();

  // 1. Animated Pink & Yellow Flowers Background
  const flowerContainer = document.getElementById("flower-container");
  if (flowerContainer) {
    const flowerCount = window.innerWidth < 600 ? 16 : 28;
    const pinkBlossomSVG = `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="14" rx="10" ry="13" fill="#FF9EC2"/>
        <ellipse cx="32" cy="50" rx="10" ry="13" fill="#FF9EC2"/>
        <ellipse cx="14" cy="32" rx="13" ry="10" fill="#FFB8D4"/>
        <ellipse cx="50" cy="32" rx="13" ry="10" fill="#FFB8D4"/>
        <ellipse cx="20" cy="20" rx="10" ry="10" fill="#FF85B3"/>
        <ellipse cx="44" cy="44" rx="10" ry="10" fill="#FF85B3"/>
        <circle cx="32" cy="32" r="8" fill="#FFE066"/>
      </svg>`;
    const yellowBlossomSVG = `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="14" rx="10" ry="13" fill="#FFE066"/>
        <ellipse cx="32" cy="50" rx="10" ry="13" fill="#FFE066"/>
        <ellipse cx="14" cy="32" rx="13" ry="10" fill="#FFF099"/>
        <ellipse cx="50" cy="32" rx="13" ry="10" fill="#FFF099"/>
        <ellipse cx="44" cy="20" rx="10" ry="10" fill="#FFD43B"/>
        <ellipse cx="20" cy="44" rx="10" ry="10" fill="#FFD43B"/>
        <circle cx="32" cy="32" r="8" fill="#FF85B3"/>
      </svg>`;

    for (let i = 0; i < flowerCount; i++) {
      const flower = document.createElement("span");
      flower.className = "floating-flower";
      const size = (Math.random() * 18 + 16).toFixed(0);
      flower.style.width = `${size}px`;
      flower.style.height = `${size}px`;
      flower.style.left = `${(Math.random() * 98).toFixed(2)}%`;
      flower.style.top = `${(Math.random() * 98).toFixed(2)}%`;
      flower.style.setProperty("--dur", `${(Math.random() * 5 + 6).toFixed(1)}s`);
      flower.style.setProperty("--delay", `${(Math.random() * 5).toFixed(1)}s`);
      flower.style.setProperty("--max-op", `${(Math.random() * 0.35 + 0.35).toFixed(2)}`);
      flower.innerHTML = i % 2 === 0 ? pinkBlossomSVG : yellowBlossomSVG;
      flowerContainer.appendChild(flower);
    }
  }

  // 2. Wax Seal Envelope Open + Auto Background Audio + Hero Text Trigger
  const gate = document.getElementById("envelope-gate");
  const openBtn = document.getElementById("open-invitation-btn");
  const audioBar = document.getElementById("audio-bar");
  const audio = document.getElementById("bg-audio");
  const musicBtn = document.getElementById("music-toggle-btn");
  const musicStatus = document.getElementById("music-status-text");

  let userPausedMusic = false;
  let isOpeningEnvelope = false;

  const startMusic = () => {
    if (!audio || userPausedMusic) return;
    audio.play().then(() => {
      if (musicStatus) musicStatus.textContent = "Pause Music";
    }).catch(() => {
      if (musicStatus) musicStatus.textContent = "Play Music";
    });
  };

  const revealHeroTexts = () => {
    const heroTexts = document.querySelectorAll("#celebrant .text-reveal");
    heroTexts.forEach((el) => el.classList.add("in-view"));
  };

  if (openBtn && gate) {
    openBtn.addEventListener("click", () => {
      if (isOpeningEnvelope) return;
      isOpeningEnvelope = true;

      gate.classList.add("is-untied");

      setTimeout(() => {
        gate.classList.add("is-open");
        document.body.classList.remove("locked");
        if (audioBar) audioBar.classList.remove("hidden");
        userPausedMusic = false;
        startMusic();
        revealHeroTexts();
      }, 780);
    });
  }

  const unlockOnce = () => {
    if (gate && audio && !gate.classList.contains("is-open") && audio.paused && !userPausedMusic) {
      startMusic();
    }
  };
  document.addEventListener("pointerdown", unlockOnce, { once: true });

  if (musicBtn && audio) {
    musicBtn.addEventListener("click", () => {
      if (audio.paused) {
        userPausedMusic = false;
        audio.play().then(() => {
          if (musicStatus) musicStatus.textContent = "Pause Music";
        }).catch(() => {
          if (musicStatus) musicStatus.textContent = "Add MP3 to assets/audio";
        });
      } else {
        userPausedMusic = true;
        audio.pause();
        if (musicStatus) musicStatus.textContent = "Play Music";
      }
    });
  }

  // 3. Helper for Slideshows (Celebrant Photo 1-6 & Church 1-3)
  function createSlideshow({
    containerId,
    dotsId,
    prevId,
    nextId,
    counterId,
    intervalMs = 3500,
    autoStart = true,
  }) {
    const container = document.getElementById(containerId);
    if (!container) return { start: () => {} };

    const slides = Array.from(container.querySelectorAll(".slide"));
    const dotsEl = dotsId ? document.getElementById(dotsId) : null;
    const prevBtn = prevId ? document.getElementById(prevId) : null;
    const nextBtn = nextId ? document.getElementById(nextId) : null;
    const counterEl = counterId ? document.getElementById(counterId) : null;

    let current = 0;
    let timer = null;
    let isRunning = false;

    const dots = slides.map((_, idx) => {
      if (!dotsEl) return null;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slide-dot" + (idx === 0 ? " active" : "");
      btn.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      btn.addEventListener("click", () => {
        goTo(idx);
        restart();
      });
      dotsEl.appendChild(btn);
      return btn;
    });

    function goTo(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      dots.forEach((dot, i) => dot && dot.classList.toggle("active", i === current));
      if (counterEl) {
        counterEl.textContent = `${current + 1} / ${slides.length}`;
      }
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function start() {
      if (isRunning || slides.length <= 1) return;
      isRunning = true;
      timer = setInterval(next, intervalMs);
    }

    function restart() {
      clearInterval(timer);
      if (isRunning) {
        timer = setInterval(next, intervalMs);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prev();
        restart();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        next();
        restart();
      });
    }

    goTo(0);
    if (autoStart) start();

    return { start };
  }

  // Celebrant Slideshow (Photo 1 to Photo 6)
  createSlideshow({
    containerId: "debut-slideshow",
    dotsId: "debut-dots",
    prevId: "debut-prev",
    nextId: "debut-next",
    counterId: "debut-counter",
    intervalMs: 3500,
    autoStart: true,
  });

  // Church Slideshow (church 1 to church 3)
  const churchSlideshow = createSlideshow({
    containerId: "church-slideshow",
    dotsId: "church-dots",
    prevId: "church-prev",
    nextId: "church-next",
    intervalMs: 3200,
    autoStart: false,
  });

  const venueSection = document.getElementById("venue");
  if (venueSection) {
    const venueObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            churchSlideshow.start();
            venueObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    venueObserver.observe(venueSection);
  }

  // 4. Countdown to Saturday, December 19, 2026 at 8:00 AM (+08:00)
  const eventDate = new Date("2026-12-19T08:00:00+08:00").getTime();
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-minutes");
  const secsEl = document.getElementById("cd-seconds");

  function updateCountdown() {
    if (!daysEl) return;
    const now = Date.now();
    const diff = Math.max(0, eventDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, "0");
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 5. Staggered Scroll Reveal for Sections & Texts
  document.querySelectorAll(".section").forEach((section) => {
    const items = section.querySelectorAll(".text-reveal");
    items.forEach((item, index) => {
      if (!item.style.getPropertyValue("--stagger")) {
        item.style.setProperty("--stagger", `${Math.min(index * 0.1, 0.5)}s`);
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          entry.target.querySelectorAll(".text-reveal").forEach((el) => {
            el.classList.add("in-view");
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const textObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          textObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".text-reveal").forEach((el) => {
    if (!el.closest("#celebrant")) {
      textObserver.observe(el);
    }
  });

  // 6. Gallery Click-to-Enlarge Lightbox + Mobile Touch Swipe
  const galleryItems = Array.from(document.querySelectorAll("#gallery .gallery-item"));
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxStage = lightbox ? lightbox.querySelector(".lightbox-stage") : null;
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  let activeGalleryIdx = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  const swipeThreshold = 45;

  function renderLightboxPhoto(index) {
    if (!galleryItems.length || !lightboxImg) return;
    activeGalleryIdx = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeGalleryIdx];
    const sourceImg = item.querySelector("img");
    const captionEl = item.querySelector("figcaption");

    lightboxImg.src = sourceImg ? sourceImg.currentSrc || sourceImg.src : "";
    lightboxImg.alt = sourceImg ? sourceImg.alt : `Yunique Laine Photo ${activeGalleryIdx + 1}`;
    if (lightboxCaption) {
      lightboxCaption.textContent = captionEl ? captionEl.textContent : lightboxImg.alt;
    }
    if (lightboxCounter) {
      lightboxCounter.textContent = `${activeGalleryIdx + 1} / ${galleryItems.length}`;
    }
  }

  function openLightbox(index) {
    if (!lightbox) return;
    renderLightboxPhoto(index);
    lightbox.classList.remove("hidden");
    requestAnimationFrame(() => lightbox.classList.add("is-visible"));
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-visible");
    setTimeout(() => {
      if (!lightbox.classList.contains("is-visible")) {
        lightbox.classList.add("hidden");
      }
    }, 240);
  }

  galleryItems.forEach((item, idx) => {
    item.addEventListener("click", () => openLightbox(idx));
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      renderLightboxPhoto(activeGalleryIdx - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener("click", (e) => {
      e.stopPropagation();
      renderLightboxPhoto(activeGalleryIdx + 1);
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    const swipeTarget = lightboxStage || lightbox;
    swipeTarget.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches || !e.touches.length) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    swipeTarget.addEventListener(
      "touchend",
      (e) => {
        if (!e.changedTouches || !e.changedTouches.length) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          if (deltaX < 0) {
            renderLightboxPhoto(activeGalleryIdx + 1);
          } else {
            renderLightboxPhoto(activeGalleryIdx - 1);
          }
        }
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") renderLightboxPhoto(activeGalleryIdx - 1);
    if (e.key === "ArrowRight") renderLightboxPhoto(activeGalleryIdx + 1);
  });

  // 7. Dynamic RSVP Form
  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("rsvp-status");
  const submitBtn = document.getElementById("rsvp-submit-btn");
  const kidsSection = document.getElementById("kids-section");
  const companionSection = document.getElementById("companion-section");
  const kidsInputsList = document.getElementById("kids-inputs-list");
  const addKidBtn = document.getElementById("add-kid-btn");
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

  function updateRsvpFieldsVisibility() {
    const selected = document.querySelector('input[name="attendance"]:checked');
    const val = selected ? selected.value : "";

    if (!kidsSection || !companionSection || !kidsInputsList) return;

    if (val === "Yes, I will attend with my kid/s.") {
      kidsSection.classList.remove("hidden");
      companionSection.classList.remove("hidden");
      const firstKid = kidsInputsList.querySelector("input");
      if (firstKid) firstKid.required = true;
    } else if (val === "Declines with regret.") {
      kidsSection.classList.add("hidden");
      companionSection.classList.add("hidden");
      kidsInputsList.querySelectorAll("input").forEach((inp) => (inp.required = false));
    } else {
      kidsSection.classList.add("hidden");
      companionSection.classList.remove("hidden");
      kidsInputsList.querySelectorAll("input").forEach((inp) => (inp.required = false));
    }
  }

  attendanceRadios.forEach((radio) => {
    radio.addEventListener("change", updateRsvpFieldsVisibility);
  });

  function refreshKidPlaceholders() {
    if (!kidsInputsList) return;
    const rows = kidsInputsList.querySelectorAll(".kid-row");
    rows.forEach((row, index) => {
      const input = row.querySelector("input");
      if (input) input.placeholder = `Kid ${index + 1} Full Name`;
    });
  }

  if (addKidBtn && kidsInputsList) {
    addKidBtn.addEventListener("click", () => {
      const count = kidsInputsList.querySelectorAll(".kid-row").length + 1;
      const row = document.createElement("div");
      row.className = "kid-row";

      const input = document.createElement("input");
      input.type = "text";
      input.name = "kidName[]";
      input.placeholder = `Kid ${count} Full Name`;
      input.required = true;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-kid-btn";
      removeBtn.setAttribute("aria-label", "Remove kid");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        row.remove();
        refreshKidPlaceholders();
      });

      row.appendChild(input);
      row.appendChild(removeBtn);
      kidsInputsList.appendChild(row);
      input.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullNameInput = document.getElementById("fullName");
      const companionInput = document.getElementById("companionName");
      const fullName = fullNameInput ? fullNameInput.value.trim() : "";
      const selectedRadio = document.querySelector('input[name="attendance"]:checked');
      const attendance = selectedRadio ? selectedRadio.value : "";

      if (!fullName || !attendance) {
        if (statusEl) {
          statusEl.textContent = "Please enter your full name and select an attendance option.";
        }
        return;
      }

      const companionName =
        attendance === "Declines with regret." || !companionInput
          ? ""
          : companionInput.value.trim();

      const kids =
        attendance === "Yes, I will attend with my kid/s." && kidsInputsList
          ? Array.from(kidsInputsList.querySelectorAll("input"))
              .map((inp) => inp.value.trim())
              .filter(Boolean)
          : [];

      const payload = {
        event: "Yunique Laine (YL) - 1st Birthday & Christening",
        fullName,
        attendance,
        companionName,
        kids,
        notifyEmails: [
          "reacasidsid0903@gmail.com",
          "siraceacance08@gmail.com",
        ],
      };

      const originalBtnText = submitBtn ? submitBtn.textContent : "CONFIRM RSVP";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }
      if (statusEl) statusEl.textContent = "Confirming and sending your RSVP...";

      try {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === "error")) {
          throw new Error((data && data.message) || "Server error while saving RSVP.");
        }

        if (statusEl) {
          statusEl.textContent = "Thank you! Your RSVP for YL’s celebration has been recorded.";
        }
        form.reset();
        if (kidsInputsList) {
          kidsInputsList.innerHTML = `
            <div class="kid-row">
              <input type="text" name="kidName[]" placeholder="Kid 1 Full Name" />
            </div>
          `;
        }
        updateRsvpFieldsVisibility();
      } catch (err) {
        console.error("RSVP error:", err);
        if (statusEl) {
          statusEl.textContent = "Unable to send RSVP right now. Please check your Web App deployment and try again.";
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }
});