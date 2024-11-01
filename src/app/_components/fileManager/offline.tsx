/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useReducer } from "react";

import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";
import FileManager, { initialState, reducer } from "./FileManager";
import { FileType } from "./dependencies/FileSystem";

// Define the action type with appropriate payloads for each action
export type OfflineAction =
  | { type: "push"; payload: { id: string; name: string } }
  | { type: "goto"; payload: number };

export default function TresorDrive() {
  const [idState, idDispatch] = useReducer(reducer, initialState);
  console.log("querry key here :");
  console.log(idState.list.map((file) => file.name));
  const queryClient = useQueryClient();
  const { isLoading, data } = useQuery({
    queryKey: [idState.id, "offline"],
    staleTime: Infinity,
    queryFn: async () => {
      try {
        console.log("querry executed :");
        console.log("list here :");
        console.log(idState.list);
        const files: FileType[] = await invoke("file_list_offline", {
          folderPathVec: idState.list.map((file) =>
            file.name.replaceAll("/", "-WINSEP-")
          ),
        });
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
      queryClient={queryClient}
      idState={idState as any}
      idDispatch={idDispatch as any}
      isSearchFilter={true}
      isToggle={true}
      data={data as any}
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
