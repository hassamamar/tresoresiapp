"use client";

import { useState, createContext, ReactNode, FC } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
interface AppState {
  loaded: boolean;
}
export interface AppContextProps {
  appState: AppState;
  setAppState: {};
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({loaded:false});
  const querryClient = new QueryClient();
  return (
    <QueryClientProvider client={querryClient}>
      <AppContext.Provider value={{ appState, setAppState }}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
};

export { AppContext, AppProvider };
