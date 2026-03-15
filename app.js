/* ============================================================
   app.js — Logique principale du QCM anniversaire Shanna
   ============================================================ */

// ---------- État de l'application ----------
const state = {
  currentScreen: 'welcome',
  currentQuestion: 0,
  score: 0,
  answers: [],
  participant: null,
  questionLocked: false
};

// ---------- Utilitaires DOM ----------
const $ = id => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const screen = $(id);
  screen.classList.remove('hidden');
  screen.querySelector('.card, .welcome-inner')?.classList.remove('quiz-slide-out');
  state.currentScreen = id;
}

// ---------- Étoiles de fond ----------
function createStars() {
  const container = document.querySelector('.stars');
  if (!container) return;
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${2 + Math.random() * 4}s;
      --delay: ${Math.random() * 5}s;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
    `;
    container.appendChild(star);
  }
}

// ---------- ÉCRAN ACCUEIL ----------
function initWelcome() {
  $('btn-start').addEventListener('click', () => showScreen('screen-register'));
}

// ---------- ÉCRAN INSCRIPTION ----------
function initRegister() {
  $('form-register').addEventListener('submit', e => {
    e.preventDefault();
    const prenom = $('input-prenom').value.trim();
    const nom    = $('input-nom').value.trim();
    const lien   = $('input-lien').value;

    if (!prenom || !nom) {
      showError('Merci de renseigner ton prénom et ton nom !');
      return;
    }

    state.participant = { prenom, nom, lien, fullName: `${prenom} ${nom}` };
    state.currentQuestion = 0;
    state.score = 0;
    state.answers = [];
    state.questionLocked = false;

    startQuiz();
  });
}

function showError(msg) {
  let err = document.querySelector('.form-error');
  if (!err) {
    err = document.createElement('p');
    err.className = 'form-error';
    err.style.cssText = 'color:#E74C3C;font-size:.9rem;margin-top:12px;text-align:center;';
    $('form-register').appendChild(err);
  }
  err.textContent = msg;
  setTimeout(() => { if (err) err.textContent = ''; }, 3000);
}

// ---------- QCM ----------
function startQuiz() {
  showScreen('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q   = QUESTIONS[state.currentQuestion];
  const idx = state.currentQuestion;
  const total = QUESTIONS.length;

  $('quiz-player-name').textContent = state.participant.prenom;
  $('quiz-counter').textContent     = `Question ${idx + 1} / ${total}`;

  const pct = (idx / total) * 100;
  $('progress-fill').style.width = `${pct}%`;

  $('quiz-question-text').textContent = q.question;

  const grid = $('choices-grid');
  grid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];

  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-letter">${letters[i]}</span>${choice}`;
    btn.dataset.index = i;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    grid.appendChild(btn);
  });

  state.questionLocked = false;

  // Animation d'entrée
  const card = document.querySelector('#screen-quiz .card');
  card.classList.remove('quiz-slide-in');
  void card.offsetWidth;
  card.classList.add('quiz-slide-in');
}

function handleAnswer(choiceIdx, clickedBtn) {
  if (state.questionLocked) return;
  state.questionLocked = true;

  const q = QUESTIONS[state.currentQuestion];
  const isCorrect = choiceIdx === q.answer;

  if (isCorrect) state.score++;

  state.answers.push({
    questionIdx: state.currentQuestion,
    chosen: choiceIdx,
    correct: q.answer,
    isCorrect
  });

  // Feedback visuel
  const allBtns = document.querySelectorAll('.choice-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    if (parseInt(b.dataset.index) === q.answer) b.classList.add('correct');
  });
  if (!isCorrect) clickedBtn.classList.add('wrong');

  // Avancer après 1.2 secondes
  setTimeout(nextQuestion, 1200);
}

function nextQuestion() {
  state.currentQuestion++;

  if (state.currentQuestion >= QUESTIONS.length) {
    finishQuiz();
    return;
  }

  // Animation de transition
  const card = document.querySelector('#screen-quiz .card');
  card.classList.add('quiz-slide-out');
  setTimeout(() => {
    card.classList.remove('quiz-slide-out');
    renderQuestion();
  }, 300);
}

// ---------- FIN DU QUIZ ----------
function finishQuiz() {
  const team = getTeamForScore(state.score);

  const result = {
    id: Date.now(),
    prenom: state.participant.prenom,
    nom: state.participant.nom,
    fullName: state.participant.fullName,
    lien: state.participant.lien,
    score: state.score,
    total: QUESTIONS.length,
    team: team.name,
    teamEmoji: team.emoji,
    ribbon: team.ribbon,
    ribbonColor: team.ribbonColor,
    bgClass: team.bgClass,
    timestamp: new Date().toISOString()
  };

  saveResult(result);
  showResult(result, team);
}

function showResult(result, team) {
  showScreen('screen-result');

  $('result-score').textContent      = result.score;
  $('result-team-emoji').textContent = team.emoji;
  $('result-team-name').textContent  = team.name;
  $('result-team-name').className    = `result-team-name ${team.bgClass}`;
  $('result-desc').textContent       = team.description;

  const ribbonEl = $('result-ribbon');
  ribbonEl.textContent = `🎀 ${team.ribbon}`;
  ribbonEl.style.color       = team.ribbonColor;
  ribbonEl.style.borderColor = team.ribbonColor;
  ribbonEl.style.background  = `${team.ribbonColor}18`;

  launchConfetti(team.ribbonColor);

  $('btn-next-player').addEventListener('click', resetForNext, { once: true });
}

function resetForNext() {
  // Réinitialiser le formulaire
  $('input-prenom').value = '';
  $('input-nom').value    = '';
  $('input-lien').value   = '';
  state.participant = null;

  // Nettoyer les confettis
  const cc = document.querySelector('.confetti-container');
  if (cc) cc.innerHTML = '';

  showScreen('screen-welcome');
}

// ---------- STOCKAGE LOCALSTORAGE ----------
function saveResult(result) {
  try {
    const existing = JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
    existing.push(result);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(existing));
  } catch (e) {
    console.warn('Erreur localStorage:', e);
  }
}

// ---------- CONFETTIS ----------
function launchConfetti(color) {
  let container = document.querySelector('.confetti-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
  }
  container.innerHTML = '';

  const colors = [color, '#E07A5F', '#F5F0E8', '#7BAFAE', '#FFFFFF'];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      --duration: ${2 + Math.random() * 2}s;
      --delay: ${Math.random() * 1.5}s;
    `;
    container.appendChild(piece);
  }

  // Nettoyer après l'animation
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  createStars();
  initWelcome();
  initRegister();
  showScreen('screen-welcome');
});
