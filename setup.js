const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const baseDir = __dirname;
const webgenDir = path.join(baseDir, "./webgen");

if (!fs.existsSync(webgenDir)) {
  console.log("webgen folder not found. Setup may have already been run.");
  process.exit(0);
}

try {
  // Delete root package.json, README.md, .git, and setup.js
  const filesToDelete = [
    path.join(baseDir, "package.json"),
    path.join(baseDir, "README.md"),
    path.join(baseDir, ".git"),
    path.join(baseDir, "setup.js"),
  ];

  filesToDelete.forEach((file) => {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        fs.rmSync(file, { recursive: true, force: true });
      } else {
        fs.unlinkSync(file);
      }
    }
  });

  // Copy everything from webgen to base directory
  copyDirRecursive(webgenDir, baseDir);

  // Delete webgen folder
  fs.rmSync(webgenDir, { recursive: true, force: true });

  // Ask if user wants to clear pages folder
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "\nClear out the pages folder with examples? (y/n): ",
    (answer) => {
      rl.close();

      if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
        const pagesDir = path.join(baseDir, "pages");
        if (fs.existsSync(pagesDir)) {
          fs.rmSync(pagesDir, { recursive: true, force: true });
          fs.mkdirSync(pagesDir);
        }
      }

      // Run npm install
      console.log("Running npm install...");
      execSync("npm install", { stdio: "inherit", cwd: baseDir });

      console.log("\n✓ Setup complete! Library is ready to use.");
    },
  );
} catch (error) {
  console.error("Setup failed:", error.message);
  process.exit(1);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
