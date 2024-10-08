/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useReducer } from "react";

import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FileManager, { reducer, initialState,  } from "./FileManager";
import { Button } from "@/components/ui/button";
import { HardDriveIcon } from "lucide-react";
import Link from "next/link";
import { invoke } from "@tauri-apps/api/core";
import { FileType } from "./dependencies/FileSystem";

// Define the initial state


// Define the reducer function

export default function TresorDrive() {
  const queryClient=useQueryClient();
  const [idState, idDispatch] = useReducer(reducer, initialState);
  const { isLoading, data } = useQuery({
    queryKey: [idState.id],
    staleTime: Infinity,
    queryFn: async () => {
      try {
        const res: string = await invoke("file_list", { id: idState.id });
        console.log(JSON.parse(res));
        const files: FileType[] = JSON.parse(res).files;
        for (const file of files) {
          file.isDownloaded = await invoke("file_exist", {
            file: {
              name: file.name,
              path: idState.list.map((file) => file.name),
            },
          });
        }
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
      idState={idState }
      idDispatch={idDispatch as any}
      isSearchFilter={true}
      isToggle={true}
      data={data || []}
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
