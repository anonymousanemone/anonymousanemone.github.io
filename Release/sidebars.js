function toggleHelp(show) {
  document.getElementById("overlay").style.display = show ? "block" : "none";
  document.getElementById("helpPopup").style.display = show ? "flex" : "none";
}

function toggleFiles(show) {
  document.getElementById("overlay").style.display = show ? "block" : "none";
  document.getElementById("file-explorer").style.display = show ? "flex" : "none";
}

function removeOverlay() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("helpPopup").style.display = "none";
  document.getElementById("file-explorer").style.display = "none";
}

function switchTab(tabName) {
  // Buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Tabs
  document.querySelectorAll('.help-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Activate new tab and button
  document.querySelector(`.tab-button[onclick*="${tabName}"]`).classList.add('active');
  document.getElementById(`tab-${tabName}`).classList.add('active');
}


  function insertCommand(command) {
    const input = document.querySelector('input[type="text"]');
    if (input) {
      input.value = command + ' ';
      input.focus();
    }
  }

    function goHome() {
    window.location.href = "index.html"; // or your home URL
    }

function moveGameport(event) {
    // Wait for Vorple to fully load
    const observer = new MutationObserver(() => {
      const vorpleElement = document.getElementById("vorple");
      const container = document.getElementById("game-container");

      if (vorpleElement && container && !container.contains(vorpleElement)) {
        container.appendChild(vorpleElement);
        console.log("Vorple moved into #game-container.");
        observer.disconnect(); // stop observing once done
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  vorple.addEventListener("init", moveGameport);

function toggleAccordion(button) {
  const content = button.nextElementSibling;

  // Close all others
  document.querySelectorAll(".accordion-content").forEach(c => {
    if (c !== content) {
      c.classList.remove("open");
    }
  });

  // Toggle the clicked one
  content.classList.toggle("open");
}

function toggleTranscriptButton(disable) {
  const button = document.getElementById("save-transcript");
  if (!button) return;

  button.disabled = disable;
}