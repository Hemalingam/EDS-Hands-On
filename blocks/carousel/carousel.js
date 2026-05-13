const PAUSE_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>';
const PLAY_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const PREV_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
const NEXT_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

const AUTOPLAY_DELAY = 5000;

/**
 * Builds the carousel DOM from the authored block rows.
 * Expected block structure (each row = one slide):
 *   Row cell 1: image (picture element)
 *   Row cell 2: text content (h3 title + link as CTA)
 * @param {Element} block The carousel block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const slideCount = rows.length;
  if (slideCount === 0) return;

  // Build slide track
  const slidesContainer = document.createElement("div");
  slidesContainer.className = "carousel-slides";

  rows.forEach((row, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `Slide ${index + 1} of ${slideCount}`);

    const cells = [...row.children];

    // Image cell
    const imageDiv = document.createElement("div");
    imageDiv.className = "carousel-slide-image";
    const picture = cells[0]?.querySelector("picture");
    if (picture) {
      imageDiv.append(picture);
      const img = imageDiv.querySelector("img");
      if (img) {
        img.loading = index === 0 ? "eager" : "lazy";
      }
    }
    slide.append(imageDiv);

    // Content cell (title + CTA)
    const contentDiv = document.createElement("div");
    contentDiv.className = "carousel-slide-content";

    if (cells[1]) {
      const paragraphs = cells[1].querySelectorAll("p");
      const heading = cells[1].querySelector("h1, h2, h3, h4, h5, h6");

      // Title: use heading if available, otherwise first <p>
      const titleSource = heading || paragraphs[0];
      if (titleSource) {
        const h3 = document.createElement("h3");
        h3.textContent = titleSource.textContent;
        contentDiv.append(h3);
      }

      // CTA: use <a> if available, otherwise second <p> as plain text CTA
      const link = cells[1].querySelector("a");
      if (link) {
        link.className = "carousel-cta";
        contentDiv.append(link);
      } else if (paragraphs[1]) {
        const cta = document.createElement("span");
        cta.className = "carousel-cta";
        cta.textContent = paragraphs[1].textContent;
        contentDiv.append(cta);
      }
    }
    slide.append(contentDiv);
    slidesContainer.append(slide);
  });

  // Clear block and rebuild
  block.textContent = "";
  block.setAttribute("aria-roledescription", "carousel");
  block.setAttribute("aria-label", "Image Carousel");

  block.append(slidesContainer);

  // Previous / Next buttons
  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "carousel-nav-btn carousel-nav-prev";
  prevBtn.setAttribute("aria-label", "Previous slide");
  prevBtn.innerHTML = PREV_ICON;

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "carousel-nav-btn carousel-nav-next";
  nextBtn.setAttribute("aria-label", "Next slide");
  nextBtn.innerHTML = NEXT_ICON;

  block.append(prevBtn, nextBtn);

  // Controls bar (play/pause + dots)
  const controls = document.createElement("div");
  controls.className = "carousel-controls";

  const playBtn = document.createElement("button");
  playBtn.type = "button";
  playBtn.className = "carousel-play-btn";
  playBtn.setAttribute("aria-label", "Pause carousel");
  playBtn.innerHTML = PAUSE_ICON;
  controls.append(playBtn);

  const dots = [];
  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `carousel-dot${i === 0 ? " active" : ""}`;
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dots.push(dot);
    controls.append(dot);
  }

  block.append(controls);

  // Live region for screen readers
  const liveRegion = document.createElement("div");
  liveRegion.className = "sr-only";
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.setAttribute("role", "status");
  liveRegion.textContent = `Slide 1 of ${slideCount}`;
  block.append(liveRegion);

  // State
  let currentSlide = 0;
  let isPlaying = true;
  let autoplayTimer;

  function goToSlide(index) {
    currentSlide = ((index % slideCount) + slideCount) % slideCount;
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) =>
      dot.classList.toggle("active", i === currentSlide),
    );
    liveRegion.textContent = `Slide ${currentSlide + 1} of ${slideCount}`;
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(
      () => goToSlide(currentSlide + 1),
      AUTOPLAY_DELAY,
    );
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  // Event listeners
  prevBtn.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
    if (isPlaying) startAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
    if (isPlaying) startAutoplay();
  });

  playBtn.addEventListener("click", () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playBtn.innerHTML = PAUSE_ICON;
      playBtn.setAttribute("aria-label", "Pause carousel");
      startAutoplay();
    } else {
      playBtn.innerHTML = PLAY_ICON;
      playBtn.setAttribute("aria-label", "Play carousel");
      stopAutoplay();
    }
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goToSlide(i);
      if (isPlaying) startAutoplay();
    });
  });

  // Start autoplay
  startAutoplay();
}
