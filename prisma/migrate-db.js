const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

function runSql(sql) {
  try {
    execSync(`sqlite3 "${dbPath}" "${sql}"`, { stdio: "inherit" });
    return true;
  } catch (e) {
    console.log(`[INFO] SQL skipped or failed: ${sql}`);
    return false;
  }
}

async function main() {
  console.log("[MIGRATE] Checking database...");

  if (!fs.existsSync(dbPath)) {
    console.log("[MIGRATE] Database not found, creating...");
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    return;
  }

  // 1. Check if table 'entreprise' exists and 'Entreprise' does not
  try {
    execSync(`sqlite3 "${dbPath}" "SELECT 1 FROM entreprise LIMIT 1;"`, { stdio: "pipe" });
    console.log("[MIGRATE] Table 'entreprise' found, renaming to 'Entreprise'...");
    runSql("ALTER TABLE entreprise RENAME TO Entreprise;");
  } catch (e) {
    console.log("[MIGRATE] Table 'entreprise' not found or already renamed.");
  }

  // 2. Check if 'isActive' column exists in User
  try {
    execSync(`sqlite3 "${dbPath}" "SELECT isActive FROM User LIMIT 1;"`, { stdio: "pipe" });
    console.log("[MIGRATE] Column 'isActive' already exists in User.");
  } catch (e) {
    console.log("[MIGRATE] Adding 'isActive' to User...");
    runSql("ALTER TABLE User ADD COLUMN isActive BOOLEAN DEFAULT 1;");
  }

  // 3. Check if Production table exists
  try {
    execSync(`sqlite3 "${dbPath}" "SELECT 1 FROM Production LIMIT 1;"`, { stdio: "pipe" });
    console.log("[MIGRATE] Table 'Production' already exists.");
  } catch (e) {
    console.log("[MIGRATE] Creating Production table...");
    runSql(`CREATE TABLE Production (
      id TEXT PRIMARY KEY,
      entrepriseId TEXT NOT NULL,
      annee INTEGER NOT NULL,
      trimestre INTEGER NOT NULL,
      productionPhysique REAL,
      chiffreAffaires REAL,
      effectifs INTEGER,
      investissements REAL,
      commentaire TEXT,
      statut TEXT NOT NULL DEFAULT 'EN_ATTENTE',
      saisiePar TEXT NOT NULL,
      validePar TEXT,
      dateSaisie DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      dateValidation DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(entrepriseId, annee, trimestre)
    );`);
  }

  console.log("[MIGRATE] Done.");
}

main().catch(console.error);
