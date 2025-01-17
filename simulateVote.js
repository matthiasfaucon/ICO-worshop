import axios from "axios";

const gameCode = "H6LVK8"; 
const apiVoteEndpoint = `http://localhost:3000/api/games/${gameCode}/vote`;
const sessionUUIDs = [
  "7c7b35f2-bf1b-4053-819a-c23a72166aaf",
  "f84255f5-4053-4542-8177-09980c182e90",
  "933d1b18-3573-46a7-8eca-baa80a648e30",
  "3b2ad355-6f7e-42ac-80eb-a5b20581dce6",
  "fdcd3eae-8f59-4810-9174-71d70ad3247c",
  "91c3c2bf-cf18-431a-a2d4-3aab68b151b3",
  "a82cd186-913d-4ab6-b4d1-2fdcf4c75200",
]; 

async function simulatePlayerVote(sessionUUID, vote) {
  try {
    const response = await axios.post(
      apiVoteEndpoint,
      { sessionUuid: sessionUUID, vote },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Vote '${vote}' enregistré pour le joueur avec session ${sessionUUID}.`);
  } catch (err) {
    console.error(
      `Erreur pour le joueur avec session ${sessionUUID}:`,
      err.response?.data || err.message
    );
  }
}

async function runVoteSimulation() {
  console.log("Simulation des votes des joueurs...");
  
  const votePromises = sessionUUIDs.map((uuid, index) =>
    simulatePlayerVote(uuid, index % 2 === 0 ? "yes" : "no") // Alternance entre "yes" et "no"
  );

  await Promise.all(votePromises);
  console.log("Simulation des votes terminée.");
}

runVoteSimulation();
