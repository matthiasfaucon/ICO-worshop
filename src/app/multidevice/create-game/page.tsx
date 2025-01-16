import CreateGameMulti from "@/components/CreateGameMulti";

export default function CreateGamePage() {
  const gameConfig = {
    withSiren: true,
    withBonus: false,
    pointsToWin: 10,
    playersCount: 10,
  };

  return <CreateGameMulti {...gameConfig} />;
}
