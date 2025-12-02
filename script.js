// Simple note app using localStorage + backup import/export

const STORAGE_KEY = "studyNotes";

let notes = [];
let activeId = null;

const notesListEl = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const noteTitleEl = document.getElementById("noteTitle");
const noteContentEl = document.getElementById("noteContent");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");

// Load notes from localStorage
function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    notes = saved ? JSON.parse(saved) : [];
  } catch (e) {
    notes = [];
  }
}

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// Render list in sidebar
function renderNotesList() {
  notesListEl.innerHTML = "";
  notes
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((note) => {
      const li = document.createElement("li");
      li.dataset.id = note.id;

      if (note.id === activeId) {
        li.classList.add("active");
      }

      const titleDiv = document.createElement("div");
      titleDiv.className = "title";
      titleDiv.textContent = note.title || "Untitled note";

      const previewDiv = document.createElement("div");
      previewDiv.className = "preview";
      const plain = note.content.replace(/\s+/g, " ").trim();
      previewDiv.textContent =
        plain.length > 60 ? plain.slice(0, 60) + "..." : plain;

      li.appendChild(titleDiv);
      li.appendChild(previewDiv);

      li.addEventListener("click", () => {
        setActiveNote(note.id);
      });

      notesListEl.appendChild(li);
    });
}

// Show active note in editor
function setActiveNote(id) {
  activeId = id;
  const note = notes.find((n) => n.id === id);
  if (!note) {
    noteTitleEl.value = "";
    noteContentEl.value = "";
    renderNotesList();
    return;
  }
  noteTitleEl.value = note.title;
  noteContentEl.value = note.content;
  renderNotesList();
}

// Create a new note
function createNewNote() {
  const newNote = {
    id: Date.now().toString(),
    title: "",
    content: "",
    updatedAt: Date.now(),
  };
  notes.push(newNote);
  saveNotes();
  setActiveNote(newNote.id);
}

// Update active note when typing
function updateActiveNote() {
  if (!activeId) return;
  const note = notes.find((n) => n.id === activeId);
  if (!note) return;
  note.title = noteTitleEl.value;
  note.content = noteContentEl.value;
  note.updatedAt = Date.now();
  saveNotes();
  renderNotesList();
}

// Delete active note
function deleteActiveNote() {
  if (!activeId) return;
  const idx = notes.findIndex((n) => n.id === activeId);
  if (idx === -1) return;
  if (!confirm("Delete this note?")) return;
  notes.splice(idx, 1);
  saveNotes();
  activeId = notes[0]?.id || null;
  if (activeId) {
    setActiveNote(activeId);
  } else {
    noteTitleEl.value = "";
    noteContentEl.value = "";
    renderNotesList();
  }
}

// Export notes to a JSON file
function exportNotes() {
  const dataStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study-notes-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import notes from a JSON file
function importNotes(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        alert("Invalid backup file.");
        return;
      }
      notes = imported;
      saveNotes();
      activeId = notes[0]?.id || null;
      if (activeId) {
        setActiveNote(activeId);
      } else {
        noteTitleEl.value = "";
        noteContentEl.value = "";
      }
      renderNotesList();
      alert("Notes imported successfully.");
    } catch (err) {
      alert("Could not read backup file.");
    }
  };
  reader.readAsText(file);
}

// Event listeners
newNoteBtn.addEventListener("click", () => {
  createNewNote();
});

deleteNoteBtn.addEventListener("click", () => {
  deleteActiveNote();
});

noteTitleEl.addEventListener("input", () => {
  updateActiveNote();
});

noteContentEl.addEventListener("input", () => {
  updateActiveNote();
});

exportBtn.addEventListener("click", () => {
  exportNotes();
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    importNotes(file);
  }
  // reset input so same file can be chosen again if needed
  event.target.value = "";
});

// Init
loadNotes();
if (notes.length === 0) {
  createNewNote();
} else {
  // Pick the most recently updated note as active
  notes.sort((a, b) => b.updatedAt - a.updatedAt);
  activeId = notes[0].id;
  setActiveNote(activeId);
}
renderNotesList();
