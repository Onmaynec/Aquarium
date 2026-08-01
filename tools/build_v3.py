from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1] if Path(__file__).parent.name == 'tools' else Path.cwd()

def replace_between(text: str, start: str, end: str, replacement: str) -> str:
    a = text.find(start)
    b = text.find(end, a + len(start))
    if a < 0 or b < 0:
        raise RuntimeError(f'Не найден блок: {start!r} … {end!r}')
    return text[:a] + replacement + text[b:]

parts = [ROOT / f'app-{i}.part' for i in range(1, 6)]
app = ''.join(p.read_text(encoding='utf-8') for p in parts)
manifest_parts = [ROOT / 'assets' / f'manifest-{i}.txt' for i in range(1, 5)]
manifest = json.loads(''.join(p.read_text(encoding='utf-8') for p in manifest_parts))
(ROOT / 'assets' / 'manifest.js').write_text(
    'window.AQUARIUM_MANIFEST=' + json.dumps(manifest, ensure_ascii=False, separators=(',', ':')) + ';\n',
    encoding='utf-8',
)

app = app.replace(
    "manifest,assets={},sandPattern=null,audio={ambient:null,feed:null,bubble:null},audioUnlocked=false;",
    "manifest=window.AQUARIUM_MANIFEST||null,assets={},sandPattern=null,audio={ambient:null,feed:null,bubble:null},audioUnlocked=false,paused=false,booted=false;",
)
loader = """function setLoadProgress(done,total,message='Загружаем подводный мир…'){const ratio=total?done/total:0,$bar=$('#loaderBar'),$msg=$('#loaderMessage');if($bar)$bar.style.width=Math.round(ratio*100)+'%';if($msg)$msg.textContent=message+' '+Math.round(ratio*100)+'%'}
async function loadImage(src,timeout=15000){return new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>reject(new Error('Превышено время загрузки: '+src)),timeout);im.onload=()=>{clearTimeout(timer);resolve(im)};im.onerror=()=>{clearTimeout(timer);reject(new Error('Не удалось загрузить '+src))};im.src=src})}
async function loadAssets(){if(!manifest)throw new Error('Манифест ассетов не найден. Проверьте assets/manifest.js');assets={};const imageEntries=[...Object.entries(manifest.atlases).map(([name,data])=>[name,data.file]),...Object.entries(manifest.images)];let done=0,total=imageEntries.length;setLoadProgress(0,total,'Подготавливаем ассеты…');for(const [name,src] of imageEntries){assets[name]=await loadImage(src);done++;setLoadProgress(done,total,'Загружаем графику…')}audio.ambient=new Audio(manifest.audio.ambient);audio.ambient.loop=true;audio.ambient.preload='auto';audio.feed=new Audio(manifest.audio.feed);audio.feed.preload='auto';audio.bubble=new Audio(manifest.audio.bubble);audio.bubble.preload='auto';applyVolume();setLoadProgress(total,total,'Готово')}
"""
app = replace_between(app, 'async function loadImage(src)', 'function spriteInfo', loader)

new_animate = """function animate(now){const dt=paused?0:Math.min((now-last)/1000,.034);last=now;if(!paused)elapsed+=dt;drawBackground(now);drawSeabed(now);drawPlants(now);drawDecor();drawCritters(dt,now);updateFood(dt,now);for(const f of fish){if(!paused)f.update(dt,now);f.draw(now)}updateBubbles(dt,now);drawVignette();if(!paused)frameCount++;if(now-fpsClock>600){$('#fps').textContent=paused?'—':Math.round(frameCount*1000/(now-fpsClock));frameCount=0;fpsClock=now}requestAnimationFrame(animate)}
function setPaused(value){paused=!!value;$('#pause').setAttribute('aria-pressed',String(paused));$('#pause').textContent=paused?'▶️ Продолжить':'⏸️ Пауза';$('#pausedLabel').classList.toggle('show',paused);last=performance.now();toast(paused?'⏸️ Симуляция поставлена на паузу':'▶️ Симуляция продолжена')}
async function toggleFullscreen(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{toast('Полноэкранный режим недоступен в этом браузере')}}
function showBootError(err){console.error(err);const loading=$('#loading');loading.classList.add('error');$('#loaderFish').textContent='⚠️';$('#loaderTitle').textContent='Аквариум не запустился';$('#loaderMessage').textContent=err&&err.message?err.message:'Неизвестная ошибка загрузки'}
async function boot(){if(booted)return;const loading=$('#loading');loading.classList.remove('done','error');$('#loaderFish').textContent='🐠';$('#loaderTitle').textContent='Заселяем аквариум';$('#loaderMessage').textContent='Подготавливаем ассеты…';try{await loadAssets();resize();syncControls();restoreState();setSound(false);booted=true;requestAnimationFrame(animate);requestAnimationFrame(()=>loading.classList.add('done'));if(location.protocol==='file:'){$('#localBadge').classList.add('show');setTimeout(()=>$('#localBadge').classList.remove('show'),4200)}}catch(err){showBootError(err)}}
"""
app = replace_between(app, 'function animate(now){', 'function unlockAudio(){', new_animate)

