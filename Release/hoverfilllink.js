
function HoverFillLink(event) {
  const outputArea = document.body;
  let clickedLink = null;
  let disableHover = false;

  outputArea.addEventListener("mouseover", function (event) {
    const link = event.target.closest("a.vorple-commandlink");
    if (link && outputArea.contains(link)) {
      const command = link.getAttribute("data-command");
      console.log("Hovered command:", command);
      const input = document.getElementById("lineinput-field");
      if (command && input) {
        vorple.prompt.setValue(command);
        input.style.color = "var(--prefill-color)";
      }
    }
  });

  outputArea.addEventListener("mouseout", function (event) {
    const link = event.target.closest("a.vorple-commandlink");
    const input = document.getElementById("lineinput-field");
    if (link && outputArea.contains(link)) {
      if (disableHover && link === clickedLink) {
        // disable hover-off if this is a recently clicked link
        return;
      }
      if (input) {
        vorple.prompt.setValue("");
        input.style.color = input.dataset.originalColor || "";
      }
    }
  });

  outputArea.addEventListener("click", function (event) {
    const link = event.target.closest("a.vorple-commandlink.click-fill-command");
    const input = document.getElementById("lineinput-field");
    if (link && outputArea.contains(link)) {
      const command = link.getAttribute("data-command");
      if (command && input) {
        vorple.prompt.setValue(command);
        input.style.color = "var(--fg)"; // Solid black
        clickedLink = link;
        disableHover = true;

        // re-enable hover after 2 seconds
        setTimeout(() => {
          disableHover = false;
          clickedLink = null;
        }, 2000);
      }
    }
  });
}

vorple.addEventListener("init", HoverFillLink);

