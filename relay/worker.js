// Stage Ready form relay (Cloudflare Worker). The public pages POST JSON here with no email addresses;
// the relay adds the recipients (Worker secrets, never in git) and forwards to FormSubmit server-side.
// Secrets: FORM_TO / SETUP_TO (FormSubmit endpoint address or alias), NUMBERS_CC (always CC'd on /numbers/),
// CC_LUKE, CC_JACOB (extra CC per submitter), SETUP_CC (CC on /sunday-setup/). Set with `wrangler secret put`.
const ORIGINS = ['https://pastorontherun.github.io'];
const SITE = 'https://pastorontherun.github.io/stage-ready/';
const cors = o => ({ 'access-control-allow-origin': ORIGINS.includes(o) ? o : ORIGINS[0], 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type, accept', 'vary': 'origin' });
const json = (o, b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json', ...cors(o) } });

export default {
  async fetch(req, env) {
    const o = req.headers.get('origin') || '';
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(o) });
    if (req.method !== 'POST') return json(o, { success: 'false', message: 'POST only' }, 405);
    if (o && !ORIGINS.includes(o)) return json(o, { success: 'false', message: 'origin not allowed' }, 403);
    const raw = await req.text();
    if (raw.length > 20000) return json(o, { success: 'false', message: 'too large' }, 413);
    let b; try { b = JSON.parse(raw); } catch { return json(o, { success: 'false', message: 'bad json' }, 400); }
    const form = b._form, who = b._who;
    let cc;
    if (form === 'numbers') cc = [env.NUMBERS_CC, who === 'Luke' ? env.CC_LUKE : who === 'Jacob' ? env.CC_JACOB : ''];
    else if (form === 'setup') cc = [env.SETUP_CC];
    else return json(o, { success: 'false', message: 'unknown form' }, 400);
    const out = {};
    for (const [k, v] of Object.entries(b)) if (!/^_(cc|bcc|to|replyto|next|autoresponse|webhook|form|who)$/i.test(k)) out[k] = typeof v === 'string' ? v.slice(0, 4000) : v;
    out._cc = cc.filter(Boolean).join(',');
    if (!out._cc) delete out._cc;
    out._captcha = 'false';
    const r = await fetch('https://formsubmit.co/ajax/' + (form === 'setup' ? env.SETUP_TO : env.FORM_TO), { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', origin: 'https://pastorontherun.github.io', referer: SITE }, body: JSON.stringify(out) });
    const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { success: 'false', message: 'upstream HTTP ' + r.status }; }
    const msg = String(j.message || '').replace(/[^\s@]+@[^\s@]+/g, '(address)').slice(0, 200); // never echo addresses
    return json(o, { success: j.success, message: msg }, 200);
  }
};
