import axios from "axios";

const gameCode = "GR3THN"; // Code de la partie à rejoindre
const apiEndpoint = `http://localhost:3000/api/games/${gameCode}`;
const sessionUUIDs = Array.from({ length: 7 }, () => generateUUID());

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function simulatePlayerJoin(sessionUUID) {
  try {
    const response = await axios.post(apiEndpoint, {}, {
      headers: {
        "x-session-uuid": sessionUUID,
        "x-nickname": `Player-${Math.random().toString(36).substring(2, 8)}`,
      },
    });
    console.log(`Player with session ${sessionUUID} joined successfully.`);
  } catch (err) {
    console.error(`Error for session ${sessionUUID}:`, err.response?.data || err.message);
  }
}

async function runSimulation() {
  console.log("Simulating 7 players joining the game...");
  await Promise.all(sessionUUIDs.map((uuid) => simulatePlayerJoin(uuid)));
  console.log("Simulation complete.");
}

runSimulation();
