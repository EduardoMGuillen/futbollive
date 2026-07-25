import sharp from "sharp";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const dir = "public/velada";
fs.mkdirSync(dir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; DondeJuega/1.0)", Accept: "image/*" } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`status ${res.statusCode} ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", async () => {
          try {
            const buf = Buffer.concat(chunks);
            await sharp(buf).resize(400, 400, { fit: "cover" }).png().toFile(dest);
            resolve(dest);
          } catch (e) {
            reject(e);
          }
        });
      },
    );
    req.on("error", reject);
  });
}

async function avatar(slug, initials, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <circle cx="200" cy="200" r="152" fill="rgba(0,0,0,0.25)"/>
    <text x="200" y="225" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="110" font-weight="800" fill="#ffffff">${initials}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(dir, `${slug}.png`));
}

const downloads = [
  ["thegrefg", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/TheGrefg_en_el_torneo_de_p%C3%A1del_de_Ibai_%282021%29.png/500px-TheGrefg_en_el_torneo_de_p%C3%A1del_de_Ibai_%282021%29.png"],
  ["fernanfloo", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Fernanfloo_Creatour_Social_Media_Day.jpg/500px-Fernanfloo_Creatour_Social_Media_Day.jpg"],
  ["samy-rivers", "https://upload.wikimedia.org/wikipedia/commons/f/f2/Samy_Rivers_2023.jpg"],
  ["lit-killah", "https://upload.wikimedia.org/wikipedia/commons/b/bf/Lit_Killah_en_2022_04.jpg"],
  ["ibai-llanos", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Ibai_Llanos_2021.jpg/500px-Ibai_Llanos_2021.jpg"],
];

for (const [slug, url] of downloads) {
  try {
    await download(url, path.join(dir, `${slug}.png`));
    console.log("dl", slug);
  } catch (e) {
    console.log("fail", slug, e.message);
  }
}

const avatars = [
  ["fabiana-sevillano", "FS", ["#e11d48", "#9f1239"]],
  ["la-parce", "LP", ["#f59e0b", "#b45309"]],
  ["clersss", "CL", ["#8b5cf6", "#5b21b6"]],
  ["natalia-mx", "NX", ["#06b6d4", "#0e7490"]],
  ["edu-aguirre", "EA", ["#22c55e", "#15803d"]],
  ["gaston-edul", "GE", ["#3b82f6", "#1d4ed8"]],
  ["marta-diaz", "MD", ["#ec4899", "#be185d"]],
  ["tatiana-kaer", "TK", ["#a855f7", "#6b21a8"]],
  ["viruzz", "VZ", ["#ef4444", "#991b1b"]],
  ["gero-arias", "GA", ["#14b8a6", "#0f766e"]],
  ["alondrissa", "AL", ["#f97316", "#c2410c"]],
  ["angie-velasco", "AV", ["#d946ef", "#a21caf"]],
  ["kidd-keo", "KK", ["#84cc16", "#4d7c0f"]],
  ["roro", "RR", ["#38bdf8", "#0369a1"]],
  ["plex", "PX", ["#fbbf24", "#b45309"]],
  ["illojuan", "IJ", ["#4ade80", "#166534"]],
];

for (const [slug, ini, bg] of avatars) {
  const dest = path.join(dir, `${slug}.png`);
  if (!fs.existsSync(dest)) {
    await avatar(slug, ini, bg);
    console.log("avatar", slug);
  }
}

if (!fs.existsSync(path.join(dir, "thegrefg.png"))) {
  await avatar("thegrefg", "TG", ["#60a5fa", "#1e40af"]);
}

// Ensure logo is square-ish for badges
if (fs.existsSync(path.join(dir, "logo.png"))) {
  await sharp(path.join(dir, "logo.png")).resize(512, 512, { fit: "cover" }).png().toFile(path.join(dir, "logo-512.png"));
}

console.log("files", fs.readdirSync(dir).join(", "));
