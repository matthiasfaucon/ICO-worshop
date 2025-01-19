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
        if (!revealedRoles.includes(playerId)) {
            setRevealedRoles(prev => [...prev, playerId]);
        }
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
                  <Header 
        pirateScore={gameState.pirateScore} 
        marinScore={gameState.marinScore} 
      />
                <div className="mx-auto mt-8 mb-4 bg-white/15 backdrop-blur-sm rounded-lg shadow-lg border-2 border-white/40 h-5/6 w-11/12 z-10">
                    <div className="relative pb-6 z-10 flex flex-col items-center gap-4">
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
                                                    <div className='px-6 pb-6'>
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
                                    className="absolute top-0 left-0 bottom-0 right-0 inset-0 flex items-center justify-center bg-cover bg-center text-white text-center p-6"
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
                                    <p className="text-white font-filson text-center font-bold">Capitaine: { gameState.players.find(p => p.id === gameState.currentCaptain)?.name }</p>
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
                                                    ? 'bg-white text-slate-700 font-bold'
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
                                        className="mt-4 bg-white text-slate-700 font-bold px-4 py-2 rounded disabled:bg-gray-400 w-full"
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
                                            className="bg-white text-slate-700 px-4 py-2 rounded"
                                        >
                                            Approuver
                                        </button>
                                        <button
                                            onClick={() => handleVote(false)}
                                            className="border-2 text-white px-4 py-2 rounded"
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
                                <div className="mt-4 flex items-center justify-center flex-col">
                                    <p className='text-white'>Score final:</p>

                                    <div className="flex items-center gap-2">
                                    <p className="flex items-center gap-1 text-sm font-bold text-gray-700">
                                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.0253 2.75033C14.5853 2.44691 14.8591 0.122275 12.4388 1.36045C10.8399 2.17774 11.4267 3.63614 10.9328 4.74707C10.8106 5.02113 8.77167 6.98362 8.52719 6.93957C7.93557 6.21526 6.61541 5.65245 6.20469 4.84495C5.5984 3.65082 6.08734 1.35066 4.07288 1.08638C2.41046 0.871049 2.72338 1.84495 2.12198 2.535C1.5988 3.14185 0.469335 2.82864 0.528009 4.37513C0.61113 6.47954 3.06565 6.67529 4.69873 6.33272L6.899 8.5399C6.899 8.75034 4.12177 11.168 3.80396 11.3344C2.96786 11.7797 0.20041 11.2463 0.0586155 13.4534C-0.0342846 14.8678 1.21742 14.8482 1.70637 15.3327C2.48379 16.1109 2.3909 17.7406 4.38581 16.5415C6.1069 15.504 5.26591 13.8009 5.80375 12.5823C5.97488 12.1957 8.30716 10.0913 8.69832 10.1598C9.05036 10.7422 11.0159 11.9901 11.1822 12.3327C11.7347 13.473 10.8301 15.4649 12.7908 16.5954C14.9715 17.8531 14.7759 15.8221 15.2698 15.3278C15.7147 14.8825 17.0202 15.3572 16.942 13.4436C16.8393 10.9477 14.1599 11.8678 13.1771 11.3344C12.8495 11.1582 10.3118 8.7797 10.3118 8.54479C10.8204 8.01624 11.764 6.63125 12.3556 6.39634C13.3775 5.99504 16.1988 7.25278 16.6388 4.56599C16.9273 2.81395 15.5338 3.1027 15.0204 2.74544L15.0253 2.75033Z" fill="#8E122A" stroke="white" strokeWidth="0.0938502" strokeMiterlimit="10"/>
                                    </svg>
                                    <span className='text-white'>{gameState.pirateScore}</span>
                                    </p>
                                    {/* barre vertic */}
                                    <div className="h-6 w-px bg-gray-400"></div>
                                    <p className="flex items-center gap-1 text-sm font-bold text-gray-700">
                                    <span className='text-white'>{gameState.marinScore}</span>
                                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9.2239 3.47185C9.3263 3.378 9.3263 3.11813 9.4031 3.09286C9.77613 3.1073 10.5039 2.94849 10.5807 3.46824C10.61 3.68119 10.61 4.33088 10.5807 4.54022C10.4966 5.12133 9.74322 4.82897 9.34459 4.88311C9.35921 4.71708 9.23487 4.50052 9.06299 4.46082C8.88013 4.42111 8.09018 4.43555 7.92561 4.51135C7.43189 4.73874 7.51235 5.31985 7.51966 5.76741C7.53795 6.75638 7.60378 7.75979 7.63303 8.75237C7.66595 9.8821 7.60743 11.1346 7.70252 12.2462C7.72446 12.5133 7.81223 12.7335 8.01338 12.9104C8.43029 13.2785 8.8143 13.145 9.28241 12.9717C10.215 12.6325 11.0488 12.0261 11.6779 11.2717C11.7144 11.1851 11.3999 11.214 11.367 11.2176C11.1878 11.232 10.7124 11.4558 10.8587 11.1129L12.6616 8.71988C12.7092 8.67296 12.7494 8.60438 12.8226 8.59356C12.8957 8.58273 12.9067 8.77402 12.914 8.82817C13.0018 9.65832 13.0895 10.5895 13.1334 11.4197C13.1407 11.5821 13.1298 11.7445 13.1334 11.907C13.0164 12.0189 12.5958 11.4161 12.4056 11.4738C12.0399 13.0114 10.6429 14.1953 9.18001 14.7115C8.60584 14.9172 8.15966 14.928 7.66595 15.3395C7.42092 15.5452 7.2088 15.8592 6.92354 16C6.5688 15.7329 6.27622 15.3323 5.88856 15.1121C5.50091 14.8919 5.0145 14.8233 4.59393 14.6645C3.15301 14.1195 1.85105 12.9898 1.46705 11.4702C1.40488 11.4161 1.05745 11.7157 0.99162 11.7734C0.911162 11.842 0.925793 11.9828 0.753906 11.8673L0.998936 8.65131L1.02819 8.60799L1.13425 8.59717L3.05792 11.1815C3.12009 11.4125 2.69952 11.2356 2.57517 11.2212C2.45083 11.2067 2.32283 11.2212 2.19849 11.2176C2.18386 11.2789 2.22408 11.2898 2.25334 11.3259C2.7946 12.0225 3.76375 12.6685 4.59393 12.9717C4.92308 13.0908 5.19736 13.2063 5.54479 13.0981C5.89222 12.9898 6.13725 12.6613 6.17017 12.3148C6.33108 10.7303 6.15554 9.01224 6.31645 7.42412C6.22502 6.66254 6.4664 5.72049 6.34206 4.98418C6.29817 4.73152 6.00559 4.48247 5.74959 4.4536C5.58868 4.43555 4.9121 4.43194 4.78044 4.46804C4.5537 4.53661 4.53176 4.88312 4.50616 4.88672C4.12581 4.83258 3.37975 5.11051 3.28832 4.54022C3.25906 4.34532 3.26272 3.56569 3.32123 3.38883C3.46386 2.93766 4.1441 3.12535 4.50616 3.08204C4.53541 3.08564 4.51713 3.47907 4.8097 3.54404C4.97062 3.58013 5.63988 3.57291 5.82274 3.55125C6.11531 3.51877 6.38594 3.24085 6.42251 2.95571C6.47737 2.50453 6.11531 2.49371 5.87759 2.20135C5.31439 1.50474 5.57405 0.403876 6.43348 0.0898596C7.72081 -0.37936 8.83259 1.08966 8.02801 2.16525C7.87441 2.37099 7.49772 2.52258 7.45383 2.74997C7.38435 3.08565 7.6696 3.49711 8.01338 3.54765C8.21086 3.57652 8.79235 3.57291 8.99716 3.54765C9.06298 3.54043 9.17635 3.50794 9.2239 3.46463V3.47185ZM6.81749 0.649314C5.93611 0.79008 6.07874 2.20496 7.09178 2.03531C7.97315 1.88733 7.75372 0.50133 6.81749 0.649314Z" fill="#093074"/>
                                    <path d="M6.81719 0.64927C7.75342 0.501285 7.97285 1.88729 7.09148 2.03527C6.07844 2.20491 5.93581 0.790036 6.81719 0.64927Z" fill="#093074"/>
                                    </svg>
                                    </p>
                                </div>
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
                        {/* {gameState.gamePhase !== 'SETUP' && gameState.gamePhase !== 'CREATE_PLAYERS' && gameState.gamePhase !== 'REVEAL_ROLES' && gameState.gamePhase !== 'GAME_OVER' && (
                            <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded">
                                <p>Score:</p>
                                <p>Pirates: {gameState.pirateScore}</p>
                                <p>Marins: {gameState.marinScore}</p>
                            </div>
                        )} */}
                    </div>

                </div>

        </div>
    );
}