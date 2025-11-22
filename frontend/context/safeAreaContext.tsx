import React, { createContext, useContext, useState } from "react";

type SafeAreaCtx = {
  safeBg: string;
  setSafeBg: (c: string) => void;
};

const SafeAreaContext = createContext<SafeAreaCtx | null>(null);

export const SafeAreaProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [safeBg, setSafeBg] = useState("#000"); // default

  return (
    <SafeAreaContext.Provider value={{ safeBg, setSafeBg }}>
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
