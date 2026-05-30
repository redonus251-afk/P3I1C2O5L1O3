/* ============================================
   COMMENTAIRES GÉNÉRAUX
   ============================================
   
   Ce fichier contient toute la logique de l'application.
   Il gère :
   - La navigation entre les écrans
   - L'ajout/suppression de joueurs
   - La gestion du mode duel
   - Les interactions utilisateur
   
   ============================================ */

/* ============================================
   1. VARIABLES GLOBALES
   ============================================ */

// Tableau pour stocker les joueurs
// Chaque joueur est un objet avec un 'id' et un 'nom'
let players = [];

// Variable pour tracker quel duel est actuellement affiché
let currentDuelIndex = 0;

// Tableau pour stocker tous les duels possibles
// Chaque duel est un objet avec 'player1' et 'player2'
let duels = [];

/* ============================================
   2. GESTION DE LA SAUVEGARDE (LocalStorage)
   ============================================ */

/**
 * Fonction pour sauvegarder les joueurs dans le localStorage du navigateur.
 * Le localStorage permet de persister les données même après fermeture de l'app.
 */
function savePlayers() {
    // JSON.stringify() convertit notre tableau en chaîne de caractères
    localStorage.setItem('players', JSON.stringify(players));
}

/**
 * Fonction pour charger les joueurs depuis le localStorage.
 * Appelée au démarrage de l'app.
 */
function loadPlayers() {
    // Récupère les joueurs du localStorage
    const storedPlayers = localStorage.getItem('players');
    // S'il y a des joueurs sauvegardés, on les charge
    if (storedPlayers) {
        // JSON.parse() convertit la chaîne en tableau
        players = JSON.parse(storedPlayers);
    }
}

/* ============================================
   3. NAVIGATION ENTRE LES ÉCRANS
   ============================================ */

/**
 * Fonction pour afficher un écran et en masquer les autres.
 * @param {string} screenId - L'ID de l'écran à afficher
 */
function showScreen(screenId) {
    // Récupère tous les éléments avec la classe 'screen'
    const screens = document.querySelectorAll('.screen');
    
    // Boucle sur tous les écrans
    screens.forEach(screen => {
        // Enlève la classe 'active' de tous les écrans (les masque)
        screen.classList.remove('active');
    });
    
    // Récupère l'écran à afficher par son ID
    const screenToShow = document.getElementById(screenId);
    // Ajoute la classe 'active' pour l'afficher
    if (screenToShow) {
        screenToShow.classList.add('active');
    }
}

/* ============================================
   4. GESTION DES JOUEURS
   ============================================ */

/**
 * Fonction pour ajouter un nouveau joueur.
 * @param {string} playerName - Le nom du joueur à ajouter
 */
function addPlayer(playerName) {
    // Vérifie que le nom n'est pas vide et pas seulement des espaces
    if (!playerName.trim()) {
        // Affiche une alerte à l'utilisateur
        alert('Le nom du joueur ne peut pas être vide !');
        return;
    }
    
    // Vérifie que le joueur n'existe pas déjà
    if (players.some(p => p.nom.toLowerCase() === playerName.toLowerCase())) {
        alert('Ce joueur existe déjà !');
        return;
    }
    
    // Crée un nouvel objet joueur
    // L'ID est basé sur la date actuelle pour garantir l'unicité
    const newPlayer = {
        id: Date.now(),
        nom: playerName.trim()
    };
    
    // Ajoute le joueur au tableau
    players.push(newPlayer);
    
    // Sauvegarde les joueurs
    savePlayers();
    
    // Met à jour l'affichage
    updatePlayersList();
    updatePlayerCount();
}

/**
 * Fonction pour supprimer un joueur.
 * @param {number} playerId - L'ID du joueur à supprimer
 */
function removePlayer(playerId) {
    // Filtre le tableau pour garder tous les joueurs sauf celui avec cet ID
    players = players.filter(p => p.id !== playerId);
    
    // Sauvegarde les joueurs
    savePlayers();
    
    // Met à jour l'affichage
    updatePlayersList();
    updatePlayerCount();
}

/**
 * Fonction pour supprimer tous les joueurs.
 */
function clearAllPlayers() {
    // Demande confirmation à l'utilisateur
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les joueurs ?')) {
        // Vide le tableau des joueurs
        players = [];
        
        // Sauvegarde (vide)
        savePlayers();
        
        // Met à jour l'affichage
        updatePlayersList();
        updatePlayerCount();
    }
}

/**
 * Fonction pour mettre à jour l'affichage de la liste des joueurs.
 */
