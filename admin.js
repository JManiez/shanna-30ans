/* ============================================================
   admin.js — Dashboard admin en temps réel
   Lit le localStorage toutes les 3 secondes et met à jour
   l'interface sans rechargement de page.
   ============================================================ */

const REFRESH_INTERVAL = 3000; // ms
let refreshTimer = null;

// ---------- Lecture des données ----------
function getResults() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
  } catch {
    return [];
  }
}

// ---------- Groupement par équipe ----------
function groupByTeam(results) {
  const groups = {};
  TEAMS.forEach(t => { groups[t.name] = []; });

  results.forEach(r => {
    if (groups[r.team] !== undefined) {
      groups[r.team].push(r);
    }
  });

  // Trier chaque groupe par score décroissant
  Object.keys(groups).forEach(k => {
    groups[k].sort((a, b) => b.score - a.score);
  });

  return groups;
}

// ---------- Rendu du dashboard ----------
function renderDashboard() {
  const results = getResults();
  const total   = CONFIG.totalInvites;
  const count   = results.length;
  const avgScore = count > 0
    ? (results.reduce((s, r) => s + r.score, 0) / count).toFixed(1)
    : '—';
  const pct = Math.round((count / total) * 100);

  // Stats globales
  document.getElementById('stat-inscrits').textContent  = count;
  document.getElementById('stat-restants').textContent  = Math.max(0, total - count);
  document.getElementById('stat-moyenne').textContent   = avgScore;

  // Barre de progression globale
  document.getElementById('progress-label').textContent     = `${count} / ${total} invités`;
  document.getElementById('progress-pct').textContent       = `${pct}%`;
  document.getElementById('progress-global-fill').style.width = `${pct}%`;

  // Équipes
  const groups = groupByTeam(results);

  TEAMS.forEach(team => {
    const members  = groups[team.name] || [];
    const listEl   = document.getElementById(`team-list-${team.bgClass}`);
    const countEl  = document.getElementById(`team-count-${team.bgClass}`);

    if (countEl) countEl.textContent = members.length;

    if (listEl) {
      if (members.length === 0) {
        listEl.innerHTML = '<p class="empty-team">Aucun invité pour l\'instant…</p>';
      } else {
        listEl.innerHTML = members.map(m => `
          <div class="invite-card">
            <div>
              <div class="invite-name">${escHtml(m.prenom)} ${escHtml(m.nom)}</div>
              <div class="invite-link">${escHtml(m.lien || '—')}</div>
            </div>
            <div class="invite-score" style="color:${m.ribbonColor}">${m.score}/10</div>
          </div>
        `).join('');
      }
    }
  });

  // Horodatage
  const now = new Date();
  document.getElementById('last-update').textContent =
    `Dernière mise à jour : ${now.toLocaleTimeString('fr-FR')}`;
}

// ---------- Récap texte exportable ----------
function generateRecap() {
  const results = getResults();
  if (results.length === 0) return 'Aucun participant pour le moment.';

  const groups = groupByTeam(results);
  let text = `🎂 ANNIVERSAIRE SHANNA - RÉSULTATS\n`;
  text += `${'='.repeat(40)}\n\n`;
  text += `Total participants : ${results.length} / ${CONFIG.totalInvites}\n\n`;

  TEAMS.forEach(team => {
    const members = groups[team.name] || [];
    text += `${team.emoji} ${team.name.toUpperCase()} (${members.length})\n`;
    text += `${'─'.repeat(32)}\n`;
    if (members.length === 0) {
      text += '  Aucun\n';
    } else {
      members.forEach(m => {
        const lien = m.lien ? ` [${m.lien}]` : '';
        text += `  • ${m.prenom} ${m.nom}${lien} — ${m.score}/10\n`;
      });
    }
    text += '\n';
  });

  return text;
}

function showRecap() {
  const block = document.getElementById('recap-block');
  const btn   = document.getElementById('btn-recap');
  if (block.classList.contains('hidden')) {
    block.textContent = generateRecap();
    block.classList.remove('hidden');
    btn.textContent = 'Masquer le récap';
  } else {
    block.classList.add('hidden');
    btn.textContent = 'Afficher le récap complet';
  }
}

function copyRecap() {
  const text = generateRecap();
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('btn-copy');
    const orig = btn.textContent;
    btn.textContent = '✓ Copié !';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => {
    alert('Impossible de copier automatiquement.\nOuvre le récap et copie-le manuellement.');
  });
}

function resetData() {
  const confirmed = confirm(
    '⚠️ Supprimer TOUTES les données de la soirée ?\n\nCette action est irréversible.'
  );
  if (!confirmed) return;
  const confirmed2 = confirm('Vraiment supprimer ? Il n\'y a pas de retour en arrière.');
  if (!confirmed2) return;

  localStorage.removeItem(CONFIG.storageKey);
  renderDashboard();
}

// ---------- Utilitaire anti-XSS ----------
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  refreshTimer = setInterval(renderDashboard, REFRESH_INTERVAL);

  document.getElementById('btn-refresh')?.addEventListener('click', renderDashboard);
  document.getElementById('btn-recap')?.addEventListener('click', showRecap);
  document.getElementById('btn-copy')?.addEventListener('click', copyRecap);
  document.getElementById('btn-reset')?.addEventListener('click', resetData);
});
