"""Capture public, server-rendered reference pages and visual assets. No private APIs."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,re,json,time
ROOT=Path(__file__).resolve().parent.parent
origin='https://torikorean.com'
routes=['','world/','city/','korea/','download/','pricing/','guides/','features/ai-speaking/']
reference=ROOT/'src/pages/guides/index.html'
if reference.exists():
 routes+=sorted(set(p.lstrip('/') for p in re.findall(r'href="(/[^"#]+/)"',reference.read_text()) if p.startswith(('/guides/','/legal/','/features/','/help/','/about/')))-set(routes))
def fetch(path):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(origin+path,timeout=20) as r:return r.read()
  except Exception:
   if attempt==2:raise
   time.sleep(1)
def page(route):
 s=fetch('/'+route).decode()
 # Remove production runtime, telemetry, metadata and original service-worker registrations.
 s=re.sub(r'<script\b[^>]*>.*?</script>','',s,flags=re.S|re.I)
 s=re.sub(r'<link[^>]+rel="(?:canonical|alternate|manifest|modulepreload)"[^>]*>','',s)
 s=re.sub(r'<meta[^>]+(?:property="og:|name="twitter:)[^>]*>','',s)
 s=s.replace('https://torikorean.com/learn','/learn/').replace('https://torikorean.com/','/')
 s=s.replace('929989569@qq.com','example@example.com').replace('13817498530','演示版本')
 s=s.replace('© 2026 Tori Korean','© 2026 · 学习研究复刻 · 非官方网站')
 s=s.replace('</head>','<link rel="stylesheet" href="/replica.css"></head>')
 s=s.replace('</body>','<script type="module" src="/brand-interactions.js"></script></body>')
 target=ROOT/'src/pages'/route/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(s)
 return s
with ThreadPoolExecutor(max_workers=8) as pool: pages=list(pool.map(page,routes))
assets=set(re.findall(r'/brand/assets/[^\s"\'<>?#)]+',' '.join(pages)))
def asset(path):
 target=ROOT/'public'/path.lstrip('/');target.parent.mkdir(parents=True,exist_ok=True)
 if not target.exists():target.write_bytes(fetch(path))
 return path,target.stat().st_size
with ThreadPoolExecutor(max_workers=10) as pool:
 results=list(pool.map(asset,sorted(assets)))
css=' '.join((ROOT/'public'/p.lstrip('/')).read_text() for p in assets if p.endswith('.css'))
more=set('/brand/assets/'+p.split('/')[-1] for p in re.findall(r'url\(["\']?([^\)"\']+)',css) if not p.startswith(('data:','http:','https:','#')))-assets
with ThreadPoolExecutor(max_workers=10) as pool:results+=list(pool.map(asset,sorted(more)))
(ROOT/'docs/reference-assets.json').write_text(json.dumps([{'path':p,'bytes':n,'source':origin+p} for p,n in results],ensure_ascii=False,indent=2))
print(f'Captured {len(routes)} pages, {len(results)} assets, {sum(n for _,n in results)/1024/1024:.1f} MB')
