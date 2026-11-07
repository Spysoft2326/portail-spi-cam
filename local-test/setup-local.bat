@echo off
REM ============================================================
REM  (Re)cree la base SQLite locale de test avec des donnees fictives.
REM  Efface prisma\local-test.db s'il existe. Ne touche pas Render.
REM ============================================================
cd /d "%~dp0.."

set DATABASE_URL=file:./local-test.db

if exist "prisma\local-test.db" del "prisma\local-test.db"

call npx prisma db push --schema prisma\schema.local.prisma --accept-data-loss
call node prisma\seed-users.js
call node prisma\seed-enterprises-150.js
call node local-test\seed-productions-local.js

echo.
echo Base locale prete : prisma\local-test.db
