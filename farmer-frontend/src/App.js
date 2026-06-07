// ============================================
//  LOCAL FARMER'S CROP & MARKET PORTAL
//  Frontend: React.js — Ultimate Edition
//  15+ Unique Features for Academic Evaluation
// ============================================

import { useState, useEffect, useRef, createContext, useContext, useCallback, useMemo } from "react";

const API = "http://localhost:5000/api";
const AuthCtx  = createContext(null);
const ToastCtx = createContext(null);
const ThemeCtx = createContext(null);
function useAuth()  { return useContext(AuthCtx); }
function useToast() { return useContext(ToastCtx); }
function useTheme() { return useContext(ThemeCtx); }

// ─── HELPERS ──────────────────────────────────
function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 10) return { name:"Kharif", color:"#f59e0b", icon:"🌧️", desc:"Monsoon — Rice, Maize, Cotton" };
  if (m >= 11 || m <= 3) return { name:"Rabi",   color:"#3b82f6", icon:"❄️", desc:"Winter — Wheat, Barley, Mustard" };
  return                        { name:"Zaid",   color:"#10b981", icon:"☀️", desc:"Summer — Watermelon, Cucumber" };
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text:"Good night",     icon:"🌙" };
  if (h < 12) return { text:"Good morning",   icon:"🌅" };
  if (h < 17) return { text:"Good afternoon", icon:"☀️" };
  if (h < 21) return { text:"Good evening",   icon:"🌆" };
  return               { text:"Good night",     icon:"🌙" };
}
const emojiMap = { Grain:"🌾", Vegetable:"🥬", Fruit:"🍎", Spice:"🌶️", Pulse:"🫘" };

// ─── API ──────────────────────────────────────
const api = {
  headers: t => ({ "Content-Type":"application/json", ...(t ? { Authorization:`Bearer ${t}` } : {}) }),
  get:  async (u,t) => { try { return (await fetch(`${API}${u}`, { headers:api.headers(t) })).json(); } catch { return null; } },
  post: async (u,b,t) => { try { return (await fetch(`${API}${u}`, { method:"POST", headers:api.headers(t), body:JSON.stringify(b) })).json(); } catch { return { error:"Cannot connect to server" }; } },
  put:  async (u,b,t) => { try { return (await fetch(`${API}${u}`, { method:"PUT",  headers:api.headers(t), body:JSON.stringify(b) })).json(); } catch { return { error:"Cannot connect to server" }; } },
  del:  async (u,t) => { try { return (await fetch(`${API}${u}`, { method:"DELETE", headers:api.headers(t) })).json(); } catch { return null; } },
  ping: async () => { try { return (await fetch("http://localhost:5000/", { signal:AbortSignal.timeout(3000) })).ok; } catch { return false; } },
};

