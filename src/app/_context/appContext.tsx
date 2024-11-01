"use client";

import {
  useState,
  createContext,
  ReactNode,
  FC,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import Decorations from "../decorations";
import NavMenu from "../_components/navigationMenu/main";
import { DownloadItem } from "../_components/navigationMenu/dependencies/download-popover";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import {
  FileType,
  FSLib,
  SerializedFSLib,
} from "../_components/fileManager/dependencies/FileSystem";
import { IdStateType } from "../_components/fileManager/FileManager";
interface AppState {
  loaded: { value: boolean; set: Dispatch<SetStateAction<boolean>> };
  library: FSLib | undefined;
  setLibrary: Dispatch<SetStateAction<FSLib | undefined>>;
}
interface AppActions {
  download(
    file: DownloadItem,
    parentId: string,
    idState: IdStateType,
    setFiles: Dispatch<SetStateAction<FileType[]>>,
    querryClient: QueryClient
  ): void;
  onDownloadsChange: (fn: (newDownloads: DownloadItem[]) => void) => void;
}
export interface AppContextProps {
  appState: AppState;
  appActions: AppActions;
}
const AppContext = createContext<AppContextProps | undefined>(undefined);

const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [fsLib, setFsLib] = useState<FSLib | undefined>();
  const querryClient = new QueryClient();
  const appActions: AppActions = {
    async download(downloadFile, parentId, idState, setFiles, querryClient) {
      await invoke("download", { downloadFile });
      querryClient.invalidateQueries({
        queryKey: [parentId, "online"],
        exact: true,
      });
      querryClient.invalidateQueries({
        queryKey: [parentId, "offline"],
        exact: true,
      });
      if (idState.id == parentId) {
        setFiles((oldFiles) => {
          if (oldFiles.some((file) => file.id == downloadFile.id))
            oldFiles.forEach((file) =>
              file.id == downloadFile.id
                ? { ...file, isDownloaded: true }
                : file
            );
          else oldFiles.push({ ...downloadFile, isDownloaded: true });
          return oldFiles;
        });
      }
      for (const id of downloadFile.ids) {
        querryClient.invalidateQueries({
          queryKey: [id, "offline"],
          exact: true,
        });
      }
      if (idState.list.length < downloadFile.path.length) {
        let ChildFolderName = downloadFile.path[idState.list.length];
        let ChildFolderId = downloadFile.ids[idState.list.length];
        setFiles((oldFiles) => {
          if (!oldFiles.some((file) => file.id == ChildFolderId)) {
            oldFiles.push({
              id: ChildFolderId,
              name: ChildFolderName,
              mimeType: "application/vnd.google-apps.folder",
              isDownloaded: false,
            });
          }
          return oldFiles;
        });
      }
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
    library: fsLib,
    setLibrary: setFsLib,
  };
  useEffect(() => {
    async function get_library() {
      if (fsLib) return;
      const library_parsed: SerializedFSLib = JSON.parse(
        await invoke("get_library")
      ); // set the type for code completion
      const library = new SerializedFSLib(
        library_parsed.files,
        library_parsed.last_visited
      ).parse();
      setFsLib(library);
      console.log(fsLib);
    }
    get_library();
  }, [setFsLib, fsLib]);
  return (
    <QueryClientProvider client={querryClient}>
      <TooltipProvider>
        <AppContext.Provider value={{ appState, appActions }}>
          <Decorations />
          <NavMenu />
          <div className="px-3 py-6 overflow-hidden" data-tauri-drag-region>
            {fsLib && children}
          </div>
        </AppContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export { AppContext, AppProvider };
