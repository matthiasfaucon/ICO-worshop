import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Role = 'PIRATE' | 'MARIN' | 'SIRENE';
interface Player {
  id: string;
  name: string;
  role?: Role;
  bonusCard?: string;
  hasVoted?: boolean;
  isInCrew?: boolean;
}

interface VoteResult {
  playerId: string;
  vote: boolean;
}

interface GameState {
  gameId: string | null;
  players: Player[];
  tour: number;
  currentCaptain: string | null;
  currentCrew: string[];
  lastCrew: string[];
  pirateScore: number;
  marinScore: number;
  gamePhase: 'SETUP' | 'CREATE_PLAYERS' | 'REVEAL_ROLES' | 'CREW_SELECTION' | 'VOTING' | 'JOURNEY' | 'PIRATES_OR_SIRENES_WIN' | 'GAME_OVER' | 'REPLAY';
  winner: 'PIRATES' | 'MARINS' | 'SIRENE' | null;
  votes: VoteResult[];
  votesAnnulation: number;
  votesSirene: VoteResult[];
  general_rules: {
    min_players: number,
    max_players: number,
    min_points: number,
    max_points: number
  },
  settings: {
    withBonus: boolean,
    pointsToWin: number,
    playersCount: number,
    timerDuration?: number
  },
  journeyCards: [];
  submittedVotes: string[];
  submittedVotesSirene: string[];
  submittedCards: string[];
}

