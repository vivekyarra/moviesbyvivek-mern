import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const apiKey =
  process.env.OMDB_API_KEY ||
  process.env.OMDB_KEY ||
  process.argv.find((arg) => arg.startsWith("--key="))?.split("=")[1];

if (!apiKey) {
  console.error("Missing OMDB_API_KEY. Example:");
  console.error("  OMDB_API_KEY=your_key node scripts/fetch-posters.mjs");
  process.exit(1);
}

const movies = require(path.join(rootDir, "server", "src", "data", "movies.js"));
const postersDir = path.join(rootDir, "client", "public", "posters");

async function ensureDir() {
  await fs.mkdir(postersDir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image download failed: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function downloadPoster(movie) {
  const posterPath = movie.poster || "";
  const filename = posterPath.split("/").pop();
  if (!filename) return { status: "skip", reason: "No poster path" };

  const outputPath = path.join(postersDir, filename);
  if (await fileExists(outputPath)) {
    return { status: "skip", reason: "Already exists" };
  }

  const query = new URLSearchParams({
    t: movie.title,
    type: "movie",
    apikey: apiKey,
  });

  const data = await fetchJson(`http://www.omdbapi.com/?${query.toString()}`);
  if (data.Response === "False" || !data.Poster || data.Poster === "N/A") {
    return { status: "missing", reason: data.Error || "Poster not found" };
  }

  const buffer = await fetchBuffer(data.Poster);
  await fs.writeFile(outputPath, buffer);
  return { status: "saved", path: outputPath };
}

async function run() {
  await ensureDir();
  console.log(`Downloading ${movies.length} posters to ${postersDir}`);

  for (const movie of movies) {
    try {
      const result = await downloadPoster(movie);
      if (result.status === "saved") {
        console.log(`✅ ${movie.title} -> ${path.basename(result.path)}`);
      } else {
        console.log(`⚠️  ${movie.title}: ${result.reason}`);
      }
    } catch (err) {
      console.log(`❌ ${movie.title}: ${err.message}`);
    }
  }
}

run();
