# ============================================
# Portail SPI Cam - Script de démarrage complet
# ============================================

Write-Host "🚀 Démarrage de Portail SPI Cam..." -ForegroundColor Green

# 1. Vérifier si Docker est lancé
Write-Host "📦 Vérification de Docker..." -ForegroundColor Cyan
docker ps > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas démarré. Veuillez lancer Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Lancer les conteneurs
Write-Host "🐳 Démarrage des conteneurs..." -ForegroundColor Cyan
docker-compose up -d

# 3. Attendre que PostgreSQL soit prêt
Write-Host "⏳ Attente de PostgreSQL..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
$connected = $false

while ($attempt -lt $maxAttempts -and -not $connected) {
    $attempt++
    try {
        $result = docker exec spi-cam-postgres pg_isready -U spi_cam -d portail_spi_cam 2>$null
        if ($result -match "accepting connections") {
            $connected = $true
            Write-Host "✅ PostgreSQL est prêt !" -ForegroundColor Green
        }
    } catch {
        Start-Sleep -Seconds 1
    }
    if (-not $connected) {
        Start-Sleep -Seconds 1
    }
}

if (-not $connected) {
    Write-Host "❌ PostgreSQL n'a pas démarré à temps" -ForegroundColor Red
    exit 1
}

# 4. Installer les dépendances
Write-Host "📥 Installation des dépendances..." -ForegroundColor Cyan
npm install

# 5. Générer le client Prisma
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Cyan
npx prisma generate

# 6. Créer les tables
Write-Host "🗄️ Création des tables..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss

# 7. Seeder les utilisateurs
Write-Host "🌱 Création des utilisateurs de test..." -ForegroundColor Cyan
node scripts/seed-users.js

# 8. Lancer le serveur
Write-Host "🚀 Lancement du serveur..." -ForegroundColor Green
Write-Host ""
Write-Host "📌 Accès :" -ForegroundColor Yellow
Write-Host "   Portail public : http://localhost:3000" -ForegroundColor White
Write-Host "   Login          : http://localhost:3000/login" -ForegroundColor White
Write-Host "   pgAdmin        : http://localhost:5050" -ForegroundColor White
Write-Host ""
Write-Host "👤 Comptes de test :" -ForegroundColor Yellow
Write-Host "   superadmin@spi-cam.cm / SpiCam2026! (SUPER_ADMIN)" -ForegroundColor White
Write-Host "   admin@spi-cam.cm / SpiCam2026! (ADMIN)" -ForegroundColor White
Write-Host "   agent1@spi-cam.cm / SpiCam2026! (AGENT_SAISIE)" -ForegroundColor White
Write-Host ""

npm run dev
