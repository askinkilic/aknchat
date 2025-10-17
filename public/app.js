const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('chat-form');
const inputEl = document.getElementById('user-input');
const yearEl = document.getElementById('year');
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');
const newChatBtn = document.getElementById('new-chat');
const sessionsListEl = document.getElementById('sessions-list');
const modelSelect = document.getElementById('model-select');
const themeToggle = document.getElementById('theme-toggle');
const clearBtn = document.getElementById('clear-history');
const fileInput = document.getElementById('file-input');
const pickImageBtn = document.getElementById('pick-image');
const attachmentsEl = document.getElementById('attachments');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');

yearEl.textContent = new Date().getFullYear();

const PREFS_KEY = 'aknchat.prefs.v1';
function loadPrefs() { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; } catch { return {}; } }
function savePrefs(p) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }
let prefs = loadPrefs();

// Initialize theme - Default is dark, light if saved
if (prefs.theme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
  if (themeToggle) themeToggle.textContent = '☀️ Açık';
} else {
  if (themeToggle) themeToggle.textContent = '🌙 Koyu';
}
// Initialize model
if (prefs.model && modelSelect) {
  modelSelect.value = prefs.model;
}

if (themeToggle) themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const isLight = currentTheme === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    prefs = { ...prefs, theme: 'dark' };
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    prefs = { ...prefs, theme: 'light' };
  }
  savePrefs(prefs);
  // Update button text
  themeToggle.textContent = isLight ? '🌙 Koyu' : '☀️ Açık';
});

if (modelSelect) modelSelect.addEventListener('change', () => {
  prefs = { ...prefs, model: modelSelect.value };
  savePrefs(prefs);
});

function isInternalAnchor(link) {
  try { return link.hash && link.pathname === location.pathname; } catch { return false; }
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('a');
  if (!target) return;
  if (isInternalAnchor(target)) {
    const id = target.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      siteNav?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
      // Active state for nav buttons
      document.querySelectorAll('.nav-btn').forEach(a => a.classList.remove('active'));
      if (target.classList.contains('nav-btn')) target.classList.add('active');
    }
  }
});

// Set active on load based on current hash
window.addEventListener('load', () => {
  const hash = location.hash || '#main';
  const link = document.querySelector(`.nav-btn[href="${hash}"]`);
  if (link) {
    document.querySelectorAll('.nav-btn').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  }
});

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    sidebar?.classList.toggle('open');
  });
}

// Desktop sidebar toggle
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const icon = sidebarToggle.querySelector('.toggle-icon');
    if (icon) {
      icon.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✕';
    }
  });
}

// Quick prompt buttons
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('prompt-btn')) {
    const prompt = e.target.getAttribute('data-prompt');
    if (prompt && inputEl) {
      inputEl.value = prompt;
      inputEl.focus();
      // Auto-submit the form
      setTimeout(() => {
        formEl.requestSubmit();
      }, 100);
    }
  }
});

if (inputEl?.tagName === 'TEXTAREA') {
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + 'px';
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formEl.requestSubmit();
    }
  });
}

