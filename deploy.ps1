# Script para Vercel deploy en Windows (PowerShell)
# Ejecutar: .\deploy.ps1

Write-Host "🚀 Iniciando despliegue en Vercel..." -ForegroundColor Green
Write-Host ""

Write-Host "Paso 1: Instalar Vercel CLI globalmente" -ForegroundColor Yellow
npm install -g vercel

Write-Host ""
Write-Host "Paso 2: Autenticarse en Vercel (se abrirá el navegador)" -ForegroundColor Yellow
Write-Host "Copia el código de confirmación que verás en pantalla"
vercel login

Write-Host ""
Write-Host "Paso 3: Desplegar la aplicación" -ForegroundColor Yellow
Write-Host "Sigue las instrucciones en pantalla para configurar el despliegue"
vercel

Write-Host ""
Write-Host "✅ ¡Despliegue completado!" -ForegroundColor Green
Write-Host "Tu app estará disponible en la URL que te proporcione Vercel"
Write-Host ""
Write-Host "📱 Para acceder desde móvil, usa la URL de Vercel en el navegador"
Write-Host "🔧 Para cambiar NEXT_PUBLIC_API_URL, ve a Vercel Dashboard > Settings > Environment Variables"
