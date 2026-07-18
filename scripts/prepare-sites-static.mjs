import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const assetsDir = path.join(root, ".open-next", "assets");

await mkdir(assetsDir, { recursive: true });

const files = [
  [".next/server/app/index.html", "index.html"],
  [".next/server/app/datenschutz.html", "datenschutz.html"],
  [".next/server/app/impressum.html", "impressum.html"],
  [".next/server/app/_not-found.html", "404.html"],
  [".next/server/app/robots.txt.body", "robots.txt"],
  [".next/server/app/sitemap.xml.body", "sitemap.xml"],
  [".next/server/app/apple-icon.png.body", "apple-icon.png"],
];

for (const [source, destination] of files) {
  await copyFile(path.join(root, source), path.join(assetsDir, destination));
}

const worker = `const pageRoutes = new Map([
  ["/", "/index.html"],
  ["/datenschutz", "/datenschutz.html"],
  ["/datenschutz/", "/datenschutz.html"],
  ["/impressum", "/impressum.html"],
  ["/impressum/", "/impressum.html"],
]);

function assetRequest(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return new Request(url, {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: request.headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/project-inquiries") {
      return Response.json(
        { error: "Das Anfrageformular ist auf dieser Spiegelkopie nicht verfügbar." },
        { status: 503 },
      );
    }

    if (url.pathname === "/_next/image") {
      const source = url.searchParams.get("url");
      if (!source || !source.startsWith("/") || source.startsWith("//")) {
        return new Response("Invalid image URL", { status: 400 });
      }
      return env.ASSETS.fetch(assetRequest(request, source));
    }

    const pageAsset = pageRoutes.get(url.pathname);
    if (pageAsset) {
      return env.ASSETS.fetch(assetRequest(request, pageAsset));
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const notFound = await env.ASSETS.fetch(assetRequest(request, "/404.html"));
    return new Response(notFound.body, {
      status: 404,
      headers: notFound.headers,
    });
  },
};
`;

await writeFile(path.join(root, ".open-next", "worker.js"), worker, "utf8");
