import { createContext, useState, ReactNode } from "react";

import { GameContextType, GameData } from "/app/src/Types/Game/Interfaces";


export const GameDataContext = createContext<GameContextType | null>(null);

// Creiamo il provider che avvolgerà l'applicazione
export const GameDataProvider = ({ children }: { children: ReactNode }) => {
  const [gameData, setGameData] = useState<GameData>(null);

  return (
    <GameDataContext.Provider value={{ gameData, setGameData }}>
      {children}
    </GameDataContext.Provider>
  );
};
