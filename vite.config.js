import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Minimal dev-time proxy so the frontend never hits OpenAI directly.
// This avoids browser CORS issues and keeps the API key on the server side.
const openAiProxyPlugin = (apiKey) => ({
  name: 'openai-dev-proxy',
  configureServer(server) {
    server.middlewares.use('/api/ai-chat', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      if (!apiKey) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'OpenAI API key missing on dev server.' }));
        return;
      }

      try {
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });

        req.on('end', async () => {
          let payload = {};
          try {
            payload = raw ? JSON.parse(raw) : {};
          } catch (e) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
            return;
          }

          const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          });

          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(text);
        });
      } catch (err) {
        console.error('Proxy error', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }));
      }
    });
  },
});

// Dev-time proxy for Plant.id soil/plant identification API
const soilProxyPlugin = (apiKey, apiUrl) => ({
  name: 'soil-dev-proxy',
  configureServer(server) {
    server.middlewares.use('/api/soil-id', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      if (!apiKey) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Soil API key missing on dev server.' }));
        return;
      }

      try {
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });

        req.on('end', async () => {
          let payload = {};
          try {
            payload = raw ? JSON.parse(raw) : {};
          } catch (e) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid JSON body.' }));
            return;
          }

          const upstream = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Api-Key': apiKey,
            },
            body: JSON.stringify(payload),
          });

          const text = await upstream.text();
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(text);
        });
      } catch (err) {
        console.error('Soil proxy error', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Soil proxy error', detail: err.message }));
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const aiKey =
    env.VITE_OPENAI_API_KEY ||
    env.REACT_APP_OPENAI_API_KEY ||
    env.OPENAI_API_KEY ||
    '';
  const soilKey =
    env.VITE_SOIL_API_KEY ||
    env.VITE_PLANT_ID_API_KEY ||
    env.PLANT_ID_API_KEY ||
    env.SOIL_API_KEY ||
    '';
  const soilUrl =
    env.VITE_SOIL_API_URL ||
    env.VITE_PLANT_ID_URL ||
    env.PLANT_ID_API_URL ||
    env.SOIL_API_URL ||
    'https://api.plant.id/v3/identification';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Only attach the proxy when a key is available so dev stays safe.
      openAiProxyPlugin(aiKey),
      soilProxyPlugin(soilKey, soilUrl),
    ],
    server: {
      // Optional: allow cross-origin during dev if you open the app from a different port
      cors: {
        origin: '*',
      },
    },
  };
})