// ─── MEGA STYLES ──────────────────────────────
const buildCSS = (dark) => {
  const t = dark ? {
    bg:"#070e0e", bg2:"#0c1a1a", surface:"rgba(14,26,26,0.92)", glass:"rgba(255,255,255,0.055)",
    glassHover:"rgba(255,255,255,0.09)", border:"rgba(255,255,255,0.08)", border2:"rgba(16,185,129,0.3)",
    text:"#edfaf3", text2:"#8faab5", text3:"#3d5a65", cardBg:"rgba(255,255,255,0.04)",
    inputBg:"rgba(0,0,0,0.3)", tableBg:"rgba(16,185,129,0.07)", hoverRow:"rgba(255,255,255,0.02)",
  } : {
    bg:"#f4f7f5", bg2:"#ffffff", surface:"rgba(255,255,255,0.95)", glass:"rgba(0,80,40,0.04)",
    glassHover:"rgba(0,80,40,0.08)", border:"rgba(0,0,0,0.1)", border2:"rgba(16,185,129,0.35)",
    text:"#1a2e28", text2:"#5a7a6d", text3:"#9ab3a5", cardBg:"#ffffff",
    inputBg:"#f0f5f2", tableBg:"rgba(16,185,129,0.06)", hoverRow:"rgba(0,0,0,0.02)",
  };
  return `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:${t.bg}; --bg2:${t.bg2}; --surface:${t.surface}; --glass:${t.glass}; --glass-hover:${t.glassHover};
    --border:${t.border}; --border2:${t.border2};
    --emerald:#10b981; --emerald2:#059669; --emerald3:#34d399; --emerald-dim:rgba(16,185,129,0.13);
    --amber:#f59e0b; --amber2:#d97706; --amber-dim:rgba(245,158,11,0.13);
    --red:#ef4444; --red-dim:rgba(239,68,68,0.13);
    --blue:#3b82f6; --blue-dim:rgba(59,130,246,0.13);
    --purple:#a78bfa; --purple-dim:rgba(167,139,250,0.13);
    --text:${t.text}; --text2:${t.text2}; --text3:${t.text3};
    --card-bg:${t.cardBg}; --input-bg:${t.inputBg}; --table-bg:${t.tableBg}; --hover-row:${t.hoverRow};
    --sidebar-w:250px; --radius:14px; --radius-sm:9px;
    --glow-e:0 0 40px rgba(16,185,129,0.18); --shadow:0 4px 24px rgba(0,0,0,${dark?0.45:0.12}); --shadow-lg:0 16px 60px rgba(0,0,0,${dark?0.65:0.2});
  }
  html { scroll-behavior:smooth; }
  body { font-family:'Inter',sans-serif; background:var(--bg); color:var(--text); line-height:1.6; overflow-x:hidden; transition:background 0.4s,color 0.4s; }
  ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:3px; }
  h1,h2,h3,h4,h5 { font-family:'Outfit',sans-serif; line-height:1.2; }

  .app-shell { display:flex; min-height:100vh; }
  .main-content { margin-left:var(--sidebar-w); flex:1; min-height:100vh; display:flex; flex-direction:column; }
  .page-wrapper { flex:1; padding:2rem 2.5rem; max-width:1240px; width:100%; }
  .page-enter { animation:pageIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes pageIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  /* ── TICKER ── */
  .ticker-wrap { width:100%; overflow:hidden; background:linear-gradient(90deg,rgba(16,185,129,0.1),rgba(16,185,129,0.04),rgba(16,185,129,0.1)); border-bottom:1px solid var(--border2); padding:7px 0; position:sticky; top:0; z-index:90; backdrop-filter:blur(20px); }
  .ticker-track { display:flex; white-space:nowrap; animation:tickerScroll 45s linear infinite; }
  .ticker-wrap:hover .ticker-track { animation-play-state:paused; }
  @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .ticker-item { display:inline-flex; align-items:center; gap:6px; padding:0 2rem; font-size:0.78rem; font-weight:600; color:var(--text2); border-right:1px solid var(--border); }
  .ticker-crop { color:var(--text); } .ticker-price { color:var(--emerald3); font-family:'Outfit'; font-size:0.82rem; }
  .ticker-up { color:#4ade80; font-size:0.7rem; } .ticker-down { color:#f87171; font-size:0.7rem; }

  /* ── SEASON BANNER ── */
  .season-banner { display:flex; align-items:center; gap:10px; padding:8px 2.5rem; background:var(--card-bg); border-bottom:1px solid var(--border); font-size:0.8rem; color:var(--text2); flex-wrap:wrap; }
  .season-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 11px; border-radius:20px; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; }

  /* ── SIDEBAR ── */
  .sidebar { width:var(--sidebar-w); min-height:100vh; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:100; backdrop-filter:blur(24px); transition:transform 0.3s; }
  .sidebar-logo { padding:1.3rem 1.2rem 0.9rem; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; }
  .logo-icon { width:38px; height:38px; background:linear-gradient(135deg,var(--emerald),var(--emerald2)); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:var(--glow-e); }
  .logo-text { font-family:'Outfit'; font-size:1.05rem; font-weight:800; color:var(--text); }
  .logo-sub { font-size:0.6rem; color:var(--emerald); text-transform:uppercase; letter-spacing:1.2px; font-weight:600; }
  .sidebar-nav { flex:1; padding:0.8rem 0.7rem; display:flex; flex-direction:column; gap:2px; overflow-y:auto; }
  .nav-section-label { font-size:0.62rem; font-weight:800; color:var(--text3); text-transform:uppercase; letter-spacing:1.2px; padding:0 10px; margin:8px 0 3px; }
  .nav-item { display:flex; align-items:center; gap:9px; padding:8px 11px; border-radius:var(--radius-sm); cursor:pointer; color:var(--text2); font-size:0.85rem; font-weight:500; transition:all 0.16s; border:1px solid transparent; }
  .nav-item:hover { background:var(--glass); color:var(--text); border-color:var(--border); }
  .nav-item.active { background:var(--emerald-dim); color:var(--emerald3); border-color:var(--border2); }
  .nav-icon { font-size:1rem; width:20px; text-align:center; }
  .nav-badge { margin-left:auto; background:var(--red); color:#fff; font-size:0.62rem; font-weight:800; padding:1px 7px; border-radius:20px; }
  .sidebar-divider { height:1px; background:var(--border); margin:5px 0; }
  .sidebar-user { margin:0.7rem; padding:0.65rem 0.9rem; background:var(--glass); border-radius:var(--radius-sm); border:1px solid var(--border); display:flex; align-items:center; gap:9px; }
  .user-avatar { width:32px; height:32px; background:linear-gradient(135deg,var(--amber),var(--amber2)); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; color:#000; flex-shrink:0; }
  .user-info { flex:1; min-width:0; } .user-name { font-size:0.8rem; font-weight:700; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; } .user-role { font-size:0.66rem; color:var(--emerald); font-weight:600; text-transform:capitalize; }
  .logout-btn { background:none; border:none; color:var(--text3); cursor:pointer; font-size:1rem; padding:4px; transition:color 0.2s; } .logout-btn:hover { color:var(--red); }

  /* ── THEME TOGGLE ── */
  .theme-toggle { display:flex; align-items:center; gap:8px; padding:6px 10px; margin:0 0.7rem 0.5rem; border-radius:var(--radius-sm); background:var(--glass); border:1px solid var(--border); cursor:pointer; transition:all 0.2s; }
  .theme-toggle:hover { border-color:var(--border2); }
  .theme-toggle-track { width:36px; height:20px; border-radius:10px; background:${dark?"var(--emerald-dim)":"rgba(0,0,0,0.12)"}; position:relative; transition:background 0.3s; }
  .theme-toggle-thumb { width:16px; height:16px; border-radius:50%; background:var(--emerald); position:absolute; top:2px; left:${dark?"18px":"2px"}; transition:left 0.3s cubic-bezier(0.34,1.56,0.64,1); box-shadow:0 1px 4px rgba(0,0,0,0.3); }
  .theme-toggle-label { font-size:0.75rem; font-weight:600; color:var(--text2); }

  /* ── TOAST ── */
  .toast-container { position:fixed; top:1rem; right:1rem; z-index:9999; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
  .toast { pointer-events:all; display:flex; align-items:center; gap:9px; padding:11px 15px; border-radius:var(--radius-sm); font-size:0.85rem; font-weight:500; backdrop-filter:blur(20px); box-shadow:var(--shadow-lg); min-width:260px; max-width:340px; animation:toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both; cursor:pointer; }
  .toast.exit { animation:toastOut 0.2s ease both; }
  @keyframes toastIn { from{opacity:0;transform:translateX(50px)} to{opacity:1;transform:translateX(0)} }
  @keyframes toastOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(50px)} }
  .toast-success { background:${dark?"#071a10":"#ecfdf5"}; border:1px solid rgba(16,185,129,0.4); color:${dark?"#6ee7b7":"#065f46"}; }
  .toast-error { background:${dark?"#1a0707":"#fef2f2"}; border:1px solid rgba(239,68,68,0.4); color:${dark?"#fca5a5":"#991b1b"}; }
  .toast-info { background:${dark?"#070e1a":"#eff6ff"}; border:1px solid rgba(59,130,246,0.4); color:${dark?"#93c5fd":"#1e40af"}; }
  .toast-icon { font-size:1rem; flex-shrink:0; } .toast-msg { flex:1; } .toast-close { background:none; border:none; color:inherit; opacity:0.5; cursor:pointer; font-size:0.9rem; } .toast-close:hover { opacity:1; }

  /* ── CONFETTI ── */
  .confetti-container { position:fixed; inset:0; pointer-events:none; z-index:10000; overflow:hidden; }
  .confetti-piece { position:absolute; width:10px; height:10px; top:-20px; animation:confettiFall linear forwards; }
  @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }

  /* ── COMMAND PALETTE ── */
  .cmd-overlay { position:fixed; inset:0; background:rgba(0,0,0,${dark?0.7:0.4}); backdrop-filter:blur(8px); z-index:500; display:flex; align-items:flex-start; justify-content:center; padding-top:18vh; animation:fadeIn 0.12s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .cmd-box { width:100%; max-width:520px; background:${dark?"#0c1e1e":"#fff"}; border:1px solid var(--border2); border-radius:var(--radius); box-shadow:var(--shadow-lg); overflow:hidden; animation:slideDown 0.2s ease; }
  @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
  .cmd-input { width:100%; padding:14px 18px; background:transparent; border:none; border-bottom:1px solid var(--border); color:var(--text); font-size:1rem; font-family:'Inter'; outline:none; }
  .cmd-input::placeholder { color:var(--text3); }
  .cmd-list { max-height:280px; overflow-y:auto; padding:6px; }
  .cmd-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:var(--radius-sm); cursor:pointer; color:var(--text2); font-size:0.88rem; transition:all 0.12s; }
  .cmd-item:hover,.cmd-item.sel { background:var(--emerald-dim); color:var(--emerald3); }
  .cmd-item-icon { font-size:1rem; width:22px; text-align:center; }
  .cmd-item-label { flex:1; } .cmd-item-hint { font-size:0.72rem; color:var(--text3); }
  .cmd-footer { padding:8px 14px; border-top:1px solid var(--border); font-size:0.7rem; color:var(--text3); display:flex; gap:12px; }
  .kbd { background:var(--glass); border:1px solid var(--border); padding:1px 6px; border-radius:4px; font-size:0.68rem; font-family:'Inter'; }

  /* ── NOTIFICATION BELL ── */
  .notif-bell { position:relative; background:none; border:none; color:var(--text2); cursor:pointer; font-size:1.1rem; padding:6px; transition:color 0.2s; }
  .notif-bell:hover { color:var(--text); }
  .notif-dot { position:absolute; top:2px; right:2px; width:8px; height:8px; background:var(--red); border-radius:50%; animation:notifPulse 1.5s ease infinite; }
  @keyframes notifPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)} 50%{box-shadow:0 0 0 4px rgba(239,68,68,0)} }
  .notif-panel { position:absolute; top:100%; right:0; width:280px; background:${dark?"#0c1e1e":"#fff"}; border:1px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow-lg); z-index:200; animation:slideDown 0.2s ease; overflow:hidden; }
  .notif-header { padding:10px 14px; border-bottom:1px solid var(--border); font-size:0.78rem; font-weight:700; color:var(--text); display:flex; justify-content:space-between; align-items:center; }
  .notif-item { padding:10px 14px; border-bottom:1px solid var(--border); font-size:0.8rem; color:var(--text2); display:flex; gap:8px; align-items:flex-start; transition:background 0.15s; cursor:default; }
  .notif-item:hover { background:var(--glass); }
  .notif-item:last-child { border-bottom:none; }
  .notif-empty { padding:2rem; text-align:center; color:var(--text3); font-size:0.82rem; }

  /* ── WISHLIST HEART ── */
  .wish-btn { background:none; border:none; cursor:pointer; font-size:1.1rem; transition:transform 0.2s; padding:2px; }
  .wish-btn:hover { transform:scale(1.2); }
  .wish-btn.liked { animation:heartPop 0.3s ease; }
  @keyframes heartPop { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }

  /* ── VOICE SEARCH ── */
  .voice-btn { width:38px; height:38px; border-radius:50%; border:1px solid var(--border); background:var(--glass); color:var(--text2); cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
  .voice-btn:hover { border-color:var(--border2); color:var(--text); }
  .voice-btn.recording { border-color:var(--red); color:var(--red); background:var(--red-dim); animation:voicePulse 1s ease infinite; }
  @keyframes voicePulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)} 50%{box-shadow:0 0 0 8px rgba(239,68,68,0)} }

  /* ── COMPARE TOOL ── */
  .compare-bar { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); background:${dark?"#0c1e1e":"#fff"}; border:1px solid var(--border2); border-radius:var(--radius); padding:10px 18px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-lg); z-index:200; animation:slideUp 0.25s ease; backdrop-filter:blur(16px); }
  @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  .compare-modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
  .compare-col { }
  .compare-col h3 { font-family:'Outfit'; font-size:1.1rem; font-weight:800; margin-bottom:1rem; color:var(--text); text-align:center; }
  .compare-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:0.85rem; }
  .compare-label { color:var(--text2); } .compare-val { color:var(--text); font-weight:600; }
  .compare-winner { color:var(--emerald3); font-weight:700; }

  /* ── SPARKLINE ── */
  .sparkline { display:inline-block; vertical-align:middle; }

  /* ── BUTTONS ── */
  .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:var(--radius-sm); border:none; cursor:pointer; font-weight:600; font-size:0.85rem; font-family:'Inter'; transition:all 0.2s; white-space:nowrap; }
  .btn:hover { transform:translateY(-1px); } .btn:active { transform:translateY(0); }
  .btn-primary { background:linear-gradient(135deg,var(--emerald),var(--emerald2)); color:#000; box-shadow:0 4px 14px rgba(16,185,129,0.3); }
  .btn-primary:hover { box-shadow:0 6px 24px rgba(16,185,129,0.5); }
  .btn-amber { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:#000; box-shadow:0 4px 14px rgba(245,158,11,0.3); }
  .btn-ghost { background:var(--glass); color:var(--text); border:1px solid var(--border); backdrop-filter:blur(10px); }
  .btn-ghost:hover { background:var(--glass-hover); border-color:var(--border2); }
  .btn-danger { background:var(--red-dim); color:var(--red); border:1px solid rgba(239,68,68,0.25); }
  .btn-sm { padding:6px 13px; font-size:0.78rem; } .btn-xs { padding:3px 9px; font-size:0.73rem; border-radius:6px; }
  .btn-full { width:100%; justify-content:center; }

  /* ── CAT PILLS ── */
  .cat-pills { display:flex; flex-wrap:wrap; gap:7px; margin-bottom:1.3rem; }
  .cat-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 13px; border-radius:20px; background:var(--glass); border:1px solid var(--border); font-size:0.78rem; font-weight:600; color:var(--text2); cursor:pointer; transition:all 0.16s; }
  .cat-pill:hover { border-color:var(--border2); color:var(--text); }
  .cat-pill.active { background:var(--emerald-dim); border-color:var(--border2); color:var(--emerald3); }

  /* ── CROP CARDS ── */
  .crops-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.2rem; }
  .crop-card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); backdrop-filter:blur(20px); overflow:hidden; transition:all 0.25s; position:relative; }
  .crop-card:hover { border-color:var(--border2); box-shadow:0 0 0 1px var(--border2),var(--glow-e); transform:translateY(-3px); }
  .crop-card.hot { border-color:rgba(245,158,11,0.35); }
  .crop-card.hot::after { content:''; position:absolute; inset:0; border-radius:var(--radius); box-shadow:0 0 0 1px rgba(245,158,11,0.25),0 0 25px rgba(245,158,11,0.08); pointer-events:none; animation:hotPulse 2s ease-in-out infinite; }
  @keyframes hotPulse { 0%,100%{box-shadow:0 0 0 1px rgba(245,158,11,0.2),0 0 15px rgba(245,158,11,0.04)} 50%{box-shadow:0 0 0 1px rgba(245,158,11,0.45),0 0 35px rgba(245,158,11,0.14)} }
  .crop-emoji-banner { height:110px; display:flex; align-items:center; justify-content:center; font-size:3rem; position:relative; overflow:hidden; }
  .crop-emoji-banner::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--emerald-dim),transparent 60%,var(--amber-dim)); }
  .crop-hot-tag { position:absolute; top:8px; right:8px; background:rgba(245,158,11,0.9); color:#000; font-size:0.63rem; font-weight:800; padding:2px 8px; border-radius:20px; text-transform:uppercase; animation:hotTagPulse 1.5s ease infinite; }
  @keyframes hotTagPulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
  .crop-card-header { display:flex; justify-content:space-between; align-items:flex-start; }
  .crop-card-body { padding:0.9rem 1rem 1rem; }
  .crop-name { font-family:'Outfit'; font-size:1rem; font-weight:700; color:var(--text); margin-bottom:2px; }
  .crop-farmer { font-size:0.74rem; color:var(--text2); margin-bottom:7px; }
  .crop-tags { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px; }
  .crop-price-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; }
  .crop-price { font-family:'Outfit'; font-size:1.25rem; font-weight:800; color:var(--emerald3); }
  .crop-stock { font-size:0.72rem; color:var(--text3); margin-bottom:8px; }

  /* ── FRESHNESS METER ── */
  .freshness-meter { display:flex; align-items:center; gap:6px; margin-bottom:8px; }
  .freshness-bar { flex:1; height:4px; border-radius:2px; background:var(--border); overflow:hidden; }
  .freshness-fill { height:100%; border-radius:2px; transition:width 0.5s ease; }
  .freshness-label { font-size:0.68rem; font-weight:700; }

  /* ── BADGES ── */
  .badge { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:20px; font-size:0.69rem; font-weight:600; text-transform:capitalize; }
  .badge-emerald { background:var(--emerald-dim); color:var(--emerald3); border:1px solid var(--border2); }
  .badge-amber { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(245,158,11,0.25); }
  .badge-red { background:var(--red-dim); color:var(--red); border:1px solid rgba(239,68,68,0.25); }
  .badge-blue { background:var(--blue-dim); color:var(--blue); border:1px solid rgba(59,130,246,0.25); }
  .badge-purple { background:var(--purple-dim); color:var(--purple); border:1px solid rgba(167,139,250,0.25); }
  .badge-gray { background:rgba(128,128,128,0.1); color:var(--text2); border:1px solid var(--border); }
  .badge-pending { background:var(--amber-dim); color:var(--amber); border:1px solid rgba(245,158,11,0.25); }
  .badge-confirmed { background:var(--emerald-dim); color:var(--emerald3); border:1px solid var(--border2); }
  .badge-shipped { background:var(--blue-dim); color:var(--blue); border:1px solid rgba(59,130,246,0.25); }
  .badge-delivered { background:var(--emerald-dim); color:var(--emerald3); border:1px solid var(--border2); }
  .badge-cancelled { background:var(--red-dim); color:var(--red); border:1px solid rgba(239,68,68,0.25); }

  .price-delta { display:inline-flex; align-items:center; gap:3px; font-size:0.7rem; font-weight:700; padding:2px 7px; border-radius:6px; }
  .price-delta.up { color:#4ade80; background:rgba(74,222,128,0.1); }
  .price-delta.down { color:#f87171; background:rgba(248,113,113,0.1); }
  .price-delta.fair { color:var(--text2); background:var(--glass); }

  /* ── ORDER TIMELINE ── */
  .order-timeline { display:flex; align-items:center; margin:0.4rem 0; }
  .timeline-step { display:flex; flex-direction:column; align-items:center; flex:1; position:relative; }
  .timeline-step:not(:last-child)::after { content:''; position:absolute; top:12px; left:50%; width:100%; height:2px; background:var(--border); z-index:0; }
  .timeline-step.done:not(:last-child)::after { background:var(--emerald); }
  .timeline-dot { width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:800; z-index:1; border:2px solid var(--border); background:var(--bg); color:var(--text3); transition:all 0.3s; }
  .timeline-step.done .timeline-dot { border-color:var(--emerald); background:var(--emerald-dim); color:var(--emerald3); }
  .timeline-step.active .timeline-dot { border-color:var(--amber); background:var(--amber-dim); color:var(--amber); box-shadow:0 0 10px rgba(245,158,11,0.4); animation:activePulse 1.5s ease infinite; }
  @keyframes activePulse { 0%,100%{box-shadow:0 0 6px rgba(245,158,11,0.3)} 50%{box-shadow:0 0 16px rgba(245,158,11,0.6)} }
  .timeline-label { font-size:0.58rem; font-weight:600; color:var(--text3); margin-top:3px; text-transform:uppercase; letter-spacing:0.3px; }
  .timeline-step.done .timeline-label { color:var(--emerald); }
  .timeline-step.active .timeline-label { color:var(--amber); }

  /* ── STAT / TABLE / FORM / MODAL / TABS / ETC ── */
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:1rem; margin-bottom:1.75rem; }
  .stat-card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); padding:1.1rem 1.3rem; position:relative; overflow:hidden; backdrop-filter:blur(10px); transition:all 0.25s; }
  .stat-card:hover { border-color:var(--border2); box-shadow:var(--glow-e); }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--emerald),transparent); }
  .stat-card.amber::before { background:linear-gradient(90deg,var(--amber),transparent); }
  .stat-card.blue::before { background:linear-gradient(90deg,var(--blue),transparent); }
  .stat-card.red::before { background:linear-gradient(90deg,var(--red),transparent); }
  .stat-card.purple::before { background:linear-gradient(90deg,var(--purple),transparent); }
  .stat-icon { font-size:1.3rem; margin-bottom:6px; } .stat-val { font-family:'Outfit'; font-size:1.8rem; font-weight:800; color:var(--text); margin-bottom:1px; } .stat-label { font-size:0.73rem; color:var(--text2); text-transform:uppercase; letter-spacing:0.5px; }

  .chart-card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); padding:1.3rem; backdrop-filter:blur(10px); margin-bottom:1.75rem; }
  .chart-title { font-family:'Outfit'; font-size:0.95rem; font-weight:700; margin-bottom:1.1rem; color:var(--text); }
  .bar-chart { display:flex; align-items:flex-end; gap:10px; height:100px; }
  .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; height:100%; justify-content:flex-end; }
  .bar-fill { width:100%; border-radius:5px 5px 0 0; min-height:3px; animation:barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes barGrow { from{transform:scaleY(0);transform-origin:bottom} to{transform:scaleY(1)} }
  .bar-label { font-size:0.66rem; color:var(--text2); text-transform:capitalize; } .bar-val { font-size:0.7rem; font-weight:700; color:var(--text); }

  .table-card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; backdrop-filter:blur(10px); } .table-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead th { padding:10px 14px; background:var(--table-bg); color:var(--emerald3); font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.9px; text-align:left; border-bottom:1px solid var(--border); }
  tbody td { padding:10px 14px; border-bottom:1px solid var(--border); font-size:0.83rem; color:var(--text2); vertical-align:middle; }
  tbody tr:last-child td { border-bottom:none; } tbody tr:hover td { background:var(--hover-row); color:var(--text); }

  .tabs-row { display:inline-flex; background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-sm); padding:3px; margin-bottom:1.5rem; }
  .tab-btn { padding:7px 16px; border-radius:6px; border:none; background:none; color:var(--text2); font-size:0.82rem; font-weight:600; cursor:pointer; transition:all 0.16s; font-family:'Inter'; }
  .tab-btn.active { background:var(--emerald-dim); color:var(--emerald3); } .tab-btn:hover:not(.active) { color:var(--text); }

  .form-card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); padding:1.8rem; backdrop-filter:blur(20px); max-width:400px; margin:0 auto; }
  .form-title { font-family:'Outfit'; font-size:1.35rem; font-weight:800; color:var(--text); text-align:center; margin-bottom:0.2rem; }
  .form-subtitle { font-size:0.82rem; color:var(--text2); text-align:center; margin-bottom:1.4rem; }
  .form-group { margin-bottom:0.9rem; } .form-label { display:block; font-size:0.76rem; font-weight:700; color:var(--text2); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.5px; }
  .form-input { width:100%; padding:9px 12px; background:var(--input-bg); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-size:0.88rem; font-family:'Inter'; outline:none; transition:border 0.2s,box-shadow 0.2s; }
  .form-input::placeholder { color:var(--text3); } .form-input:focus { border-color:var(--emerald); box-shadow:0 0 0 3px rgba(16,185,129,0.1); }
  textarea.form-input { resize:vertical; min-height:70px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:0.9rem; }
  .form-toggle { display:flex; background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius-sm); overflow:hidden; margin-bottom:1.3rem; }
  .form-toggle-btn { flex:1; padding:9px; background:none; border:none; color:var(--text2); font-size:0.86rem; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'Inter'; }
  .form-toggle-btn.active { background:var(--emerald-dim); color:var(--emerald3); }

  .overlay { position:fixed; inset:0; background:rgba(0,0,0,${dark?0.72:0.4}); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:300; padding:1rem; animation:fadeIn 0.12s ease; }
  .modal { background:${dark?"#0c1e1e":"#fff"}; border:1px solid var(--border); border-radius:var(--radius); padding:1.6rem; width:100%; max-width:480px; box-shadow:var(--shadow-lg); animation:slideDown 0.2s ease; }
  .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.1rem; }
  .modal-title { font-family:'Outfit'; font-size:1.1rem; font-weight:700; color:var(--text); }
  .modal-close { background:none; border:none; color:var(--text3); font-size:1.1rem; cursor:pointer; } .modal-close:hover { color:var(--text); }
  .order-total-box { background:var(--emerald-dim); border:1px solid var(--border2); border-radius:var(--radius-sm); padding:9px 13px; display:flex; justify-content:space-between; align-items:center; margin-bottom:0.9rem; }
  .order-total-label { font-size:0.82rem; color:var(--text2); } .order-total-val { font-family:'Outfit'; font-size:1.15rem; font-weight:800; color:var(--emerald3); }

  .inline-form { background:var(--card-bg); border:1px solid var(--border); border-radius:var(--radius); padding:1.3rem; margin-bottom:1.3rem; }
  .inline-form-title { font-family:'Outfit'; font-size:0.95rem; font-weight:700; margin-bottom:1rem; color:var(--emerald3); }

  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:0.7rem; }
  .section-title { font-family:'Outfit'; font-size:1.05rem; font-weight:700; color:var(--text); }

  .page-header { margin-bottom:1.5rem; } .page-title { font-family:'Outfit'; font-size:1.65rem; font-weight:800; color:var(--text); margin-bottom:3px; } .page-subtitle { font-size:0.85rem; color:var(--text2); }
  .empty-state { text-align:center; padding:3.5rem 2rem; color:var(--text3); } .empty-state-icon { font-size:2.8rem; margin-bottom:0.8rem; } .empty-state-title { font-family:'Outfit'; font-size:1rem; font-weight:600; color:var(--text2); margin-bottom:0.3rem; } .empty-state-sub { font-size:0.82rem; }
  .pending-notice { background:var(--amber-dim); border:1px solid rgba(245,158,11,0.25); border-radius:var(--radius-sm); padding:0.65rem 1rem; font-size:0.82rem; color:var(--amber); margin-bottom:1.1rem; }
  .offline-toast { position:fixed; bottom:1.25rem; left:50%; transform:translateX(-50%); background:${dark?"#1a0707":"#fef2f2"}; border:1px solid rgba(239,68,68,0.4); color:${dark?"#fca5a5":"#991b1b"}; padding:9px 18px; border-radius:10px; font-size:0.82rem; font-weight:600; z-index:9999; display:flex; align-items:center; gap:8px; box-shadow:var(--shadow-lg); backdrop-filter:blur(12px); }

  .card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); backdrop-filter:blur(20px); transition:all 0.25s; overflow:hidden; }
  .card:hover { border-color:var(--border2); box-shadow:var(--glow-e); transform:translateY(-2px); }

  .calendar-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:1.2rem; }
  .cal-card { background:var(--glass); border:1px solid var(--border); border-radius:var(--radius); padding:1.1rem; backdrop-filter:blur(10px); transition:all 0.25s; position:relative; overflow:hidden; }
  .cal-card:hover { border-color:var(--border2); box-shadow:var(--glow-e); transform:translateY(-2px); }
  .cal-card-season-bar { position:absolute; top:0; left:0; right:0; height:3px; }
  .cal-card-season-bar.kharif { background:linear-gradient(90deg,var(--amber),transparent); }
  .cal-card-season-bar.rabi { background:linear-gradient(90deg,var(--blue),transparent); }
  .cal-card-season-bar.zaid { background:linear-gradient(90deg,var(--emerald),transparent); }
  .cal-card-season-bar.all_season { background:linear-gradient(90deg,var(--emerald3),var(--amber),transparent); }
  .cal-crop-name { font-family:'Outfit'; font-size:0.95rem; font-weight:700; margin:0.4rem 0 0.65rem; }
  .cal-meta { display:grid; grid-template-columns:1fr 1fr; gap:0.4rem; margin-bottom:0.65rem; }
  .cal-meta-label { font-size:0.64rem; color:var(--text3); text-transform:uppercase; letter-spacing:0.5px; } .cal-meta-val { font-size:0.82rem; color:var(--text); font-weight:600; }
  .cal-tip { font-size:0.78rem; color:var(--emerald3); font-style:italic; margin-top:0.4rem; padding-top:0.65rem; border-top:1px solid var(--border); }

  .auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:radial-gradient(ellipse at 30% 50%,rgba(16,185,129,0.08) 0%,transparent 60%),radial-gradient(ellipse at 70% 80%,rgba(245,158,11,0.05) 0%,transparent 60%),var(--bg); padding:2rem; }
  .auth-container { width:100%; max-width:380px; } .auth-logo-icon { width:52px; height:52px; background:linear-gradient(135deg,var(--emerald),var(--emerald2)); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; margin:0 auto 10px; box-shadow:var(--glow-e); }

  .hero { position:relative; overflow:hidden; background:linear-gradient(135deg,${dark?"#030909":"#e8f5ed"} 0%,${dark?"#081a14":"#d1fae5"} 40%,${dark?"#0a1a08":"#fef3c7"} 100%); padding:4.5rem 3rem 3.5rem; display:flex; align-items:center; justify-content:center; flex-direction:column; text-align:center; min-height:88vh; }
  .hero-orb { position:absolute; border-radius:50%; filter:blur(90px); animation:floatOrb 9s ease-in-out infinite; pointer-events:none; }
  .hero-orb-1 { width:500px; height:500px; background:radial-gradient(circle,rgba(16,185,129,${dark?0.15:0.12}) 0%,transparent 70%); top:-120px; left:-120px; }
  .hero-orb-2 { width:380px; height:380px; background:radial-gradient(circle,rgba(245,158,11,${dark?0.1:0.08}) 0%,transparent 70%); bottom:-100px; right:-100px; animation-delay:-4.5s; }
  .hero-orb-3 { width:250px; height:250px; background:radial-gradient(circle,rgba(52,211,153,${dark?0.09:0.07}) 0%,transparent 70%); top:55%; left:60%; animation-delay:-2.2s; }
  @keyframes floatOrb { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(25px,-20px) scale(1.04)} 66%{transform:translate(-16px,12px) scale(0.97)} }
  .hero-grain { position:absolute; inset:0; opacity:${dark?0.35:0.15}; pointer-events:none; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); }
  .hero-badge { display:inline-flex; align-items:center; gap:6px; background:var(--emerald-dim); border:1px solid var(--border2); color:var(--emerald3); font-size:0.71rem; font-weight:700; padding:5px 13px; border-radius:20px; margin-bottom:1.3rem; text-transform:uppercase; letter-spacing:1.1px; animation:fadeSlideUp 0.6s ease both; }
  .hero h1 { font-size:clamp(2.4rem,5vw,4rem); font-weight:900; line-height:1.05; background:linear-gradient(135deg,${dark?"#edfaf3":"#1a2e28"} 30%,var(--emerald3) 65%,var(--amber) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:1rem; animation:fadeSlideUp 0.6s 0.1s ease both; }
  .hero-sub { font-size:1.05rem; color:var(--text2); max-width:480px; margin:0 auto 2rem; font-weight:400; animation:fadeSlideUp 0.6s 0.2s ease both; }
  .hero-cta { display:flex; gap:0.9rem; justify-content:center; flex-wrap:wrap; animation:fadeSlideUp 0.6s 0.3s ease both; }
  .hero-stats { display:flex; gap:2.5rem; justify-content:center; flex-wrap:wrap; margin-top:3rem; padding-top:2.2rem; border-top:1px solid var(--border); animation:fadeSlideUp 0.6s 0.4s ease both; }
  .hero-stat-item { text-align:center; } .hero-stat-num { font-family:'Outfit'; font-size:1.9rem; font-weight:900; color:var(--emerald3); } .hero-stat-label { font-size:0.72rem; color:var(--text2); text-transform:uppercase; letter-spacing:1px; margin-top:2px; }
  @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .mobile-menu-btn { display:none; position:fixed; top:0.9rem; left:0.9rem; z-index:200; background:var(--glass); border:1px solid var(--border); color:var(--text); width:38px; height:38px; border-radius:var(--radius-sm); cursor:pointer; font-size:1.05rem; align-items:center; justify-content:center; backdrop-filter:blur(10px); }
  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:99; }
  @media(max-width:768px) {
    .sidebar{transform:translateX(-100%)} .sidebar.open{transform:translateX(0)} .sidebar-overlay.open{display:block} .mobile-menu-btn{display:flex}
    .main-content{margin-left:0} .page-wrapper{padding:1rem;margin-top:52px} .form-row{grid-template-columns:1fr}
    .hero{padding:2.5rem 1.3rem;min-height:auto;padding-top:4.5rem} .hero h1{font-size:2rem} .hero-stats{gap:1.3rem}
    .stats-grid{grid-template-columns:1fr 1fr} .season-banner{padding:7px 1rem;font-size:0.76rem;flex-wrap:wrap;gap:5px}
    .ticker-wrap{display:none} .compare-bar{left:1rem;right:1rem;transform:none}
  }
  @media(max-width:480px) { .stats-grid{grid-template-columns:1fr} .crops-grid{grid-template-columns:1fr} }
  `;
};

