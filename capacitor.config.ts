import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biosense.iot',
  appName: 'BioSense IOT',
  // IMPORTANTE: Asegúrate de que coincida con la carpeta de Next.js
  webDir: 'out', 
  server: {
    // Esto es vital para que la App no bloquee las peticiones al backend
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    // Permite tráfico mixto (HTTP/HTTPS) para los sensores si es necesario
    allowMixedContent: true,
    // Captura errores de red para debugging
    loggingBehavior: 'production'
  }
};

export default config;
