import { Colors } from "@/constants/Colors";
import React, { createContext, useContext, useState } from "react";

type SafeAreaCtx = {
  safeBg: string;
  setSafeBg: (c: string) => void;
  safeEdges: any;
  setSafeEdges: any;
};

const SafeAreaContext = createContext<SafeAreaCtx | null>(null);

export const SafeAreaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [safeBg, setSafeBg] = useState(Colors.dark.bg_dark); // default
  const [safeEdges, setSafeEdges] = useState(["top", "bottom"]);

  return (
    <SafeAreaContext.Provider
      value={{ safeBg, setSafeBg, safeEdges, setSafeEdges }}
    >
      {children}
    </SafeAreaContext.Provider>
  );
};

export const useSafeAreaBg = () => {
  const ctx = useContext(SafeAreaContext);
  if (!ctx)
    throw new Error("useSafeAreaBg must be used inside SafeAreaProvider");
  return ctx;
};
