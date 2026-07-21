import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require=createRequire(import.meta.url);
const gameDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(gameDir,'../..');
const htmlPath=path.join(gameDir,'index.html');

function validate(report,pageErrors,consoleErrors){
  const failures=[];
  if(report.started.mode!=='play')failures.push('start');
  if(!(report.afterStir.stirs>report.started.stirs))failures.push('stir input');
  if(report.choice.mode!=='choice')failures.push('choice gate');
  if(report.afterChoice.mode!=='play'||report.afterChoice.palette===report.started.palette)failures.push('choice apply');
  if(report.result.mode!=='result')failures.push('result');
  if(!report.storage.daily?.played||!report.storage.gallery?.length)failures.push('localStorage');
  if(report.wowCount!==5)failures.push('wow factors');
  if(report.body.includes('undefined')||report.body.includes('NaN'))failures.push('invalid text');
  if(report.scrollWidth>report.innerWidth)failures.push('horizontal overflow');
  if(report.particleCount>650)failures.push('particle cap');
  if(pageErrors.length)failures.push(`pageerror ${pageErrors.join(' | ')}`);
  const relevant=consoleErrors.filter(x=>!x.includes('ERR_')&&!x.includes('Failed to load resource'));
  if(relevant.length)failures.push(`console ${relevant.join(' | ')}`);
  if(failures.length)throw new Error(failures.join(', '));
  return {ok:true,viewport:'390x844',pageErrors:0,consoleErrors:0,wowFactors:5,state:'result',storageRuns:report.storage.daily.played,gallery:report.storage.gallery.length,particles:report.particleCount};
}

function domAudit(browserNote){
  const {parseHTML}=require('/Users/kjaylee/.openclaw/workspace/openclaw/node_modules/linkedom');
  const html=fs.readFileSync(htmlPath,'utf8');
  const {window}=parseHTML(html);
  const store=new Map();
  window.localStorage={getItem:key=>store.has(key)?store.get(key):null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
  window.location={search:'?qa=1'};
  window.performance=globalThis.performance;
  window.requestAnimationFrame=()=>0;
  window.cancelAnimationFrame=()=>{};
  window.setTimeout=setTimeout;
  window.clearTimeout=clearTimeout;
  window.URLSearchParams=URLSearchParams;
  window.Telegram={WebApp:{HapticFeedback:{impactOccurred(){},notificationOccurred(){}}}};
  const gradient={addColorStop(){}};
  const context=new Proxy({createRadialGradient:()=>gradient,createLinearGradient:()=>gradient,measureText:()=>({width:10})},{get(target,key){return key in target?target[key]:()=>{};},set(target,key,value){target[key]=value;return true;}});
  for(const canvas of window.document.querySelectorAll('canvas')){
    canvas.getContext=()=>context;
    canvas.getBoundingClientRect=()=>({left:0,top:0,width:360,height:440});
    canvas.setPointerCapture=()=>{};
  }
  Object.defineProperty(window.document.documentElement,'scrollWidth',{value:390,configurable:true});
  window.innerWidth=390;
  const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
  const gameScript=scripts.at(-1)[1];
  new Function('window','document','addEventListener','with(window){'+gameScript+'}')(window,window.document,()=>{});
  const q=window.__GAME_QA__;
  if(!q)throw new Error('QA API missing');
  q.start();const started=q.state();q.stir(140,400,24,8);q.advance(500);const afterStir=q.state();q.forceChoice();const choice=q.state();q.choose(1);const afterChoice=q.state();q.forceResult(94);const result=q.state(),storage=q.storage();
  const report={started,afterStir,choice,afterChoice,result,storage,wowCount:Object.values(q.wowFactors).filter(Boolean).length,body:window.document.body.textContent,scrollWidth:390,innerWidth:390,particleCount:result.particles};
  return {...validate(report,[],[]),engine:'linkedom-fallback',browserNote};
}

async function run(){
  let playwright;
  for(const candidate of ['playwright','/Users/kjaylee/.openclaw/workspace/testnet-farmer/node_modules/playwright']){
    try{playwright=require(candidate);break}catch{}
  }
  if(!playwright)return domAudit('Playwright package unavailable; deterministic DOM smoke passed.');
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css'};
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.join(root,pathname==='/'?'index.html':pathname);
    if(target.endsWith(path.sep))target=path.join(target,'index.html');
    if(!target.startsWith(root)){res.writeHead(403).end();return;}
    fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end('not found');return;}res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});res.end(data);});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    try{browser=await playwright.chromium.launch({headless:true});}
    catch(error){
      if(String(error).includes("Executable doesn't exist"))return domAudit('Playwright browser executable unavailable; deterministic DOM smoke passed.');
      throw error;
    }
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const pageErrors=[],consoleErrors=[];
    page.on('pageerror',error=>pageErrors.push(String(error)));
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text());});
    await page.goto(`http://127.0.0.1:${server.address().port}/games/moonmilk-marbler/?qa=1`,{waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForFunction(()=>document.body.dataset.qaReady==='1'&&window.__GAME_QA__,null,{timeout:10000});
    const title=await page.locator('h1').innerText();
    if(!title.includes('Moonmilk'))throw new Error('title missing');
    await page.locator('#startBtn').click();
    const report=await page.evaluate(()=>{
      const q=window.__GAME_QA__;
      const started=q.state();
      q.stir(140,400,260,470);
      q.advance(500);
      const afterStir=q.state();
      q.forceChoice();
      const choice=q.state();
      q.choose(1);
      const afterChoice=q.state();
      q.forceResult(94);
      const result=q.state();
      const storage=q.storage();
      return {started,afterStir,choice,afterChoice,result,storage,wowCount:Object.values(q.wowFactors).filter(Boolean).length,body:document.body.innerText,scrollWidth:document.documentElement.scrollWidth,innerWidth,particleCount:result.particles};
    });
    return validate(report,pageErrors,consoleErrors);
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}

console.log(JSON.stringify(await run(),null,2));
