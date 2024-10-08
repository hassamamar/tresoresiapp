"use client";
import { useContext, useReducer } from "react";

import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FileManager, { IdStateType, Action } from "./FileManager";
import { AppContext } from "@/app/_context/appContext";
import { FileLib, FSLib } from "./dependencies/FileSystem";

// Define the action type with appropriate payloads for each action

// Define the initial state
const initialState: IdStateType = {
  list: [{ id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0", name: "Tresor Esi" }],
  id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0",
};

// Define the reducer function
const reducer = (state: IdStateType, action: Action): IdStateType => {
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

export default function Library() {
  const context = useContext(AppContext);
  const fsLib = context?.appState.library as FSLib;
  const queryClient = useQueryClient();
  const [idState, idDispatch] = useReducer(reducer, initialState);
  const { isLoading, data } = useQuery({
    queryKey: idState.list,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        console.log("querry executed :");
        console.log("list here :");
        console.log(idState.list);
        const files = fsLib.readFolder(idState.list.map((file) => file.name));
        if (!files) throw Error("Folder doesn't exist");
        files.forEach((file) => (file.isDownloaded = true));
        console.log(files);
        return files;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  });
  return (
    <FileManager
      idState={idState}
      idDispatch={idDispatch}
      isSearchFilter={true}
      isToggle={true}
      data={data as FileLib[]}
      isLoading={isLoading}
      queryClient={queryClient}
    >
      <h1
        className="text-3xl font-bold mb-7 flex gap-2 items-center selectDisable "
        data-tauri-drag-region
      >
        <Image
          src="/googleDrive2.png"
          alt=""
          width={35}
          height={35}
          className="mr-1 selectDisable data-tauri-drag-region"
          data-tauri-drag-region
        />
        Tresor Drive
      </h1>
    </FileManager>
  );
}
