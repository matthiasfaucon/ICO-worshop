'use client';

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addPlayer, startGame, selectCrew, submitVote, submitJourneyCard } from '@/lib/reducers/game';
import { useState } from 'react';

export default function GamePage() {
    const dispatch = useAppDispatch();
    const gameState = useAppSelector((state) => state.game);
    const [playerName, setPlayerName] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

    const handleAddPlayer = () => {
        if (playerName.trim()) {
            dispatch(addPlayer({
                id: crypto.randomUUID(),
                name: playerName.trim(),
            }));
            setPlayerName('');
        }
    };

    const handleStartGame = () => {
        dispatch(startGame());
    };

    const handleCrewSelection = () => {
        if (selectedPlayers.length === 3) {
            dispatch(selectCrew(selectedPlayers));
            setSelectedPlayers([]);
        }
    };

    const handleVote = (vote: boolean) => {
        const currentVoter = gameState.players.find(
            (player) => !gameState.submittedVotes.includes(player.id)
        );
        if (currentVoter) {
            dispatch(submitVote({
                playerId: currentVoter.id,
                vote
            }));
        }
    };
    

    const handleJourneyCardSubmit = (card: 'POISON' | 'ILE') => {
        const currentCardSubmitter = gameState.currentCrew.find(
            (crewId) => !gameState.submittedCards.includes(crewId)
        );
        if (currentCardSubmitter) {
            dispatch(submitJourneyCard({
                playerId: currentCardSubmitter,
                card
            }));
        }
    };    

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Le Trésor des Pirates</h1>

            {/* Phase de configuration */}
            {gameState.gamePhase === 'SETUP' && (
                <div className="mb-4">
                    <h2 className="text-xl mb-2">Ajout des joueurs</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="border p-2 rounded"
                            placeholder="Nom du joueur"
                        />
                        <button
                            onClick={handleAddPlayer}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Ajouter
                        </button>
                    </div>

                    <div className="mt-4">
                        <h3>Joueurs ({gameState.players.length}):</h3>
                        <ul className="mb-4">
                            {gameState.players.map(player => (
                                <li key={player.id}>{player.name}</li>
                            ))}
                        </ul>

                        {gameState.players.length >= 7 && (
                            <button
                                onClick={handleStartGame}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Commencer la partie
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Phase de sélection d'équipage */}
            {gameState.gamePhase === 'CREW_SELECTION' && (
                <div className="mb-4">
                    <h2 className="text-xl mb-2">Sélection de l'équipage</h2>
                    <p>Capitaine actuel: {gameState.players.find(p => p.id === gameState.currentCaptain)?.name}</p>

                    <div className="mt-4">
                        <h3>Sélectionnez 3 joueurs:</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {gameState.players.map(player => (
                                <button
                                    key={player.id}
                                    onClick={() => {
                                        if (selectedPlayers.includes(player.id)) {
                                            setSelectedPlayers(selectedPlayers.filter(id => id !== player.id));
                                        } else if (selectedPlayers.length < 3) {
                                            setSelectedPlayers([...selectedPlayers, player.id]);
                                        }
                                    }}
                                    className={`p-2 rounded ${selectedPlayers.includes(player.id)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200'
                                        }`}
                                >
                                    {player.name}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCrewSelection}
                            disabled={selectedPlayers.length !== 3}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                        >
                            Valider l'équipage
                        </button>
                    </div>
                </div>
            )}

            {/* Phase de vote */}
            {gameState.gamePhase === 'VOTING' && (
                <div className="mb-4">
                    <h2 className="text-xl mb-2">Vote de l'équipage</h2>
                    <div className="mt-4">
                        {gameState.players
                            .filter(player => !gameState.submittedVotes.includes(player.id))[0] && (
                                <p className="text-lg font-bold text-blue-600 mb-4">
                                    C'est au tour de {gameState.players.find(player => !gameState.submittedVotes.includes(player.id))?.name} de voter
                                </p>
                            )}

                        <h3 className="mt-4">Équipage proposé:</h3>
                        <ul className="mb-4">
                            {gameState.currentCrew.map(crewId => (
                                <li key={crewId}>
                                    {gameState.players.find(p => p.id === crewId)?.name}
                                </li>
                            ))}
                        </ul>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleVote(true)}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Approuver
                            </button>
                            <button
                                onClick={() => handleVote(false)}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Rejeter
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase de voyage */}
            {gameState.gamePhase === 'JOURNEY' && (
                <div className="mb-4">
                    <h2 className="text-xl mb-2">Voyage en cours</h2>
                    <div className="mt-4">
                        {gameState.currentCrew
                            .find(crewId => !gameState.submittedCards.includes(crewId)) && (
                                <p className="text-lg font-bold text-blue-600 mb-4">
                                    C'est au tour de {
                                        gameState.players.find(
                                            p => p.id === gameState.currentCrew.find(
                                                crewId => !gameState.submittedCards.includes(crewId)
                                            )
                                        )?.name
                                    } de choisir une carte
                                </p>
                            )}

                        <h3 className="mt-4">Choisissez votre carte:</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleJourneyCardSubmit('ILE')}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Île
                            </button>
                            <button
                                onClick={() => handleJourneyCardSubmit('POISON')}
                                className="bg-purple-500 text-white px-4 py-2 rounded"
                            >
                                Poison
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase de fin de partie */}
            {gameState.gamePhase === 'GAME_OVER' && (
                <div className="mb-4">
                    <h2 className="text-xl mb-2">Partie terminée!</h2>
                    <p className="text-2xl font-bold">
                        {gameState.winner === 'PIRATES' ? 'Les Pirates ont gagné!' : 'Les Marins ont gagné!'}
                    </p>
                    <div className="mt-4">
                        <p>Score final:</p>
                        <p>Pirates: {gameState.pirateScore}</p>
                        <p>Marins: {gameState.marinScore}</p>
                    </div>
                </div>
            )}

            {/* Affichage du score en cours */}
            {gameState.gamePhase !== 'SETUP' && gameState.gamePhase !== 'GAME_OVER' && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded">
                    <p>Score:</p>
                    <p>Pirates: {gameState.pirateScore}</p>
                    <p>Marins: {gameState.marinScore}</p>
                </div>
            )}
        </div>
    );
}
