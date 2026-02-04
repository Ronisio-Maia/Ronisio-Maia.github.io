import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "..", "data.db");

const db = new Database(dbPath);

const runSqlFile = (relativePath) => {
  const sqlPath = path.join(__dirname, "..", relativePath);
  const sql = fs.readFileSync(sqlPath, "utf8");
  db.exec(sql);
};

const initialize = () => {
  runSqlFile("sql/schema.sql");
};

initialize();

export default db;
