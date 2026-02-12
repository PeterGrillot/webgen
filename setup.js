const fs = require("fs");
const path = require("path");

const exampleDir = path.join(__dirname, "../examples");

if (fs.existsSync(exampleDir)) {
  // Optionally remove .git directory
  const gitDir = path.join(__dirname, "../.git");
  if (fs.existsSync(gitDir)) {
    fs.rmdirSync(gitDir, { recursive: true });
  }

  // Optionally rename the project folder
  const newDir = path.join(__dirname, "../webgen-clean");
  fs.renameSync(path.join(__dirname, "../webgen"), newDir);
  console.log("Project setup complete. You can now use the library.");
} else {
  console.log("No examples found. You can use the library directly.");
}
