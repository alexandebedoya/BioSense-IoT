#!/bin/bash
# Script para vercel deploy (para Windows usar en Git Bash o WSL)
# Si usas PowerShell, mejor usar: npm install -g vercel && vercel

echo "🚀 Iniciando despliegue en Vercel..."
echo ""
echo "Paso 1: Instalar Vercel CLI"
npm install -g vercel

echo ""
echo "Paso 2: Autenticarse en Vercel (se abrirá el navegador)"
vercel login

echo ""
echo "Paso 3: Desplegar"
vercel

echo ""
echo "✅ ¡Despliegue completado!"
echo "Tu app estará disponible en la URL que te proporcione Vercel"
