'use client';

import Header from '@/components/header';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addPlayer, startGame, selectCrew, submitVote, submitJourneyCard, distributeRoles, submitVoteSirene, revealRole, resetGame, loadGameState, loadFromLocalStorage } from '@/lib/reducers/game';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
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

    // Déplacer le useEffect de chargement du localStorage tout en haut
    useEffect(() => {
        const savedGameState = localStorage.getItem('gameState');
        if (savedGameState) {
            try {
                const parsedState = JSON.parse(savedGameState);
                // Vérifier que le state est valide avant de le charger
                if (parsedState && parsedState.gamePhase) {
                    dispatch(loadFromLocalStorage());
                }
            } catch (error) {
                console.error('Erreur lors du chargement du state:', error);
                localStorage.removeItem('gameState');
            }
        }
    }, [dispatch]);

    // Modifiez handleTimerForPirate
    const handleTimerForPirate = () => {
        const end = new Date();
        const remainingTime = gameState?.settings?.timerDuration ?? 10;
        end.setSeconds(end.getSeconds() + remainingTime ); // 10 secondes de timer
        setEndTime(end);
    };

    useEffect(() => {
        const savedGameState = localStorage.getItem('gameState');
        console.log('savedGameState:', savedGameState);
        if (savedGameState) {
            dispatch(loadFromLocalStorage());
        }
    }, []);

    useEffect(() => {

        if (!endTime) return;

        const timerInterval = setInterval(() => {
            const now = new Date();
            const diff = Math.ceil((endTime.getTime() - now.getTime()) / 1000);

            if (diff <= 0) {
                clearInterval(timerInterval);
                setEndTime(null);
                setRevealedRoles([]);
                setRemainingTime(null);
                dispatch(revealRole());
            } else {
                setRemainingTime(diff);
            }
        }, 100);

        return () => clearInterval(timerInterval);
    }, [endTime, dispatch]);


    // si gameState.gamePhase === "GAME_OVER" alors on update le score en base de données
    async function updateScoreInBDD() {
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
        localStorage.setItem('gameState', JSON.stringify(gameState));
        if (gameState.gamePhase === 'GAME_OVER') {
            localStorage.removeItem('gameState');
            updateScoreInBDD();
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
        const token = Cookies.get("authToken");
        if (!token) {
            alert("Vous devez être connecté pour créer une partie.");
            router.push("/signin");
            return;
        }
        try {
            // Créer la partie en base de données
            const responseGame = await fetch('/api/game-mono', {
                method: 'POST',
                body: JSON.stringify({
                    playersCount: gameState.settings.playersCount,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const game = await responseGame.json();

            const gameId = game.id;

            if (!responseGame.ok) {
                if (responseGame.status === 401) {
                    router.push('/auth-options');
                    return;
                }
                
                throw new Error('Erreur lors de la création du jeu');
            }

            const responseBonusCard = await fetch(`/api/admin/cards?type=bonus`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const bonusCards = await responseBonusCard.json();

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
            router.push('/onedevice');
        }
    };

    return (
        <div className='bg-brown-texture min-h-screen bg-cover bg-center'>
            <Header />
                <div className="mx-auto mt-8 bg-white/15 backdrop-blur-sm rounded-lg shadow-lg border-2 border-white/40 h-5/6 w-11/12 z-10">
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        {/* Phase de configuration */}
                        {gameState.gamePhase === 'CREATE_PLAYERS' && (
                            <div className="mb-4 w-full pt-6">
                                 <h1 className="text-4xl text-center font-magellan text-white mb-4">Joueurs</h1>
                                {gameState.settings.playersCount > gameState.players.length && (
                                    <div className='p-6'>
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
                                <div className="mt-4 px-6">
                                    <h3 className='text-center text-white font-bold text-2xl'>Joueurs ({gameState.players.length}):</h3>

                                    <div className="max-h-64 w-full overflow-y-auto rounded-md my-4">
                                        <ul className="space-y-2">
                                            {gameState.players.map(player => (
                                            <li
                                                key={player.id}
                                                className="border-2 text-white font-bold border-gray-300 rounded-md p-3 shadow-sm"
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
                                                Vous devez être {gameState.settings.playersCount} joueurs pour commencer
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
                            <div className="flex flex-col items-center relative pt-6 w-full">
                                {!selectedPlayer ? (
                                    <>
                                    <h1 className="text-4xl text-center font-magellan text-white mb-4">Vos Roles</h1>
                                    <div className=" border-white/20 border-y-2 p-4 w-full">
                                        <p className="text-white font-filson ">Clique sur ton pseudo pour révéler ton rôle</p>
                                    </div>
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6 px-6 pt-6">
                                            {gameState.players.map(player => (
                                                <button
                                                    key={player.id}
                                                    onClick={() => setSelectedPlayer(player.id)}
                                                    className={`
                                            flex items-center gap-2 p-3 rounded-lg
                                            ${revealedRoles.includes(player.id)
                                                            ? 'bg-brown-400 text-gray-600'
                                                            : ' text-white font-bold'
                                                        }
                                            transition-all duration-300 border-2
                                        `}
                                                >
                                                    <img src="/cards/icon-image.svg" alt="" className="w-6 h-6" />
                                                    <span>{player.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full">
                                        <div
                                            className="w-full max-w-md rounded-lg">
                                            {!isRevealing ? (
                                                <>
                                                <h1 className="text-4xl text-center font-magellan text-white mb-4">De quel côté tu vas te ranger ?</h1>
                                                <div className="  border-white/20 border-y-2 p-4 w-full">
                                                    <p className="text-white font-filson text-center ">Clique sur ton pseudo pour révéler ton rôle</p>
                                                </div>
                                                    <div className="aspect-square w-full max-w-sm mx-auto p-6 flex items-center justify-center">
                                                        <div className="text-4xl font-bold bg-dos-carte w-full h-full bg-center bg-cover bg-no-repeat" onClick={() => handleTouch(selectedPlayer)}></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h1 className="text-4xl text-center font-magellan text-white mb-4">
                                                        Tu es un {gameState.players.find(p => p.id === selectedPlayer)?.role === 'PIRATE' ? 'pirate' :
                                                            gameState.players.find(p => p.id === selectedPlayer)?.role === 'MARIN' ? 'marin' : 'sirène'} !
                                                    </h1>
                                                    <div className=" border-white/20  border-y-2 p-4 w-full">
                                                        <p className="text-white font-filson text-center ">Ton objectif est d’empoisonner les marins sans te faire démasquer pour gagner le trésor</p>
                                                    </div>
                                                    <div className="w-full max-w-sm mx-auto flex items-center justify-center px-6 py-2 ">
                                                        <img
                                                            src={`/cards/${gameState.players.find(p => p.id === selectedPlayer)?.role.toLowerCase()}.png`}
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
                                                        <div className="flex items-center justify-center gap-2 text-center p-6">
                                                            {/* <img src="/images/captain.png" alt="Captain" className="w-6 h-6" /> */}
                                                            <p className='text-white font-bold'>Tu es aussi le capitaine du prochain voyage!</p>
                                                        </div>
                                                    )}
                                                    <div className='px-6'>
                                                    <p className="text-center text-white mb-2">Retient bien et passe le téléphone</p>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPlayer(null);
                                                            setIsRevealing(false);
                                                        }}
                                                        className="w-full py-3 rounded-lg font-bold 
                                                            bg-white text-slate-800 
                                                            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                        >
                                                        J'ai compris
                                                    </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {revealedRoles.length >= gameState.players.length && (
                                    <button
                                        onClick={() => handleTimerForPirate()}
                                        className="mt-6 bg-brown-500 text-white px-6 py-3 rounded-lg hover:bg-brown-600 transition-colors"
                                    >
                                        Tous le monde sait son rôle
                                    </button>
                                )}

                                {/* Afficher le timer */}
                                {remainingTime !== null && (
                                <div
                                    className="fixed inset-0 flex items-center justify-center bg-cover bg-center text-white text-center p-6"
                                    style={{
                                    backgroundImage: "url('/cards/background-red.jpg')",
                                    }}
                                >
                                    <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 w-full max-w-md">
                                    {/* Title */}
                                    <h1 className="text-3xl font-bold font-magellan text-white mb-4">
                                        La bande de pirates
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="text-sm text-white mb-6 leading-5">
                                        Tout le monde ferme les yeux. Les pirates les rouvrent pour se reconnaître.
                                        <br />
                                        N’oubliez personne !
                                    </p>

                                    {/* Timer */}
                                    <div className="relative w-32 h-32 mx-auto">
                                        {/* Background Circle */}
                                        <div className="absolute inset-0 rounded-full border-4 border-gray-400" />

                                        {/* Animated Circle */}
                                        <div
                                        className="absolute inset-0 rounded-full border-4"
                                        style={{
                                            borderImage: "linear-gradient(167deg, rgba(121,83,13,1) 0%, rgba(166,95,17,1) 35%, rgba(240,157,52,1) 100%)",
                                            borderImageSlice: 1,
                                            clipPath: "circle(50%)",
                                            transform: `rotate(${(remainingTime / 60) * 360}deg)`,
                                            transition: "transform 1s linear",
                                        }}
                                        />

                                        {/* Timer Text */}
                                        <div className="flex items-center justify-center absolute inset-0 text-3xl font-bold text-white">
                                        {remainingTime}s
                                        </div>
                                    </div>

                                    {/* Bottom button */}
                                    <button className="mt-6 w-full py-3 bg-white text-slate-800 font-bold rounded-lg shadow" onClick={() => dispatch(revealRole())}>
                                        On est prêt pour l’aventure
                                    </button>
                                    </div>
                                </div>
                                )}


                            </div>
                        )}

                        {/* Phase de sélection d'équipage */}
                        {gameState.gamePhase === 'CREW_SELECTION' && (
                            <div className="mb-4 w-full pt-6">
                                <h1 className="text-4xl text-center font-magellan text-white mb-4">Qui part en voyage ?</h1>
                                <div className=" border-white/20 border-y-2 p-4 w-full">
                                    <p className="text-white font-filson text-center font-bold">Tour actuel: {gameState.tour}</p>
                                    <p className="text-white font-filson text-center font-bold border-2">Capitaine: { gameState.players.find(p => p.id === gameState.currentCaptain)?.name }</p>
                                </div>
                            
                                <div className="mt-4 px-6">
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
                                                    ? 'bg-blue-400 text-white font-bold'
                                                    : 'text-white font-bold'
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
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400 w-full"
                                    >
                                        Valider l'équipage
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Phase de vote */}
                        {gameState.gamePhase === 'VOTING' && gameState.tour > 1 && (
                            <div className="mb-4 pt-6 w-full">
                                <h1 className="text-4xl text-center font-magellan text-white mb-4">Cet équipage part ?</h1>
                                <div className="mt-4">
                                <div className=" border-white/20 border-y-2 p-4 w-full">
                                    {gameState.players
                                        .filter(player => !gameState.submittedVotes.includes(player.id))[0] && (
                                            <p className="font-bold text-white text-center">
                                                C'est au tour de {gameState.players.find(player => !gameState.submittedVotes.includes(player.id))?.name} de voter
                                            </p>
                                        )}
                                </div>

                                    <ul className="mb-4 pt-6">
                                        {gameState.currentCrew.map(crewId => (
                                            <li className=' mx-auto text-white font-bold border-2 text-center w-min px-4 rounded-lg mb-4' key={crewId}>
                                                {gameState.players.find(p => p.id === crewId)?.name}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex gap-2 flex-col px-6">
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
                            <div className="mb-4 w-full pt-6">
                                <div className=' mx-auto  text-white font-bold border-2 text-center w-min px-4 rounded-lg mb-4'>
                                {gameState.currentCrew
                                        .find(crewId => !gameState.submittedCards.includes(crewId)) && (
                                            <p className="text-lg">
                                                {
                                                    gameState.players.find(
                                                        p => p.id === gameState.currentCrew.find(
                                                            crewId => !gameState.submittedCards.includes(crewId)
                                                        )
                                                    )?.name
                                                }
                                            </p>
                                        )}
                                </div>
                                <h1 className="text-4xl text-center font-magellan text-white mb-4">Choisis ton action</h1>
                                <div className="mt-4">
                                <div className="flex justify-center flex-col items-center gap-6 mt-6">
                                    {/* Carte Île */}
                                    <div
                                        onClick={() => handleJourneyCardSubmit('ILE')}
                                        className="relative group cursor-pointer"
                                    >
                                        <img
                                        src="/cards/Carte_Ile.png"
                                        alt="Carte Île"
                                        className="w-52 h-52 border-2 border-white rounded-md object-cover shadow-md transition-transform transform group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Carte Poison */}
                                    <div
                                        onClick={() => handleJourneyCardSubmit('POISON')}
                                        className="relative group cursor-pointer"
                                    >
                                        <img
                                        src="/cards/Carte_Poison.png"
                                        alt="Carte Poison"
                                        className="w-52 h-52 border-2 border-white rounded-lg object-cover shadow-md transition-transform transform group-hover:scale-105"
                                        />
                                    </div>
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
                            <div className="mb-4 w-full pt-6">
                                <h1 className="text-4xl text-center font-magellan text-white mb-4">{gameState.winner === 'PIRATES' ? 'Les Pirates ont gagné!' : gameState.winner === 'MARINS' ? 'Les Marins ont gagné!' : 'La Sirène a gagné!'}</h1>
                                <div className="mt-4">
                                    <p>Score final:</p>
                                    <p>Pirates: {gameState.pirateScore}</p>
                                    <p>Marins: {gameState.marinScore}</p>
                                </div>

                                <div className='flex flex-col gap-2 items-center px-6 pt-6'>
                                    <button onClick={() => handleReplay(false)} className="w-full py-3 rounded-lg font-bold 
                                            bg-white text-slate-800 
                                            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                                        Rejouer
                                    </button>
                                    <button onClick={() => handleReplay(true)} className="w-full py-3 rounded-lg font-bold 
                                            bg-white text-slate-800 
                                            disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                                        Rejouer avec les mêmes paramètres et joueurs
                                    </button>
                                </div>
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