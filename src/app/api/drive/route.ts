import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function GET(request:NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const auth = new google.auth.GoogleAuth({
    apiKey: process.env.GOOGLE_API_KEY, // Use your API key
  });

  const driveService = google.drive({ version: "v3", auth });

  try {
    const response = await driveService.files.list({
      q: `'${id}' in parents and trashed = false`, // Filter for files in the specific folder
      fields: "files(id, name, mimeType,size, webContentLink)",
    });

    return new Response(JSON.stringify(response.data.files), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return new Response("Failed to fetch files", { status: 500 });
  }
}
