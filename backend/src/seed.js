import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedSql = fs.readFileSync(path.join(__dirname, "..", "sql", "seed.sql"), "utf8");

db.exec(seedSql);

console.log("Seed concluído.");
