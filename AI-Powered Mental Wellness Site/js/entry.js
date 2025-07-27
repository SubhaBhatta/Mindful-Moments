const STORAGE_KEY = "dailyJournalEntries";
const params = new URLSearchParams(window.location.search);
const entryId = Number(params.get("id"));
const entryView = document.getElementById("entryView");

function loadEntries() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

const entries = loadEntries();
const entry = entries.find((e) => e.id === entryId);

if (entry) {
  entryView.textContent = entry.text;
} else {
  entryView.textContent = "Journal entry not found.";
}
