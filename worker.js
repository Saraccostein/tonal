// Los imports de ES modules se evalúan primero (hoisting).
// El polyfill de caches debe estar en un módulo separado que se ejecute
// antes de que WebLLM acceda a caches. Lo hacemos en el mismo scope
// después de que los imports terminan.

import * as webllm from 'https://esm.run/@mlc-ai/web-llm';

// Polyfill: si caches no existe (browser sin Cache API), crear uno en memoria.
// Esto permite que WebLLM arranque y dé un error descriptivo (ej: no WebGPU)
// en lugar del críptico "caches is not defined".
if (typeof self.caches === 'undefined') {
  const store = new Map();
  const fakeCache = {
    match: async () => undefined,
    put: async (req, res) => store.set(typeof req === 'string' ? req : req.url, res),
    delete: async (req) => store.delete(typeof req === 'string' ? req : req.url),
    keys: async () => [],
    addAll: async () => {},
  };
  self.caches = {
    open: async () => fakeCache,
    match: async () => undefined,
    has: async () => false,
    delete: async () => true,
    keys: async () => [],
  };
}

const MODEL_GPU = 'Llama-3.2-3B-Instruct-q4f32_1-MLC';
const MODEL_CPU = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

let engine = null;

function post(type, data) { self.postMessage({ type, ...data }); }

self.onmessage = async ({ data: msg }) => {
  if (msg.type === 'load')     await doLoad();
  if (msg.type === 'generate') await doGenerate(msg.messages);
  if (msg.type === 'cancel' && engine) engine.interruptGenerate();
};

async function tryLoad(modelId, label) {
  post('progress', { text: `Iniciando ${label}…`, sub: 'Primera descarga queda en caché.', pct: 2, compiling: false });
  engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: (r) => {
      const pct = Math.min(Math.round((r.progress || 0) * 90) + 2, 92);
      post('progress', { text: r.text || 'Cargando…', sub: '', pct, compiling: r.progress > 0 && r.progress < 1 });
    }
  });
  post('loaded', { badge: label });
}

async function doLoad() {
  if (!navigator.gpu) {
    post('load_error', { message: 'Tu navegador no soporta WebGPU. Usa la API Key de Claude (botón ⚙).' });
    return;
  }
  try { await tryLoad(MODEL_GPU, 'Llama 3.2 3B · GPU'); return; } catch(e) {}
  try {
    await tryLoad(MODEL_CPU, 'Llama 3.2 1B · GPU');
  } catch(err) {
    post('load_error', { message: err.message });
  }
}

async function doGenerate(messages) {
  try {
    const stream = await engine.chat.completions.create({
      messages, stream: true, temperature: 0.75, max_tokens: 500,
    });
    for await (const chunk of stream) {
      const t = chunk.choices[0]?.delta?.content;
      if (t) post('token', { token: t });
    }
    post('gen_done', {});
  } catch(err) {
    if (err.message?.includes('interrupted') || err.message?.includes('abort')) {
      post('gen_done', {});
    } else {
      post('gen_error', { message: err.message });
    }
  }
}
