import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { ConfidentialClientApplication } from '@azure/msal-node';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Sessions for authentication (Azure AD B2C)
app.use(session({
  secret: process.env.SESSION_SECRET || 'aknchat-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// MSAL (Azure AD B2C) configuration
const b2cTenant = process.env.B2C_TENANT; // e.g., contosob2c
const b2cPolicy = process.env.B2C_POLICY_SIGNIN || 'B2C_1_signupsignin';
const hasB2C = Boolean(b2cTenant && process.env.B2C_CLIENT_ID);
let cca;
if (hasB2C) {
  const authority = `https://${b2cTenant}.b2clogin.com/${b2cTenant}.onmicrosoft.com/${b2cPolicy}`;
  const msalConfig = {
    auth: {
      clientId: process.env.B2C_CLIENT_ID,
      authority,
      clientSecret: process.env.B2C_CLIENT_SECRET,
      knownAuthorities: [`${b2cTenant}.b2clogin.com`]
    },
    system: { loggerOptions: { loggerCallback(){} } }
  };
  cca = new ConfidentialClientApplication(msalConfig);
}

const authScopes = ['openid', 'offline_access', 'profile', 'email'];
const redirectUri = process.env.B2C_REDIRECT_URI || `http://localhost:${PORT}/auth/redirect`;

function ensureAuth(req, res, next) {
  if (!hasB2C) return next(); // if B2C not configured, don't block in dev
  if (req.session?.account) return next();
  return res.redirect('/login');
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'aknchat' });
});

