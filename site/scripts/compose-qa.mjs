import sharp from "sharp";

const source = await sharp("source-captures/purium-home-desktop.png")
  .extract({ left: 0, top: 0, width: 1265, height: 720 })
  .resize(632, 360)
  .png()
  .toBuffer();
const implementation = await sharp("source-captures/nova-redesign-home-desktop.png")
  .extract({ left: 0, top: 0, width: 1265, height: 720 })
  .resize(632, 360)
  .png()
  .toBuffer();

await sharp({
  create: { width: 1268, height: 360, channels: 4, background: { r: 15, g: 20, b: 22, alpha: 1 } },
})
  .composite([
    { input: source, left: 0, top: 0 },
    { input: implementation, left: 636, top: 0 },
  ])
  .png()
  .toFile("screenshots/home-comparison.png");

console.log("Created screenshots/home-comparison.png");
