@echo off
REM ============================================================
REM  (Re)cree la base SQLite locale de test.
REM  Efface prisma\local-test.db s'il existe. Ne touche pas Render.
REM  Entreprises : les grandes industries du fichier MINMIDT si
REM  local-test\data\ge-gi-classe.csv existe, sinon les donnees de demonstration.
REM ============================================================
cd /d "%~dp0.."

set DATABASE_URL=file:./local-test.db

if exist "prisma\local-test.db" del "prisma\local-test.db"

call npx prisma db push --schema prisma\schema.local.prisma --accept-data-loss
call node prisma\seed-users.js
call node local-test\referentiels-local.js charger
call node local-test\import-ge-gi.js
if errorlevel 2 (
  call node prisma\seed-enterprises-150.js
  call node local-test\referentiels-local.js reclasser
)
call node local-test\seed-productions-local.js

echo.
echo Base locale prete : prisma\local-test.db
