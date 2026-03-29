function slowScroll() {
  const outputArea = document.getElementById("vorple");
  if (!outputArea) return;

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Hide the node initially
          node.style.opacity = 0;

          // Gradually reveal it (simulate delay)
          setTimeout(() => {
            node.style.transition = "opacity 0.3s ease";
            node.style.opacity = 1;
            outputArea.scrollTop = outputArea.scrollHeight;
          }, 150); // Delay in ms before showing
        }
      });
    });
  });

  observer.observe(outputArea, {
    childList: true,
    subtree: true
  });
}

vorple.addEventListener("init", slowScroll);
