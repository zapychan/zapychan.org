import { serve } from "bun";
import index from "./index.html";
import path from "node:path";

let hitCount = Math.floor(Math.random() * 9000) + 1000; // Start with a fun fake count

const publicDir = path.resolve(import.meta.dir, "../public");

const server = serve({
  routes: {
    "/": index,

    "/api/hits": {
      GET() {
        hitCount++;
        return Response.json({ count: hitCount });
      },
    },

    "/api/weather": {
      async GET() {
        try {
          const res = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,weather_code&temperature_unit=fahrenheit",
          );
          const data = await res.json();
          return Response.json(data);
        } catch {
          return Response.json(
            { error: "weather unavailable" },
            { status: 500 },
          );
        }
      },
    },

    "/audio/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },

    "/images/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },

    "/gallery/*": async (req) => {
      const url = new URL(req.url);
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response("Not found", { status: 404 });
    },
  },

  // Fallback: serve index.html for client-side routing
  fetch() {
    return new Response(Bun.file(path.join(import.meta.dir, "index.html")));
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`💖 zapychan.org running at ${server.url}`);