app = app.replace(
    "$('#feed').onclick=()=>{unlockAudio();feedFish()};$('#add').onclick=()=>addFish();$('#night').onclick=()=>{night=!night;syncNight();saveState()};",
    "$('#feed').onclick=()=>{unlockAudio();feedFish()};$('#add').onclick=()=>addFish();$('#pause').onclick=()=>setPaused(!paused);$('#fullscreen').onclick=toggleFullscreen;$('#retryLoad').onclick=()=>{booted=false;boot()};$('#night').onclick=()=>{night=!night;syncNight();saveState()};",
)
init_pos = app.find("addEventListener('resize',resize,{passive:true});")
if init_pos < 0:
    raise RuntimeError('Не найден блок инициализации')
app = app[:init_pos] + """addEventListener('resize',resize,{passive:true});addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden&&audio.ambient)audio.ambient.pause();else if(cfg.sound&&audioUnlocked)audio.ambient.play().catch(()=>{})});addEventListener('keydown',e=>{if(/input|textarea|select/i.test(document.activeElement?.tagName||''))return;const k=e.key.toLowerCase();if(k===' '){e.preventDefault();setPaused(!paused)}else if(k==='f')feedFish();else if(k==='a')addFish();else if(k==='n')$('#night').click();else if(k==='m')setSound(!cfg.sound);else if(k==='s')$('#settings').click()});
boot();
})();
"""
(ROOT / 'app.js').write_text(app, encoding='utf-8')

index = (ROOT / 'index.html').read_text(encoding='utf-8')
index = index.replace('<title>Living Aquarium — Interactive Boids</title>', '<title>Living Aquarium V3 — Interactive Boids</title>')
index = index.replace('content="Живой интерактивный аквариум с реалистичным Boids, красивыми ассетами, хищником, кормлением и звуком воды."', 'content="Living Aquarium V3 — красивый интерактивный аквариум, который запускается двойным кликом без локального сервера."')
index = re.sub(r'<div class="loading" id="loading">.*?</div></div>', '<div class="loading" id="loading"><div class="loader-card glass"><span class="loader-fish" id="loaderFish">🐠</span><b id="loaderTitle">Заселяем аквариум</b><span id="loaderMessage">Подготавливаем ассеты…</span><div class="progress"><i id="loaderBar"></i></div><div class="loader-actions"><button id="retryLoad">↻ Повторить</button></div></div></div>', index, count=1)
index = index.replace('<h1>Living Aquarium</h1>', '<h1>Living Aquarium <span class="version-badge">V3</span></h1>')
index = index.replace('реалистичный Boids • живые ассеты • умный хищник', 'реалистичный Boids • живые ассеты • запуск без сервера')
index = index.replace('<div class="toast" id="toast"></div>', '<div class="toast" id="toast"></div><div class="paused-label glass" id="pausedLabel">⏸️ ПАУЗА</div>')
index = index.replace('<div class="panel-actions"><button id="save">💾 Сохранить</button><button id="reset">↺ Сбросить</button></div>', '<div class="panel-actions"><button id="save">💾 Сохранить</button><button id="reset">↺ Сбросить</button></div><div class="key-help"><kbd>Space</kbd> пауза · <kbd>F</kbd> корм · <kbd>A</kbd> рыбка · <kbd>N</kbd> ночь · <kbd>M</kbd> звук · <kbd>S</kbd> настройки</div>')
index = index.replace('<button id="add">🐟 Добавить</button><button id="night"', '<button id="add">🐟 Добавить</button><button id="pause" aria-pressed="false">⏸️ Пауза</button><button id="night"')
index = index.replace('<button id="settings" class="settings-button"', '<button id="fullscreen" class="icon-only" title="Полный экран" aria-label="Полный экран">⛶</button><button id="settings" class="settings-button"')
index = index.replace('<div class="hint">Кликните по воде — рыбки на 2 секунды разбегутся от точки</div>', '<div class="hint">Кликните по воде — рыбки на 2 секунды разбегутся от точки</div><div class="local-badge" id="localBadge">✅ Локальный режим: сервер не требуется</div>')
index = index.replace('<script src="app-loader.js" defer></script>', '<script src="assets/manifest.js"></script>\n<script src="app.js"></script>')
(ROOT / 'index.html').write_text(index, encoding='utf-8')

