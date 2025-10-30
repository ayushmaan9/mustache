document.addEventListener("DOMContentLoaded", function() {
  const fab = document.querySelector(".fab");
  const container = document.querySelector(".fab-container");

  fab.addEventListener("click", function() {
    container.classList.toggle("active");
  });
});
