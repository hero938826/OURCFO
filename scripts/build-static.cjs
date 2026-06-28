const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public");
const staticFiles = ["index.html", "styles.css", "app.js"];
const staticDirs = ["utils"];

async function build() {
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });

  await Promise.all(
    staticFiles.map((file) => fs.copyFile(path.join(root, file), path.join(output, file)))
  );
  await Promise.all(
    staticDirs.map((dir) => fs.cp(path.join(root, dir), path.join(output, dir), { recursive: true }))
  );

  console.log(`OurCFO static build ready: ${staticFiles.length} files and ${staticDirs.length} directories copied to public/`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