// Auth endpoints (only if B2C configured)
if (hasB2C) {
  // Show branded login page
  app.get('/login', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

  // Start OAuth flow
  app.get('/auth/start', async (req, res, next) => {
    try {
      const url = await cca.getAuthCodeUrl({ scopes: authScopes, redirectUri });
      res.redirect(url);
    } catch (e) { next(e); }
  });

  app.get('/auth/redirect', async (req, res, next) => {
    try {
      const token = await cca.acquireTokenByCode({ code: req.query.code, scopes: authScopes, redirectUri });
      req.session.account = token.account;
      req.session.idTokenClaims = token.idTokenClaims;
      res.redirect('/chat.html');
    } catch (e) { next(e); }
  });

  app.get('/logout', (req, res) => {
    const postLogout = encodeURIComponent(process.env.B2C_LOGOUT_REDIRECT_URI || `http://localhost:${PORT}/`);
    const logoutUrl = `https://${b2cTenant}.b2clogin.com/${b2cTenant}.onmicrosoft.com/${b2cPolicy}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogout}`;
    req.session.destroy(() => res.redirect(logoutUrl));
  });

  app.get('/me', (req, res) => {
    if (!req.session?.account) return res.json({ authenticated: false });
    const c = req.session.idTokenClaims || {};
    res.json({ authenticated: true, name: c.name, email: c.emails?.[0], sub: c.sub });
  });
}
// Fallback routes if B2C is not configured: provide friendly pages
if (!hasB2C) {
  app.get('/login', (_req, res) => {
    res.status(200).send(`<!doctype html>
      <html lang="tr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Giriş - AKNCHAT</title><link rel="stylesheet" href="/styles.css"/></head>
      <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div class="home-cta" style="max-width:680px;text-align:center;">
          <h2>Azure AD B2C yapılandırılmamış</h2>
          <p>Lütfen .env dosyanıza B2C_TENANT, B2C_CLIENT_ID, B2C_CLIENT_SECRET ve yönlendirme adreslerini ekleyin. Ardından sunucuyu yeniden başlatın.</p>
          <a href="/" class="cta-button" style="margin-right:10px;">← Ana sayfa</a>
          <a href="/chat.html" class="cta-button">Devam et (korumasız)</a>
        </div>
      </body></html>`);
  });
  app.get('/logout', (req, res) => {
    req.session?.destroy(() => res.redirect('/'));
  });
}

// Diagnostics: List deployments for default Azure OpenAI resource
app.get('/api/diagnostics/default/deployments', async (_req, res) => {
  try {
    const { AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_VERSION } = process.env;
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Default Azure resource not configured' });
    }
    const apiVersion = AZURE_OPENAI_API_VERSION || '2024-05-01-preview';
    const url = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments?api-version=${encodeURIComponent(apiVersion)}`;
    const r = await fetch(url, { headers: { 'api-key': AZURE_OPENAI_API_KEY } });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = t; }
    return res.status(r.status).json(j);
  } catch (e) {
    return res.status(500).json({ error: 'Diagnostics failed', details: String(e) });
  }
});

// Diagnostics: List deployments for GPT5-Mini Azure resource
app.get('/api/diagnostics/gpt5-mini/deployments', async (_req, res) => {
  try {
    const { GPT5_MINI_ENDPOINT, GPT5_MINI_API_KEY, GPT5_MINI_API_VERSION } = process.env;
    if (!GPT5_MINI_ENDPOINT || !GPT5_MINI_API_KEY) {
      return res.status(500).json({ error: 'GPT5-Mini Azure resource not configured' });
    }
    const apiVersion = GPT5_MINI_API_VERSION || '2025-04-01-preview';
    const url = `${GPT5_MINI_ENDPOINT.replace(/\/$/, '')}/openai/deployments?api-version=${encodeURIComponent(apiVersion)}`;
    const r = await fetch(url, { headers: { 'api-key': GPT5_MINI_API_KEY } });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = t; }
    return res.status(r.status).json(j);
  } catch (e) {
    return res.status(500).json({ error: 'Diagnostics failed', details: String(e) });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_API_VERSION } = process.env;

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

      const maxTokens = typeof req.body?.max_tokens === 'number'
        ? req.body.max_tokens
        : (typeof req.body?.max_completion_tokens === 'number' ? req.body.max_completion_tokens : 1024);

      // Inject a subtle system instruction to include hidden suggestions
      const sysInstr = 'Lütfen TÜRKÇE yanıt ver. Cevabının sonunda, kullanıcının sorabileceği 3 ilgili soru veya takip komutu üret ve bunları şu gizli etikete yaz: <akn-suggestions>İlgili Soru 1 || İlgili Soru 2 || İlgili Soru 3</akn-suggestions>. Bu etiketi ana metinde ASLA gösterme, sadece sonuna ekle.';
      const sysMessage = { role: 'system', content: sysInstr };
      const body = { messages: [sysMessage, ...mapped], max_tokens: maxTokens, stream: false };
      if (typeof req.body?.temperature === 'number' && req.body.temperature === 1) {
        body.temperature = 1;
      }

      // Try chat/completions (once, with a single retry on 5xx), then fallback to Responses API
      const doChatCompletion = async () => {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': AZURE_OPENAI_API_KEY },
          body: JSON.stringify(body)
        });
        const t = await resp.text();
        return { ok: resp.ok, status: resp.status, text: t };
      };

      let result = await doChatCompletion();
      if (!result.ok && result.status >= 500) {
        // brief retry for transient server_error
        result = await doChatCompletion();
      }

      if (result.ok) {
        let data;
        try { data = JSON.parse(result.text); } catch { data = result.text; }
        const choice = data?.choices?.[0];
        const content = choice?.message?.content
          ?? choice?.messages?.[0]?.content
          ?? (Array.isArray(choice?.content) ? choice.content.find(p => p?.type === 'text')?.text : undefined)
          ?? (typeof data === 'string' ? data : '')
          ?? '';
        return res.json({ content, model: clientModel, usage: data?.usage, raw: data });
      }

      // Fallback to Responses API (same resource)
      const respEndpoint = `${altBase}/openai/responses?api-version=${altApiVersion}`;
      const maxOutputTokens = typeof req.body?.max_output_tokens === 'number'
        ? req.body.max_output_tokens
        : maxTokens;

      const input = [{ role: 'system', content: sysInstr }];
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
      const rBody = { model: deployment, input, max_output_tokens: maxOutputTokens };
      if (typeof req.body?.temperature === 'number' && req.body.temperature === 1) { rBody.temperature = 1; }

      const r = await fetch(respEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': AZURE_OPENAI_API_KEY }, body: JSON.stringify(rBody)
      });
      const rt = await r.text();
      if (!r.ok) {
        return res.status(r.status).json({ error: 'Azure OpenAI error', details: rt });
      }
      let rd; try { rd = JSON.parse(rt); } catch { rd = rt; }
      let content = '';
      const outputs = rd?.output || rd?.outputs || rd?.result;
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
      if (!content && typeof rd === 'string') content = rd;
      return res.json({ content, model: clientModel, usage: rd?.usage, raw: rd });
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

      const input = [{ role: 'system', content: 'Sen aknchat adlı yardımcı bir asistansın. Varsayılan olarak TÜRKÇE yanıt ver. Her yanıtın sonunda kullanıcının sorabileceği 3 ilgili takip sorusu veya komutu üret ve bunları şu gizli etikete yaz: <akn-suggestions>İlgili Soru 1 || İlgili Soru 2 || İlgili Soru 3</akn-suggestions>. Bu etiketi ana metinde ASLA gösterme.' }];
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

// Protect chat.html before static middleware
app.get('/chat.html', ensureAuth, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`aknchat listening on http://localhost:${PORT}`);
});
