@echo off
cd /d "%~dp0"

echo ============================================
echo  Portail SPI Cam - Demarrage (SQLite)
echo ============================================
echo.

echo [1/5] Installation des dependances...
call npm install
echo.

echo [2/5] Generation du client Prisma...
call npx prisma generate
echo.

echo [3/5] Creation de la base de donnees SQLite...
call npx prisma db push --accept-data-loss
echo.

echo [4/5] Creation des utilisateurs de test...
node scripts/seed-users.js
echo.

echo [5/5] Lancement du serveur...
echo.
echo ============================================
echo  SERVEUR PRET !
echo ============================================
echo.
echo Acces:
echo   - Portail public : http://localhost:3000
echo   - Login          : http://localhost:3000/login
echo.
echo Comptes de test:
echo   - superadmin@spi-cam.cm / SpiCam2026!
echo   - admin@spi-cam.cm / SpiCam2026!
echo   - agent1@spi-cam.cm / SpiCam2026!
echo.
echo Appuyez sur une touche pour lancer...
pause >nul

call npm run dev
pause
