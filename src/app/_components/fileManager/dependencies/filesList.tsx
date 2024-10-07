/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Download, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileType,
  FileTypeIcon,
  formatFileSize,
  isFile,
  isFolder,
  isFolderShortcut,
  MoreButton,
} from "./more";
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OnlineIdStateType, OnlineAction } from "../FileManager";
import { AppContext } from "@/app/_context/appContext";
import { invoke } from "@tauri-apps/api/core";
import { QueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 7;
export default function FilesList({
  mode,
  filteredAndSortedFiles,
  setFiles,
  idDispatch,
  idState,
  queryClient,
}: {
  mode: "squares" | "list";
  filteredAndSortedFiles: any[];
  setFiles: Dispatch<SetStateAction<any[]>>;
  idDispatch: Dispatch<OnlineAction>;
  idState: OnlineIdStateType;
  queryClient: QueryClient;
}) {
  const context = useContext(AppContext);
  const [currentPage, setCurrentPage] = useState(1);
  const handleDelete = async (file: {
    id?: string;
    name: string;
    path: string[];
    mimeType: string;
  }) => {
    if (file.id) {
      setFiles((prevFiles) =>
        prevFiles.map((mapFile) =>
          mapFile.name === file.name
            ? { ...file, isDownloaded: false }
            : mapFile
        )
      );
    } else {
      setFiles((prevFiles) =>
        prevFiles.filter((mapFile) => mapFile.name !== file.name)
      );
    }
    console.log(file);
    queryClient.removeQueries({ queryKey: [...file.path], exact: true });
    if (isFile(file)) {
      await invoke("delete_file", {
        file: { name: file.name, path: file.path },
      });
    } else {
      await invoke("delete_folder", {
        path: file.path.concat(file.name),
      });
    }
  };

  const handleDownload = (file: FileType, path: string[]) => {
    context?.appActions.download({
      id: file.id,
      name: file.name,
      progress: 0,
      path,
    });
  };
  const totalPages = Math.ceil(filteredAndSortedFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = filteredAndSortedFiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  return (
    <>
      <div className={`border-t ${mode == "squares" ? "" : "px-4 h-[337px]"}`}>
        <div
          className={` ${
            mode === "squares"
              ? "flex flex-col gap-4"
              : "grid grid-cols-1 w-[675px]"
          }`}
        >
          {filteredAndSortedFiles.length == 0 && (
            <h1 className="flex items-center justify-center w-full mt-20">
              Nothing found
            </h1>
          )}
          {mode == "squares" ? (
            <ScrollArea
              id="squares"
              className=" h-[420px] w-[691px] pl-4 pr-6 border-b"
            >
              <div className={`grid my-4 grid-cols-2 gap-4 `}>
                {filteredAndSortedFiles
                  .filter((file) => isFolder(file) || isFolderShortcut(file))
                  .map((file, ind) => (
                    <React.Fragment key={ind}>
                      <div
                        className={`p-2 border shadow-sm cursor-pointer  border-gray-300 focus:bg-[#C2E7FF] hover:bg-gray-100 rounded-lg flex items-center justify-between h-12 w-full bg-white `}
                        onDoubleClick={() =>
                          file.shortcutDetails
                            ? idDispatch({
                                type: "push",
                                payload: {
                                  id: file.shortcutDetails.targetId,
                                  name: file.name,
                                },
                              })
                            : idDispatch({
                                type: "push",
                                payload: {
                                  id: file.id,
                                  name: file.name,
                                },
                              })
                        }
                      >
                        {/* File/Folder Icon and Name */}
                        <div className={`flex items-center overflow-hidden`}>
                          <div className={` mr-3 flex-shrink-0 text-black`}>
                            <FileTypeIcon
                              type={
                                file.shortcutDetails
                                  ? file.shortcutDetails.targetMimeType
                                  : file.mimeType
                              }
                            />
                          </div>
                          <div className={` min-w-0 flex-1`}>
                            <Tooltip>
                              <TooltipTrigger className="text-black   text-base font-medium ">
                                <span className="flex items-start truncate w-48 ">
                                  {file.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{file.name}</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* File/Folder Actions */}
                        <div className={`flex items-center gap-3 text-black `}>
                          {file.isDownloaded ? (
                            <Check className="h-4 w-4 text-green-500 " />
                          ) : (
                            <Download className="h-4 w-4 text-gray-500 " />
                          )}
                          <MoreButton
                            file={file}
                            onDownload={() =>
                              handleDownload(
                                file,
                                idState.list.map(({ name }) => name)
                              )
                            }
                            onDelete={() =>
                              handleDelete({
                                ...file,
                                path: idState.list
                                  .map((file) => file.name)
                                  .concat(isFile(file) ? [] : [file.name]),
                              })
                            }
                            onOpen={() =>
                              invoke("open_file", {
                                file: {
                                  name: file.name,
                                  path: idState.list.map((file) => file.name),
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
              </div>
              <div className={`grid  grid-cols-4 gap-4 pb-2`}>
                {filteredAndSortedFiles
                  .filter((file) => !isFolder(file) && !isFolderShortcut(file))
                  .map((file, ind) => (
                    <React.Fragment key={ind}>
                      <div
                        className={`p-2 border focus:bg-[#C2E7FF] border-gray-300 hover:bg-gray-100 rounded-lg flex   flex-col items-center justify-between h-32 w-full bg-white `}
                      >
                        {/* File/Folder Icon and Name */}
                        <div
                          className={`flex flex-col items-center text-center overflow-hidden`}
                        >
                          <div className={` mb-1 flex-shrink-0 text-black`}>
                            <FileTypeIcon
                              type={
                                file.shortcutDetails
                                  ? file.shortcutDetails.targetMimeType
                                  : file.mimeType
                              }
                            />
                          </div>
                          <div className={`text-center min-w-0 flex-1`}>
                            <Tooltip>
                              <TooltipTrigger className="text-sm font-medium">
                                <span className="inline-block truncate w-32  overflow-hidden text-black">
                                  {file.name}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{file.name}</TooltipContent>
                            </Tooltip>

                            <div className="text-xs text-gray-500 mr-3 mt-1">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>

                        {/* File/Folder Actions */}
                        <div className={`flex items-center gap-3  mt-1 `}>
                          {file.isDownloaded ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Download className="h-4 w-4 text-gray-500 " />
                          )}
                          <MoreButton
                            file={file}
                            onDownload={() => {
                              handleDownload(
                                file,
                                idState.list.map(({ name }) => name)
                              );
                              queryClient.removeQueries({
                                queryKey: [...file.path],
                                exact: true,
                              });
                            }}
                            onDelete={() => {
                              queryClient.removeQueries({
                                queryKey: [...file.path],
                                exact:true
                              });
                              handleDelete({
                                ...file,
                                path: idState.list
                                  .map((file) => file.name)
                                  .concat(isFile(file) ? [] : [file.name]),
                              });
                            }}
                            onOpen={() =>
                              invoke("open_file", {
                                file: {
                                  name: file.name,
                                  path: idState.list.map((file) => file.name),
                                },
                              })
                            }
                          />
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            paginatedFiles.map((file, ind, array) => (
              <div
                key={ind}
                className={`p-2 rounded-none shadow-none border border-t-0 border-gray-300 focus:bg-[#C2E7FF] hover:bg-gray-100  flex items-center justify-between h-12  border-x-0  ${
                  ind == array.length - 1 && "border-b-0"
                }
                    } w-full bg-white `}
                onDoubleClick={() => {
                  if (isFolder(file) || isFolderShortcut(file))
                    if (file.shortcutDetails)
                      idDispatch({
                        type: "push",
                        payload: {
                          id: file.shortcutDetails.targetId,
                          name: file.name,
                        },
                      });
                    else
                      idDispatch({
                        type: "push",
                        payload: {
                          id: file.id,
                          name: file.name,
                        },
                      });
                }}
              >
                {/* File/Folder Icon and Name */}
                <div className={`flex items-center overflow-hidden text-black`}>
                  <div className={`mr-3 flex-shrink-0`}>
                    <FileTypeIcon
                      type={
                        file.shortcutDetails
                          ? file.shortcutDetails.targetMimeType
                          : file.mimeType
                      }
                    />
                  </div>
                  <div className="flex-1 flex items-start justify-start">
                    <Tooltip>
                      <TooltipTrigger className="text-sm font-medium">
                        <span className="inline-block truncate w-96  overflow-hidden text-black text-left">
                          {file.name}
                        </span>
                      </TooltipTrigger>

                      <TooltipContent>{file.name}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* File/Folder Actions */}
                <div className={`flex items-center gap-3 `}>
                  {!isFolder(file) && !isFolderShortcut(file) && (
                    <div className="text-xs text-gray-500 mr-3">
                      {formatFileSize(file.size)}
                    </div>
                  )}
                  {isFile(file) && (
                    <>
                      {file.isDownloaded ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Download className="h-4 w-4 text-gray-500 " />
                      )}
                    </>
                  )}

                  <MoreButton
                    file={file}
                    onDownload={() =>
                      handleDownload(
                        file,
                        idState.list.map(({ name }) => name)
                      )
                    }
                    onDelete={() =>
                      handleDelete({
                        ...file,
                        path: idState.list
                          .map((file) => file.name)
                          .concat(isFile(file) ? [] : [file.name]),
                      })
                    }
                    onOpen={() =>
                      invoke("open_file", {
                        file: {
                          name: file.name,
                          path: idState.list.map((file) => file.name),
                        },
                      })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {mode == "list" && (
        <div className="p-4 pt-0 border-t flex items-center justify-between">
          <span className="text-sm pt-2 text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="icon"
              className="h-8 w-8 mt-3 bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="outline"
              size="icon"
              className="h-8 w-8 mt-3 bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