function pushMessage(role, content) {
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user' : 'assistant'}`;
  if (content instanceof HTMLElement) {
    div.appendChild(content);
  } else {
    div.innerHTML = typeof content === 'string' ? content : '';
  }
  messagesEl.appendChild(div);
  
  // Force scroll to bottom
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
  
  return div;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatToHtml(text) {
  const safe = escapeHtml(text);
  let html = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Convert plain URLs to clickable links
  const urlRegex = /(https?:\/\/[\w.-]+(?:\/[\w\-._~:\/?#\[\]@!$&'()*+,;=.]+)?)/gi;
  html = html.replace(urlRegex, (m) => `<a href="${m}" target="_blank" rel="noopener noreferrer">${m}</a>`);
  const lines = html.split(/\r?\n/);
  const out = [];
  let inList = false;
  for (const line of lines) {
    const m = line.match(/^\s*[-*]\s+(.*)$/);
    if (m) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${m[1]}</li>`);
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(line);
    }
  }
  if (inList) out.push('</ul>');
  html = out.join('\n');
  html = html
    .split(/\n{2,}/)
    .map(block => block.trim().startsWith('<ul>') ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
  return html;
}

function createThinkingNode() {
  const span = document.createElement('span');
  span.className = 'typing';
  span.setAttribute('aria-label', 'AI yanıtlıyor');
  span.innerHTML = '🤖 AI yanıtlıyor <span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  return span;
}

function showToast(message) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = message;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1200);
}

function renderAssistantAnswer(container, html) {
  const wrapper = document.createElement('div');
  const contentEl = document.createElement('div');
  contentEl.className = 'msg-content';
  contentEl.innerHTML = html;
  const footer = document.createElement('div');
  footer.className = 'msg-footer';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'copy-btn icon';
  copyBtn.setAttribute('title', 'Kopyala');
  copyBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z"></path></svg>';
  copyBtn.addEventListener('click', async () => {
    const plain = stripHtml(contentEl.innerHTML);
    try {
      await navigator.clipboard.writeText(plain);
      showToast('Kopyalandı');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = plain; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      showToast('Kopyalandı');
    }
  });
  footer.appendChild(copyBtn);
  wrapper.appendChild(contentEl);
  wrapper.appendChild(footer);
  container.innerHTML = '';
  container.appendChild(wrapper);
  
  // Force scroll to bottom
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

// Session management
const STORAGE_KEY = 'aknchat.sessions.v1';
let sessions = [];
let activeSessionId = null;

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function createSession(title = 'Yeni sohbet') {
  const id = 's_' + Date.now().toString(36);
  const session = { id, title, model: modelSelect?.value || prefs.model || 'gpt-5-mini', messages: [ { role: 'system', content: 'You are aknchat, a helpful assistant. Answer in Turkish by default.' } ] };
  sessions.unshift(session);
  activeSessionId = id;
  saveSessions();
  renderSessions();
  renderActiveSession();
}

function setActiveSession(id) {
  activeSessionId = id;
  renderSessions();
  renderActiveSession();
}

function getActiveSession() {
  return sessions.find(s => s.id === activeSessionId);
}

function updateActiveTitleFromFirstUserMessage() {
  const s = getActiveSession();
  if (!s) return;
  const firstUser = s.messages.find(m => m.role === 'user');
  if (firstUser) {
    s.title = firstUser.content.slice(0, 40);
    saveSessions();
    renderSessions();
  }
}

function renderSessions() {
  sessionsListEl.innerHTML = '';
  sessions.forEach((s, index) => {
    const btn = document.createElement('button');
    btn.className = 'session-item' + (s.id === activeSessionId ? ' active' : '');
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', s.id === activeSessionId ? 'true' : 'false');
    
    // Session number
    const numberSpan = document.createElement('span');
    numberSpan.className = 'session-number';
    numberSpan.textContent = `#${index + 1}`;
    btn.appendChild(numberSpan);
    
    // Session title
    const span = document.createElement('span');
    span.className = 'session-title';
    span.textContent = s.title || 'Yeni sohbet';
    btn.appendChild(span);
    
    // Click to select
    btn.addEventListener('click', () => setActiveSession(s.id));
    
    // Right-click context menu
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e, s.id);
    });
    
    sessionsListEl.appendChild(btn);
  });
}

// Context menu for right-click
function showContextMenu(e, sessionId) {
  // Remove existing context menu
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) existingMenu.remove();
  
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'context-menu-item delete';
  deleteBtn.innerHTML = '🗑️ Bu sohbeti sil';
  deleteBtn.addEventListener('click', () => {
    deleteSession(sessionId);
    menu.remove();
  });
  
  menu.appendChild(deleteBtn);
  document.body.appendChild(menu);
  
  // Close menu on click outside
  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 0);
}

function deleteSession(sessionId) {
  if (sessions.length === 1) {
    showToast('Son sohbet silinemez');
    return;
  }
  
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index === -1) return;
  
  sessions.splice(index, 1);
  
  // If deleted session was active, select another
  if (activeSessionId === sessionId) {
    activeSessionId = sessions[0]?.id;
  }
  
  saveSessions();
  renderSessions();
  renderActiveSession();
  showToast('Sohbet silindi');
}

function renderActiveSession() {
  messagesEl.innerHTML = '';
  const s = getActiveSession();
  if (!s) return;
  if (modelSelect && s.model) modelSelect.value = s.model;
  s.messages.filter(m => m.role !== 'system').forEach(m => {
    if (m.role === 'assistant') {
      const el = pushMessage('assistant', '');
      renderAssistantAnswer(el, formatToHtml(m.content));
    } else {
      pushMessage('user', m.content);
    }
  });
}

// Initialize sessions
sessions = loadSessions();
if (sessions.length === 0) {
  createSession('Yeni sohbet');
} else {
  activeSessionId = sessions[0].id;
  renderSessions();
  renderActiveSession();
}

