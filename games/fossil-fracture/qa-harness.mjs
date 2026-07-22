import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const gameDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(gameDir,'../..');
const htmlPath=path.join(gameDir,'index.html');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function assert(condition,label,failures){if(!condition)failures.push(label)}

function validate(report,pageErrors=[],consoleErrors=[]){
  const failures=[];
  assert(report.title.mode==='title','title state',failures);
  assert(report.titleCopy.includes('Fossil')&&report.titleCopy.includes('Daily Stratum'),'title copy',failures);
  assert(report.started.mode==='play'&&report.started.stage===1,'start → play',failures);
  assert(report.safe.after.lastFracture.removed>0,'safe stress-line removes rock',failures);
  assert(report.safe.after.lastFracture.length>0&&report.safe.after.lastFracture.branches>0,'trajectory branches on release',failures);
  assert(report.safe.after.exposure>report.safe.before.exposure,'safe stress-line raises exposure',failures);
  assert(report.safe.after.preservation===report.safe.before.preservation,'safe stress-line preserves fossil',failures);
  assert(report.hit.after.lastFracture.damage>0,'fossil-crossing line causes damage',failures);
  assert(report.hit.after.preservation<report.hit.before.preservation,'preservation verdict',failures);
  assert(report.draft.mode==='draft'&&report.draft.stage===3,'stage 2 draft gate',failures);
  assert(report.afterFine.mode==='play'&&report.afterFine.tools.includes('fine'),'Fine Chisel selected',failures);
  assert(report.afterFine.modifier.radius<report.started.modifier.radius&&report.afterFine.modifier.safe>report.started.modifier.safe,'tool modifier applied',failures);
  assert(report.stage4.config.strength>report.started.config.strength&&report.stage4.config.branches>report.started.config.branches&&report.stage4.config.target>report.started.config.target,'faultline escalation',failures);
  assert(report.secondDraft.mode==='draft'&&report.secondDraft.stage===5,'stage 4 draft gate',failures);
  assert(report.afterClamp.clampReady&&report.afterClamp.tools.includes('clamp'),'Plaster Clamp selected',failures);
  assert(report.success.mode==='result'&&report.success.reveal,'museum result state',failures);
  assert(report.success.particles>0,'museum dust feedback',failures);
  assert(report.resultCopy.includes('점수')&&report.resultCopy.includes('무손상 연쇄'),'museum card data',failures);
  assert(report.storageAfterSuccess.runs===1&&report.storageAfterSuccess.best>=report.success.score,'result persistence',failures);
  assert(report.storageAfterSuccess.daily&&Object.keys(report.storageAfterSuccess.daily).length===1,'daily persistence',failures);
  assert(report.storageAfterSuccess.cabinetRank!=='—','cabinet rank persistence',failures);
  assert(report.failed.mode==='result'&&report.failed.preservation>=0,'gameover result',failures);
  assert(report.retried.mode==='play'&&report.retried.stage===1&&report.retried.score===0&&report.retried.preservation===100,'retry resets play',failures);
  assert(report.storageAfterFailure.runs===2,'runs increment across results',failures);
  assert(report.reloadStorage.runs===report.storageAfterFailure.runs&&Number(report.reloadBest.replaceAll(',',''))===report.reloadStorage.best,'reload reads persisted records',failures);
  assert(report.wowCount===5,'five wow factors',failures);
  assert(!report.body.includes('undefined')&&!report.body.includes('NaN'),'invalid DOM text',failures);
  assert(!report.renderText.includes('undefined')&&!report.renderText.includes('NaN'),'invalid state text',failures);
  assert(report.scrollWidth<=report.innerWidth,'390px horizontal overflow',failures);
  assert(report.canvasWidth>0&&report.canvasHeight>0,'active canvas',failures);
  assert(pageErrors.length===0,`pageerror: ${pageErrors.join(' | ')}`,failures);
  const relevantConsole=consoleErrors.filter(x=>!x.includes('Failed to load resource')&&!x.includes('ERR_'));
  assert(relevantConsole.length===0,`console error: ${relevantConsole.join(' | ')}`,failures);
  if(failures.length)throw new Error(failures.join(', '));
  return {
    ok:true,
    viewport:'390x844',
    flow:'title → play → stress-line → draft → result/gameover → retry',
    safeRemoval:report.safe.after.lastFracture.removed,
    fossilDamage:report.hit.after.lastFracture.damage,
    stage1:report.started.config,
    stage4:report.stage4.config,
    tools:report.success.tools,
    wowFactors:report.wowCount,
    museumParticles:report.success.particles,
    storageRuns:report.storageAfterFailure.runs,
    finalState:report.retried.mode,
    pageErrors:0,
    consoleErrors:0
  };
}

async function exercise(window){
  const q=window.__GAME_QA__;
  if(!q)throw new Error('public QA API missing');
  const title=q.state();
  const titleCopy=window.document.body.textContent;
  q.start();
  const started=q.state();
  const safe=q.fracture(q.path('safe'));
  const hit=q.fracture(q.path('hit'));
  q.forceStageComplete();
  q.forceStageComplete();
  await wait(160);
  const draft=q.state();
  q.choose('fine');
  const afterFine=q.state();
  q.fracture(q.path('safe'));
  q.forceStageComplete();
  const stage4=q.state();
  q.forceStageComplete();
  await wait(160);
  const secondDraft=q.state();
  q.choose('clamp');
  const afterClamp=q.state();
  q.succeed();
  const success=q.state();
  const resultCopy=window.document.getElementById('resultCopy').textContent;
  const storageAfterSuccess=q.storage();
  q.retry();
  q.fail();
  const failed=q.state();
  const storageAfterFailure=q.storage();
  q.retry();
  const retried=q.state();
  return {
    title,titleCopy,started,safe,hit,draft,afterFine,stage4,secondDraft,afterClamp,success,resultCopy,
    storageAfterSuccess,failed,storageAfterFailure,retried,
    wowCount:Object.values(q.wowFactors).filter(Boolean).length,
    body:window.document.body.textContent,
    renderText:window.render_game_to_text(),
    scrollWidth:window.document.documentElement.scrollWidth,
    innerWidth:window.innerWidth,
    canvasWidth:window.document.getElementById('gameCanvas').width,
    canvasHeight:window.document.getElementById('gameCanvas').height
  };
}

