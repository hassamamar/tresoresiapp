"use client";

import React, { useContext, useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download } from "lucide-react";
import { AppContext } from "@/app/_context/appContext";
import { invoke } from "@tauri-apps/api/core";

export interface DownloadItem {
  id: string;
  name: string;
  mimeType:string,
  progress: number;
  path: string[];
  ids: string[];
}

const DownloadItem: React.FC<DownloadItem> = ({
  name,
  progress,
  path,
}: DownloadItem) => {
  const truncatedName =
    name && name.length > 20
      ? name.slice(0, 20) + "'...'"
      : name || "'Unnamed file'";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{truncatedName}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {path || "'Unknown path'"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{progress}%</span>
            <Progress value={progress} className="w-[60px]" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{name || "'Unnamed file'"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export function DownloadPopover() {
  const context = useContext(AppContext);
  // set the app to loaded, so the backend emits the download list
  useEffect(() => {
    if (!context?.appState.loaded.value) {
      context?.appActions.onDownloadsChange((newDownloads) => {
        setDownloads(newDownloads);
      });
      invoke("loaded");
      context?.appState.loaded.set(true);
    }
  });

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  console.log("downloads :");
  console.log(downloads);
  return (
    <Popover>
      <PopoverTrigger className="bg-white text-black flex items-center hover:bg-white bg-opacity-70 border border-gray-300 hover:bg-opacity-100 mt-5 px-3 py-1 rounded-xl">
        <>
          <Download className="mr-2 h-4 w-4 rounded-3xl" />
          Downloads
        </>
      </PopoverTrigger>
      <PopoverContent side="right" className="w-[300px] p-4 ">
        <div className="space-y-2">
          <h3 className="font-medium leading-none">Downloads</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your current downloads.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {downloads.map((item) => (
            <DownloadItem key={item.id} {...item} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
