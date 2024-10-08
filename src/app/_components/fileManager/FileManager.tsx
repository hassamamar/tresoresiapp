import { useState, useMemo, useEffect, Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GridIcon, ListIcon, ArrowUpDown } from "lucide-react";
import FilesList from "./dependencies/filesList";
import {
  BreadcrumbFiles,
  isFolder,
  isFolderShortcut,
  LoadingComponent,
} from "./dependencies/more";
import { FileType } from "./dependencies/FileSystem";
import { OfflineAction } from "./offline";
import { QueryClient } from "@tanstack/react-query";
interface FileManagerProps {
  queryClient: QueryClient;
  idState: IdStateType;
  idDispatch: Dispatch<Action> & Dispatch<OfflineAction>;
  children: React.ReactNode;
  isSearchFilter: boolean;
  isToggle: boolean;
  data: FileType[];
  isLoading: boolean;
}
const initialState: IdStateType = {
  list: [{ id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0", name: "Tresor Esi" }],
  id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0",
};
export { initialState };
export function reducer(state: IdStateType, action: Action): IdStateType {
  switch (action.type) {
    case "push":
      return {
        list: [...state.list, action.payload], // Add the new item (object) to the list
        id: action.payload.id, // Update id to the payload's id
      };
    case "goto": {
      const item = state.list[action.payload];
      if (item)
        return {
          list: state.list.slice(0, action.payload + 1),
          id: item.id, // Change id to the new payload string
        };
      else return state;
    }
    default:
      return state;
  }
}
export type Action =
  | { type: "push"; payload: { id: string; name: string } }
  | { type: "goto"; payload: number };

// Define the state structure
export interface IdStateType {
  list: { id: string; name: string }[];
  id: string;
}
export default function FileManager({
  queryClient,
  idState,
  idDispatch,
  children,
  isSearchFilter,
  isToggle,
  data,
  isLoading,
}: FileManagerProps) {
  const [mode, setMode] = useState<"list" | "squares">("list");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDownloaded, setFilterDownloaded] = useState<
    "all" | "downloaded" | "not-downloaded"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<FileType[]>([]);

  const toggleMode = () => setMode(mode === "list" ? "squares" : "list");
  useEffect(() => setFiles(data || []), [data]);
  const toggleSort = () => {
    if (sortBy === "name") {
      setSortBy("size");
    } else {
      setSortBy("name");
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    const finalArray = isSearchFilter
      ? files
          .filter((file) => {
            if (file.isDownloaded == undefined) return true;
            if (filterDownloaded === "downloaded") return file.isDownloaded;
            if (filterDownloaded === "not-downloaded")
              return !file.isDownloaded;
            return true;
          })
          .filter((file) =>
            file.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort((a, b) => {
            if (sortBy === "name") {
              return sortOrder === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            } else {
              const sizeA = a.size || 0;
              const sizeB = b.size || 0;
              return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
            }
          })
      : files;
    return isSearchFilter
      ? finalArray
          .filter((file) => isFolder(file) || isFolderShortcut(file))
          .concat(
            finalArray.filter(
              (file) => !isFolder(file) && !isFolderShortcut(file)
            )
          )
      : files;
  }, [files, filterDownloaded, isSearchFilter, searchTerm, sortBy, sortOrder]);

  return (
    <div
      className="w-full overflow-hidden bg-white rounded-lg"
      data-tauri-drag-region
    >
      <div className="p-4 pt-2 " data-tauri-drag-region>
        {children}
        <div
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          data-tauri-drag-region
        >
          {/* Search and Sort */}
          {isSearchFilter && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-600"
              />
              <Button
                onClick={toggleSort}
                variant="outline"
                className="whitespace-nowrap bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                Sort by {sortBy === "name" ? "Name" : "Size"}
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Filter and Toggle View */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isSearchFilter && (
              <Select
                value={filterDownloaded}
                onValueChange={(
                  value: "all" | "downloaded" | "not-downloaded"
                ) => setFilterDownloaded(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px] rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-600">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="downloaded">Downloaded</SelectItem>
                  <SelectItem value="not-downloaded">Not Downloaded</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Toggle View Button */}
            {isToggle && (
              <Button
                onClick={toggleMode}
                variant="outline"
                className="bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                {mode === "list" ? (
                  <GridIcon className="h-4 w-4" />
                ) : (
                  <ListIcon className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      <BreadcrumbFiles list={idState.list} idDispatch={idDispatch} />
      {/* File List */}
      {isLoading ? (
        <div className="w-[675px] h-[380px] flex items-center justify-center flex-col gap-3 border-t">
          <LoadingComponent />
          <span className="font-semibold">Looking for files...</span>
        </div>
      ) : (
        <FilesList
          queryClient={queryClient}
          filteredAndSortedFiles={filteredAndSortedFiles}
          setFiles={setFiles}
          mode={mode}
          idState={idState}
          idDispatch={idDispatch}
        />
      )}
    </div>
  );
}
