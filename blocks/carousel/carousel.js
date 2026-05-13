export default function decorate(block) {
  const rows = [...block.children];

  const carousel = document.createElement('div');
  carousel.classList.add('carousel-slides');

  rows.forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('carousel-slide');

    // Preserve ALL columns
    [...row.children].forEach((column, index) => {
      column.classList.add(index === 0 ? 'carousel-image' : 'carousel-content');
      slide.append(column);
    });

    carousel.append(slide);
  });

  block.textContent = '';
  block.append(carousel);
}
