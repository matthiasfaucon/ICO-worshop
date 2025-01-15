import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Role = 'PIRATE' | 'MARIN' | 'SIRENE';
type BonusCard = 'POISON' | 'ILE';

interface Player {
  id: string;
  name: string;
  role?: Role;
  bonusCard?: BonusCard;
  hasVoted?: boolean;
  isInCrew?: boolean;
}

interface VoteResult {
  playerId: string;
  vote: boolean;
}

interface GameState {
  players: Player[];
  currentCaptain: string | null;
  currentCrew: string[];
  pirateScore: number;
  marinScore: number;
  gamePhase: 'SETUP' | 'CREW_SELECTION' | 'VOTING' | 'JOURNEY' | 'GAME_OVER';
  winner: 'PIRATES' | 'MARINS' | 'SIRENE' | null;
  votes: VoteResult[];
  journeyCards: BonusCard[];
  submittedVotes: string[];
  submittedCards: string[];
}

const initialState: GameState = {
  players: [],
  currentCaptain: null,
  currentCrew: [],
  pirateScore: 0,
  marinScore: 0,
  gamePhase: 'SETUP',
  winner: null,
  votes: [],
  journeyCards: [],
  submittedVotes: [],
  submittedCards: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    startGame: (state) => {
      if (state.players.length >= 7 && state.players.length <= 20) {
        state.gamePhase = 'CREW_SELECTION';
        // Sélectionner aléatoirement le premier capitaine
        const randomIndex = Math.floor(Math.random() * state.players.length);
        state.currentCaptain = state.players[randomIndex].id;
      }
    },
    distributeRoles: (state) => {
      const playerCount = state.players.length;
      let pirates = Math.floor((playerCount - 1) / 2);
      let marins = playerCount - pirates - 1; // -1 pour la sirène
      
      const shuffledPlayers = [...state.players].sort(() => Math.random() - 0.5);
      
      shuffledPlayers.forEach((player, index) => {
        if (index < pirates) {
          player.role = 'PIRATE';
        } else if (index < pirates + marins) {
          player.role = 'MARIN';
        } else {
          player.role = 'SIRENE';
        }
      });
      
      state.players = shuffledPlayers;
    },
    selectCrew: (state, action: PayloadAction<string[]>) => {
      state.currentCrew = action.payload;
      state.gamePhase = 'VOTING';
      state.votes = [];
      state.submittedVotes = [];
    },
    submitVote: (state, action: PayloadAction<VoteResult>) => {
        state.votes.push(action.payload);
        state.submittedVotes.push(action.payload.playerId);      
      if (state.votes.length === state.players.length) {
        const approvalVotes = state.votes.filter(v => v.vote).length;
        if (approvalVotes > state.players.length / 2) {
          state.gamePhase = 'JOURNEY';
          state.submittedCards = [];
        } else {
          state.gamePhase = 'CREW_SELECTION';
        }
        state.votes = [];
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
        
        if (state.pirateScore >= 10 || state.marinScore >= 10) {
          state.gamePhase = 'GAME_OVER';
          state.winner = state.pirateScore >= 10 ? 'PIRATES' : 'MARINS';
        } else {
          state.gamePhase = 'CREW_SELECTION';
          // Passer au capitaine suivant
          const currentIndex = state.players.findIndex(p => p.id === state.currentCaptain);
          const nextIndex = (currentIndex + 1) % state.players.length;
          state.currentCaptain = state.players[nextIndex].id;
        }
        state.journeyCards = [];
        state.currentCrew = [];
        state.submittedCards = [];
      }
    },
    resetGame: () => initialState,
  },
});

export const { 
  addPlayer, 
  startGame, 
  distributeRoles, 
  selectCrew, 
  submitVote, 
  submitJourneyCard,
  resetGame 
} = gameSlice.actions;

export default gameSlice.reducer; 