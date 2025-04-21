const LANGUAGES = {
  fr: {
    title: "Quick Mémo",
    placeholder: "Écris ta note...",
    save: "Enregistrer",
    empty: "Aucun mémo",
    delete: "Supprimer",
    lang: "Langue",
  },
  en: {
    title: "Quick Memo",
    placeholder: "Write your note...",
    save: "Save",
    empty: "No memos",
    delete: "Delete",
    lang: "Language",
  },
  es: {
    title: "Memo Rápido",
    placeholder: "Escribe tu nota...",
    save: "Guardar",
    empty: "Sin memos",
    delete: "Eliminar",
    lang: "Idioma",
  },
  de: {
    title: "Schnellnotiz",
    placeholder: "Notiz schreiben...",
    save: "Speichern",
    empty: "Keine Notizen",
    delete: "Löschen",
    lang: "Sprache",
  },
  ar: {
    title: "مذكرة سريعة",
    placeholder: "اكتب مذكرتك...",
    save: "حفظ",
    empty: "لا توجد مذكرات",
    delete: "حذف",
    lang: "اللغة"
  },
};

const LOCAL_STORAGE_KEY = "quick-memo-list";
const LOCAL_STORAGE_LANG = "quick-memo-lang";

const langSelect = document.getElementById("lang-select");
const memoForm = document.querySelector(".memo-form");
const memoInput = document.querySelector(".memo-input");
const memoList = document.querySelector(".memo-list");
const saveBtn = document.querySelector(".save-btn");
const appTitle = document.querySelector(".app-title");
const appTitleText = document.querySelector(".title-text");
const labelLang = document.querySelector(".lang-label");
const footer = document.querySelector(".footer-signature");
const themeBtn = document.querySelector(".theme-toggle-btn");
const themeIcon = document.querySelector(".theme-icon");
const LOCAL_STORAGE_THEME = "quick-memo-theme";

function getLang() {
  return localStorage.getItem(LOCAL_STORAGE_LANG) || "fr";
}
function setLang(lang) {
  localStorage.setItem(LOCAL_STORAGE_LANG, lang);
}

function renderLang() {
  const lang = getLang();
  const t = LANGUAGES[lang];
  appTitleText.textContent = t.title;
  memoInput.placeholder = t.placeholder;
  saveBtn.textContent = t.save;
  labelLang.textContent = t.lang;
  footer.textContent = `Quick Mémo by ABG`;
  // RTL pour l'arabe
  document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    themeIcon.innerHTML = `<svg class="icon-sun" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="13" r="6" fill="#fff"/><g stroke="#fff" stroke-width="1.5"><line x1="13" y1="3" x2="13" y2="6"/><line x1="13" y1="20" x2="13" y2="23"/><line x1="23" y1="13" x2="20" y2="13"/><line x1="6" y1="13" x2="3" y2="13"/><line x1="19.07" y1="6.93" x2="17.24" y2="8.76"/><line x1="8.76" y1="17.24" x2="6.93" y2="19.07"/><line x1="19.07" y1="19.07" x2="17.24" y2="17.24"/><line x1="8.76" y1="8.76" x2="6.93" y2="6.93"/></g></svg>`;
  } else {
    document.body.classList.remove('dark');
    themeIcon.innerHTML = `<svg class="icon-moon" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 17.5A9 9 0 0 1 8.5 5c0 5.247 4.253 9.5 9.5 9.5Z" fill="#fff"/><circle cx="13" cy="13" r="9" stroke="#fff" stroke-width="1.5"/></svg>`;
  }
  localStorage.setItem(LOCAL_STORAGE_THEME, theme);
}

function getTheme() {
  return localStorage.getItem(LOCAL_STORAGE_THEME) || 'light';
}

themeBtn.addEventListener('click', () => {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

// Initial theme setup
setTheme(getTheme());

langSelect.value = getLang();
renderLang();
langSelect.addEventListener("change", (e) => {
  setLang(e.target.value);
  renderLang();
  renderMemos();
});

function getMemos() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
}
function setMemos(memos) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memos));
}

function renderMemos() {
  const lang = getLang();
  const t = LANGUAGES[lang];
  const memos = getMemos();
  memoList.innerHTML = "";
  if (memos.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = t.empty;
    memoList.appendChild(li);
    return;
  }
  memos.forEach((memo) => {
    const li = document.createElement("li");
    li.className = "memo-item fade-in";
    li.innerHTML = `<span>${memo.text}</span><button class='delete-btn' title='${t.delete}'>✕</button>`;
    // Suppression avec animation
    li.querySelector(".delete-btn").onclick = () => {
      li.classList.remove("fade-in");
      li.classList.add("fade-out");
      setTimeout(() => {
        const updated = getMemos().filter((m) => m.id !== memo.id);
        setMemos(updated);
        renderMemos();
      }, 400);
    };
    memoList.appendChild(li);
  });
}

memoForm.onsubmit = (e) => {
  e.preventDefault();
  const text = memoInput.value.trim();
  if (!text) return;
  const memos = getMemos();
  const newMemo = { id: Date.now(), text, createdAt: new Date().toISOString() };
  setMemos([newMemo, ...memos]);
  memoInput.value = "";
  renderMemos();
};

// Migration : ajoute createdAt aux anciens mémos
(function migrateOldMemos() {
  const memos = getMemos();
  let changed = false;
  const now = new Date().toISOString();
  const migrated = memos.map(memo => {
    if (!memo.createdAt) { changed = true; return { ...memo, createdAt: now }; }
    return memo;
  });
  if (changed) setMemos(migrated);
})();

// Initial rendering
renderMemos();

// --- Affichage dynamique de la date et l'heure ---
document.addEventListener('DOMContentLoaded', () => {
  const datetimeLabel = document.getElementById('datetime-label');
  const langSelect = document.getElementById('lang-select');
  function updateDateTimeLabel() {
    if (!datetimeLabel) return;
    const now = new Date();
    let lang = langSelect ? langSelect.value : 'fr';
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    };
    if (lang === 'ar') lang = 'ar-EG';
    if (lang === 'en') lang = 'en-GB';
    if (lang === 'es') lang = 'es-ES';
    if (lang === 'de') lang = 'de-DE';
    if (lang === 'fr') lang = 'fr-FR';
    // Format HH:MM strict
    // Obtenir la date uniquement (sans heure)
    const datePart = now.toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    // Obtenir l’heure HH:MM uniquement
    const timePart = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false });
    datetimeLabel.textContent = datePart + ' ' + timePart;
  }
  setInterval(updateDateTimeLabel, 1000);
  if (langSelect) langSelect.addEventListener('change', updateDateTimeLabel);
  updateDateTimeLabel();
});

