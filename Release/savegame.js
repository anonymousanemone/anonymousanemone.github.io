let lastWrite = false;
let lastRestore = false;

function saveGame() {
  vorple.prompt.queueCommand('SAVE')
  const originalWrite = vorple.file.write;
  vorple.file.write = function (filename, contents, options) {
      const isRelevantFile = filename.startsWith(vorple.file.ASYNC_FS_ROOT);
      const hasContent = (
        (typeof contents === "string" && contents.length > 0) ||
        (contents instanceof Uint8Array && contents.length > 0) ||
        (Array.isArray(contents) && contents.length > 0)
      );

      if (isRelevantFile && hasContent) {
        console.log("[write intercepted]");
        console.log("Filename:", filename);
        console.log("Contents (preview):", typeof contents === "string" ? contents.slice(0, 100) : contents);
        // console.log("Options:", options);
      }

      const result = originalWrite(filename, contents, options);

      if (filename.startsWith(vorple.file.ASYNC_FS_ROOT)) {
        if (result === true) {
          console.log("Write result:", result);
          lastWrite = true;
        }
      }
    return result;
  }
}

function changeSave(){
  if (!lastWrite) return;
  const spans = Array.from(document.querySelectorAll('div.turn > span'));
  // console.log(spans);
  const matchingSpans = spans.filter(span => span.textContent.trim()=== 'Save failed.');
  // console.log(matchingSpans);
  const lastMatchingSpan = matchingSpans[matchingSpans.length - 1];
  // console.log(lastMatchingSpan);
  lastMatchingSpan.textContent = "Ok. \n";
  lastWrite = false;
}

vorple.addEventListener( 'expectCommand', changeSave );

function restoreGame() {
  vorple.prompt.queueCommand('RESTORE');
  lastRestore = true;
}

function clearScreen(){
  removeHintStyle();
  if (!lastRestore) return;
  const outputArea = document.getElementById("vorple");
  const turn = outputArea.querySelector(".turn.previous");
  // console.log(turn);
  if (!turn) return;

  const input = turn.querySelector(".lineinput.last");
  const spans = turn.querySelectorAll("span");

  const inputText = input?.textContent?.trim().toLowerCase();
  const spanTexts = Array.from(spans).map(span => span.textContent.trim().toLowerCase());
  console.log(inputText)
  console.log(spanTexts)

  if (inputText.includes("restore") && spanTexts.includes("ok.")) {
    console.log("Restore confirmed, queuing follow-up command...");
    setTimeout(() => {
      vorple.prompt.queueCommand('clear-the-screen-exec-command');
    }, 500);
    lastRestore = false;
  }
}

vorple.addEventListener( 'expectCommand', clearScreen );

function loadGameFromFile() {
}

function saveTranscript() {
  vorple.prompt.queueCommand('TRANSCRIPT');
}

vorple.file.transcriptFilePrompt = function (callback) {
    vorple.file.filePrompt(callback, vorple.file.TRANSCRIPT_PATH+"/");
};

function downloadFile(data, filename, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function checkFiles(){
  getVorpleSaveFiles(gameid).then(savefiles => {
    console.log("Available save files:", savefiles);
    if (savefiles.length === 0) {
      alert("No save files found.");
    } else {
      // Do something with the list, like populate a custom dialog
      savefiles.forEach(file => {
        console.log("Savefile:", file);
      });
    }
  });

}

async function showFileExplorer() {
  const explorer = document.getElementById("file-explorer");

  const fs = vorple.file.getFS();
  const savePath = vorple.file.SAVE_PATH || '/extended/savefiles';
  const transcriptPath = vorple.file.TRANSCRIPT_PATH || '/extended/transcripts';

  explorer.innerHTML = ''; // Clear previous content
  explorer.style.display = 'block'; // Show the explorer panel

  if (!fs) {
    explorer.textContent = "Filesystem not available.";
    return;
  }

  function renderDirectory(title, path) {
    const section = document.createElement("div");
    section.className = "file-section";

    const header = document.createElement("h2");
    header.textContent = `${title}: ${path}`;
    section.appendChild(header);
    explorer.appendChild(section);

    const container = document.createElement("div");
    section.appendChild(container);
    readDir(path, container, 0);
  }

  function readDir(path, container, depth = 0) {
    fs.readdir(path, (err, items) => {
      if (err || !items || items.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = `(empty)`;
        empty.style.marginLeft = `${depth * 20}px`;
        empty.style.color = "#aaa";
        container.appendChild(empty);
        return;
      }

      lastItem = `${path}/${items[items.length-1]}`;
      console.log(lastItem);

      fs.stat(lastItem, (err, stats) => {
        // console.log(lastItem);
        if (!err && stats?.isDirectory()) {
          // If last item is a directory, only explore that directory
          console.log(lastItem);
          readDir(lastItem, container, depth);
          return;
        }

        items.forEach(item => {
          const fullPath = `${path}/${item}`;
          fs.stat(fullPath, (err, stats) => {
            const entry = document.createElement("div");
            entry.className = "file-entry";
            entry.style.marginLeft = `${depth * 20}px`;

            if (stats?.isDirectory()) {
              entry.classList.add("folder");
              entry.textContent = `📁 ${item}`;

              const nestedContainer = document.createElement("div");
              nestedContainer.style.display = "none";

              entry.addEventListener("click", () => {
                if (nestedContainer.style.display === "none") {
                  nestedContainer.style.display = "block";
                  // Lazy load only once
                  if (nestedContainer.childElementCount === 0) {
                    readDir(fullPath, nestedContainer, depth + 1);
                  }
                } else {
                  nestedContainer.style.display = "none";
                }
              });

              container.appendChild(entry);
              container.appendChild(nestedContainer);
            } else {
              entry.classList.add("file");
              entry.textContent = `📄 ${item} `;
              // console.log(fullPath);
              const downloadBtn = document.createElement("button");
              downloadBtn.textContent = "Download";
              downloadBtn.className = "download-btn";
              downloadBtn.addEventListener("click", () => {
                downloadFromBrowserFS(fs, fullPath, item);
              });
              entry.appendChild(downloadBtn);
              container.appendChild(entry);
            }
          });
        });
      });
    });
  }

  // Render both save files and transcripts
  
  renderDirectory("Transcripts", transcriptPath);
  renderDirectory("Save Files", savePath);
}

function downloadFromBrowserFS(fs, path, filename) {
  fs.readFile(path, (err, data) => {
    if (err) {
      alert("Error reading file: " + err.message);
      return;
    }

    // Convert Buffer to Blob
    const blob = new Blob([data], { type: "application/octet-stream" });

    // Trigger download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || path.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });
}
