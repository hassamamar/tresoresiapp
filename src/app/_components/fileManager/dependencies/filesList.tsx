import { Button } from "@/components/ui/button";
import { Download, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileType, FileTypeIcon, formatFileSize, MoreButton } from "./more";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Action } from "../main";

const ITEMS_PER_PAGE = 7;
export default function FilesList({
  mode,
  filteredAndSortedFiles,
  setFiles,
  idDispatch,
}: {
  mode: "squares" | "list";
  filteredAndSortedFiles: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
  idDispatch: Dispatch<Action>;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const handleDelete = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isDownloaded: false } : file
      )
    );
  };
  const handleDownload = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isDownloaded: true } : file
      )
    );
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
          {mode == "squares" ? (
            <ScrollArea
              id="squares"
              className=" h-[420px] w-[691px] pl-4 pr-6 border-b"
            >
              <div className={`grid my-4 grid-cols-2 gap-4 `}>
                {filteredAndSortedFiles
                  .filter(
                    (file) =>
                      file.mimeType == "application/vnd.google-apps.folder" ||
                      file.shortcutDetails?.targetMimeType ==
                        "application/vnd.google-apps.folder"
                  )
                  .map((file) => (
                    <Button
                      key={file.id}
                      className={`p-2 border  border-gray-300 focus:bg-[#C2E7FF] hover:bg-gray-100 rounded-lg flex items-center justify-between h-12 w-full bg-white `}
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
                              <span className="flex items-start truncate w-48">
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
                          onDownload={() => handleDownload(file.id)}
                          onDelete={() => handleDelete(file.id)}
                        />
                      </div>
                    </Button>
                  ))}
              </div>
              <div className={`grid  grid-cols-4 gap-4 pb-2`}>
                {filteredAndSortedFiles
                  .filter(
                    (file) =>
                      file.mimeType != "application/vnd.google-apps.folder" &&
                      file.shortcutDetails?.targetMimeType !=
                        "application/vnd.google-apps.folder"
                  )
                  .map((file) => (
                    <Button
                      key={file.id}
                      className={`p-2 border focus:bg-[#C2E7FF] border-gray-300 hover:bg-gray-100 rounded-lg flex   flex-col items-center justify-between h-32 w-full bg-white `}
                    >
                      {/* File/Folder Icon and Name */}
                      <div
                        className={`flex flex-col items-center text-center overflow-hidden`}
                      >
                        <div className={` mb-1 flex-shrink-0`}>
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
                            <TooltipTrigger className="   text-sm font-medium ">
                              <span className="truncate w-48 flex items-start">
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
                          onDownload={() => handleDownload(file.id)}
                          onDelete={() => handleDelete(file.id)}
                        />
                      </div>
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            paginatedFiles.map((file, ind, array) => (
              <Button
                key={file.id}
                className={`p-2 rounded-none shadow-none border border-t-0 border-gray-300 focus:bg-[#C2E7FF] hover:bg-gray-100  flex items-center justify-between h-12  border-x-0  ${
                  ind == array.length - 1 && "border-b-0"
                }
                    } w-full bg-white `}
                onDoubleClick={() => {
                  if (
                    file.mimeType == "application/vnd.google-apps.folder" ||
                    file.shortcutDetails?.targetMimeType ==
                      "application/vnd.google-apps.folder"
                  )
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
                  <div className="flex-1">
                    <Tooltip>
                      <TooltipTrigger className="text-black text-base font-medium overflow-hidden ">
                        <span className="flex items-start truncate w-48">
                          {file.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{file.name}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* File/Folder Actions */}
                <div className={`flex items-center gap-3 `}>
                  {file.mimeType != "application/vnd.google-apps.folder" &&
                    file.shortcutDetails?.targetMimeType !=
                      "application/vnd.google-apps.folder" && (
                      <div className="text-xs text-gray-500 mr-3">
                        {formatFileSize(file.size)}
                      </div>
                    )}

                  {file.isDownloaded ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Download className="h-4 w-4 text-gray-500 " />
                  )}
                  <MoreButton
                    file={file}
                    onDownload={() => handleDownload(file.id)}
                    onDelete={() => handleDelete(file.id)}
                  />
                </div>
              </Button>
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
