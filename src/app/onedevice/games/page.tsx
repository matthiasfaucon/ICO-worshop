'use client';

import Header from '@/components/header';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addPlayer, startGame, selectCrew, submitVote, submitJourneyCard, distributeRoles, submitVoteSirene, revealRole, resetGame } from '@/lib/reducers/game';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function GamePage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const gameState = useAppSelector((state) => state.game);
    const [playerName, setPlayerName] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [revealedRoles, setRevealedRoles] = useState<string[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [remainingTime, setRemainingTime] = useState<number | null>(null);

    console.log(gameState);

    // Modifiez handleTimerForPirate
    const handleTimerForPirate = () => {
        const end = new Date();
        end.setSeconds(end.getSeconds() + 10); // 10 secondes de timer
        setEndTime(end);
    };

    // Remplacez l'useEffect du timer par celui-ci
    useEffect(() => {
        if (!endTime) return;

        const timerInterval = setInterval(() => {
            const now = new Date();
            const diff = Math.ceil((endTime.getTime() - now.getTime()) / 1000);

            if (diff <= 0) {
                clearInterval(timerInterval);
                setEndTime(null);
                setRemainingTime(null);
                dispatch(revealRole());
            } else {
                setRemainingTime(diff);
            }
        }, 100);

        return () => clearInterval(timerInterval);
    }, [endTime, dispatch]);


    // si gameState.gamePhase === "GAME_OVER" alors on update le score en base de données
    async function updateScore() {
        try {
            if (!gameState.gameId) {
                console.error('Game ID manquant');
                return;
            }

            const response = await fetch(`/api/game-mono/${gameState.gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    who_won: gameState.winner
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la mise à jour du jeu');
            }

            const updatedGame = await response.json();
            console.log('Jeu mis à jour:', updatedGame);
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    useEffect(() => {
        if (gameState.gamePhase === 'GAME_OVER') {
            updateScore();
        }

        if (gameState.gamePhase === 'REPLAY') {
            handleStartGame();
        }
    }, [gameState.gamePhase]);

    const handleAddPlayer = () => {
        if (playerName.trim()) {
            dispatch(addPlayer({
                id: crypto.randomUUID(),
                name: playerName.trim(),
            }));
            setPlayerName('');
        }
    };

    const handleStartGame = async () => {
        const user = localStorage.getItem('userInfo');
        const user_id = user ? JSON.parse(user).id : null;
        try {
            // Créer la partie en base de données
            const responseGame = await fetch('/api/game-mono', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user_id,
                    playersCount: gameState.settings.playersCount,
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const game = await responseGame.json();

            const gameId = game.id;

            if (!responseGame.ok) {
                throw new Error('Erreur lors de la création de la partie');
            }

            const responseBonusCard = await fetch(`/api/admin/cards?type=bonus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const bonusCards = await responseBonusCard.json();

            console.log('Cartes bonus:', bonusCards);

            // Démarrer la partie dans le state local
            dispatch(startGame(gameId));
            dispatch(distributeRoles(bonusCards));
        } catch (error) {
            console.error('Erreur:', error);
            // Vous pouvez ajouter ici une notification d'erreur pour l'utilisateur
        }
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

    const handleVoteSirene = (playerId: string) => {
        dispatch(submitVoteSirene({
            playerId,
            vote: true
        }));
    };

    const handleJourneyCardSubmit = (card: 'POISON' | 'ILE') => {
        const currentCardSubmitter = gameState.currentCrew.find(
            (crewId) => !gameState.submittedCards.includes(crewId)
        );
        const player = gameState.players.find(p => p.id === currentCardSubmitter);
        if ((player?.role === 'MARIN' || player?.role === 'SIRENE') && card === 'POISON') {
            alert('Les marins et les sirenes ne peuvent pas choisir la carte poison!');
            return;
        }
        if (currentCardSubmitter) {
            dispatch(submitJourneyCard({
                playerId: currentCardSubmitter,
                card
            }));
        }
    };

    const handleTouch = (playerId: string) => {
        setIsRevealing(true);
        setRevealedRoles(prev => [...prev, playerId]);
    };

    useEffect(() => {
        if (remainingTime === null) return;

        const timerInterval = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev && prev > 1) {
                    return prev - 1; // On décrémente le timer
                } else {
                    clearInterval(timerInterval); // J'arrête le timer
                    dispatch(revealRole());
                    return null;
                }
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [remainingTime, dispatch]);

    const handleReplay = (replayWithSameConfig: boolean) => {
        dispatch(resetGame(replayWithSameConfig))
        if (replayWithSameConfig) {
            router.push('/onedevice/games');
        } else {
            router.push('/');
        }
    };

    return (
        <div className='bg-brown-texture h-dvh bg-cover bg-center'>
            <Header />
                <div className="mx-auto mt-8 bg-white/15 backdrop-blur-sm rounded-lg shadow-lg border-2 border-white/40 h-5/6 w-11/12 z-10">
                    <div className="relative z-10 flex flex-col items-center gap-4 p-6 ">
                        <h1 className="text-4xl font-magellan text-white mb-4">Joueurs</h1>

                        {/* Phase de configuration */}
                        {gameState.gamePhase === 'CREATE_PLAYERS' && (
                            <div className="mb-4 w-full h-dvh">
                                {gameState.settings.playersCount > gameState.players.length && (
                                    <div>
                                        <div>
                                            <h2 className="text-xl mb-2 text-white font-filson font-bold">Ajouter un joueur</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                className="p-2 w-full rounded text-white font-bold border-2 border-white bg-transparent placeholder-gray-50::placeholder"
                                                placeholder="Pseudo"
                                            />
                                            <button
                                                onClick={handleAddPlayer}
                                                className="bg-white border-2 border-white px-4 py-2 rounded">
                                                <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8.33325 1.16668C8.33325 0.70644 7.96016 0.333344 7.49992 0.333344C7.03968 0.333344 6.66658 0.70644 6.66658 1.16668V6.16668H1.66659C1.20635 6.16668 0.833252 6.53977 0.833252 7.00001C0.833252 7.46025 1.20635 7.83334 1.66659 7.83334H6.66658V12.8333C6.66658 13.2936 7.03968 13.6667 7.49992 13.6667C7.96016 13.6667 8.33325 13.2936 8.33325 12.8333V7.83334H13.3333C13.7935 7.83334 14.1666 7.46025 14.1666 7.00001C14.1666 6.53977 13.7935 6.16668 13.3333 6.16668H8.33325V1.16668Z" fill="#3B4450" />
                                                </svg>

                                            </button>
                                        </div>
                                    </div>
                                )}
                                <hr className="my-4" />
                                <div className="mt-4">
                                    <h3 className='text-center text-white font-bold text-2xl'>Joueurs ({gameState.players.length}):</h3>

                                    <div className="max-h-64 w-full overflow-y-auto rounded-md my-4">
                                        <ul className="space-y-2">
                                            {gameState.players.map(player => (
                                            <li
                                                key={player.id}
                                                className="border-2 bg-white/15 backdrop-blur-sm text-white font-bold border-gray-300 rounded-md p-3 shadow-sm"
                                            >
                                                {player.name}
                                            </li>
                                            ))}
                                        </ul>
                                        </div>

                                        <div className="border-t-2 border-gray-300 flex gap-2 flex-col items-center pt-2">
                                        {!(
                                            gameState.players.length >= gameState.settings.playersCount
                                        ) && (
                                            <p className="text-white font-bold">
                                            Vous devez être entre 7 et 20 joueurs
                                            </p>
                                        )}
                                        <button
                                            onClick={handleStartGame}
                                            disabled={gameState.players.length < gameState.settings.playersCount}
                                            className="w-full py-3 rounded-lg font-bold 
                                            bg-white text-slate-800 
                                            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        >
                                            Commencer la partie
                                        </button>
                                        </div>
                                </div>
                            </div>
                        )}

                    
                        {/* Phase de révélation des rôles */}
                        {gameState.gamePhase === 'REVEAL_ROLES' && (
                            <div className="flex flex-col items-center relative">
                                {!selectedPlayer ? (
                                    <>
                                        <h1 className="text-xl font-bold mb-6">De quel côté tu vas te ranger ?</h1>
                                        <p className="text-center mb-6">Clique sur ton pseudo pour révéler ton rôle</p>

                                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
                                            {gameState.players.map(player => (
                                                <button
                                                    key={player.id}
                                                    onClick={() => setSelectedPlayer(player.id)}
                                                    className={`
                                            flex items-center gap-2 p-3 rounded-lg
                                            ${revealedRoles.includes(player.id)
                                                            ? 'bg-gray-200 text-gray-600'
                                                            : 'bg-brown-100 hover:bg-brown-200'
                                                        }
                                            transition-all duration-300
                                        `}
                                                >
                                                    <img src="/images/user-icon.png" alt="" className="w-6 h-6" />
                                                    <span>{player.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full">
                                        <div
                                            className="w-full max-w-md p-6 rounded-lg bg-brown-200 shadow-lg"
                                            onClick={() => handleTouch(selectedPlayer)}>
                                            {!isRevealing ? (
                                                <>
                                                    <h2 className="text-xl text-center mb-4">Reste appuyer pour dévoiler ton rôle</h2>
                                                    <div className="aspect-square w-full max-w-sm mx-auto bg-brown-100 rounded-lg flex items-center justify-center">
                                                        <div className="text-4xl font-bold">ICO!</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-2xl text-center font-bold mb-4">
                                                        Tu es un {gameState.players.find(p => p.id === selectedPlayer)?.role === 'PIRATE' ? 'pirate' :
                                                            gameState.players.find(p => p.id === selectedPlayer)?.role === 'MARIN' ? 'marin' : 'sirène'} !
                                                    </h2>
                                                    <div className="aspect-square w-full max-w-sm mx-auto bg-red-700 rounded-lg flex items-center justify-center p-8">
                                                        <img
                                                            src={`/images/${gameState.players.find(p => p.id === selectedPlayer)?.role.toLowerCase()}.png`}
                                                            alt="Role"
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                    { gameState.settings.withBonus && (
                                                        <h2 className="text-2xl text-center font-bold mb-4">
                                                            Ta carte bonus est : {gameState.players.find(p => p.id === selectedPlayer)?.bonusCard } !
                                                        </h2>
                                                    )}
                                                    {gameState.currentCaptain === selectedPlayer && (
                                                        <div className="flex items-center gap-2 mt-4 text-center">
                                                            <img src="/images/captain.png" alt="Captain" className="w-6 h-6" />
                                                            <p>Tu es aussi le capitaine du prochain voyage!</p>
                                                        </div>
                                                    )}
                                                    <p className="text-center mt-4">Retient bien et passe le téléphone</p>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPlayer(null);
                                                            setIsRevealing(false);
                                                        }}
                                                        className="w-full mt-4 bg-brown-500 text-white px-6 py-3 rounded-lg hover:bg-brown-600 transition-colors"
                                                    >
                                                        J'ai compris
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {revealedRoles.length - 1 >= gameState.players.length && (
                                    <button
                                        onClick={() => handleTimerForPirate()}
                                        className="mt-6 bg-brown-500 text-white px-6 py-3 rounded-lg hover:bg-brown-600 transition-colors"
                                    >
                                        Tous le monde sait son rôle
                                    </button>
                                )}

                                {/* Afficher le timer */}
                                {remainingTime !== null && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 text-white text-center p-4">
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-bold">{remainingTime}</h2>
                                            <p className="text-xl">Les marins ferment les yeux</p>
                                            <p className="text-xl">Les pirates et la sirène ouvrent les yeux</p>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Phase de sélection d'équipage */}
                        {gameState.gamePhase === 'CREW_SELECTION' && (
                            <div className="mb-4">
                                <h2 className="text-xl mb-2">Sélection de l'équipage</h2>
                                <p>Capitaine actuel: {gameState.players.find(p => p.id === gameState.currentCaptain)?.name}</p>
                                <p>Tour actuel: {gameState.tour}</p>
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

                                    {selectedPlayers.length === 3 && selectedPlayers.every(playerId => gameState.lastCrew.includes(playerId)) && (
                                        <p className="text-red-500 mt-4">Vous ne pouvez pas proposer le même équipage que le tour précédent,
                                        il faut changer au moins un joueur</p>
                                    )}

                                    <button
                                        onClick={handleCrewSelection}
                                        disabled={selectedPlayers.length !== 3 || selectedPlayers.every(playerId => gameState.lastCrew.includes(playerId))}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                                    >
                                        Valider l'équipage
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Phase de vote */}
                        {gameState.gamePhase === 'VOTING' && gameState.tour > 1 && (
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

                        {/* Phase de victoire des Pirates : Savoir si c'est la sirène ou les pirates qui gagnent */}
                        {gameState.gamePhase === 'PIRATES_OR_SIRENES_WIN' && (
                            // Afficher les players qui ont le roles pirates ou sirène
                            <div className="mb-4">
                                <h2 className="text-xl mb-2">Les Pirates ont gagné! Mais une sirène se cache parmi eux</h2>
                                <p>Qui est la sirène ?</p>
                                <div className="mt-4">
                                    {gameState.players.filter(player => player.role === 'PIRATE' || player.role === 'SIRENE').map(player => (
                                        <button key={player.id} className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => handleVoteSirene(player.id)}>
                                            {player.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Phase de fin de partie */}
                        {gameState.gamePhase === 'GAME_OVER' && (
                            <div className="mb-4">
                                <h2 className="text-xl mb-2">Partie terminée!</h2>
                                <p className="text-2xl font-bold">
                                    {gameState.winner === 'PIRATES' ? 'Les Pirates ont gagné!' : gameState.winner === 'MARINS' ? 'Les Marins ont gagné!' : 'La Sirène a gagné!'}
                                </p>
                                <div className="mt-4">
                                    <p>Score final:</p>
                                    <p>Pirates: {gameState.pirateScore}</p>
                                    <p>Marins: {gameState.marinScore}</p>
                                </div>
                                <button onClick={() => handleReplay(false)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                                    Rejouer
                                </button>
                                <button onClick={() => handleReplay(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                                    Rejouer avec les mêmes paramètres et joueurs
                                </button>
                            </div>
                        )}

                        {/* Affichage du score en cours */}
                        {gameState.gamePhase !== 'SETUP' && gameState.gamePhase !== 'CREATE_PLAYERS' && gameState.gamePhase !== 'REVEAL_ROLES' && gameState.gamePhase !== 'GAME_OVER' && (
                            <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded">
                                <p>Score:</p>
                                <p>Pirates: {gameState.pirateScore}</p>
                                <p>Marins: {gameState.marinScore}</p>
                            </div>
                        )}
                    </div>

                </div>

        </div>
    );
}