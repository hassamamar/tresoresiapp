import { Button } from "@/components/ui/button";
import {
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTypeIcon, MoreButton } from "./more";
import { Dispatch, SetStateAction, useState } from "react";
export interface FileType {
  id: number;
  name: string;
  type: string;
  size: string;
  isDownloaded: boolean;
}
const ITEMS_PER_PAGE = 8;
export default function FilesList({
  mode,
  filteredAndSortedFiles,
  setFiles,
}: {
  mode: "squares" | "list";
  filteredAndSortedFiles: FileType[];
  setFiles: Dispatch<SetStateAction<FileType[]>>;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const handleDelete = (id: number) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === id ? { ...file, isDownloaded: false } : file
      )
    );
  };
  const handleDownload = (id: number) => {
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
      <div className={` ${mode == "squares" ? "" : "px-4 h-[384px]"}`}>
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
                  .filter((file) => file.type == "folder")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`p-2 border  border-gray-300 hover:bg-gray-100  active:bg-gray-200 rounded-lg flex ${
                        file.type === "folder"
                          ? "items-center justify-between h-12" // Simplified for folders in squares mode
                          : "flex-col items-center justify-between h-32" // Regular layout for files in squares mode
                      } w-full bg-white `}
                    >
                      {/* File/Folder Icon and Name */}
                      <div
                        className={`flex ${
                          file.type !== "folder"
                            ? "flex-col items-center text-center"
                            : "items-center"
                        } overflow-hidden`}
                      >
                        <div
                          className={`${
                            file.type !== "folder" ? "mb-1" : "mr-3"
                          } flex-shrink-0`}
                        >
                          <FileTypeIcon type={file.type} />
                        </div>
                        <div
                          className={`${
                            file.type !== "folder" ? "text-center" : ""
                          } min-w-0 flex-1`}
                        >
                          <div
                            className={`${
                              file.type !== "folder" ? "text-sm" : "text-base"
                            } font-medium truncate w-48`}
                          >
                            {file.name}
                          </div>
                          {file.type !== "folder" && (
                            <div className="text-xs text-gray-500 mr-3 mt-1">
                              {file.size}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File/Folder Actions */}
                      <div
                        className={`flex items-center gap-3 ${
                          file.type !== "folder" ? "mt-1" : ""
                        }`}
                      >
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
                    </div>
                  ))}
              </div>
              <div className={`grid  grid-cols-4 gap-4 pb-2`}>
                {filteredAndSortedFiles
                  .filter((file) => file.type != "folder")
                  .map((file) => (
                    <div
                      key={file.id}
                      className={`p-2 border border-gray-300 hover:bg-gray-100  active:bg-gray-200 rounded-lg flex ${
                        file.type === "folder"
                          ? "items-center justify-between h-12" // Simplified for folders in squares mode
                          : "flex-col items-center justify-between h-32" // Regular layout for files in squares mode
                      } w-full bg-white `}
                    >
                      {/* File/Folder Icon and Name */}
                      <div
                        className={`flex ${
                          file.type !== "folder"
                            ? "flex-col items-center text-center"
                            : "items-center"
                        } overflow-hidden`}
                      >
                        <div
                          className={`${
                            file.type !== "folder" ? "mb-1" : "mr-3"
                          } flex-shrink-0`}
                        >
                          <FileTypeIcon type={file.type} />
                        </div>
                        <div
                          className={`${
                            file.type !== "folder" ? "text-center" : ""
                          } min-w-0 flex-1`}
                        >
                          <div
                            className={`${
                              file.type !== "folder" ? "text-sm" : "text-base"
                            } font-medium truncate w-28`}
                          >
                            {file.name}
                          </div>
                          {file.type !== "folder" && (
                            <div className="text-xs text-gray-500 mr-3 mt-1">
                              {file.size}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File/Folder Actions */}
                      <div
                        className={`flex items-center gap-3 ${
                          file.type !== "folder" ? "mt-1" : ""
                        }`}
                      >
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
                    </div>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            paginatedFiles.map((file, ind, array) => (
              <div
                key={file.id}
                className={`p-2 border border-t-0 border-gray-300 hover:bg-gray-100 active:bg-gray-200  flex items-center justify-between h-12  border-x-0  ${
                  ind == array.length - 1 && "border-b-0"
                }
                    } w-full bg-white `}
              >
                {/* File/Folder Icon and Name */}
                <div className={`flex items-center overflow-hidden`}>
                  <div className={`mr-3 flex-shrink-0`}>
                    <FileTypeIcon type={file.type} />
                  </div>
                  <div className={` min-w-0 flex-1`}>
                    <div className={`text-base font-medium truncate w-96`}>
                      {file.name}
                    </div>
                  </div>
                </div>

                {/* File/Folder Actions */}
                <div className={`flex items-center gap-3 `}>
                  <div className="text-xs text-gray-500 mr-3">{file.size}</div>

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
