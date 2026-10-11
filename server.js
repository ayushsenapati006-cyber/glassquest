const http = require('http');
const fs = require('fs');
const path = require('path');
const HOST = '127.0.0.1';
const PORT = 3000;
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const MODEL = 'qwen2.5:3b';
const htmlPath = path.join(__dirname, 'public', 'index.html');

function send(res, status, data, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw=''; req.on('data', chunk => { raw += chunk; if (raw.length > 20000) reject(new Error('Request too large')); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON request')); } });
    req.on('error', reject);
  });
}
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    try { return send(res, 200, fs.readFileSync(htmlPath, 'utf8'), 'text/html; charset=utf-8'); }
    catch { return send(res, 500, {error:'Could not read public/index.html'}); }
  }
  if (req.method === 'GET' && req.url === '/api/health') {
    try { const r=await fetch('http://127.0.0.1:11434/api/tags'); const j=await r.json(); return send(res,200,{ok:r.ok,modelAvailable:(j.models||[]).some(m=>m.name===MODEL || m.name.startsWith(MODEL+':')),model:MODEL}); }
    catch { return send(res,503,{ok:false,error:'Ollama is not responding. Open Ollama and try again.'}); }
  }
  if (req.method === 'POST' && req.url === '/api/quest') {
    try {
      const body = await readBody(req);
      const activity = String(body.activity || 'Easy walk').slice(0,80);
      const duration = Math.max(15, Math.min(360, Number(body.durationMinutes) || 30));
      const mood = String(body.mood || 'Curious explorer').slice(0,80);
      const place = String(body.place || 'any outdoor place').slice(0,100);
      const prompt = `Create a safe, practical outdoor mini-adventure for the GrassQuest app. Return ONLY valid JSON with exactly these keys: title (short string), description (one sentence), missions (array of 4 to 8 concise strings). Activity: ${activity}. Total time available: ${duration} minutes. Mood: ${mood}. Setting: ${place}. Make the missions fit the available time and sequence them realistically. Encourage noticing nature and being present. Do not require paid gear, entering private property, picking plants, touching wildlife, risky behaviour, or using a phone while moving. For running, include a warm-up and cool-down. If the duration is long, break it into sensible stages with water/rest breaks. Do not claim to know the user's actual local weather, species, or nearby locations.`;
      const r = await fetch(OLLAMA_URL, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,prompt,stream:false,format:'json',options:{temperature:0.8}})});
      if (!r.ok) { const detail=await r.text(); return send(res,502,{error:`Ollama returned ${r.status}. Check that ${MODEL} is installed.`}); }
      const result = await r.json();
      let parsed;
      try { parsed=JSON.parse(result.response); } catch { return send(res,502,{error:'Qwen returned invalid JSON. Click Generate again.'}); }
      if (!parsed || typeof parsed.title!=='string' || !Array.isArray(parsed.missions)) return send(res,502,{error:'Qwen returned an incomplete quest. Please try again.'});
      parsed.missions=parsed.missions.filter(x=>typeof x==='string').slice(0,8);
      return send(res,200,parsed);
    } catch (err) { return send(res,500,{error:err.message || 'Unexpected server error'}); }
  }
  send(res,404,{error:'Not found'});
});
server.listen(PORT, HOST, () => console.log(`GrassQuest is running at http://${HOST}:${PORT}\nUsing local Ollama model: ${MODEL}\nKeep this window open while using the site.`));
