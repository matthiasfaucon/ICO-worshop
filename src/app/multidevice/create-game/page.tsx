import CreateGame from "@/components/CreateGame";

export default function CreateGamePage() {
  const gameConfig = {
    withSiren: true,
    withBonus: false,
    pointsToWin: 10,
    playersCount: 10,
  };

  return <CreateGame {...gameConfig} />;
}
