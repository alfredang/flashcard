// ── Helpers ──
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ── State ──
let cards = [];
let currentIndex = 0;

// ── DOM Refs ──
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const addCardBtn = document.getElementById("addCardBtn");
const cardList = document.getElementById("cardList");
const flashcard = document.getElementById("flashcard");
const frontText = document.getElementById("frontText");
const backText = document.getElementById("backText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const cardCounter = document.getElementById("cardCounter");
const themeToggle = document.getElementById("themeToggle");
const shuffleBtn = document.getElementById("shuffleBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");
const editModal = document.getElementById("editModal");
const editQuestion = document.getElementById("editQuestion");
const editAnswer = document.getElementById("editAnswer");
const editSaveBtn = document.getElementById("editSaveBtn");
const editCancelBtn = document.getElementById("editCancelBtn");

let editingIndex = -1;

// ── Default Cards ──
const defaultCards = [
  { question: "What does HTML stand for?", answer: "HyperText Markup Language" },
  { question: "What is the purpose of CSS?", answer: "To style and layout web pages" },
  { question: "What does JS stand for?", answer: "JavaScript" },
  { question: "What is the DOM?", answer: "Document Object Model — a programming interface for web documents" },
  { question: "What is responsive design?", answer: "Design that adapts to different screen sizes and devices" },
];

// ── Init ──
function init() {
  cards = [...defaultCards];
  currentIndex = 0;
  renderCardList();
  renderCurrentCard();
  loadTheme();
}

// ── Render ──
function renderCurrentCard() {
  flashcard.classList.remove("flipped");

  if (cards.length === 0) {
    frontText.textContent = "Add a card to get started";
    backText.textContent = "";
    cardCounter.textContent = "0 of 0";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  if (currentIndex >= cards.length) currentIndex = cards.length - 1;
  if (currentIndex < 0) currentIndex = 0;

  const card = cards[currentIndex];
  frontText.textContent = card.question;
  const safeAnswer = escapeHtml(card.answer);
  backText.innerHTML = safeAnswer
    .replace(/\n/g, "<br>")
    .replace(/\\n/g, "<br>")
    .replace(/&lt;br&gt;/gi, "<br>");
  cardCounter.textContent = `${currentIndex + 1} of ${cards.length}`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === cards.length - 1;

  highlightActiveItem();
}

function renderCardList() {
  cardList.innerHTML = "";

  if (cards.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No cards yet. Add one above!";
    cardList.appendChild(empty);
    return;
  }

  cards.forEach((card, i) => {
    const li = document.createElement("li");
    li.dataset.index = i;
    if (i === currentIndex) li.classList.add("active");

    const textSpan = document.createElement("span");
    textSpan.className = "card-item-text";
    textSpan.textContent = card.question;
    textSpan.addEventListener("click", () => goToCard(i));

    const actions = document.createElement("span");
    actions.className = "card-item-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(i);
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn-danger";
    delBtn.textContent = "Del";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCard(i);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    li.appendChild(textSpan);
    li.appendChild(actions);
    cardList.appendChild(li);
  });
}

function highlightActiveItem() {
  const items = cardList.querySelectorAll("li");
  items.forEach((li, i) => {
    li.classList.toggle("active", i === currentIndex);
  });
}

// ── Card Actions ──
function addCard() {
  const q = questionInput.value.trim();
  const a = answerInput.value.trim();
  if (!q || !a) return;

  cards.push({ question: q, answer: a });
  questionInput.value = "";
  answerInput.value = "";
  currentIndex = cards.length - 1;
  renderCardList();
  renderCurrentCard();
  questionInput.focus();
}

function deleteCard(index) {
  cards.splice(index, 1);
  if (currentIndex >= cards.length) currentIndex = cards.length - 1;
  renderCardList();
  renderCurrentCard();
}

function goToCard(index) {
  currentIndex = index;
  renderCurrentCard();
}

function flipCard() {
  if (cards.length === 0) return;
  flashcard.classList.toggle("flipped");
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCurrentCard();
  }
}

function nextCard() {
  if (currentIndex < cards.length - 1) {
    currentIndex++;
    renderCurrentCard();
  }
}

// ── Edit Modal ──
function openEditModal(index) {
  editingIndex = index;
  editQuestion.value = cards[index].question;
  editAnswer.value = cards[index].answer;
  editModal.hidden = false;
  editQuestion.focus();
}

function closeEditModal() {
  editModal.hidden = true;
  editingIndex = -1;
}

function saveEdit() {
  if (editingIndex < 0) return;
  const q = editQuestion.value.trim();
  const a = editAnswer.value.trim();
  if (!q || !a) return;

  cards[editingIndex].question = q;
  cards[editingIndex].answer = a;
  closeEditModal();
  renderCardList();
  renderCurrentCard();
}

// ── Shuffle ──
function shuffleCards() {
  if (cards.length < 2) return;
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  currentIndex = 0;
  renderCardList();
  renderCurrentCard();
}

// ── Import / Export ──
function exportCards() {
  if (cards.length === 0) return;
  const json = JSON.stringify(cards, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flashcards.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importCards(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      const valid = data.filter((c) => c.question && c.answer);
      if (valid.length === 0) throw new Error("No valid cards found");
      cards = valid;
      currentIndex = 0;
      renderCardList();
      renderCurrentCard();
    } catch {
      alert("Invalid JSON file. Expected an array of {question, answer} objects.");
    }
  };
  reader.readAsText(file);
}

// ── Theme ──
function loadTheme() {
  const saved = localStorage.getItem("flashcard-theme");
  const theme = saved || "dark";
  document.documentElement.dataset.theme = theme;
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("flashcard-theme", next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  themeToggle.textContent = theme === "dark" ? "\u2600\uFE0F" : "\uD83C\uDF19";
}

// ── Event Listeners ──
addCardBtn.addEventListener("click", addCard);
flashcard.addEventListener("click", flipCard);
prevBtn.addEventListener("click", prevCard);
nextBtn.addEventListener("click", nextCard);
shuffleBtn.addEventListener("click", shuffleCards);
exportBtn.addEventListener("click", exportCards);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  if (e.target.files[0]) importCards(e.target.files[0]);
  e.target.value = "";
});
themeToggle.addEventListener("click", toggleTheme);
editSaveBtn.addEventListener("click", saveEdit);
editCancelBtn.addEventListener("click", closeEditModal);

// Submit on Enter in add form (Ctrl+Enter for answer textarea)
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addCard();
});
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") answerInput.focus();
});

// Submit on Ctrl+Enter in edit modal
editAnswer.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveEdit();
});

// Close modal on overlay click
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Don't trigger shortcuts when typing in inputs
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
  if (!editModal.hidden) return;

  switch (e.key) {
    case "ArrowLeft":
      prevCard();
      break;
    case "ArrowRight":
      nextCard();
      break;
    case " ":
    case "Enter":
      e.preventDefault();
      flipCard();
      break;
  }
});

// ── Start ──
init();
