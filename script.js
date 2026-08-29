document.addEventListener("DOMContentLoaded", () => {
  const sliderContainer = document.getElementById("sliderContainer");
  const sliderInput = document.getElementById("sliderInput");
  const imgBefore = document.getElementById("imgBefore");
  const imgAfter = document.getElementById("imgAfter");
  const sampleTitle = document.getElementById("sampleTitle");
  
  const sliderWrapper = document.getElementById("sliderWrapper");
  const galleryTrack = document.getElementById("galleryTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let imagesData = [];
  let currentOffset = 0;
  let singleSetWidth = 0;
  let activeIndex = 0;

  // 1. Comparison Slider Control
  sliderInput.addEventListener("input", (e) => {
    sliderContainer.style.setProperty("--slider-pos", `${e.target.value}%`);
  });

  // 2. Fetch Manifest & Build Infinite Gallery
  async function loadGallery() {
    try {
      const response = await fetch("images.json");
      imagesData = await response.json();

      if (imagesData.length === 0) return;

      buildTrack();
      selectImage(0);

    } catch (err) {
      console.error("Error loading images manifest:", err);
      sampleTitle.textContent = "Error loading gallery.";
    }
  }

  function buildTrack() {
    galleryTrack.innerHTML = "";

    // Duplicate array 3 times to allow seamless infinite loop wrapping
    const tripleData = [...imagesData, ...imagesData, ...imagesData];

    tripleData.forEach((item, tripleIndex) => {
      const realIndex = tripleIndex % imagesData.length;

      const card = document.createElement("div");
      card.classList.add("gallery-card");
      card.dataset.realIndex = realIndex;

      card.innerHTML = `
        <img src="img/${item.id}_after.jpg" alt="${item.title}" loading="lazy">
        <p>${item.title}</p>
      `;

      card.addEventListener("click", () => selectImage(realIndex));
      galleryTrack.appendChild(card);
    });

    // Calculate total width of a single set of cards
    requestAnimationFrame(() => {
      const cardWidth = galleryTrack.children[0].offsetWidth;
      const gap = 16; // 1rem gap
      singleSetWidth = (cardWidth + gap) * imagesData.length;
      
      // Start in middle set to allow scrolling backward & forward
      currentOffset = -singleSetWidth;
      updateTrackPosition(false);
    });
  }

  // 3. Infinite Track Scroll Logic
  function updateTrackPosition(animate = true) {
    if (animate) {
      galleryTrack.style.transition = "transform 0.3s ease-out";
    } else {
      galleryTrack.style.transition = "none";
    }
    galleryTrack.style.transform = `translateX(${currentOffset}px)`;
  }

  function checkBoundary() {
    // Wrap around silently without animation when passing set boundaries
    if (Math.abs(currentOffset) >= singleSetWidth * 2) {
      currentOffset += singleSetWidth;
      updateTrackPosition(false);
    } else if (currentOffset > -singleSetWidth / 2) {
      currentOffset -= singleSetWidth;
      updateTrackPosition(false);
    }
  }

  galleryTrack.addEventListener("transitionend", checkBoundary);

  // 4. Navigation Controls
  const stepAmount = 176; // Card width (160px) + Gap (16px)

  nextBtn.addEventListener("click", () => {
    currentOffset -= stepAmount;
    updateTrackPosition(true);
  });

  prevBtn.addEventListener("click", () => {
    currentOffset += stepAmount;
    updateTrackPosition(true);
  });

  // 5. Mouse Drag to Scroll
  let isDragging = false;
  let startX = 0;
  let startOffset = 0;

  sliderWrapper.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX;
    startOffset = currentOffset;
    galleryTrack.style.transition = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const diff = e.pageX - startX;
    currentOffset = startOffset + diff;
    galleryTrack.style.transform = `translateX(${currentOffset}px)`;
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    checkBoundary();
  });

  // 6. Select Image and Highlight all duplicate cards
  function selectImage(index) {
    activeIndex = index;
    const selected = imagesData[index];
    if (!selected) return;

    sliderInput.value = 50;
    sliderContainer.style.setProperty("--slider-pos", "50%");

    imgBefore.src = `img/${selected.id}_before.jpg`;
    imgAfter.src = `img/${selected.id}_after.jpg`;
    sampleTitle.textContent = selected.title || `Sample ${index + 1}`;

    // Highlight card in all duplicated sets
    const cards = galleryTrack.querySelectorAll(".gallery-card");
    cards.forEach((card) => {
      card.classList.toggle("active", parseInt(card.dataset.realIndex) === index);
    });
  }

  loadGallery();
});

