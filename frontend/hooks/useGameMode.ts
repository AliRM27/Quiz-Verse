import { useState, useEffect, useRef, useCallback } from "react";
import { WeeklyEventNodeType } from "@/types";

type GameStatus = "playing" | "won" | "lost";

interface GameModeConfig {
  timeLimitSeconds?: number;
  maxLives?: number;
}

interface UseGameModeProps {
  nodeType: WeeklyEventNodeType;
  config?: GameModeConfig;
  onGameOver: (reason: "time" | "lives") => void;
}

export const useGameMode = ({
  nodeType,
  config,
  onGameOver,
}: UseGameModeProps) => {
  const [status, setStatus] = useState<GameStatus>("playing");

  // --- Time Challenge Logic ---
  const initialTime =
    nodeType === "time_challenge" ? config?.timeLimitSeconds || 60 : 0;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // --- Survival Logic ---
  const initialLives = nodeType === "survival" ? config?.maxLives || 3 : 0;
  const [lives, setLives] = useState(initialLives);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start/Stop Timer
  useEffect(() => {
    if (nodeType === "time_challenge" && status === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus("lost");
            onGameOver("time");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nodeType, status, onGameOver]);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      if (status !== "playing") return;

      if (nodeType === "survival") {
        if (!isCorrect) {
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setStatus("lost");
              onGameOver("lives");
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return newLives;
          });
        }
      }
    },
    [nodeType, status, onGameOver]
  );

  const stopGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return {
    status,
    timeLeft,
    lives,
    handleAnswer,
    stopGame,
    setStatus,
  };
};
