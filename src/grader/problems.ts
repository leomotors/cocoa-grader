import fs from "fs/promises";

export async function loadProblems() {
    await fs.readFile("problems/manifest.json");
}
