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