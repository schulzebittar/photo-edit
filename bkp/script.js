const slider = document.getElementById('slider');
const imgReveal = document.querySelector('.img-reveal');
const sliderButton = document.getElementById('slider-button');

slider.addEventListener('input', (e) => {
  const sliderPos = e.target.value;
  
  // Update the width of the clipped foreground image container
  imgReveal.style.width = `${sliderPos}%`;
  
  // Update the position of the visible white line handle
  sliderButton.style.left = `${sliderPos}%`;
});
