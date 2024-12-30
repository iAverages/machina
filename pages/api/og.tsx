import { ImageResponse } from "@vercel/og";
import { NextApiRequest, NextApiResponse } from "next";
import { Vibrant } from "node-vibrant/node";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { searchParams } = new URL(
      req.url as string,
      "http://localhost:3000",
    );
    const albumArt = searchParams.get("albumArt");
    const artist = searchParams.get("artist");
    const songName = searchParams.get("songName");

    if (!albumArt || !artist || !songName) {
      res.status(400);
      res.send("Missing required parameters");
      return;
    }

    const palette = await Vibrant.from(albumArt).getPalette();
    const baseColor = palette.Vibrant.hex;
    const gradientColor = palette.DarkVibrant.hex;

    const response = new ImageResponse(
      (
        <div
          style={{
            borderRadius: "12px",
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(45deg, ${baseColor}, ${gradientColor})`,
            fontFamily: "system-ui",
            padding: "20px",
          }}
        >
          {/* Album Art */}
          <img
            src={albumArt}
            alt="Album Art"
            style={{
              width: "250px",
              height: "250px",
              marginRight: "30px",
              borderRadius: "12px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          />

          {/* Song Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: "60%",
            }}
          >
            <h1
              style={{
                fontSize: "40px",
                color: "white",
                margin: "0",
              }}
            >
              {songName}
            </h1>
            <h2
              style={{
                fontSize: "32px",
                color: "rgba(255, 255, 255, 0.8)",
                margin: "10px 0",
              }}
            >
              {artist}
            </h2>
          </div>

          {/* Spotify Icon */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="white"
            style={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
            }}
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
      ),
      {
        width: 800,
        height: 300,
      },
    );

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Length", buffer.length.toString());
    res.send(buffer);
  } catch (e: any) {
    console.log(e);
    res.send("error");
  }
}
