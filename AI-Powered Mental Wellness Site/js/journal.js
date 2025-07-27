const entryInput = document.getElementById("journalEntry");
const saveStatus = document.getElementById("saveStatus");
const entriesList = document.getElementById("entriesList");
const saveBtn = document.getElementById("saveBtn");

const STORAGE_KEY = "dailyJournalEntries";

function loadEntries() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderEntriesList() {
  const entries = loadEntries();
  entriesList.innerHTML = "";

  if (entries.length === 0) {
    entriesList.textContent = "No saved entries yet.";
    return;
  }

  entries.forEach(({ id, timestamp }) => {
    const container = document.createElement("div");
    container.style.display = "inline-flex";
    container.style.alignItems = "center";
    container.style.margin = "5px";
    container.style.background = "#f0f4ff";
    container.style.borderRadius = "20px";
    container.style.padding = "0 10px";

    const btn = document.createElement("a");
    btn.textContent = formatDate(timestamp);
    btn.href = `entry.html?id=${id}`;
    btn.style.padding = "8px 14px";
    btn.style.textDecoration = "none";
    btn.style.color = "#2a3d66";
    btn.style.fontWeight = "600";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "✖";
    removeBtn.title = "Delete this entry";
    removeBtn.style.marginLeft = "8px";
    removeBtn.style.border = "none";
    removeBtn.style.background = "transparent";
    removeBtn.style.color = "#c0392b";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontWeight = "700";
    removeBtn.style.fontSize = "1.1rem";

    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      deleteEntry(id);
    });

    container.appendChild(btn);
    container.appendChild(removeBtn);
    entriesList.appendChild(container);
  });
}

function saveJournal() {
  const text = entryInput.value.trim();

  if (!text) {
    saveStatus.textContent = "Please write something before saving.";
    saveStatus.style.color = "red";
    return;
  }

  const entries = loadEntries();
  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    text,
  };

  entries.unshift(newEntry);
  saveEntries(entries);
  saveStatus.textContent = "Your journal entry has been saved!";
  saveStatus.style.color = "green";
  entryInput.value = "";

  renderEntriesList();
}

function deleteEntry(id) {
  let entries = loadEntries();
  entries = entries.filter((e) => e.id !== id);
  saveEntries(entries);
  renderEntriesList();
}

window.addEventListener("DOMContentLoaded", () => {
  renderEntriesList();
  if (saveBtn) {
    saveBtn.addEventListener("click", saveJournal);
  }
});
