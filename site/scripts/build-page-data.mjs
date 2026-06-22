import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "/Users/ferooz/Documents/Nova Website/site";
const captureDir = join(root, "source-captures");
const assetMap = JSON.parse(await readFile(join(root, "src/data/asset-map.json"), "utf8"));

const files = [
  "purium-source-map-part1.json",
  "purium-source-map-part2.json",
  "purium-source-map-installations.json",
];

const rawPages = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(join(captureDir, file), "utf8"))))).flat();

function routeFor(sourceUrl) {
  const url = new URL(sourceUrl);
  const path = url.pathname;
  const exact = {
    "/en/index.php": "/",
    "/en/sub/company/greeting.php": "/about/ceo",
    "/en/sub/company/overview/summary.php": "/about/company",
    "/en/sub/company/overview/awards.php": "/about/awards",
    "/en/sub/company/overview/corporate.php": "/about/certifications",
    "/en/sub/company/overview/ci.php": "/about/identity",
    "/en/sub/company/overview/location.php": "/about/location",
    "/en/sub/company/vision.php": "/about/vision",
    "/en/sub/company/history.php": "/about/history",
    "/en/sub/technology/list/core.php": "/technology/core",
    "/en/sub/technology/patent.php": "/technology/patents",
    "/en/sub/technology/certification.php": "/technology/certifications",
    "/en/sub/technology/score.php": "/technology/test-reports",
    "/en/sub/product/intro.php": "/products/overview",
    "/en/sub/product/lineup/purpose.php": "/products/lineup",
    "/en/sub/product/standard/general.php": "/products/specifications/large",
    "/en/sub/product/standard/slim.php": "/products/specifications/small",
    "/en/sub/product/standard/walk.php": "/products/specifications/walk-through",
    "/en/sub/product/standard/advert.php": "/products/specifications/advertising",
    "/en/sub/product/standard/composition.php": "/products/package",
    "/en/sub/product/portfolio.php": "/products/portfolio",
    "/en/sub/product/supplies.php": "/products/supplies",
    "/en/sub/product/inquiry.php": "/contact/purchase",
    "/en/sub/service/installation.php": "/services/delivery",
    "/en/sub/service/care.php": "/services/care",
    "/en/sub/service/request.php": "/contact/service",
    "/en/sub/sustainability/esg.php": "/sustainability/esg",
    "/en/sub/sustainability/environmental.php": "/sustainability/environment",
    "/en/sub/sustainability/social.php": "/sustainability/social",
    "/en/sub/sustainability/ethics.php": "/sustainability/ethics",
    "/en/sub/promotion/gallery/gallery.php": "/news/gallery",
    "/en/sub/promotion/photo.php": "/news/photos",
    "/en/sub/promotion/video.php": "/news/videos",
    "/en/sub/policy/privacy.php": "/privacy",
  };
  if (exact[path]) return exact[path];
  if (path.includes("/installation/place/example.php")) return `/installations/${url.searchParams.get("cat_no") || "all"}`;
  return path.replace(/^\/en\/sub/, "").replace(/\.php$/, "");
}

function groupFor(route) {
  if (route === "/") return "Home";
  if (route.startsWith("/about")) return "About";
  if (route.startsWith("/technology")) return "Technology";
  if (route.startsWith("/products") || route.startsWith("/installations")) return "Products";
  if (route.startsWith("/services")) return "Services";
  if (route.startsWith("/sustainability")) return "Sustainability";
  if (route.startsWith("/news")) return "Media";
  return "Contact";
}

const excludedMedia = /logo_new|footerIcon|snsIcon|favicon|pointSmall|pointLarge|subVisual|subBg|topBtn|homeIcon|arr_down|inline-svg/i;

const pages = rawPages.map((page) => {
  const route = routeFor(page.sourceUrl);
  const mediaUrls = [
    ...(page.images ?? []).map((image) => image.src),
    ...(page.assetInventory ?? []).filter((asset) => asset.kind === "image").map((asset) => asset.url),
  ];
  const media = [...new Set(mediaUrls)]
    .filter((url) => assetMap[url] && !excludedMedia.test(url))
    .map((url) => ({ source: url, local: assetMap[url] }));
  const headings = (page.h ?? []).filter((heading) => !/^(CUSTOMER SERVICE|PURIUM)$/i.test(heading.trim()));
  const category = groupFor(route);

  return {
    route,
    category,
    eyebrow: headings[0] || category.toUpperCase(),
    title: headings[1] || headings[0] || "PURIUM",
    headings: headings.slice(2),
    paragraphs: page.p ?? [],
    lists: page.lists ?? [],
    tables: page.tables ?? [],
    media,
    sourceUrl: page.sourceUrl,
  };
});

await writeFile(join(root, "src/data/pages.json"), `${JSON.stringify(pages, null, 2)}\n`);
console.log(`Built ${pages.length} page records.`);
