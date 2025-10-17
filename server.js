import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'aknchat' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const {
      AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_API_KEY,
      AZURE_OPENAI_DEPLOYMENT,
      AZURE_OPENAI_API_VERSION
    } = process.env;

    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT) {
      return res.status(500).json({ error: 'Azure OpenAI environment variables are not configured.' });
    }

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const images = Array.isArray(req.body?.images) ? req.body.images : [];
    if (messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const clientModel = typeof req.body?.model === 'string' && req.body.model.trim().length > 0 ? req.body.model.trim() : null;

    // Special routing for the new MODEL deployment on cognitive services domain
    if (clientModel === 'MODEL') {
      const altBase = 'https://akn.cognitiveservices.azure.com';
      const altApiVersion = '2025-01-01-preview';
      const deployment = 'MODEL';
      const endpoint = `${altBase}/openai/deployments/${deployment}/chat/completions?api-version=${altApiVersion}`;

      // For chat completions, map last user message to content array with text + images
      const mapped = messages.map(m => ({ ...m }));
      const lastIdx = mapped.length - 1;
      if (lastIdx >= 0 && mapped[lastIdx].role === 'user' && images.length) {
        const parts = [];
        if (typeof mapped[lastIdx].content === 'string' && mapped[lastIdx].content) {
          parts.push({ type: 'text', text: mapped[lastIdx].content });
        }
        for (const dataUrl of images) {
          parts.push({ type: 'image_url', image_url: { url: dataUrl } });
        }
        mapped[lastIdx].content = parts;
      }

      const maxCompletionTokens = typeof req.body?.max_completion_tokens === 'number'
        ? req.body.max_completion_tokens
        : (typeof req.body?.max_tokens === 'number' ? req.body.max_tokens : 1024);

      const body = { messages: mapped, max_completion_tokens: maxCompletionTokens, stream: false };
      if (typeof req.body?.temperature === 'number' && req.body.temperature === 1) {
        body.temperature = 1;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify(body)
      });

      const text = await response.text();
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Azure OpenAI error', details: text });
      }

      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      const choice = data?.choices?.[0];
      const content = choice?.message?.content
        ?? choice?.messages?.[0]?.content
        ?? (Array.isArray(choice?.content) ? choice.content.find(p => p?.type === 'text')?.text : undefined)
        ?? (typeof data === 'string' ? data : '')
        ?? '';

      return res.json({ content, model: clientModel, usage: data?.usage, raw: data });
    }

    // Default routing: use configured endpoint; Responses API for 2025 versions
    const apiVersion = AZURE_OPENAI_API_VERSION || '2024-05-01-preview';
    const useResponses = apiVersion.startsWith('2025');

    let endpoint;
    let body;
    if (useResponses) {
      endpoint = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, '')}/openai/responses?api-version=${encodeURIComponent(apiVersion)}`;

      const maxOutputTokens = typeof req.body?.max_output_tokens === 'number'
        ? req.body.max_output_tokens
        : (typeof req.body?.max_completion_tokens === 'number' ? req.body.max_completion_tokens : (typeof req.body?.max_tokens === 'number' ? req.body.max_tokens : 1024));

      const input = [{ role: 'system', content: 'You are aknchat, a helpful assistant. Answer in Turkish by default.' }];
      for (const m of messages) {
        if (m.role === 'user') {
          const content = [];
          if (typeof m.content === 'string' && m.content) content.push({ type: 'text', text: m.content });
          for (const dataUrl of images) { content.push({ type: 'input_image', image_url: dataUrl }); }
          input.push({ role: 'user', content });
        } else if (m.role === 'assistant') {
          input.push({ role: 'assistant', content: [{ type: 'output_text', text: m.content }] });
        }
      }

      body = { model: clientModel || AZURE_OPENAI_DEPLOYMENT, input, max_output_tokens: maxOutputTokens };
      if (typeof req.body?.temperature === 'number' && req.body.temperature === 1) {
        body.temperature = 1;
      }
    } else {
      endpoint = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(AZURE_OPENAI_DEPLOYMENT)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

      const maxCompletionTokens = typeof req.body?.max_completion_tokens === 'number'
        ? req.body.max_completion_tokens
        : (typeof req.body?.max_tokens === 'number' ? req.body.max_tokens : 1024);

      body = {
        messages,
        max_completion_tokens: maxCompletionTokens,
        stream: false
      };
      if (typeof req.body?.temperature === 'number' && req.body.temperature === 1) {
        body.temperature = 1;
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Azure OpenAI error', details: text });
    }

    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    const choice = data?.choices?.[0];
    let content = '';

    const outputs = data?.output || data?.outputs || data?.result;
    if (Array.isArray(outputs)) {
      const messageItem = outputs.find(o => o?.type === 'message');
      if (messageItem && Array.isArray(messageItem.content)) {
        content = messageItem.content
          .filter(p => p?.type === 'output_text' || p?.type === 'text')
          .map(p => p?.text)
          .filter(Boolean)
          .join('');
      }
    }

    if (!content) {
      content = choice?.message?.content
        ?? choice?.messages?.[0]?.content
        ?? (Array.isArray(choice?.content) ? choice.content.find(p => p?.type === 'text')?.text : undefined)
        ?? (typeof data === 'string' ? data : '')
        ?? '';
    }

    res.json({
      content,
      model: data?.model || data?.meta?.model || clientModel,
      usage: data?.usage,
      raw: data
    });
  } catch (err) {
    console.error('Chat error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`aknchat listening on http://localhost:${PORT}`);
});