styles = (ROOT / 'styles.css').read_text(encoding='utf-8')
if '.version-badge{' not in styles:
    styles += """
.version-badge{display:inline-flex;align-items:center;margin-left:7px;padding:2px 7px;border:1px solid rgba(133,232,255,.24);border-radius:999px;background:rgba(88,207,255,.1);color:#aeeeff;font-size:9px;font-weight:800;letter-spacing:.08em;vertical-align:middle}.local-badge{position:absolute;right:14px;bottom:82px;padding:7px 10px;border:1px solid rgba(137,235,255,.18);border-radius:12px;background:rgba(3,25,45,.78);color:#a9d9e8;font-size:10px;box-shadow:0 8px 25px #0005;opacity:0;transform:translateY(8px);transition:.25s}.local-badge.show{opacity:1;transform:none}.loading.error .progress{display:none}.loading.error .loader-fish{animation:none}.loader-actions{display:none;gap:8px;justify-content:center;margin-top:16px}.loading.error .loader-actions{display:flex}.loader-actions button{border:1px solid rgba(180,237,255,.22);border-radius:11px;background:rgba(20,73,99,.92);color:#f4fcff;padding:9px 12px;font-weight:750;cursor:pointer}.loader-actions button:hover{background:rgba(30,102,132,.96)}.progress i{transition:width .18s ease,transform .18s ease;animation:none;transform:none;width:0}.paused-label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.95);padding:13px 18px;border:1px solid rgba(180,237,255,.2);border-radius:16px;background:rgba(2,17,34,.75);box-shadow:0 18px 55px #0008;color:#f4fcff;font-weight:800;letter-spacing:.04em;opacity:0;transition:.2s;pointer-events:none}.paused-label.show{opacity:1;transform:translate(-50%,-50%) scale(1)}.key-help{margin-top:12px;padding-top:10px;border-top:1px solid rgba(180,237,255,.12);color:var(--muted);font-size:10px;line-height:1.55}.key-help kbd{display:inline-block;min-width:20px;padding:1px 5px;border:1px solid rgba(180,237,255,.18);border-radius:5px;background:rgba(255,255,255,.06);color:var(--text);text-align:center;font-size:9px}.dock button.icon-only{font-size:16px;padding-inline:11px}.loading .loader-card{max-width:min(420px,calc(100vw - 30px))}@media(max-width:700px){.local-badge{display:none}.dock button.icon-only{padding-inline:10px}.version-badge{font-size:8px}}
"""
(ROOT / 'styles.css').write_text(styles, encoding='utf-8')

readme = (ROOT / 'README.md').read_text(encoding='utf-8')
readme = readme.replace('# 🌊 Living Aquarium', '# 🌊 Living Aquarium V3', 1)
readme = readme.replace('### Интерактивный аквариум с настоящими графическими ассетами и реалистичным Boids', '### Интерактивный аквариум с настоящими ассетами, реалистичным Boids и запуском двойным кликом')
if '## 🆕 Что нового в V3' not in readme:
    readme = readme.replace('## ✨ Возможности', """## 🆕 Что нового в V3

- ✅ Исправлена бесконечная загрузка при открытии через `file://`.
- 📦 Удалены runtime-запросы `fetch()` — сервер больше не обязателен.
- 📊 Добавлен настоящий прогресс загрузки и понятный экран ошибки.
- ⏸️ Добавлены пауза, полный экран и горячие клавиши.
- 🌐 Одна сборка работает локально и на GitHub Pages.

## ✨ Возможности""", 1)
readme = re.sub(r'## 🚀 Запуск\n.*?(?=\n## )', """## 🚀 Запуск

Распакуйте проект и дважды нажмите `index.html` или `START-AQUARIUM.bat`.

Локальный сервер больше не обязателен. При желании:

```bash
python -m http.server 8080
```
""", readme, flags=re.S)
readme = readme.replace('├── app-loader.js\n├── app-*.part', '├── app.js')
readme = readme.replace('│   ├── manifest-*.txt', '│   ├── manifest.js')
(ROOT / 'README.md').write_text(readme, encoding='utf-8')
(ROOT / 'START-AQUARIUM.bat').write_text('@echo off\r\nstart "" "%~dp0index.html"\r\n', encoding='utf-8')

for p in parts + manifest_parts + [ROOT / 'app-loader.js']:
    p.unlink(missing_ok=True)
print('Living Aquarium V3 build complete')