function updatePlayersList() {
    // Récupère l'élément de la liste
    const playersList = document.getElementById('playersList');
    
    // Vide la liste
    playersList.innerHTML = '';
    
    // Boucle sur tous les joueurs
    players.forEach(player => {
        // Crée un nouvel élément <li>
        const li = document.createElement('li');
        
        // Ajoute le HTML avec le nom du joueur et un bouton de suppression
        li.innerHTML = `
            <span>${player.nom}</span>
            <button class="btn btn-remove-player" onclick="removePlayer(${player.id})">❌</button>
        `;
        
        // Ajoute l'élément à la liste
        playersList.appendChild(li);
    });
}

/**
 * Fonction pour mettre à jour le compteur de joueurs en pied de page.
 */
function updatePlayerCount() {
    // Récupère l'élément du compteur
    const playerCount = document.getElementById('playerCount');
    
    // Met à jour le texte avec le nombre de joueurs
    playerCount.textContent = `Joueurs : ${players.length}`;
}

/* ============================================
   5. GESTION DU MODE DUEL
   ============================================ */

/**
 * Fonction pour générer un duel avec deux joueurs aléatoires différents.
 * 
 * EXPLICATION IMPORTANTE :
 * Cette fonction crée un duel en sélectionnant 2 joueurs aléatoirement.
 * 
 * Comment ça fonctionne :
 * 1. Nous mélangeons le tableau des joueurs de manière aléatoire
 * 2. Nous prenons les 2 premiers joueurs du tableau mélangé
 * 3. Ces 2 joueurs sont garantis d'être différents car on a au minimum 2 joueurs
 * 
 * @returns {object} Un objet duel avec player1 et player2
 */
function generateRandomDuel() {
    // Vérifie qu'il y a au moins 2 joueurs
    if (players.length < 2) {
        alert('Vous devez avoir au moins 2 joueurs pour faire un duel !');
        return null;
    }
    
    // Crée une copie du tableau des joueurs pour ne pas modifier l'original
    // [...players] crée une copie superficielle du tableau
    let shuffledPlayers = [...players];
    
    // Boucle pour mélanger le tableau (algorithme de Fisher-Yates)
    // On parcourt le tableau à l'envers
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        // Génère un nombre aléatoire entre 0 et i (inclus)
        // Math.random() retourne un nombre entre 0 et 1
        // Math.floor() arrondit à l'entier inférieur
        const randomIndex = Math.floor(Math.random() * (i + 1));
        
        // Échange l'élément actuel avec l'élément aléatoire
        // C'est une technique classique pour mélanger un tableau
        const temp = shuffledPlayers[i];
        shuffledPlayers[i] = shuffledPlayers[randomIndex];
        shuffledPlayers[randomIndex] = temp;
    }
    
    // Crée un objet duel avec les 2 premiers joueurs du tableau mélangé
    // Ils sont garantis d'être différents car nous avons mélangé le tableau
    const duel = {
        player1: shuffledPlayers[0],
        player2: shuffledPlayers[1]
    };
    
    // Retourne le duel créé
    return duel;
}

/**
 * Fonction pour afficher un duel à l'écran.
 * @param {object} duel - L'objet duel à afficher
 */
function displayDuel(duel) {
    // Vérifie que le duel existe
    if (!duel) return;
    
    // Récupère les éléments HTML pour afficher les noms
    const player1NameElement = document.getElementById('player1Name');
    const player2NameElement = document.getElementById('player2Name');
    
    // Met à jour le texte avec les noms des joueurs du duel
    player1NameElement.textContent = duel.player1.nom;
    player2NameElement.textContent = duel.player2.nom;
}

/**
 * Fonction pour démarrer le mode duel.
 * Elle génère un premier duel aléatoire et l'affiche.
 */
function startDuelMode() {
    // Vérifie qu'il y a au moins 2 joueurs
    if (players.length < 2) {
        alert('Vous devez avoir au moins 2 joueurs pour jouer au duel !');
        return;
    }
    
    // Réinitialise l'index du duel actuel
    currentDuelIndex = 0;
    
    // Génère le premier duel
    const firstDuel = generateRandomDuel();
    
    // Affiche le duel
    displayDuel(firstDuel);
    
    // Affiche l'écran du mode duel
    showScreen('duelScreen');
}

/**
 * Fonction pour passer au duel suivant.
 * Génère un nouveau duel aléatoire et l'affiche.
 */
function nextDuel() {
    // Génère un nouveau duel aléatoire
    const duel = generateRandomDuel();
    
    // Affiche le duel
    displayDuel(duel);
}

/* ============================================
   6. GESTION DES MODES DE JEU
   ============================================ */

/**
 * Fonction pour démarrer le mode de jeu sélectionné.
 */
