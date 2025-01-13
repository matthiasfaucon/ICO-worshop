"use client"

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";



export default function Home() {

  function getOrCreateUUID() {
    const storedUUID = localStorage.getItem("user_uuid");
    if (storedUUID) return storedUUID;
  
    const newUUID = uuidv4();
    localStorage.setItem("user_uuid", newUUID);
    return newUUID;
  }

  useEffect(() => {
    const uuid = getOrCreateUUID();
    console.log(uuid);
  })

  return (
    <div>
      <form>
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
