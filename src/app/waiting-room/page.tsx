import WaitingRoom from "@/components/WaitingRoom";

export default function WaitingRoomPage() {
  const gameCode = "34 24 01";
  const players = [
    { id: 1, nickname: "Pseudo 1" },
    { id: 2, nickname: "Pseudo 2" },
    { id: 3, nickname: "Pseudo 3" },
    { id: 4, nickname: "Pseudo 4" },
  ];

  return <WaitingRoom gameCode={gameCode} players={players} />;
}