// 7. Style Book Overlay & Live Theme Editor Logic
  const styleBookToggle = document.getElementById("styleBookToggle");
  const styleBookOverlay = document.getElementById("styleBookOverlay");
  const closeStyleBook = document.getElementById("closeStyleBook");
  const colorSwatches = document.getElementById("colorSwatches");
  const resetThemeBtn = document.getElementById("resetThemeBtn");


  const colorVars = [
    { name: "--color-primary", label: "Primary" },
    { name: "--color-secondary", label: "Secondary" },
    { name: "--color-accent", label: "Accent Color" },
    { name: "--color-text-light", label: "Text Light" },
    { name: "--color-text-dark", label: "Text Dark" }
  ];

  // Helper: Convert named/RGB colors to HEX for <input type="color">
  function rgbToHex(rgb) {
    if (rgb.startsWith("#")) return rgb;
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = rgb;
    return ctx.fillStyle;
  }

  // Build live color pickers
  function populateColorPickers() {
    const rootStyles = getComputedStyle(document.documentElement);
    colorSwatches.innerHTML = "";

    colorVars.forEach((item) => {
      const rawValue = rootStyles.getPropertyValue(item.name).trim();
      const hexValue = rgbToHex(rawValue);

      const swatch = document.createElement("div");
      swatch.classList.add("swatch-card");
      swatch.innerHTML = `
        <strong>${item.label}</strong>
        <div class="swatch-input-container">
          <input type="color" id="picker-${item.name}" value="${hexValue}">
          <div class="swatch-info">
            <code>${item.name}</code><br>
            <code id="val-${item.name}">${hexValue}</code>
          </div>
        </div>
      `;

      colorSwatches.appendChild(swatch);

      // Live update color variable on input change
      const picker = swatch.querySelector(`input[type="color"]`);
      const valLabel = swatch.querySelector(`#val-${item.name.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1")}`);

      picker.addEventListener("input", (e) => {
        const newColor = e.target.value;
        document.documentElement.style.setProperty(item.name, newColor);
        if (valLabel) valLabel.textContent = newColor;
      });
    });
  }

  const loadedGoogleFonts = new Set();

  /**
   * Dynamically loads a Google Font by name into <head>
   * @param {string} rawFontName - e.g. "Space Grotesk" or "Playfair Display"
   */
  function loadGoogleFont(rawFontName) {
    if (!rawFontName) return null;

    // Clean input to extract pure font name
    const cleanName = rawFontName.replace(/['"]/g, "").trim();
    if (!cleanName) return null;

    if (!loadedGoogleFonts.has(cleanName)) {
      const formattedUrlName = encodeURIComponent(cleanName).replace(/%20/g, "+");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${formattedUrlName}:wght@400;500;700&display=swap`;

      document.head.appendChild(link);
      loadedGoogleFonts.add(cleanName);
    }

    return `'${cleanName}', sans-serif`;
  }

  /**
   * Binds text input and button events
   */
  function setupFontControl(customInputEl, applyBtnEl, applyCallback) {
    const applyFont = () => {
      const fontName = customInputEl.value.trim();
      if (!fontName) return;

      const fontCss = loadGoogleFont(fontName);
      if (fontCss) {
        applyCallback(fontCss);
      }
    };

    // Apply on button click
    applyBtnEl.addEventListener("click", applyFont);

    // Apply on Enter key press
    customInputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyFont();
      }
    });
  }

  // Bind controls for Body Font
  setupFontControl(
    document.getElementById("fontBodyCustom"),
    document.getElementById("fontBodyCustomBtn"),
    (fontCss) => {
      document.body.style.fontFamily = fontCss;
    }
  );

  // Bind controls for Headings
  setupFontControl(
    document.getElementById("fontHeadingsCustom"),
    document.getElementById("fontHeadingsCustomBtn"),
    (fontCss) => {
      document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
        h.style.fontFamily = fontCss;
      });
    }
  );

  // Bind controls for Paragraphs
  setupFontControl(
    document.getElementById("fontParagraphsCustom"),
    document.getElementById("fontParagraphsCustomBtn"),
    (fontCss) => {
      document.querySelectorAll("p").forEach((p) => {
        p.style.fontFamily = fontCss;
      });
    }
  );

  // Reset to stylesheet defaults
  resetThemeBtn.addEventListener("click", () => {
    colorVars.forEach((item) => {
      document.documentElement.style.removeProperty(item.name);
    });

    document.body.style.fontFamily = "";
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => (h.style.fontFamily = ""));
    document.querySelectorAll("p").forEach((p) => (p.style.fontFamily = ""));

    fontBody.value = fontBody.options[0].value;
    fontHeadings.value = fontHeadings.options[0].value;
    fontParagraphs.value = fontParagraphs.options[0].value;

    populateColorPickers();
  });

  // Toggle Overlay
  styleBookToggle.addEventListener("click", () => {
    populateColorPickers();
    styleBookOverlay.classList.remove("hidden");
  });

  closeStyleBook.addEventListener("click", () => {
    styleBookOverlay.classList.add("hidden");
  });

  styleBookOverlay.addEventListener("click", (e) => {
    if (e.target === styleBookOverlay) {
      styleBookOverlay.classList.add("hidden");
    }
  });