function startGame() {
    // Récupère l'élément select
    const gameModeSelect = document.getElementById('gameMode');
    
    // Récupère la valeur sélectionnée
    const selectedMode = gameModeSelect.value;
    
    // Vérifie qu'un mode a été sélectionné
    if (!selectedMode) {
        alert('Veuillez choisir un mode de jeu !');
        return;
    }
    
    // En fonction du mode sélectionné, lance le mode approprié
    switch(selectedMode) {
        case 'duel':
            // Lance le mode duel
            startDuelMode();
            break;
        case 'action':
            // Lance le mode action
            showScreen('actionScreen');
            break;
        case 'quiz':
            // Lance le mode quiz
            showScreen('quizScreen');
            break;
        default:
            alert('Mode de jeu inconnu !');
    }
}

/* ============================================
   7. INITIALISATION DES EVENT LISTENERS
   ============================================ */

/**
 * Cette fonction est appelée quand le document HTML est complètement chargé.
 * Elle lie les boutons et les champs aux fonctions appropriées.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Charge les joueurs depuis le localStorage
    loadPlayers();
    
    // Met à jour l'affichage de la liste et du compteur
    updatePlayersList();
    updatePlayerCount();
    
    /* ========================================
       ÉCRAN PRINCIPAL
       ======================================== */
    
    // Bouton "Ajouter des joueurs"
    document.getElementById('addPlayersBtn').addEventListener('click', function() {
        // Affiche l'écran d'ajout de joueurs
        showScreen('addPlayersScreen');
    });
    
    // Bouton "Démarrer"
    document.getElementById('startGameBtn').addEventListener('click', function() {
        // Lance le jeu
        startGame();
    });
    
    /* ========================================
       ÉCRAN D'AJOUT DE JOUEURS
       ======================================== */
    
    // Champ d'entrée du nom du joueur
    // Permet d'ajouter un joueur en appuyant sur Entrée
    document.getElementById('playerNameInput').addEventListener('keypress', function(event) {
        // Vérifie que la touche appuyée est Entrée (keyCode 13)
        if (event.key === 'Enter') {
            // Récupère la valeur du champ
            const playerName = this.value;
            // Ajoute le joueur
            addPlayer(playerName);
            // Vide le champ pour la prochaine entrée
            this.value = '';
        }
    });
    
    // Bouton "Ajouter" pour ajouter un joueur
    document.getElementById('addPlayerBtn').addEventListener('click', function() {
        // Récupère la valeur du champ d'entrée
        const playerNameInput = document.getElementById('playerNameInput');
        const playerName = playerNameInput.value;
        // Ajoute le joueur
        addPlayer(playerName);
        // Vide le champ pour la prochaine entrée
        playerNameInput.value = '';
    });
    
    // Bouton "Retour au menu"
    document.getElementById('backToMenuBtn').addEventListener('click', function() {
        // Affiche l'écran principal
        showScreen('mainMenu');
    });
    
    // Bouton "Effacer tous les joueurs"
    document.getElementById('clearPlayersBtn').addEventListener('click', function() {
        // Supprime tous les joueurs
        clearAllPlayers();
    });
    
    /* ========================================
       ÉCRAN DU MODE DUEL
       ======================================== */
    
    // Bouton "Duel suivant"
    document.getElementById('nextDuelBtn').addEventListener('click', function() {
        // Génère et affiche le duel suivant
        nextDuel();
    });
    
    // Bouton "Retour" du mode duel
    document.getElementById('backFromDuelBtn').addEventListener('click', function() {
        // Revient au menu principal
        showScreen('mainMenu');
    });
    
    /* ========================================
       ÉCRAN DU MODE ACTION
       ======================================== */
    
    // Bouton "Retour" du mode action
    document.getElementById('backFromActionBtn').addEventListener('click', function() {
        // Revient au menu principal
        showScreen('mainMenu');
    });
    
    /* ========================================
       ÉCRAN DU MODE QUIZ
       ======================================== */
    
    // Bouton "Retour" du mode quiz
    document.getElementById('backFromQuizBtn').addEventListener('click', function() {
        // Revient au menu principal
        showScreen('mainMenu');
    });
});

/* ============================================
   8. ENREGISTREMENT DU SERVICE WORKER (PWA)
   ============================================ */

/**
 * Enregistre le Service Worker pour la PWA.
 * Le Service Worker permet :
 * - Le fonctionnement hors ligne
 * - La mise en cache des ressources
 * - L'installation de l'app sur l'écran d'accueil
 */
if ('serviceWorker' in navigator) {
    // Enregistre le Service Worker au démarrage
    navigator.serviceWorker.register('sw.js')
        .then(registration => {
            // Si l'enregistrement a réussi, affiche un message dans la console
            console.log('Service Worker enregistré avec succès !', registration);
        })
        .catch(error => {
            // Si l'enregistrement a échoué, affiche l'erreur
            console.log('Erreur lors de l\'enregistrement du Service Worker :', error);
        });
}
