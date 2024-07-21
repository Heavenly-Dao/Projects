document.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  const wordCountSpan = document.getElementById("word-count");
  const fileInput = document.getElementById("fileInput");

  const updateWordCount = () => {
    const content = editor.innerText.trim();
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    wordCountSpan.textContent = wordCount;
  };

  const openFile = () => {
    fileInput.click();
  };

  const importContent = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.innerHTML = e.target.result;
        updateWordCount();
      };
      reader.onerror = (e) => {
        console.error("Error reading file", e);
      };
      reader.readAsText(file);
    }
  };

  const saveContent = () => {
    const content = editor.innerHTML;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleBold = () => document.execCommand("bold");
  const toggleItalic = () => document.execCommand("italic");
  const toggleUnderline = () => document.execCommand("underline");

  const applyTextColor = (color) => document.execCommand("foreColor", false, color);
  const applyHighlightColor = (color) => document.execCommand("hiliteColor", false, color);

  const showHelp = () => {
    alert("Keyboard Shortcuts:\n- Ctrl + S: Save\n- Ctrl + O: Open\n- Ctrl + B: Bold\n- Ctrl + I: Italic\n- Ctrl + U: Underline");
  };

  const saveToLocalStorage = () => {
    const content = editor.innerHTML;
    localStorage.setItem("editorContent", content);
  };

  const loadFromLocalStorage = () => {
    const content = localStorage.getItem("editorContent");
    if (content) {
      editor.innerHTML = content;
    }
  };

  const autoSaveToLocalStorage = () => {
    saveToLocalStorage();
  };

  // Event Listeners
  document.getElementById("openFileButton").addEventListener("click", openFile);
  document.getElementById("saveContentButton").addEventListener("click", saveContent);
  document.getElementById("boldButton").addEventListener("click", toggleBold);
  document.getElementById("italicButton").addEventListener("click", toggleItalic);
  document.getElementById("underlineButton").addEventListener("click", toggleUnderline);
  document.getElementById("textColorPicker").addEventListener("input", (e) => applyTextColor(e.target.value));
  document.getElementById("highlightColorPicker").addEventListener("input", (e) => applyHighlightColor(e.target.value));
  fileInput.addEventListener("change", importContent);
  document.getElementById("helpButton").addEventListener("click", showHelp);
  editor.addEventListener("input", updateWordCount);

  // Auto-save to local storage every 5 seconds
  setInterval(autoSaveToLocalStorage, 5000);

  // Load content from local storage on page load
  loadFromLocalStorage();

  // Initialize word count
  updateWordCount();
});
