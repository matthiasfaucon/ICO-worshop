"use client"

import { createContext, useContext, useReducer, ReactNode } from 'react';

type Role = 'PIRATE' | 'MARIN' | 'SIRENE';

interface Player {
  id: string;
  name: string;
  role?: Role;
  bonusCard?: string;
  hasVoted?: boolean;
}

interface GameState {
  players: Player[];
  currentCaptain: string | null;
  currentCrew: string[];
  pirateScore: number;
  marinScore: number;
  gamePhase: 'SETUP' | 'CREATE_PLAYERS' | 'CREW_SELECTION' | 'VOTING' | 'JOURNEY' | 'PIRATES_OR_SIRENES_WIN' | 'GAME_OVER';
  winner: 'PIRATES' | 'MARINS' | 'SIRENE' | null;
}

type GameAction = 
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'SET_ROLES' }
  | { type: 'SELECT_CREW'; payload: string[] }
  | { type: 'VOTE_CREW'; payload: { playerId: string; vote: boolean } }
  | { type: 'COMPLETE_JOURNEY'; payload: { success: boolean } }
  | { type: 'NEXT_CAPTAIN' };

const initialState: GameState = {
  players: [],
  currentCaptain: null,
  currentCrew: [],
  pirateScore: 0,
  marinScore: 0,
  gamePhase: 'SETUP',
  winner: null,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    // Implémentez ici la logique de réduction
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 