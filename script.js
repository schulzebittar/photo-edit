document.addEventListener("DOMContentLoaded", () => {
  const sliderContainer = document.getElementById("sliderContainer");
  const sliderInput = document.getElementById("sliderInput");
  const imgBefore = document.getElementById("imgBefore");
  const imgAfter = document.getElementById("imgAfter");
  const sampleTitle = document.getElementById("sampleTitle");
  const galleryGrid = document.getElementById("galleryGrid");

  let imagesData = [];

  // 1. Sync Slider Position with Range Input
  sliderInput.addEventListener("input", (e) => {
    sliderContainer.style.setProperty("--slider-pos", `${e.target.value}%`);
  });

  // 2. Fetch Manifest & Build Gallery
  async function loadGallery() {
    try {
      const response = await fetch("images.json");
      imagesData = await response.json();

      if (imagesData.length === 0) return;

      galleryGrid.innerHTML = "";

      imagesData.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("gallery-card");
        if (index === 0) card.classList.add("active");

        // Display edited photo as thumbnail preview
        const thumbnailSrc = `img/${item.id}_after.jpg`;

        card.innerHTML = `
          <img src="${thumbnailSrc}" alt="${item.title}" loading="lazy">
          <p>${item.title}</p>
        `;

        card.addEventListener("click", () => selectImage(index));
        galleryGrid.appendChild(card);
      });

      // Load initial image set
      selectImage(0);
    } catch (err) {
      console.error("Could not load images manifest:", err);
      sampleTitle.textContent = "Error loading gallery manifest.";
    }
  }

  // 3. Switch Selected Image
  function selectImage(index) {
    const selected = imagesData[index];
    if (!selected) return;

    // Reset slider position to 50%
    sliderInput.value = 50;
    sliderContainer.style.setProperty("--slider-pos", "50%");

    // Set images using your suffix naming convention
    imgBefore.src = `img/${selected.id}_before.jpg`;
    imgAfter.src = `img/${selected.id}_after.jpg`;
    sampleTitle.textContent = selected.title || `Sample ${index + 1}`;

    // Update active highlight class
    const cards = galleryGrid.querySelectorAll(".gallery-card");
    cards.forEach((card, i) => {
      card.classList.toggle("active", i === index);
    });
  }

  loadGallery();
});