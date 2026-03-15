// ============================================================
//  QUESTIONS DU QCM - Anniversaire 30 ans de Shanna
//  Modifie les questions, choix et bonnes réponses ici.
//  answer = index (0-based) de la bonne réponse dans choices[]
// ============================================================

const QUESTIONS = [
  {
    question: "Quelle est la date d'anniversaire de Shanna ?",
    choices: ["12 mars", "28 juin", "5 octobre", "17 janvier"],
    answer: 0
  },
  {
    question: "Quel est le signe astrologique de Shanna ?",
    choices: ["Verseau", "Poissons", "Bélier", "Lion"],
    answer: 1
  },
  {
    question: "Quel est le plat préféré de Shanna ?",
    choices: ["Les sushis", "Les pâtes carbonara", "Le poulet braisé", "La raclette"],
    answer: 2
  },
  {
    question: "Quelle destination de voyage fait rêver Shanna par-dessus tout ?",
    choices: ["Le Japon", "Le Mexique", "Bali", "La Grèce"],
    answer: 3
  },
  {
    question: "Quelle est la série / le film préféré de Shanna ?",
    choices: ["Game of Thrones", "Stranger Things", "Friends", "La Casa de Papel"],
    answer: 2
  },
  {
    question: "Quel est l'artiste / groupe que Shanna écoute le plus ?",
    choices: ["Beyoncé", "Aya Nakamura", "Taylor Swift", "Angèle"],
    answer: 1
  },
  {
    question: "Quelle est la boisson favorite de Shanna en soirée ?",
    choices: ["Mojito", "Rosé", "Spritz", "Vodka cranberry"],
    answer: 0
  },
  {
    question: "Quelle est la couleur préférée de Shanna ?",
    choices: ["Le bleu marine", "Le vert sauge", "Le bordeaux", "Le rose poudré"],
    answer: 3
  },
  {
    question: "Quelle expression Shanna répète-t-elle tout le temps ?",
    choices: ["\"Mais non !\"", "\"Attends...\"", "\"Franchement...\"", "\"Clairement !\""],
    answer: 2
  },
  {
    question: "Quelle est la plus grande peur / phobie de Shanna ?",
    choices: ["Les araignées", "Le vide / les hauteurs", "Le noir", "Les clowns"],
    answer: 0
  }
];

// ============================================================
//  CONFIG DES ÉQUIPES
//  Modifie les seuils et les couleurs de rubans ici.
// ============================================================

const TEAMS = [
  {
    name: "Les vrais de vrais",
    emoji: "👑",
    minScore: 8,
    maxScore: 10,
    ribbon: "Ruban DORÉ",
    ribbonColor: "#D4AF37",
    description: "Tu connais Shanna mieux qu'elle-même !",
    bgClass: "team-gold"
  },
  {
    name: "Les fifty-fifty",
    emoji: "🎯",
    minScore: 4,
    maxScore: 7,
    ribbon: "Ruban ARGENTÉ",
    ribbonColor: "#C0C0C0",
    description: "Tu la connais bien… mais il reste des secrets !",
    bgClass: "team-silver"
  },
  {
    name: "Les profiteurs",
    emoji: "🍾",
    minScore: 0,
    maxScore: 3,
    ribbon: "Ruban ROUGE",
    ribbonColor: "#C0392B",
    description: "Avouons-le, tu es là pour le buffet ! 😄",
    bgClass: "team-red"
  }
];

const CONFIG = {
  totalInvites: 32,
  storageKey: "shanna_qcm_results"
};

function getTeamForScore(score) {
  return TEAMS.find(t => score >= t.minScore && score <= t.maxScore) || TEAMS[2];
}
