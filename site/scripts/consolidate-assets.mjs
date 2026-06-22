import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const captureRoot = "/var/folders/t5/wnmxlcs56t996rq05ktsr4ph0000gq/T/nova-purium-captures";
const projectRoot = "/Users/ferooz/Documents/Nova Website/site";
const index = JSON.parse(await readFile(join(captureRoot, "bundle-index.json"), "utf8"));
const assetMap = {};

async function consolidate(entries, collection) {
  const target = join(projectRoot, "public", "media", collection);
  await mkdir(target, { recursive: true });

  for (const entry of entries) {
    for (const asset of entry.assets ?? []) {
      if (!asset.path || asset.kind === "stylesheet") continue;
      const extension = extname(asset.path) || extname(new URL(asset.url).pathname) || ".bin";
      const readable = basename(new URL(asset.url, "https://assets.local").pathname, extension)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .slice(0, 64) || asset.id;
      const filename = `${readable}-${asset.id}${extension}`;
      const publicPath = `/media/${collection}/${filename}`;
      if (!assetMap[asset.url]) {
        await copyFile(asset.path, join(target, filename));
        assetMap[asset.url] = publicPath;
      }
    }
  }
}

await consolidate(index.purium, "purium");
await consolidate([index.nova], "nova");

const captureTarget = join(projectRoot, "source-captures");
await mkdir(captureTarget, { recursive: true });
const captureFiles = await readdir(captureRoot);
for (const filename of captureFiles) {
  if (
    filename.endsWith(".json") ||
    filename === "purium-home-desktop.png" ||
    filename === "nova-current-desktop.png" ||
    filename === "company-greeting-desktop.png" ||
    /technology-list-core-php-desktop-0\.png$/.test(filename) ||
    /product-intro-php-desktop-0\.png$/.test(filename) ||
    /product-standard-general-php-desktop-0\.png$/.test(filename)
  ) {
    await copyFile(join(captureRoot, filename), join(captureTarget, filename));
  }
}

await mkdir(join(projectRoot, "src", "data"), { recursive: true });
await writeFile(join(projectRoot, "src", "data", "asset-map.json"), `${JSON.stringify(assetMap, null, 2)}\n`);
console.log(`Consolidated ${Object.keys(assetMap).length} unique media assets.`);
