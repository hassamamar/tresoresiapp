"use client"
import { useReducer } from "react";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import FileManager, { IdStateType, OnlineAction } from "./FileManager";
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";

// Define the action type with appropriate payloads for each action


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

export default function TresorDrive() {
  const [idState, idDispatch] = useReducer(reducer, initialState);
  const { isLoading, data } = useQuery({
    queryKey: [idState.id],
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/drive`, {
          params: { id: idState.id },
        });
        console.log(res.data);
        return res.data;
      } catch (error) {
        console.log(error);
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
          <span className="opacity-50 text-2xl font-medium">(offline)</span>
        </h1>
        <Link href="/drive/online">
          {" "}
          <Button
            className="font-bold mb-7 flex gap-2 items-center selectDisable "
            variant="outline"
          >
            <GlobeIcon width={18} />
            Go online
          </Button>
        </Link>
      </div>
    </FileManager>
  );
}