if (newChatBtn) newChatBtn.addEventListener('click', () => createSession('Yeni sohbet'));
if (clearBtn) clearBtn.addEventListener('click', () => {
  if (!confirm('Tüm geçmişi silmek istediğinize emin misiniz?')) return;
  sessions = []; saveSessions(); createSession('Yeni sohbet'); showToast('Geçmiş silindi');
});

let pendingImages = [];

function addAttachmentPreview(dataUrl) {
  const wrap = document.createElement('div');
  wrap.className = 'attachment';
  const img = document.createElement('img');
  img.src = dataUrl; wrap.appendChild(img);
  const rem = document.createElement('button'); rem.className = 'remove'; rem.type = 'button'; rem.textContent = '×';
  rem.addEventListener('click', () => { pendingImages = pendingImages.filter(x => x !== dataUrl); wrap.remove(); });
  wrap.appendChild(rem);
  attachmentsEl.appendChild(wrap);
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
  });
}

if (pickImageBtn && fileInput) {
  pickImageBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    for (const f of Array.from(fileInput.files || [])) {
      if (!f.type.startsWith('image/')) continue;
      const data = await fileToDataUrl(f); pendingImages.push(data); addAttachmentPreview(data);
    }
    fileInput.value = '';
  });
}

document.addEventListener('paste', async (e) => {
  const items = e.clipboardData?.items; if (!items) return;
  for (const it of items) {
    if (it.type && it.type.startsWith('image/')) {
      const file = it.getAsFile(); if (!file) continue; const data = await fileToDataUrl(file); pendingImages.push(data); addAttachmentPreview(data);
    }
  }
});

function buildMessagesForApi(messages, model) {
  // If Responses API (2025*), convert images to input_image blocks in the last user message
  const useResponses = true; // we default to 2025 in server for configured; server handles routing for MODEL/legacy
  if (pendingImages.length === 0) return { messages, images: [] };
  const last = messages[messages.length - 1];
  if (last && last.role === 'user') {
    // Keep plain text; server will accept images array to map per API
    return { messages, images: pendingImages.slice() };
  }
  return { messages, images: pendingImages.slice() };
}

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const s = getActiveSession(); if (!s) return;

  const text = inputEl.value.trim(); if (!text && pendingImages.length === 0) return;
  inputEl.value = ''; inputEl.style.height = 'auto';

  s.model = modelSelect?.value || prefs.model || s.model || 'gpt-5-mini';

  // Push user message; keep text; images tracked separately
  if (text) s.messages.push({ role: 'user', content: text });
  else s.messages.push({ role: 'user', content: '' });

  // Render user bubble with note of images if any
  const userHtml = text ? escapeHtml(text) : '';
  const userDiv = pushMessage('user', userHtml);
  if (pendingImages.length) {
    const imgsWrap = document.createElement('div'); imgsWrap.style.marginTop = '6px'; imgsWrap.style.display = 'flex'; imgsWrap.style.gap = '6px';
    pendingImages.forEach(src => { const i = document.createElement('img'); i.src = src; i.style.width = '64px'; i.style.height = '64px'; i.style.objectFit = 'cover'; i.style.borderRadius = '8px'; imgsWrap.appendChild(i); });
    userDiv.appendChild(imgsWrap);
  }

  updateActiveTitleFromFirstUserMessage(); saveSessions();

  const thinking = createThinkingNode();
  const assistantEl = pushMessage('assistant', thinking);

  // Build payload including images
  const payload = buildMessagesForApi(s.messages, s.model);
  const imagesToSend = payload.images; // base64 data URLs

  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: s.messages, model: s.model, images: imagesToSend })
    });

    if (!res.ok) { const err = await res.text(); assistantEl.textContent = 'Hata: ' + err; return; }

    const data = await res.json();
    const answer = data?.content
      || data?.choices?.[0]?.message?.content
      || data?.choices?.[0]?.messages?.[0]?.content
      || (Array.isArray(data?.choices?.[0]?.content) ? data.choices[0].content.find(p => p?.type === 'text')?.text : null)
      || 'Cevap alınamadı.';

    s.messages.push({ role: 'assistant', content: answer }); 
    renderAssistantAnswer(assistantEl, formatToHtml(answer)); 
    saveSessions();
    
    // Force scroll to bottom after answer is rendered
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  } catch (err) { 
    assistantEl.textContent = 'Ağ hatası. Tekrar deneyin.'; 
  }
  finally {
    // Reset attachments
    pendingImages = []; attachmentsEl.innerHTML = '';
  }
});
