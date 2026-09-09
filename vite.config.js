import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Escucha en todas las interfaces, no solo en localhost.
    // Esto suele arreglar el error de WebSocket cuando el proyecto
    // corre dentro de una VM, contenedor, sandbox o se accede
    // desde otro dispositivo en la misma red.
    host: true,
    port: 5173,
    strictPort: true,

    // Si accedes al proyecto a través de un túnel/proxy HTTPS
    // (por ejemplo un enlace de vista previa con "?token=...",
    // Codespaces, StackBlitz, ngrok, etc.), el navegador intenta
    // abrir el WebSocket de HMR directo a localhost:5173, que no
    // existe desde tu punto de vista externo. Descomenta y ajusta
    // estas líneas con el dominio/puerto público que te da esa
    // herramienta:
    //
    // hmr: {
    //   protocol: 'wss',
    //   host: 'tu-dominio-publico.ejemplo.com',
    //   clientPort: 443,
    // },
  },
});
