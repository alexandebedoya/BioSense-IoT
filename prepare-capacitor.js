#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crear directorio dist si no existe
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copiar archivos estáticos de Next.js
const nextDir = '.next';
const distDir = 'dist';

if (fs.existsSync(nextDir)) {
  // Copiar archivos estáticos
  const staticDir = path.join(nextDir, 'static');
  if (fs.existsSync(staticDir)) {
    copyDir(staticDir, path.join(distDir, '_next', 'static'));
  }

  // Crear index.html básico que redirige a la app
  const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Monitoreo Ambiental IoT</title>
  <script>
    // Redirigir a la app Next.js
    window.location.href = '/';
  </script>
</head>
<body>
  <div id="app">Cargando...</div>
</body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

console.log('✅ Preparación para Capacitor completada');