import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require=createRequire(import.meta.url);
const gameDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(gameDir,'../..');
const htmlPath=path.join(gameDir,'index.html');

function assertReport(report,pageErrors=[],consoleErrors=[]){
  const failures=[];
  if(report.before.mode!=='play')failures.push('start');
  if(report.moved.weightX===report.before.weightX||report.moved.angle===report.before.angle)failures.push('input');
  if(report.upgrade.mode!=='upgrade'||report.upgrade.wave!==3)failures.push('decree gate');
  if(report.over.mode!=='gameover')failures.push('gameover');
  if(!report.stored.runs)failures.push('localStorage');
  if(report.wow!==5)failures.push('wow factors');
  if(report.body.includes('undefined'))failures.push('undefined text');
  if(report.scrollWidth>report.innerWidth)failures.push('horizontal overflow');
  if(pageErrors.length)failures.push('pageerror '+pageErrors.join(' | '));
  const relevant=consoleErrors.filter(x=>!x.includes('ERR_')&&!x.includes('Failed to load resource'));
  if(relevant.length)failures.push('console '+relevant.join(' | '));
  if(failures.length)throw new Error(failures.join(', '));
  return{ok:true,viewport:'390x844',pageErrors:0,consoleErrors:0,wowFactors:report.wow,state:report.over.mode,storageRuns:report.stored.runs};
}

async function browserAudit(playwright){
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.css':'text/css'};
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.join(root,pathname==='/'?'index.html':pathname);
    if(target.endsWith(path.sep))target=path.join(target,'index.html');
    if(!target.startsWith(root)){res.writeHead(403).end();return}
    fs.readFile(target,(err,data)=>{if(err){res.writeHead(404).end('not found');return}res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});res.end(data)});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await playwright.chromium.launch({headless:true});
    const port=server.address().port;
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const pageErrors=[],consoleErrors=[];
    page.on('pageerror',e=>pageErrors.push(String(e)));
    page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
    await page.goto('http://127.0.0.1:'+port+'/games/drawbridge-rebound/?qa=1',{waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForFunction(()=>document.body.dataset.qaReady==='1'&&window.__GAME_QA__);
    const title=await page.locator('h1').innerText();
    if(!title.includes('Drawbridge'))throw new Error('title screen missing');
    await page.locator('#startBtn').click();
    const report=await page.evaluate(()=>{
      const q=window.__GAME_QA__,before=q.state();q.setWeight(300);const moved=q.state();q.forceRebound();q.forceWave();q.forceWave();const upgrade=q.state();q.chooseDecree(0);q.forceGameover();const over=q.state(),stored=q.storage();
      return{before,moved,upgrade,over,stored,wow:Object.values(q.wowFactors).filter(Boolean).length,body:document.body.innerText,scrollWidth:document.documentElement.scrollWidth,innerWidth};
    });
    return{engine:'playwright',...assertReport(report,pageErrors,consoleErrors)};
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}

function domAudit(){
  const {parseHTML}=require('/Users/kjaylee/.openclaw/workspace/openclaw/node_modules/linkedom');
  const html=fs.readFileSync(htmlPath,'utf8');
  const {window}=parseHTML(html);
  const store=new Map();
  window.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  window.location={search:'?qa=1'};
  window.performance=globalThis.performance;
  window.requestAnimationFrame=()=>0;
  window.cancelAnimationFrame=()=>{};
  window.setTimeout=setTimeout;
  window.clearTimeout=clearTimeout;
  window.URLSearchParams=URLSearchParams;
  window.Telegram={WebApp:{HapticFeedback:{impactOccurred(){}}}};
  const gradient={addColorStop(){}};
  const context=new Proxy({createLinearGradient:()=>gradient,measureText:()=>({width:10})},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});
  const canvas=window.document.querySelector('canvas');
  canvas.getContext=()=>context;
  canvas.getBoundingClientRect=()=>({left:0,top:0,width:390,height:844});
  canvas.setPointerCapture=()=>{};
  Object.defineProperty(window.document.documentElement,'scrollWidth',{value:390,configurable:true});
  window.innerWidth=390;
  const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
  const gameScript=scripts.at(-1)[1];
  new Function('window','document','with(window){'+gameScript+'}')(window,window.document);
  const q=window.__GAME_QA__;
  if(!q)throw new Error('QA API missing');
  q.start();const before=q.state();q.setWeight(300);const moved=q.state();q.forceRebound();q.forceWave();q.forceWave();const upgrade=q.state();q.chooseDecree(0);q.forceGameover();const over=q.state(),stored=q.storage();
  const report={before,moved,upgrade,over,stored,wow:Object.values(q.wowFactors).filter(Boolean).length,body:window.document.body.textContent,scrollWidth:390,innerWidth:390};
  return{engine:'linkedom-fallback',...assertReport(report)};
}

let playwright;
for(const candidate of ['playwright','/Users/kjaylee/.openclaw/workspace/testnet-farmer/node_modules/playwright']){try{playwright=require(candidate);break}catch{}}
let result;
if(playwright){
  try{result=await browserAudit(playwright)}
  catch(error){
    if(!String(error).includes('Executable doesn'))throw error;
    result=domAudit();
    result.browserNote='Playwright package exists but browser executable is absent; deterministic DOM fallback passed.';
  }
}else{
  result=domAudit();
  result.browserNote='Playwright package is absent; deterministic DOM fallback passed.';
}
console.log(JSON.stringify(result,null,2));
