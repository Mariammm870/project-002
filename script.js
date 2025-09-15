// ================= DOM ELEMENTS =================
const searchInput = document.querySelector(".search-bar input");
const searchBtn = document.querySelector(".icon-btn");
const outputCard = document.getElementById("outputCard");
const notesList = document.getElementById("notesList");
const exportBtn = document.getElementById("exportBtn");

// ================= STATE =================
const STORAGE_KEY = "ai_notes_v1";
let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ================= HELPERS =================
function detectLanguage(text) {
  // Georgian Unicode range: U+10A0–U+10FF
  return /[\u10A0-\u10FF]/.test(text) ? "ka" : "en";
}

function showMessage(msg) {
  outputCard.innerHTML = `<p>${msg}</p>`;
}

// ================= AI FETCH =================
async function fetchAnswer(query) {
  showMessage("🤖 AI is thinking...");

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.error) {
      showMessage("⚠️ Error: " + data.error);
      return;
    }

    displayAnswer(query, data.answer); // frontend just gets text
  } catch (err) {
    console.error(err);
    showMessage("⚠️ Could not reach AI server.");
  }
}

// ================= DISPLAY =================
function displayAnswer(topic, text) {
  outputCard.innerHTML = `
    <h3>${topic}</h3>
    <p>${text}</p>
    <button id="saveNoteBtn">Save to Notes</button>
  `;

  document.getElementById("saveNoteBtn").addEventListener("click", () => {
    addNote(topic, text);
  });
}

// ================= NOTES =================
function addNote(topic, text) {
  notes.push({ topic, text });
  saveNotes();
  renderNotes();
}

function removeNote(index) {
  notes.splice(index, 1);
  saveNotes();
  renderNotes();
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
  notesList.innerHTML = "";

  notes.forEach((note, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${note.topic}</strong>: ${note.text}
      <button class="remove-btn">❌</button>
    `;
    li.querySelector(".remove-btn").addEventListener("click", () =>
      removeNote(i)
    );
    notesList.appendChild(li);
  });
}

function exportNotes() {
  const content = notes
    .map((n) => `${n.topic}\n${n.text}\n`)
    .join("\n----------------\n");

  // UTF-8 BOM ensures Georgian/English characters export correctly
  const UTF8_BOM = "\uFEFF";
  const blob = new Blob([UTF8_BOM + content], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "notes.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ================= EVENT LISTENERS =================
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchAnswer(query);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) fetchAnswer(query);
  }
});

exportBtn.addEventListener("click", exportNotes);

// ================= INIT =================
renderNotes();
