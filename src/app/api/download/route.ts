import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req:NextRequest) {
  const fileId = req.nextUrl.searchParams.get("fileId");

  if (!fileId) {
    return new NextResponse("File ID is required", { status: 400 });
  }

  const googleDriveFileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  try {
    // Streaming response
    const response = await axios.get(googleDriveFileUrl,{
      responseType: "stream", // Stream the file
      onDownloadProgress: (progressEvent) => {
        const total = progressEvent.total;
        const loaded = progressEvent.loaded;
        const progress =total? Math.round((loaded / total) * 100):0;
        console.log(`Download Progress: ${progress}%`);
        // Send progress update using SSE
      },
    });

    // Return the file as a stream response to the client
    const headers = new Headers();
    headers.set("Content-Type", response.headers["content-type"]);
    headers.set(
      "Content-Disposition",
      `attachment; filename="downloaded-file"`
    );

    return new NextResponse(response.data, { headers });
  } catch (error) {
    console.error("Error downloading file:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}