// ── STYLE INJECTOR ────────────────────────────
function StyleTag({ dark }) {
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "fm-styles";
    el.textContent = buildCSS(dark);
    const old = document.getElementById("fm-styles");
    if (old) old.remove();
    document.head.appendChild(el);
    return () => { const s = document.getElementById("fm-styles"); if (s) s.remove(); };
  }, [dark]);
  return null;
}

// ── OFFLINE BANNER ────────────────────────────
function useBackendStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() => { let d=false; const c=async()=>{ const ok=await api.ping(); if(!d) setOnline(ok); }; c(); const id=setInterval(c,5000); return()=>{d=true;clearInterval(id);}; }, []);
  return online;
}
function OfflineBanner() {
  const online = useBackendStatus();
  if (online) return null;
  return <div className="offline-toast">⚠️ Backend offline — run <code style={{background:"rgba(128,128,128,0.2)",padding:"1px 5px",borderRadius:3,fontSize:"0.78rem"}}>node server.js</code></div>;
}

// ── TOAST SYSTEM ──────────────────────────────
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="info", dur=4000) => {
    const id = Date.now()+Math.random();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), dur);
  },[]);
  const icons = { success:"✅", error:"❌", info:"ℹ️" };
  return (
    <ToastCtx.Provider value={{ toast:add, success:m=>add(m,"success"), error:m=>add(m,"error"), info:m=>add(m,"info") }}>
      {children}
      <div className="toast-container">
        {toasts.map(t=>(
          <div key={t.id} className={`toast toast-${t.type}`} onClick={()=>setToasts(ts=>ts.filter(x=>x.id!==t.id))}>
            <span className="toast-icon">{icons[t.type]}</span>
            <span className="toast-msg">{t.msg}</span>
            <button className="toast-close">✕</button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ── CONFETTI ──────────────────────────────────
function fireConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);
  const colors = ["#10b981","#34d399","#f59e0b","#3b82f6","#a78bfa","#f87171","#fbbf24","#6ee7b7"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const shapes = ["50%","0%","30%"];
    piece.style.cssText = `
      left:${Math.random()*100}%; background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*8}px; height:${6+Math.random()*8}px; border-radius:${shapes[Math.floor(Math.random()*3)]};
      animation-duration:${1.5+Math.random()*2}s; animation-delay:${Math.random()*0.5}s;
    `;
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 4000);
}

// ── ANIMATED COUNTER ──────────────────────────
function AnimCounter({ target, prefix="", suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const num = parseFloat(String(target).replace(/[^0-9.]/g,""))||0;
    let start=null;
    const step = ts => { if(!start) start=ts; const p=Math.min((ts-start)/900,1); setVal(Math.floor((1-Math.pow(1-p,3))*num)); if(p<1) ref.current=requestAnimationFrame(step); };
    ref.current = requestAnimationFrame(step);
    return()=>cancelAnimationFrame(ref.current);
  },[target]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

// ── SPARKLINE SVG ─────────────────────────────
function Sparkline({ data, color="var(--emerald3)", width=80, height=24 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max-min||1;
  const points = data.map((v,i) => `${(i/(data.length-1))*width},${height-((v-min)/range)*height}`).join(" ");
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ── FRESHNESS METER ───────────────────────────
function FreshnessMeter({ quantity, maxQty }) {
  const pct = Math.min((quantity / (maxQty||100))*100, 100);
  const color = pct > 60 ? "#10b981" : pct > 30 ? "#f59e0b" : "#ef4444";
  const label = pct > 60 ? "Fresh" : pct > 30 ? "Limited" : "Low stock";
  return (
    <div className="freshness-meter">
      <div className="freshness-bar"><div className="freshness-fill" style={{ width:`${pct}%`, background:color }} /></div>
      <span className="freshness-label" style={{ color }}>{label}</span>
    </div>
  );
}

// ── PRICE DELTA ───────────────────────────────
function PriceDelta({ price, marketRate }) {
  if (!marketRate) return null;
  const d = ((price-marketRate)/marketRate*100).toFixed(1);
  const cls = d>5?"up":d<-5?"down":"fair";
  return <span className={`price-delta ${cls}`}>{cls==="fair"?"Fair price":`${d>0?"▲":"▼"}${Math.abs(d)}%`}</span>;
}

// ── ORDER TIMELINE ────────────────────────────
const ORDER_STEPS = ["pending","confirmed","shipped","delivered"];
function OrderTimeline({ status }) {
  const cur = status==="cancelled" ? -1 : ORDER_STEPS.indexOf(status);
  return (
    <div className="order-timeline">
      {ORDER_STEPS.map((s,i)=>(
        <div key={s} className={`timeline-step ${status==="cancelled"?"":cur>i||(cur===ORDER_STEPS.length-1&&i<=cur)?"done":i===cur?"active":""}`}>
          <div className="timeline-dot">{status==="cancelled"&&i===0?"✕":cur>i?"✓":i+1}</div>
          <div className="timeline-label">{s}</div>
        </div>
      ))}
    </div>
  );
}

// ── TICKER ────────────────────────────────────
function PriceTicker({ crops }) {
  if (!crops||crops.length===0) return null;
  const items = [...crops,...crops];
  return (
    <div className="ticker-wrap" title="Live prices — hover to pause">
      <div className="ticker-track">
        {items.map((c,i) => {
          const d = c.market_rate ? ((c.price-c.market_rate)/c.market_rate*100).toFixed(1) : null;
          return (
            <span key={i} className="ticker-item">
              <span>{emojiMap[c.category]||"🌱"}</span>
              <span className="ticker-crop">{c.crop_name}</span>
              <span className="ticker-price">₹{c.price}/{c.unit}</span>
              {d!==null&&<span className={d>=0?"ticker-up":"ticker-down"}>{d>=0?"▲":"▼"}{Math.abs(d)}%</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── SEASON BANNER ─────────────────────────────
function SeasonBanner() {
  const s = getCurrentSeason();
  return (
    <div className="season-banner">
      <span className="season-pill" style={{ background:`${s.color}18`, color:s.color, border:`1px solid ${s.color}33` }}>{s.icon} {s.name}</span>
      <span>{s.desc}</span>
    </div>
  );
}

// ── CATEGORY PILLS ────────────────────────────
const CATEGORIES = [{id:"",label:"All",emoji:"🌿"},{id:"Grain",label:"Grain",emoji:"🌾"},{id:"Vegetable",label:"Veggie",emoji:"🥬"},{id:"Fruit",label:"Fruit",emoji:"🍎"},{id:"Spice",label:"Spice",emoji:"🌶️"},{id:"Pulse",label:"Pulse",emoji:"🫘"}];
function CategoryPills({ selected, onSelect }) {
  return <div className="cat-pills">{CATEGORIES.map(c=><button key={c.id} className={`cat-pill ${selected===c.id?"active":""}`} onClick={()=>onSelect(c.id)}><span>{c.emoji}</span>{c.label}</button>)}</div>;
}

// ── VOICE SEARCH ──────────────────────────────
function VoiceSearch({ onResult }) {
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);
  const start = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { alert("Voice search not supported in this browser"); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN"; rec.continuous = false; rec.interimResults = false;
    rec.onresult = e => { const t=e.results[0][0].transcript; onResult(t); setRecording(false); };
    rec.onerror = () => setRecording(false);
    rec.onend   = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };
  const stop = () => { if(recRef.current) recRef.current.stop(); setRecording(false); };
  return <button className={`voice-btn ${recording?"recording":""}`} onClick={recording?stop:start} title="Voice search">🎤</button>;
}

// ── COMMAND PALETTE ───────────────────────────
function CommandPalette({ open, onClose, setPage, crops }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { if(open && inputRef.current) { setQ(""); inputRef.current.focus(); } }, [open]);

  const commands = useMemo(() => {
    const base = [
      { icon:"🏠", label:"Go to Home",        action:()=>{setPage("home");onClose();} },
      { icon:"🛒", label:"Go to Market",       action:()=>{setPage("market");onClose();} },
      { icon:"📅", label:"Go to Crop Calendar", action:()=>{setPage("calendar");onClose();} },
      { icon:"🔐", label:"Login / Register",    action:()=>{setPage("auth");onClose();} },
      { icon:"🌱", label:"Go to Farmer Dashboard", action:()=>{setPage("farmer");onClose();} },
      { icon:"📦", label:"Go to My Orders",     action:()=>{setPage("orders");onClose();} },
      { icon:"⚙️", label:"Go to Admin Panel",   action:()=>{setPage("admin");onClose();} },
    ];
    const cropCmds = (crops||[]).slice(0,8).map(c => ({
      icon: emojiMap[c.category]||"🌱",
      label: `${c.crop_name} — ₹${c.price}/${c.unit}`,
      hint: `by ${c.farmer_name}`,
      action:()=>{setPage("market");onClose();}
    }));
    return [...base, ...cropCmds];
  }, [crops, setPage, onClose]);

  const filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase())) : commands;

  if (!open) return null;
  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box" onClick={e=>e.stopPropagation()}>
        <input ref={inputRef} className="cmd-input" placeholder="Type a command or search…" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==="Escape") onClose(); if(e.key==="Enter"&&filtered[0]) filtered[0].action(); }} />
        <div className="cmd-list">
          {filtered.map((c,i) => (
            <div key={i} className="cmd-item" onClick={c.action}>
              <span className="cmd-item-icon">{c.icon}</span>
              <span className="cmd-item-label">{c.label}</span>
              {c.hint && <span className="cmd-item-hint">{c.hint}</span>}
            </div>
          ))}
          {filtered.length===0 && <div style={{padding:"1.5rem",textAlign:"center",color:"var(--text3)",fontSize:"0.85rem"}}>No results found</div>}
        </div>
        <div className="cmd-footer"><span><span className="kbd">↵</span> Select</span><span><span className="kbd">Esc</span> Close</span></div>
      </div>
    </div>
  );
}

// ── NOTIFICATION CENTER ───────────────────────
function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return()=>document.removeEventListener("mousedown",h);
  },[]);
  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button className="notif-bell" onClick={()=>setOpen(!open)}>
        🔔 {notifications.length>0 && <span className="notif-dot" />}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-header"><span>Notifications</span><span className="badge badge-emerald">{notifications.length}</span></div>
          {notifications.length===0 ? <div className="notif-empty">No new notifications</div> : notifications.map((n,i)=>(
            <div key={i} className="notif-item"><span>{n.icon}</span><span>{n.text}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── COMPARE TOOL ──────────────────────────────
function CompareBar({ items, onRemove, onCompare }) {
  if (items.length === 0) return null;
  return (
    <div className="compare-bar">
      <span style={{ fontSize:"0.82rem", fontWeight:700, color:"var(--text)" }}>⚖️ Compare</span>
      {items.map(c => <span key={c.crop_id} className="badge badge-emerald" style={{cursor:"pointer"}} onClick={()=>onRemove(c.crop_id)}>{c.crop_name} ✕</span>)}
      {items.length === 2 && <button className="btn btn-primary btn-xs" onClick={onCompare}>Compare →</button>}
      {items.length < 2  && <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>Select {2-items.length} more</span>}
    </div>
  );
}
function CompareModal({ items, onClose }) {
  if (items.length < 2) return null;
  const [a,b] = items;
  const rows = [
    { label:"Price",    va:`₹${a.price}/${a.unit}`,   vb:`₹${b.price}/${b.unit}`,   win:Number(a.price)<Number(b.price)?"a":"b" },
    { label:"Stock",    va:`${a.quantity} ${a.unit}`,  vb:`${b.quantity} ${b.unit}`,  win:Number(a.quantity)>Number(b.quantity)?"a":"b" },
    { label:"Category", va:a.category,                 vb:b.category,                 win:null },
    { label:"Season",   va:a.season,                   vb:b.season,                   win:null },
    { label:"Farmer",   va:a.farmer_name,              vb:b.farmer_name,              win:null },
    { label:"Location", va:a.farmer_location||"N/A",   vb:b.farmer_location||"N/A",   win:null },
    { label:"Mkt Rate", va:`₹${a.market_rate||"N/A"}`, vb:`₹${b.market_rate||"N/A"}`, win:null },
  ];
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:600 }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header"><div className="modal-title">⚖️ Crop Comparison</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="compare-modal-grid">
          <div className="compare-col"><h3>{emojiMap[a.category]||"🌱"} {a.crop_name}</h3></div>
          <div className="compare-col"><h3>{emojiMap[b.category]||"🌱"} {b.crop_name}</h3></div>
        </div>
        <div style={{ marginTop:"1rem" }}>
          {rows.map(r => (
            <div key={r.label} className="compare-row">
              <span className="compare-label">{r.label}</span>
              <span className={r.win==="a"?"compare-winner":""}>{r.va}</span>
              <span className={r.win==="b"?"compare-winner":""}>{r.vb}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CSV EXPORT ────────────────────────────────
function exportCSV(data, filename) {
  if(!data||!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${String(row[k]||"").replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
}

// ── PRINT INVOICE ─────────────────────────────
function printInvoice(order) {
  const w = window.open("","","width=600,height=700");
  w.document.write(`<html><head><title>Invoice #${order.order_id}</title>
    <style>body{font-family:Arial;padding:2rem;color:#1a1a1a} h1{color:#059669;margin-bottom:0.3rem} table{width:100%;border-collapse:collapse;margin:1.5rem 0} th,td{border:1px solid #ddd;padding:10px;text-align:left} th{background:#f0fdf4} .footer{margin-top:2rem;font-size:0.85rem;color:#666;border-top:1px solid #ddd;padding-top:1rem}</style>
  </head><body>
    <h1>🌾 FarmMarket Invoice</h1>
    <p style="color:#666">Order #${order.order_id} · ${new Date().toLocaleDateString()}</p>
    <table><tr><th>Item</th><td>${order.crop_name}</td></tr><tr><th>Farmer</th><td>${order.farmer_name}</td></tr><tr><th>Quantity</th><td>${order.quantity}</td></tr><tr><th>Total</th><td style="font-size:1.2rem;font-weight:bold;color:#059669">₹${order.total_price}</td></tr><tr><th>Status</th><td>${order.status}</td></tr>${order.driver_name?`<tr><th>Transport</th><td>${order.driver_name} · ${order.vehicle_no}</td></tr>`:""}</table>
    <div class="footer">Thank you for supporting local farmers! 🌾<br>FarmMarket — Fresh & Fair</div>
  </body></html>`);
  w.document.close(); w.print();
}

// ── PAGE WRAP ─────────────────────────────────
function PageWrap({ children }) { return <div className="page-enter page-wrapper">{children}</div>; }

// ── SIDEBAR ───────────────────────────────────
function Sidebar({ page, setPage, sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const { dark, toggle }  = useTheme();
  const initials = user?.name?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)||"?";
  const go = id => { setPage(id); setSidebarOpen(false); };

  const groups = [
    { label:"Explore", items:[{ id:"home",icon:"🏠",label:"Home" },{ id:"market",icon:"🛒",label:"Marketplace" },{ id:"calendar",icon:"📅",label:"Crop Calendar" }]},
    ...(user?.role==="farmer"?[{ label:"Farmer", items:[{ id:"farmer",icon:"🌱",label:"Dashboard" }] }]:[]),
    ...(user?.role==="buyer"?[{ label:"Buyer", items:[{ id:"orders",icon:"📦",label:"My Orders" }] }]:[]),
    ...(user?.role==="admin"?[{ label:"Admin", items:[{ id:"admin",icon:"⚙️",label:"Admin Panel" }] }]:[]),
  ];

  return (
    <>
      <div className={`sidebar-overlay ${sidebarOpen?"open":""}`} onClick={()=>setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen?"open":""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">🌾</div>
          <div><div className="logo-text">FarmMarket</div><div className="logo-sub">Fresh & Fair</div></div>
        </div>
        <nav className="sidebar-nav">
          {groups.map(g=>(
            <div key={g.label}>
              <div className="nav-section-label">{g.label}</div>
              {g.items.map(item=>(
                <div key={item.id} className={`nav-item ${page===item.id?"active":""}`} onClick={()=>go(item.id)}>
                  <span className="nav-icon">{item.icon}</span>{item.label}
                </div>
              ))}
            </div>
          ))}
          <div className="sidebar-divider" />
          {!user && <div className={`nav-item ${page==="auth"?"active":""}`} onClick={()=>go("auth")}><span className="nav-icon">🔐</span>Login / Register</div>}
        </nav>
        <div className="theme-toggle" onClick={toggle}>
          <div className="theme-toggle-track"><div className="theme-toggle-thumb" /></div>
          <span className="theme-toggle-label">{dark?"Dark":"Light"} Mode</span>
        </div>
        {user && (
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info"><div className="user-name">{user.name}</div><div className="user-role">{user.role}</div></div>
            <button className="logout-btn" onClick={logout} title="Logout">↩</button>
          </div>
        )}
      </aside>
    </>
  );
}

// ── AUTH PAGE ─────────────────────────────────
function AuthPage({ onAuth }) {
  const { toast } = useToast();
  const [isLogin,setIsLogin]=useState(true);
  const [form,setForm]=useState({name:"",email:"",password:"",role:"buyer",phone:"",location:""});
  const [loading,setLoading]=useState(false);
  const f=k=>e=>setForm({...form,[k]:e.target.value});
  const submit=async()=>{
    setLoading(true);
    const res=isLogin?await api.post("/auth/login",{email:form.email,password:form.password}):await api.post("/auth/register",form);
    setLoading(false);
    if(res?.token){ onAuth(res); toast("Welcome to FarmMarket!","success"); }
    else if(res?.message) toast(res.message,"success");
    else toast(res?.error||"Something went wrong","error");
  };
  return (
    <div className="auth-page"><div className="auth-container">
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div className="auth-logo-icon">🌾</div>
        <h1 style={{fontFamily:"Outfit",fontSize:"1.4rem",fontWeight:900,color:"var(--text)",marginTop:6,marginBottom:3}}>FarmMarket</h1>
        <p style={{fontSize:"0.82rem",color:"var(--text2)"}}>Direct from farms to your table</p>
      </div>
      <div className="form-card">
        <div className="form-toggle"><button className={`form-toggle-btn ${isLogin?"active":""}`} onClick={()=>setIsLogin(true)}>Login</button><button className={`form-toggle-btn ${!isLogin?"active":""}`} onClick={()=>setIsLogin(false)}>Register</button></div>
        {!isLogin&&(<>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={f("name")} placeholder="Ravi Kumar"/></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={f("phone")} placeholder="9876543210"/></div><div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={f("location")} placeholder="Punjab"/></div></div>
          <div className="form-group"><label className="form-label">I am a</label><select className="form-input" value={form.role} onChange={f("role")}><option value="buyer">Buyer</option><option value="farmer">Farmer</option></select></div>
        </>)}
        <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={form.email} onChange={f("email")} placeholder="you@email.com"/></div>
        <div className="form-group" style={{marginBottom:"1.1rem"}}><label className="form-label">Password</label><input type="password" className="form-input" value={form.password} onChange={f("password")} placeholder="••••••••"/></div>
        <button className="btn btn-primary btn-full" onClick={submit} disabled={loading}>{loading?"⏳ Please wait…":isLogin?"Login →":"Create Account →"}</button>
        {!isLogin&&<p style={{fontSize:"0.71rem",color:"var(--text3)",marginTop:"0.8rem",textAlign:"center"}}>Farmer accounts need admin approval.</p>}
      </div>
    </div></div>
  );
}

// ── HERO ──────────────────────────────────────
function HeroPage({ setPage }) {
  const { user } = useAuth();
  const g = getGreeting();
  return (
    <div className="hero">
      <div className="hero-orb hero-orb-1"/><div className="hero-orb hero-orb-2"/><div className="hero-orb hero-orb-3"/><div className="hero-grain"/>
      {user && <div className="hero-badge">{g.icon} {g.text}, {user.name}!</div>}
      {!user && <div className="hero-badge">🌿 Farm-to-Table Marketplace</div>}
      <h1>Fresh Crops,<br/>Fair Prices</h1>
      <p className="hero-sub">Connect with local farmers. Buy fresh produce, track orders in real-time, and support sustainable agriculture.</p>
      <div className="hero-cta">
        <button className="btn btn-primary" onClick={()=>setPage("market")}>🛒 Browse Market</button>
        <button className="btn btn-ghost" onClick={()=>setPage("auth")}>Join as Farmer ↗</button>
      </div>
      <div className="hero-stats">
        {[["500+","Farmers"],["50+","Varieties"],["10K+","Deliveries"],["4.9★","Rating"]].map(([n,l])=>(
          <div key={l} className="hero-stat-item"><div className="hero-stat-num">{n}</div><div className="hero-stat-label">{l}</div></div>
        ))}
      </div>
    </div>
  );
}

// ── MARKET PAGE ───────────────────────────────
function MarketPage() {
  const { user, token }=useAuth();
  const { toast }=useToast();
  const [crops,setCrops]=useState([]);
  const [search,setSearch]=useState("");
  const [season,setSeason]=useState("");
  const [category,setCategory]=useState("");
  const [orderModal,setOrderModal]=useState(null);
  const [orderQty,setOrderQty]=useState(1);
  const [orderAddr,setOrderAddr]=useState("");
  const [wishlist,setWishlist]=useState(()=>{ try{return JSON.parse(localStorage.getItem("fm_wish")||"[]")}catch{return[]} });
  const [compareList,setCompareList]=useState([]);
  const [showCompare,setShowCompare]=useState(false);

  const toggleWish=id=>{ const nw=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id]; setWishlist(nw); localStorage.setItem("fm_wish",JSON.stringify(nw)); toast(nw.includes(id)?"Added to wishlist ❤️":"Removed from wishlist","info"); };
  const toggleCompare=crop=>{ if(compareList.find(c=>c.crop_id===crop.crop_id)) setCompareList(compareList.filter(c=>c.crop_id!==crop.crop_id)); else if(compareList.length<2) setCompareList([...compareList,crop]); else toast("You can compare only 2 crops at a time","info"); };

  const load=async()=>{
    let url="/crops?";
    if(search) url+=`search=${encodeURIComponent(search)}&`;
    if(season) url+=`season=${season}&`;
    if(category) url+=`category=${encodeURIComponent(category)}`;
    const d=await api.get(url);
    setCrops(Array.isArray(d)?d:[]);
    if(d===null) toast("Cannot reach server","error");
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{load();},[search,season,category]);

  const placeOrder=async()=>{
    if(!token){toast("Please login to order","error");return;}
    const res=await api.post("/orders",{crop_id:orderModal.crop_id,quantity:Number(orderQty),delivery_address:orderAddr},token);
    if(res?.order_id){ fireConfetti(); toast(`Order placed! Total: ₹${res.total_price}`,"success"); setOrderModal(null); setOrderQty(1); setOrderAddr(""); }
    else toast(res?.error||"Order failed","error");
  };

  const maxQty=Math.max(...crops.map(c=>Number(c.quantity)||1),1);
  const sparkData=crops.slice(0,10).map(c=>Number(c.price)||0);

  return (
    <PageWrap>
      <PriceTicker crops={crops}/>
      <div style={{paddingTop:"1rem"}}>
        <div className="page-header">
          <h1 className="page-title">🛒 Marketplace</h1>
          <p className="page-subtitle">Fresh produce from farmers near you · {crops.length} listings {sparkData.length>2&&<Sparkline data={sparkData} width={60} height={16}/>}</p>
        </div>
        <div className="search-row">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search crops…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <VoiceSearch onResult={t=>{setSearch(t);toast(`Searching: "${t}"`,"info");}} />
          <select className="filter-select" value={season} onChange={e=>setSeason(e.target.value)}>
            <option value="">All Seasons</option><option value="kharif">Kharif</option><option value="rabi">Rabi</option><option value="zaid">Zaid</option><option value="all_season">All Season</option>
          </select>
        </div>
        <CategoryPills selected={category} onSelect={setCategory}/>

        {crops.length===0?(
          <div className="empty-state"><div className="empty-state-icon">🌾</div><div className="empty-state-title">No crops found</div><div className="empty-state-sub">Try adjusting your search or filters</div></div>
        ):(
          <div className="crops-grid">
            {crops.map(c=>(
              <div className={`crop-card ${c.demand_level==="high"?"hot":""}`} key={c.crop_id}>
                <div className="crop-emoji-banner">
                  {emojiMap[c.category]||"🌱"}
                  {c.demand_level==="high"&&<div className="crop-hot-tag">🔥 Hot</div>}
                </div>
                <div className="crop-card-body">
                  <div className="crop-card-header">
                    <div className="crop-name">{c.crop_name}</div>
                    <div style={{display:"flex",gap:4}}>
                      <button className={`wish-btn ${wishlist.includes(c.crop_id)?"liked":""}`} onClick={()=>toggleWish(c.crop_id)}>{wishlist.includes(c.crop_id)?"❤️":"🤍"}</button>
                      <button className="wish-btn" onClick={()=>toggleCompare(c)} title="Compare" style={{fontSize:"0.9rem"}}>{compareList.find(x=>x.crop_id===c.crop_id)?"✅":"⚖️"}</button>
                    </div>
                  </div>
                  <div className="crop-farmer">by {c.farmer_name} · 📍 {c.farmer_location||"Unknown"}</div>
                  <div className="crop-tags">
                    <span className="badge badge-emerald">{c.season}</span>
                    <span className="badge badge-amber">{c.category}</span>
                  </div>
                  <FreshnessMeter quantity={Number(c.quantity)} maxQty={maxQty}/>
                  <div className="crop-price-row">
                    <div className="crop-price">₹{c.price}<span style={{fontSize:"0.75rem",fontWeight:400,color:"var(--text2)"}}>/{c.unit}</span></div>
                    <PriceDelta price={Number(c.price)} marketRate={Number(c.market_rate)}/>
                  </div>
                  <div className="crop-stock">📦 {c.quantity} {c.unit} · Market ₹{c.market_rate}</div>
                  {user?.role==="buyer"&&<button className="btn btn-primary btn-sm btn-full" style={{marginTop:4}} onClick={()=>{setOrderModal(c);setOrderQty(1);}}>Order Now →</button>}
                  {!user&&<span style={{fontSize:"0.72rem",color:"var(--text3)"}}>Login as buyer to order</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <CompareBar items={compareList} onRemove={id=>setCompareList(compareList.filter(c=>c.crop_id!==id))} onCompare={()=>setShowCompare(true)}/>
        {showCompare&&<CompareModal items={compareList} onClose={()=>setShowCompare(false)}/>}

        {orderModal&&(
          <div className="overlay" onClick={()=>setOrderModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <div className="modal-header"><div className="modal-title">Order — {orderModal.crop_name}</div><button className="modal-close" onClick={()=>setOrderModal(null)}>✕</button></div>
              <div className="form-group"><label className="form-label">Quantity ({orderModal.unit})</label><input type="number" min="1" max={orderModal.quantity} className="form-input" value={orderQty} onChange={e=>setOrderQty(e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Delivery Address</label><textarea className="form-input" rows="2" value={orderAddr} onChange={e=>setOrderAddr(e.target.value)} placeholder="House No, Street, City…"/></div>
              <div className="order-total-box"><span className="order-total-label">Estimated Total</span><span className="order-total-val">₹{(orderModal.price*orderQty).toFixed(2)}</span></div>
              <div style={{display:"flex",gap:"0.7rem"}}><button className="btn btn-primary" style={{flex:1}} onClick={placeOrder}>Confirm Order ✓</button><button className="btn btn-ghost" onClick={()=>setOrderModal(null)}>Cancel</button></div>
            </div>
          </div>
        )}
      </div>
    </PageWrap>
  );
}

// ── FARMER DASHBOARD ──────────────────────────
function FarmerPage() {
  const {token,user}=useAuth(); const {toast}=useToast();
  const [crops,setCrops]=useState([]); const [orders,setOrders]=useState([]); const [tab,setTab]=useState("crops");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:"",category:"Grain",quantity:"",unit:"kg",price:"",season:"kharif",description:""});
  const loadCrops=async()=>{const d=await api.get("/crops",token);setCrops(Array.isArray(d)?d:[]);}; const loadOrders=async()=>{const d=await api.get("/orders",token);setOrders(Array.isArray(d)?d:[]);};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{loadCrops();loadOrders();},[]);
  const addCrop=async()=>{ const res=await api.post("/crops",form,token); if(res?.crop_id){fireConfetti();toast("Crop listed!","success");setShowForm(false);setForm({name:"",category:"Grain",quantity:"",unit:"kg",price:"",season:"kharif",description:""});loadCrops();}else toast(res?.error||"Failed","error"); };
  const updateStatus=async(oid,s)=>{await api.put(`/orders/${oid}/status`,{status:s},token);toast(`Order → ${s}`,"success");loadOrders();};
  const myCrops=crops.filter(c=>c.farmer_name===user?.name);
  const revenue=orders.filter(o=>o.status!=="cancelled").reduce((s,o)=>s+Number(o.total_price||0),0);
  const f=k=>e=>setForm({...form,[k]:e.target.value});

  return (
    <PageWrap>
      <div className="page-header"><h1 className="page-title">🌱 Farmer Dashboard</h1><p className="page-subtitle">Manage listings and track orders</p></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">🌾</div><div className="stat-val"><AnimCounter target={myCrops.length}/></div><div className="stat-label">Crops</div></div>
        <div className="stat-card amber"><div className="stat-icon">📦</div><div className="stat-val"><AnimCounter target={orders.length}/></div><div className="stat-label">Orders</div></div>
        <div className="stat-card blue"><div className="stat-icon">⏳</div><div className="stat-val"><AnimCounter target={orders.filter(o=>o.status==="pending").length}/></div><div className="stat-label">Pending</div></div>
        <div className="stat-card purple"><div className="stat-icon">💰</div><div className="stat-val">₹<AnimCounter target={Math.floor(revenue)}/></div><div className="stat-label">Revenue</div></div>
      </div>
      <div className="tabs-row"><button className={`tab-btn ${tab==="crops"?"active":""}`} onClick={()=>setTab("crops")}>My Crops</button><button className={`tab-btn ${tab==="orders"?"active":""}`} onClick={()=>setTab("orders")}>Orders</button></div>
      {tab==="crops"&&(<>
        <div className="section-header"><span className="section-title">Listings ({myCrops.length})</span><button className="btn btn-primary btn-sm" onClick={()=>setShowForm(!showForm)}>{showForm?"✕ Cancel":"+ Add Crop"}</button></div>
        {showForm&&(
          <div className="inline-form"><div className="inline-form-title">📋 New Crop</div>
            <div className="form-row"><div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={f("name")} placeholder="Wheat"/></div><div className="form-group"><label className="form-label">Category</label><select className="form-input" value={form.category} onChange={f("category")}>{["Grain","Vegetable","Fruit","Spice","Pulse"].map(c=><option key={c}>{c}</option>)}</select></div></div>
            <div className="form-row"><div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-input" value={form.quantity} onChange={f("quantity")}/></div><div className="form-group"><label className="form-label">Unit</label><select className="form-input" value={form.unit} onChange={f("unit")}>{["kg","quintal","ton","dozen","piece"].map(u=><option key={u}>{u}</option>)}</select></div></div>
            <div className="form-row"><div className="form-group"><label className="form-label">Price (₹)</label><input type="number" className="form-input" value={form.price} onChange={f("price")}/></div><div className="form-group"><label className="form-label">Season</label><select className="form-input" value={form.season} onChange={f("season")}>{["kharif","rabi","zaid","all_season"].map(s=><option key={s}>{s}</option>)}</select></div></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="2" value={form.description} onChange={f("description")}/></div>
            <button className="btn btn-primary" onClick={addCrop}>Submit ✓</button>
          </div>
        )}
        {myCrops.length===0?<div className="empty-state"><div className="empty-state-icon">🌱</div><div className="empty-state-title">No crops yet</div></div>:(
          <div className="crops-grid">{myCrops.map(c=>(
            <div className="crop-card" key={c.crop_id}>
              <div className="crop-emoji-banner">{emojiMap[c.category]||"🌱"}</div>
              <div className="crop-card-body">
                <div className="crop-name">{c.crop_name}</div>
                <div className="crop-tags"><span className="badge badge-emerald">{c.season}</span><span className="badge badge-amber">{c.category}</span></div>
                <div className="crop-price-row"><div className="crop-price">₹{c.price}/{c.unit}</div><PriceDelta price={Number(c.price)} marketRate={Number(c.market_rate)}/></div>
                <div className="crop-stock">📦 {c.quantity} {c.unit}</div>
              </div>
            </div>
          ))}</div>
        )}
      </>)}
      {tab==="orders"&&(
        <div className="table-card"><div className="table-wrap"><table>
          <thead><tr><th>ID</th><th>Buyer</th><th>Crop</th><th>Qty</th><th>Total</th><th>Status</th><th>Progress</th><th>Action</th></tr></thead>
          <tbody>
            {orders.length===0&&<tr><td colSpan="8" style={{textAlign:"center",color:"var(--text3)",padding:"2rem"}}>No orders</td></tr>}
            {orders.map(o=>(
              <tr key={o.order_id}>
                <td style={{color:"var(--emerald3)",fontWeight:700}}>#{o.order_id}</td><td>{o.buyer_name}</td><td style={{fontWeight:600,color:"var(--text)"}}>{o.crop_name}</td>
                <td>{o.quantity}</td><td style={{fontWeight:700,color:"var(--text)"}}>₹{o.total_price}</td><td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                <td style={{minWidth:160}}><OrderTimeline status={o.status}/></td>
                <td>{o.status==="pending"&&<button className="btn btn-primary btn-xs" onClick={()=>updateStatus(o.order_id,"confirmed")}>Confirm</button>}{o.status==="confirmed"&&<button className="btn btn-ghost btn-xs" onClick={()=>updateStatus(o.order_id,"shipped")}>Ship</button>}</td>
              </tr>
            ))}
          </tbody>
        </table></div></div>
      )}
    </PageWrap>
  );
}

// ── BUYER ORDERS ──────────────────────────────
function OrdersPage() {
  const {token}=useAuth(); const [orders,setOrders]=useState([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{api.get("/orders",token).then(d=>setOrders(Array.isArray(d)?d:[]));},[] );
  return (
    <PageWrap>
      <div className="page-header"><h1 className="page-title">📦 My Orders</h1><p className="page-subtitle">Track purchases from farm to doorstep</p></div>
      {orders.length===0?<div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">No orders yet</div></div>:(
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {orders.map(o=>(
            <div key={o.order_id} className="card" style={{padding:"1.2rem 1.4rem"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.7rem",marginBottom:"0.8rem"}}>
                <div>
                  <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:"1rem",color:"var(--text)",marginBottom:2}}>{o.crop_name} <span style={{fontFamily:"Inter",fontWeight:400,fontSize:"0.78rem",color:"var(--text2)"}}>from {o.farmer_name}</span></div>
                  <div style={{fontSize:"0.76rem",color:"var(--text3)"}}>Order #{o.order_id} · {o.quantity} units</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"Outfit",fontWeight:800,fontSize:"1.15rem",color:"var(--emerald3)"}}>₹{o.total_price}</div>
                  <div style={{display:"flex",gap:6,justifyContent:"flex-end",marginTop:3}}>
                    <span className={`badge badge-${o.status}`}>{o.status}</span>
                    <button className="btn btn-ghost btn-xs" onClick={()=>printInvoice(o)} title="Print Invoice">🖨️</button>
                  </div>
                </div>
              </div>
              <OrderTimeline status={o.status}/>
              {o.driver_name&&<div style={{marginTop:"0.6rem",padding:"0.5rem 0.8rem",background:"var(--blue-dim)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:"var(--radius-sm)",fontSize:"0.78rem",color:"var(--blue)"}}>🚛 {o.driver_name} · {o.vehicle_no} · ETA: {o.eta||"TBD"}</div>}
            </div>
          ))}
        </div>
      )}
    </PageWrap>
  );
}

// ── ADMIN PANEL ───────────────────────────────
function AdminPage() {
  const {token}=useAuth(); const {toast}=useToast();
  const [stats,setStats]=useState({}); const [users,setUsers]=useState([]); const [tab,setTab]=useState("dashboard");
  const loadAll=useCallback(async()=>{const[s,u]=await Promise.all([api.get("/admin/stats",token),api.get("/admin/users",token)]);if(s)setStats(s);if(Array.isArray(u))setUsers(u);},[token]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{loadAll();},[]);
  const approve=async id=>{await api.put(`/admin/approve/${id}`,{},token);toast("Approved!","success");loadAll();};
  const reject=async id=>{await api.put(`/admin/reject/${id}`,{},token);toast("Rejected","error");loadAll();};
  const pending=users.filter(u=>!u.is_approved).length;
  const roleCount={farmer:users.filter(u=>u.role==="farmer").length,buyer:users.filter(u=>u.role==="buyer").length,admin:users.filter(u=>u.role==="admin").length};
  const maxRole=Math.max(...Object.values(roleCount),1);

  return (
    <PageWrap>
      <div className="page-header"><h1 className="page-title">⚙️ Admin Panel</h1><p className="page-subtitle">Platform management and analytics</p></div>
      <div className="tabs-row">
        <button className={`tab-btn ${tab==="dashboard"?"active":""}`} onClick={()=>setTab("dashboard")}>Dashboard</button>
        <button className={`tab-btn ${tab==="users"?"active":""}`} onClick={()=>setTab("users")}>Users {pending>0&&<span className="nav-badge" style={{marginLeft:5}}>{pending}</span>}</button>
      </div>
      {tab==="dashboard"&&(<>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-val"><AnimCounter target={stats.total_users||0}/></div><div className="stat-label">Users</div></div>
          <div className="stat-card amber"><div className="stat-icon">🌾</div><div className="stat-val"><AnimCounter target={stats.total_crops||0}/></div><div className="stat-label">Crops</div></div>
          <div className="stat-card blue"><div className="stat-icon">📦</div><div className="stat-val"><AnimCounter target={stats.total_orders||0}/></div><div className="stat-label">Orders</div></div>
          <div className="stat-card purple"><div className="stat-icon">💰</div><div className="stat-val">₹<AnimCounter target={Math.floor(Number(stats.total_revenue)||0)}/></div><div className="stat-label">Revenue</div></div>
          <div className="stat-card red"><div className="stat-icon">⏳</div><div className="stat-val"><AnimCounter target={stats.pending_farmers||0}/></div><div className="stat-label">Pending</div></div>
        </div>
        {pending>0&&<div className="pending-notice">⚠️ {pending} farmer(s) need approval</div>}
        <div className="chart-card"><div className="chart-title">📊 Users by Role</div>
          <div className="bar-chart">{Object.entries(roleCount).map(([role,count])=>{const colors={farmer:"var(--emerald)",buyer:"var(--blue)",admin:"var(--amber)"};const pct=Math.max((count/maxRole)*100,count>0?8:2);return(
            <div key={role} className="bar-col"><div className="bar-val">{count}</div><div className="bar-fill" style={{height:`${pct}%`,background:colors[role]}}/><div className="bar-label">{role}s</div></div>
          );})}</div>
        </div>
      </>)}
      {tab==="users"&&(
        <><div style={{marginBottom:"1rem",display:"flex",justifyContent:"flex-end"}}><button className="btn btn-ghost btn-sm" onClick={()=>{exportCSV(users,"farmmarket_users.csv");toast("CSV exported!","success");}}>📥 Export CSV</button></div>
        <div className="table-card"><div className="table-wrap"><table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.user_id}>
              <td style={{color:"var(--text3)"}}>#{u.user_id}</td><td style={{color:"var(--text)",fontWeight:600}}>{u.name}</td><td>{u.email}</td>
              <td><span className={`badge ${u.role==="farmer"?"badge-emerald":u.role==="admin"?"badge-amber":"badge-blue"}`}>{u.role}</span></td>
              <td>{u.location||<span style={{color:"var(--text3)"}}>—</span>}</td>
              <td>{u.is_approved?<span className="badge badge-emerald">✓ Active</span>:<span className="badge badge-amber">⏳ Pending</span>}</td>
              <td><div style={{display:"flex",gap:5}}>
                {!u.is_approved&&<button className="btn btn-primary btn-xs" onClick={()=>approve(u.user_id)}>Approve</button>}
                {u.is_approved&&u.role!=="admin"&&<button className="btn btn-danger btn-xs" onClick={()=>reject(u.user_id)}>Revoke</button>}
              </div></td>
            </tr>
          ))}</tbody>
        </table></div></div></>
      )}
    </PageWrap>
  );
}

// ── CALENDAR ──────────────────────────────────
function CalendarPage() {
  const [data,setData]=useState([]); const [filter,setFilter]=useState("");
  const season=getCurrentSeason();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(()=>{api.get("/crop-calendar").then(d=>setData(Array.isArray(d)?d:[]));},[]);
  const seasonBadge={kharif:"badge-amber",rabi:"badge-blue",zaid:"badge-emerald",all_season:"badge-emerald"};
  const filtered=filter?data.filter(c=>c.season===filter):data;
  return (
    <PageWrap>
      <div className="page-header"><h1 className="page-title">📅 Crop Calendar</h1><p className="page-subtitle">Sowing schedules, soil types & farming tips</p></div>
      <div style={{display:"flex",alignItems:"center",gap:"0.7rem",marginBottom:"1.3rem",flexWrap:"wrap"}}>
        <div style={{padding:"6px 12px",background:`${season.color}15`,border:`1px solid ${season.color}30`,borderRadius:"var(--radius-sm)",fontSize:"0.8rem",color:season.color,fontWeight:700}}>{season.icon} Now: {season.name}</div>
        <div className="tabs-row" style={{marginBottom:0}}>{["","kharif","rabi","zaid","all_season"].map(s=><button key={s} className={`tab-btn ${filter===s?"active":""}`} onClick={()=>setFilter(s)}>{s||"All"}</button>)}</div>
      </div>
      {filtered.length===0?<div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-title">Loading…</div></div>:(
        <div className="calendar-grid">{filtered.map(c=>{const isCur=c.season===season.name.toLowerCase()||c.season==="all_season";return(
          <div className="cal-card" key={c.calendar_id} style={isCur?{borderColor:`${season.color}35`}:{}}>
            <div className={`cal-card-season-bar ${c.season}`}/>
            <div style={{marginTop:6,display:"flex",alignItems:"center",gap:5}}>
              <span className={`badge ${seasonBadge[c.season]||"badge-gray"}`}>{c.season}</span>
              {isCur&&<span style={{fontSize:"0.68rem",fontWeight:700,color:season.color}}>● In season</span>}
            </div>
            <div className="cal-crop-name">🌱 {c.crop_name}</div>
            <div className="cal-meta">
              <div><div className="cal-meta-label">Sow</div><div className="cal-meta-val">{c.sowing_month}</div></div>
              <div><div className="cal-meta-label">Harvest</div><div className="cal-meta-val">{c.harvest_month}</div></div>
              <div style={{gridColumn:"span 2"}}><div className="cal-meta-label">Soil</div><div className="cal-meta-val">{c.soil_type}</div></div>
            </div>
            {c.tip&&<div className="cal-tip">💡 {c.tip}</div>}
          </div>
        );})}</div>
      )}
    </PageWrap>
  );
}

// ═══════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [page,setPage]=useState("home");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [dark,setDark]=useState(()=>{ try{return JSON.parse(localStorage.getItem("fm_dark")??"true")}catch{return true} });
  const [cmdOpen,setCmdOpen]=useState(false);
  const [allCrops,setAllCrops]=useState([]);
  const [authData,setAuthData]=useState(()=>{ try{return JSON.parse(localStorage.getItem("fm_auth")||"null")}catch{return null} });

  const login=d=>{localStorage.setItem("fm_auth",JSON.stringify(d));setAuthData(d);setPage("market");};
  const logout=()=>{localStorage.removeItem("fm_auth");setAuthData(null);setPage("home");};
  const toggleTheme=()=>{const n=!dark;setDark(n);localStorage.setItem("fm_dark",JSON.stringify(n));};

  const authCtx={user:authData?.user||null,token:authData?.token||null,login,logout};
  const themeCtx={dark,toggle:toggleTheme};

  // load crops for command palette + ticker
  useEffect(()=>{api.get("/crops").then(d=>{if(Array.isArray(d))setAllCrops(d);});},[]);

  // keyboard shortcuts
  useEffect(()=>{
    const h=e=>{
      if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setCmdOpen(o=>!o);}
      if(e.key==="Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[]);

  // Notifications
  const notifications = useMemo(() => {
    const n = [];
    const s = getCurrentSeason();
    n.push({ icon:s.icon, text:`${s.name} season is active — check the calendar for tips!` });
    if (authData?.user?.role==="farmer") n.push({ icon:"💡", text:"Tip: Add detailed descriptions to boost crop visibility" });
    if (allCrops.some(c=>c.demand_level==="high")) n.push({ icon:"🔥", text:"Hot demand crops in the market — check now!" });
    return n;
  }, [authData, allCrops]);

  if(page==="auth") return (
    <ThemeCtx.Provider value={themeCtx}><AuthCtx.Provider value={authCtx}><ToastProvider>
      <StyleTag dark={dark}/><OfflineBanner/><AuthPage onAuth={login}/>
    </ToastProvider></AuthCtx.Provider></ThemeCtx.Provider>
  );

  return (
    <ThemeCtx.Provider value={themeCtx}><AuthCtx.Provider value={authCtx}><ToastProvider>
      <StyleTag dark={dark}/><OfflineBanner/>
      <CommandPalette open={cmdOpen} onClose={()=>setCmdOpen(false)} setPage={setPage} crops={allCrops}/>
      <button className="mobile-menu-btn" onClick={()=>setSidebarOpen(true)}>☰</button>
      <div className="app-shell">
        <Sidebar page={page} setPage={setPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <main className="main-content">
          <SeasonBanner/>
          <div style={{position:"sticky",top:0,zIndex:80,background:"var(--bg)",borderBottom:"1px solid var(--border)",padding:"6px 2.5rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button className="btn btn-ghost btn-xs" onClick={()=>setCmdOpen(true)} style={{gap:8}}>🔍 Search <span className="kbd" style={{marginLeft:2}}>Ctrl+K</span></button>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <NotificationBell notifications={notifications}/>
              {authData?.user&&<span style={{fontSize:"0.82rem",color:"var(--text2)"}}>{getGreeting().icon} {getGreeting().text}, <strong style={{color:"var(--text)"}}>{authData.user.name}</strong></span>}
            </div>
          </div>
          {page==="home"&&<HeroPage setPage={setPage}/>}
          {page==="market"&&<MarketPage/>}
          {page==="farmer"&&<FarmerPage/>}
          {page==="orders"&&<OrdersPage/>}
          {page==="admin"&&<AdminPage/>}
          {page==="calendar"&&<CalendarPage/>}
        </main>
      </div>
    </ToastProvider></AuthCtx.Provider></ThemeCtx.Provider>
  );
}
