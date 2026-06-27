const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "public");
const staticFiles = ["index.html", "styles.css", "app.js"];

async function build() {
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });

  await Promise.all(
    staticFiles.map((file) => fs.copyFile(path.join(root, file), path.join(output, file)))
  );

  console.log(`OurCFO static build ready: ${staticFiles.length} files copied to public/`);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
