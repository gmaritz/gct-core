document.addEventListener("DOMContentLoaded", () => {
  const showcase = document.querySelector(".homepage-showcase");
  if (showcase instanceof HTMLElement) {
    showcase.dataset.ready = "true";
  }
});