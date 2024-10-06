"use client";

import { useState, createContext, ReactNode, FC, SetStateAction, Dispatch } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
interface AppState {
  loaded: boolean;
}
export interface AppContextProps {
  appState: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>({ loaded: false });
  const querryClient = new QueryClient();
  return (
    <QueryClientProvider client={querryClient}>
      <TooltipProvider>
        <AppContext.Provider value={{ appState, setAppState }}>
          {children}
        </AppContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export { AppContext, AppProvider };