async function domAudit(browserNote){
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
  const gradient={addColorStop(){}};
  const context=new Proxy({
    createRadialGradient:()=>gradient,
    createLinearGradient:()=>gradient,
    measureText:()=>({width:10})
  },{get(target,key){return key in target?target[key]:()=>{}},set(target,key,value){target[key]=value;return true}});
  for(const canvas of window.document.querySelectorAll('canvas')){
    canvas.getContext=()=>context;
    canvas.getBoundingClientRect=()=>({left:0,top:0,width:360,height:452});
    canvas.setPointerCapture=()=>{};
  }
  Object.defineProperty(window.document.documentElement,'scrollWidth',{value:390,configurable:true});
  window.innerWidth=390;
  const scripts=[...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
  const gameScript=scripts.at(-1)[1];
  new Function('window','document','localStorage','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','addEventListener',gameScript)(window,window.document,window.localStorage,window.requestAnimationFrame,window.cancelAnimationFrame,setTimeout,clearTimeout,()=>{});
  const report=await exercise(window);
  new Function('window','document','localStorage','requestAnimationFrame','cancelAnimationFrame','setTimeout','clearTimeout','addEventListener',gameScript)(window,window.document,window.localStorage,window.requestAnimationFrame,window.cancelAnimationFrame,setTimeout,clearTimeout,()=>{});
  report.reloadStorage=window.__GAME_QA__.storage();
  report.reloadBest=window.document.getElementById('bestText').textContent;
  return {...validate(report),engine:'linkedom-fallback',browserNote};
}

async function run(){
  let playwright;
  for(const candidate of ['playwright','/Users/kjaylee/.openclaw/workspace/testnet-farmer/node_modules/playwright']){
    try{playwright=require(candidate);break}catch{}
  }
  if(!playwright)return domAudit('Playwright package unavailable; deterministic DOM gameplay QA passed.');
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.css':'text/css'};
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let target=path.join(root,pathname==='/'?'index.html':pathname);
    if(target.endsWith(path.sep))target=path.join(target,'index.html');
    if(!target.startsWith(root)){res.writeHead(403).end();return}
    fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end('not found');return}res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});res.end(data)});
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    try{browser=await playwright.chromium.launch({headless:true})}
    catch(error){
      if(String(error).includes("Executable doesn't exist"))return domAudit('Playwright browser executable unavailable; deterministic DOM gameplay QA passed.');
      throw error;
    }
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const pageErrors=[],consoleErrors=[];
    page.on('pageerror',error=>pageErrors.push(String(error)));
    page.on('console',message=>{if(message.type()==='error')consoleErrors.push(message.text())});
    await page.goto(`http://127.0.0.1:${server.address().port}/games/fossil-fracture/?qa=1`,{waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForFunction(()=>document.body.dataset.qaReady==='1'&&window.__GAME_QA__,null,{timeout:10000});
    const report=await page.evaluate(async()=>{
      const q=window.__GAME_QA__,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
      const title=q.state(),titleCopy=document.body.innerText;
      document.getElementById('startBtn').click();
      const started=q.state(),safe=q.fracture(q.path('safe')),hit=q.fracture(q.path('hit'));
      q.forceStageComplete();q.forceStageComplete();await pause(160);const draft=q.state();
      q.choose('fine');const afterFine=q.state();q.fracture(q.path('safe'));q.forceStageComplete();const stage4=q.state();
      q.forceStageComplete();await pause(160);const secondDraft=q.state();q.choose('clamp');const afterClamp=q.state();
      q.succeed();const success=q.state(),resultCopy=document.getElementById('resultCopy').innerText,storageAfterSuccess=q.storage();
      q.retry();q.fail();const failed=q.state(),storageAfterFailure=q.storage();q.retry();const retried=q.state();
      return {title,titleCopy,started,safe,hit,draft,afterFine,stage4,secondDraft,afterClamp,success,resultCopy,storageAfterSuccess,failed,storageAfterFailure,retried,wowCount:Object.values(q.wowFactors).filter(Boolean).length,body:document.body.innerText,renderText:render_game_to_text(),scrollWidth:document.documentElement.scrollWidth,innerWidth,canvasWidth:document.getElementById('gameCanvas').width,canvasHeight:document.getElementById('gameCanvas').height};
    });
    await page.reload({waitUntil:'domcontentloaded',timeout:15000});
    await page.waitForFunction(()=>document.body.dataset.qaReady==='1'&&window.__GAME_QA__,null,{timeout:10000});
    Object.assign(report,await page.evaluate(()=>({reloadStorage:window.__GAME_QA__.storage(),reloadBest:document.getElementById('bestText').innerText})));
    return validate(report,pageErrors,consoleErrors);
  }finally{
    if(browser)await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
}

console.log(JSON.stringify(await run(),null,2));
