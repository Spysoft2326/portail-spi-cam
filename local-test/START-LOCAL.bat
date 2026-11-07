@echo off
REM ============================================================
REM  PORTAIL SPI CAM - LANCEMENT EN LOCAL (MODE TEST)
REM  Base SQLite locale : prisma\local-test.db
REM  N'utilise PAS la base PostgreSQL de Render (.env ignore pour la base)
REM ============================================================
cd /d "%~dp0.."

set DATABASE_URL=file:./local-test.db
if "%PORT%"=="" set PORT=3000
set NEXTAUTH_URL=http://localhost:%PORT%
set NEXTAUTH_SECRET=local-test-secret-not-for-production
set NEXT_PUBLIC_APP_URL=http://localhost:%PORT%

if not exist "prisma\local-test.db" (
  echo Base locale absente : lancement de setup-local.bat...
  call "%~dp0setup-local.bat"
)

REM Le client Prisma doit correspondre au schema SQLite local
call npx prisma generate --schema prisma\schema.local.prisma

echo.
echo  Ouvrez http://localhost:%PORT% dans votre navigateur
echo  Compte : identifiant Spysoft (super administrateur)
echo  Mot de passe provisoire : SpiCam2026! (a changer a la 1re connexion)
echo  Ctrl+C pour arreter.
echo.
call npx next dev -p %PORT%
