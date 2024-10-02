import {
  ChartColumnIncreasingIcon,
  CloudUploadIcon,
  CopyPlusIcon,
  FileStackIcon,
  FolderClosedIcon,
  FolderOpenIcon,
  FolderSearchIcon,
  HouseIcon,
  LibraryBigIcon,
  SearchIcon,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

export default function NavMenu() {
  return (
    <>
      <div className="relative flex flex-col justify-between items-center w-40 text-gray-700 bg-white overflow-hidden border-r pb-10">
        <div className="relative z-10 flex flex-col items-center w-full px-2 mt-3">
          <Link
            className="flex items-center w-full px-3 mt-3 gap-3 mb-1 "
            href="#"
          >
            <Image src="/logoTxt.webp" alt="logo" width={110} height={90} />
          </Link>
          <div className="flex flex-col items-center w-full mt-3 border-t border-gray-300">
            <Link
              className="flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-300"
              href="#"
            >
              <HouseIcon />
              <span className="ml-2 text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              className="flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-300"
              href="#"
            >
              <Image src="/googleDrive2.png" alt="" width={20} height={20} className="mr-1"/>
              <span className="ml-2 text-sm font-medium">Drive</span>
            </Link>
            <Link
              className="flex items-center w-full h-12 px-3 mt-2 bg-gray-300 rounded"
              href="#"
            >
              <LibraryBigIcon />
              <span className="ml-2 text-sm font-medium">Library</span>
            </Link>
            <Link
              className="flex items-center w-full h-12 px-3 mt-2 rounded hover:bg-gray-300"
              href="#"
            >
              <CloudUploadIcon />
              <span className="ml-2 text-sm font-medium">Share</span>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 opacity-80">
          <Image src="/logo.png" alt="logo" width={50} height={25} />
          <p className="font-bold text-sm font-sans">CSE Club</p>
        </div>
        {/* Background Image */}
        <Image
          src="/background.png"
          alt="logo"
          layout="fill" // Use layout fill to make it behave like a background
          className="absolute inset-0 object-cover z-0 scale-150  transform  opacity-5"
        />
      </div>
    </>
  );
}
