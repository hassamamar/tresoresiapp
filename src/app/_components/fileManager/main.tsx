import { useState, useMemo, useReducer, useEffect } from "react";
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
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  BreadcrumbFiles,
  FileType,
  LoadingComponent,
} from "./dependencies/more";

// Define the action type with appropriate payloads for each action
export type Action =
  | { type: "push"; payload: { id: string; name: string } }
  | { type: "goto"; payload: number };

// Define the state structure
interface State {
  list: { id: string; name: string }[];
  id: string;
}

// Define the initial state
const initialState: State = {
  list: [{ id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0", name: "Tresor Esi" }],
  id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0",
};

// Define the reducer function
const reducer = (state: State, action: Action): State => {
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
};

export default function FileManager() {
  const [mode, setMode] = useState<"list" | "squares">("list");
  const [sortBy, setSortBy] = useState<"name" | "size">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterDownloaded, setFilterDownloaded] = useState<
    "all" | "downloaded" | "not-downloaded"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [idState, idDispatch] = useReducer(reducer, initialState);
  const { isLoading,data } = useQuery({
    queryKey: [idState.id],
    staleTime:Infinity,
    queryFn: async () => {
      try {
        
        const res = await axios.get(`http://localhost:3000/api/drive`, {
          params: { id: idState.id }
        });
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error);
        return error;
      }
    },
  });
  const [files, setFiles] = useState<FileType[]>([]);

  const toggleMode = () => setMode(mode === "list" ? "squares" : "list");
useEffect(()=>setFiles(data|| []),[data])
  const toggleSort = () => {
    if (sortBy === "name") {
      setSortBy("size");
    } else {
      setSortBy("name");
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    const finalArray = files
      .filter((file) => {
        if (filterDownloaded === "downloaded") return file.isDownloaded;
        if (filterDownloaded === "not-downloaded") return !file.isDownloaded;
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
          const sizeA = a.size;
          const sizeB = b.size;
          return sortOrder === "asc" ? sizeA - sizeB : sizeB - sizeA;
        }
      });
    return finalArray
      .filter(
        (file) =>
          file.mimeType == "application/vnd.google-apps.folder" ||
          file.mimeType == "application/vnd.google-apps.shortcut"
      )
      .concat(
        finalArray.filter(
          (file) =>
            file.mimeType != "application/vnd.google-apps.folder" &&
            file.mimeType != "application/vnd.google-apps.shortcut"
        )
      );
  }, [files, filterDownloaded, searchTerm, sortBy, sortOrder]);

  return (
    <div
      className="w-full overflow-hidden bg-white rounded-lg"
      data-tauri-drag-region
    >
      <div className="p-4 pt-2 " data-tauri-drag-region>
        <h1 className="text-3xl font-bold mb-7 flex gap-2 items-center">
          <Image
            src="/googleDrive2.png"
            alt=""
            width={35}
            height={35}
            className="mr-1"
          />
          Tresor Drive
        </h1>
        <div
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
          data-tauri-drag-region
        >
          {/* Search and Sort */}
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

          {/* Filter and Toggle View */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={filterDownloaded}
              onValueChange={(value: "all" | "downloaded" | "not-downloaded") =>
                setFilterDownloaded(value)
              }
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

            {/* Toggle View Button */}
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
          filteredAndSortedFiles={filteredAndSortedFiles}
          setFiles={setFiles}
          mode={mode}
          idDispatch={idDispatch}
        />
      )}
    </div>
  );
}
