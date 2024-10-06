"use client";

import {
  useState,
  createContext,
  ReactNode,
  FC,
  SetStateAction,
  Dispatch,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Decorations from "../decorations";
import NavMenu from "../_components/navigationMenu/main";
import { DownloadItem } from "../_components/navigationMenu/dependencies/download-popover";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
interface AppState {
  loaded: { value: boolean; set: Dispatch<SetStateAction<boolean>> };
}
interface AppActions {
  download(file: DownloadItem): void;
  onDownloadsChange: (fn: (newDownloads: DownloadItem[]) => void) => void;
}
export interface AppContextProps {
  appState: AppState;
  appActions: AppActions;
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const querryClient = new QueryClient();
  const appActions: AppActions = {
    download(downloadFile) {
      invoke("download", { downloadFile });
    },
    onDownloadsChange(fn) {
      listen("downloads", (event) => {
        const downloads = event.payload as DownloadItem[];
        fn(downloads);
      });
    },
  };
  const appState: AppState = {
    loaded: { value: loaded, set: setLoaded },
  };
  return (
    <QueryClientProvider client={querryClient}>
      <TooltipProvider>
        <AppContext.Provider value={{ appState, appActions }}>
          <Decorations />
          <NavMenu />
          <div className="px-3 py-6 overflow-hidden" data-tauri-drag-region>
            {children}
          </div>
        </AppContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export { AppContext, AppProvider };