const initialState: GameState = {
  gameId: null,
  players: [],
  tour: 1,
  currentCaptain: null,
  currentCrew: [],
  lastCrew: [],
  pirateScore: 0,
  marinScore: 0,
  gamePhase: 'SETUP',
  winner: null,
  votes: [],
  votesAnnulation: 0,
  general_rules: {
    min_players: 7,
    max_players: 20,
    min_points: 10,
    max_points: 20
  },
  votesSirene: [],
  settings: {
    withBonus: false,
    pointsToWin: 10,
    playersCount: 7
  },
  journeyCards: [],
  submittedVotes: [],
  submittedVotesSirene: [],
  submittedCards: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    configureGame: (state, action: PayloadAction<{ withBonus: boolean, pointsToWin: number, playersCount: number, timerDuration: number, min_players: number, max_players: number, min_points: number, max_points: number }>) => {
      state.settings = {
        withBonus: action.payload.withBonus,
        pointsToWin: action.payload.pointsToWin,
        playersCount: action.payload.playersCount,
        timerDuration: action.payload.timerDuration
      }
      state.general_rules = {
        min_players: action.payload.min_players,
        max_players: action.payload.max_players,
        min_points: action.payload.min_points,
        max_points: action.payload.max_points
      }
      state.gamePhase = 'CREATE_PLAYERS';
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    startGame: (state, action) => {
      state.gameId = action.payload;

      if (state.players.length >= state.general_rules.min_players && state.players.length <= state.general_rules.max_players) {
        state.gamePhase = 'REVEAL_ROLES';

        // Sélectionner aléatoirement le premier capitaine
        const randomIndex = Math.floor(Math.random() * state.players.length);
        state.currentCaptain = state.players[randomIndex].id;
      }
    },
    revealRole: (state) => {
      state.gamePhase = 'CREW_SELECTION';
    },
    loadGameState: (state, action: PayloadAction<GameState>) => {
      return action.payload;
    },
    distributeRoles: (state, action: PayloadAction) => {
      const bonusCards = action.payload;
      const roleDistribution = {
        7: { pirates: 3, marins: 3, sirene: 1 },
        8: { pirates: 3, marins: 4, sirene: 1 },
        9: { pirates: 4, marins: 4, sirene: 1 },
        10: { pirates: 4, marins: 5, sirene: 1 },
        11: { pirates: 5, marins: 5, sirene: 1 },
        12: { pirates: 5, marins: 6, sirene: 1 },
        13: { pirates: 6, marins: 6, sirene: 1 },
        14: { pirates: 6, marins: 7, sirene: 1 },
        15: { pirates: 7, marins: 7, sirene: 1 },
        16: { pirates: 7, marins: 8, sirene: 1 },
        17: { pirates: 8, marins: 8, sirene: 1 },
        18: { pirates: 8, marins: 9, sirene: 1 },
        19: { pirates: 9, marins: 9, sirene: 1 },
        20: { pirates: 9, marins: 10, sirene: 1 },
      };

      const playerCount = state.players.length;

      const roleCount = roleDistribution[playerCount];

      let pirates = roleCount.pirates;
      let marins = roleCount.marins;
      // let sirene = roleCount.sirene;

      let shuffledPlayers = [...state.players].sort(() => Math.random() - 0.5);

      shuffledPlayers.forEach((player, index) => {
        if (index < pirates) {
          player.role = 'PIRATE';
        } else if (index < pirates + marins) {
          player.role = 'MARIN';
        } else {
          player.role = 'SIRENE';
        }
      });

      // Ajouter les cartes bonus
      if (state.settings.withBonus) {
        shuffledPlayers.forEach(player => {
          const randomIndex = Math.floor(Math.random() * bonusCards.length);
          player.bonusCard = bonusCards[randomIndex].name;
          bonusCards.splice(randomIndex, 1); // Remove the assigned card from the array
        });
      }

      shuffledPlayers = [...state.players].sort(() => Math.random() - 0.5);

      state.players = shuffledPlayers;
    },
    selectCrew: (state, action: PayloadAction<string[]>) => {
      state.currentCrew = action.payload;
      if (state.tour > 1) {
        state.gamePhase = 'VOTING';
      } else {
        state.gamePhase = 'JOURNEY';
      }
      state.votes = [];
      state.submittedVotes = [];
    },
    submitVote: (state, action: PayloadAction<VoteResult>) => {
      state.votes.push(action.payload);
      state.submittedVotes.push(action.payload.playerId);
      if (state.votes.length === state.players.length) {
        const approvalVotes = state.votes.filter(v => v.vote).length;
        if (approvalVotes > state.players.length / 2) {
          state.votesAnnulation = 0;
          state.gamePhase = 'JOURNEY';
          state.submittedCards = [];
        } else {
          state.votesAnnulation += 1;
          state.lastCrew = state.currentCrew;
          if (state.votesAnnulation === 2) {
            const currentIndex = state.players.findIndex(p => p.id === state.currentCaptain);
            const nextIndex = (currentIndex + 1) % state.players.length;
            state.currentCaptain = state.players[nextIndex].id;
            state.votesAnnulation = 0;
            state.tour += 1;
          }
          state.gamePhase = 'CREW_SELECTION';
        }
        state.lastCrew = state.currentCrew;
        state.votes = [];
      }
    },
    submitVoteSirene: (state, action: PayloadAction<VoteResult>) => {
      state.votesSirene.push(action.payload);
      state.submittedVotesSirene.push(action.payload.playerId);
      const piratesLength = state.players.filter(p => p.role === 'PIRATE').length
      const sireneLength = state.players.filter(p => p.role === 'SIRENE').length
      const totalLength = piratesLength + sireneLength
      if (state.votesSirene.length === totalLength) {
        // Compter les votes pour chaque joueur
        const voteCounts = state.votesSirene.reduce((acc, vote) => {
          acc[vote.playerId] = (acc[vote.playerId] || 0) + (vote.vote ? 1 : 0);
          return acc;
        }, {} as Record<string, number>);

        // Trouver le joueur avec le plus de votes
        const maxVotes = Math.max(...Object.values(voteCounts));
        const mostVotedPlayerId = Object.entries(voteCounts)
          .find(([_, count]) => count === maxVotes)?.[0];

        if (mostVotedPlayerId) {
          const mostVotedPlayer = state.players.find(p => p.id === mostVotedPlayerId);

          if (mostVotedPlayer?.role === 'SIRENE') {
            state.winner = 'PIRATES';
          } else {
            state.winner = 'SIRENE';
          }
          state.gamePhase = 'GAME_OVER';
        }

        // Réinitialiser les votes
        state.votesSirene = [];
        state.submittedVotesSirene = [];
      }
    },
    submitJourneyCard: (state, action: PayloadAction<{ playerId: string, card: BonusCard }>) => {
      state.journeyCards.push(action.payload.card);
      state.submittedCards.push(action.payload.playerId);
      if (state.journeyCards.length === state.currentCrew.length) {
        const hasPoison = state.journeyCards.includes('POISON');
        if (hasPoison) {
          state.pirateScore += 1;
        } else {
          state.marinScore += 1;
        }
        state.tour += 1;

        if (state.pirateScore >= state.settings.pointsToWin || state.marinScore >= state.settings.pointsToWin) {
          if (state.pirateScore >= state.settings.pointsToWin) {
            state.gamePhase = 'PIRATES_OR_SIRENES_WIN';
          } else {
            state.winner = 'MARINS';
            state.gamePhase = 'GAME_OVER';
            state.winner = state.pirateScore >= state.settings.pointsToWin ? 'PIRATES' : 'MARINS';
          }
        } else {
          state.gamePhase = 'CREW_SELECTION';
          // Passer au capitaine suivant
          const currentIndex = state.players.findIndex(p => p.id === state.currentCaptain);
          const nextIndex = (currentIndex + 1) % state.players.length;
          state.currentCaptain = state.players[nextIndex].id;
        }
        state.journeyCards = [];
        state.lastCrew = state.currentCrew;
        state.currentCrew = [];
        state.submittedCards = [];
      }
    },
    resetGame: (state, payload) => {
      const replayWithSameConfig = payload;
      if (replayWithSameConfig) {
        state.gamePhase = 'REPLAY';
        state.players.forEach(player => {
          player.role = undefined;
          player.bonusCard = undefined;
          player.hasVoted = undefined;
          player.isInCrew = undefined;
        });
        state.tour = 1;
        state.currentCaptain = null;
        state.currentCrew = [];
        state.lastCrew = [];
        state.pirateScore = 0;
        state.marinScore = 0;
        state.winner = null;
        state.votes = [];
        state.votesAnnulation = 0;
        state.votesSirene = [];
        state.journeyCards = [];
        state.submittedVotes = [];
        state.submittedVotesSirene = [];
        state.submittedCards = [];
      } else {
        state = initialState;
      }
    },
    loadFromLocalStorage: (state) => {
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        return JSON.parse(savedState);
      }
      return state;
    }
  },
});

export const {
  addPlayer,
  configureGame,
  submitVoteSirene,
  startGame,
  revealRole,
  distributeRoles,
  selectCrew,
  submitVote,
  submitJourneyCard,
  resetGame,
  loadGameState,
  loadFromLocalStorage
} = gameSlice.actions;

export default gameSlice.reducer; 