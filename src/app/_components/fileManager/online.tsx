"use client";
import { useReducer } from "react";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import FileManager, { IdStateType, OnlineAction } from "./FileManager";
import { Button } from "@/components/ui/button";
import { HardDriveIcon } from "lucide-react";
import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";

// Define the initial state
const initialState: IdStateType = {
  list: [{ id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0", name: "Tresor Esi" }],
  id: "1akzOIDlH3IjZY-hDVyW5fb8Jwg12zdi0",
};

// Define the reducer function
const reducer = (state: IdStateType, action: OnlineAction): IdStateType => {
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
function sleep(ms:number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export default function TresorDrive() {
  const [idState, idDispatch] = useReducer(reducer, initialState);
  const { isLoading, data } = useQuery({
    queryKey: [idState.id],
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const res: string = await invoke("file_list", { id: idState.id });
        console.log(JSON.parse(res));
        return JSON.parse(res).files;
      } catch (error) {
        return error;
      }
    },
  });

  return (
    <FileManager
      idState={idState}
      idDispatch={idDispatch}
      isSearchFilter={true}
      isToggle={true}
      data={data}
      isLoading={isLoading}
    >
      <div className="flex justify-between mt-3">
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
        <Link href="/drive/offline">
          {" "}
          <Button
            className="font-bold mb-7 flex gap-2 items-center selectDisable "
            variant="outline"
          >
            <HardDriveIcon width={18} />
            Go offline
          </Button>
        </Link>
      </div>
    </FileManager>
  );
}
