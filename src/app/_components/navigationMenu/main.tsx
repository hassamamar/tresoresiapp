"use client";
import { open } from "@tauri-apps/plugin-shell";
import { CloudUploadIcon, HouseIcon, LibraryBigIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import axios from "axios";

export default function NavMenu() {
  return (
    <>
      <div className="relative flex flex-col justify-between items-center w-40 text-gray-700 bg-white overflow-hidden border-r pb-10">
        <div className="relative z-10 flex flex-col items-center cursor-pointer w-full px-2 mt-3">
          <div
            onClick={async () => await open("https://tresor.cse.club/")}
            className="flex items-center w-full px-3 mt-6 mb-8 gap-3 "
          >
            <Image
              src="/logoTxt.webp"
              alt="logo"
              width={110}
              height={90}
              className="selectDisable"
            />
          </div>
          <div className="flex flex-col items-center w-full  border-gray-300">
            <MenuItem linkPath="/" icon={<HouseIcon />} label="Dashboard" />
            <MenuItem
              linkPath="/drive"
              icon={
                <Image
                  src="/googleDrive2.png"
                  alt=""
                  width={20}
                  height={20}
                  className="mr-1"
                />
              }
              label="Drive"
            />
            <MenuItem
              linkPath="/library"
              icon={<LibraryBigIcon />}
              label="Library"
            />
            <MenuItem
              linkPath="/share"
              icon={<CloudUploadIcon />}
              label="Share"
            />
          </div>
          <DownloadProgress />
        </div>
        <div
          className="flex flex-col items-center cursor-pointer gap-3 opacity-80 z-10 "
          onClick={async () => await open("https://www.cse.club/")}
        >
          <Image
            src="/logo.png"
            alt="logo"
            width={50}
            height={50}
            className="selectDisable"
          />
          <p className="font-bold text-sm font-sans selectDisable">CSE Club</p>
        </div>
        {/* Background Image */}
        <Image
          src="/background.png"
          alt="logo"
          width={1}
          height={1}
          className="absolute selectDisable inset-0 object-cover z-0 scale-150 transform opacity-10 w-full h-full"
        />
      </div>
    </>
  );
}
const MenuItem = ({
  linkPath,
  icon,
  label,
}: {
  linkPath: string;
  icon: ReactNode;
  label: string;
}) => {
  const path = usePathname();
  const getMenuItemClass = (linkPath: string) =>
    `flex items-center w-full h-12 px-3 mt-2 rounded selectDisable ${
      (linkPath == "/drive" && path.includes(linkPath)) || path == linkPath
        ? "bg-gray-300"
        : "hover:bg-gray-300"
    }`;

  return (
    <Link
      className={getMenuItemClass(linkPath)}
      href={
        linkPath == "/drive"
          ? path.includes("/drive")
            ? "#"
            : "/drive/online"
          : linkPath
      }
    >
      {icon}
      <span className="ml-2 text-sm font-medium selectDisable">{label}</span>
    </Link>
  );
};

function DownloadProgress() {
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileId = "1UMKV89uJOoSoD6wmBMX-huB4wrc66Auo";
  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);

    try {
      const response = await axios.get(`https://drive.google.com/uc`, {
        params: { export: "download", id: fileId },
        withCredentials:true
      });
      console.log(response.data);
      setIsDownloading(false);
    } catch (error) {
      console.error("Error downloading file:", error);
      setIsDownloading(false);
      // Handle error (you might want to set an error state)
    } finally {
      // Reset download state
    }
  };

  return (
    <div>
      <button onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? "Downloading..." : "Download File"}
      </button>
      {isDownloading && (
        <div>
          <div>Progress: {progress}%</div>
          <progress value={progress} max="100" />
        </div>
      )}
    </div>
  );
}
