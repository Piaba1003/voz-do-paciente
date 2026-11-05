const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const source = readFileSync(path.join(__dirname, '../app.js'), 'utf8');

function setup(options = {}) {
  const events = {}, clips = [], utterances = [], timers = new Map(), saved = new Map();
  let timerId = 0, cancelled = 0;
  function element(id, value = '') {
    return {id, value, textContent: '', dataset: {}, attributes: {}, hidden: false,
      addEventListener(type, fn) { events[id + ':' + type] = fn; },
      setAttribute(key, val) { this.attributes[key] = String(val); },
      querySelector() { return this.caption || (this.caption = element('caption')); }};
  }
  const ids = ['feedback','status-title','status-detail','state-label','screen-notice','volume','speed','volume-value','test-sound','fullscreen'];
  const nodes = Object.fromEntries(ids.map(id => [id, element(id)]));
  nodes.volume.value = '100'; nodes.speed.value = '1';
  const buttons = ['comfortable','discomfort','stop'].map(key => {
    const b = element(key); b.dataset.message = key;
    b.classList = {toggle(name, on) { b.selected = on; }};
    return b;
  });
  class Audio {
    constructor(url) { this.src = url; this.currentTime = 0; this.plays = 0; this.pauses = 0; clips.push(this); }
    pause() { this.pauses++; }
    play() { this.plays++; return options.mediaRejected ? Promise.reject(new Error('media failed')) : Promise.resolve(); }
  }
  const document = {baseURI:'https://example.com/voz-do-paciente/', fullscreenEnabled: options.fullscreen !== false,
    getElementById:id => nodes[id], querySelectorAll:() => buttons,
    addEventListener:(type,fn) => events['document:'+type] = fn,
    documentElement:{requestFullscreen:async () => { if(options.fullscreenRejected) throw new Error('not allowed'); document.fullscreenElement = {}; }},
    exitFullscreen:async () => { document.fullscreenElement = null; }};
  const synth = {getVoices:() => [{lang:'pt-BR',name:'Google português',localService:false}],
    addEventListener(){}, cancel(){cancelled++;}, speak(u){utterances.push(u);}};
  const window = {addEventListener:(type,fn) => events['window:'+type] = fn};
  if(!options.noSpeech) { window.speechSynthesis = synth; window.SpeechSynthesisUtterance = function(text){this.text=text;}; }
  const localStorage = {getItem(){if(options.storageBlocked) throw new Error('blocked'); return options.stored ? JSON.stringify(options.stored) : null;}, setItem(k,v){if(options.storageBlocked) throw new Error('blocked'); saved.set(k,v);}};
  vm.runInNewContext(source, {window,document,Audio,URL,localStorage,SpeechSynthesisUtterance:window.SpeechSynthesisUtterance,
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;}, clearTimeout:id=>timers.delete(id)});
  return {events,clips,utterances,nodes,buttons,document,timers,saved,cancelled:()=>cancelled,click:key=>events[key+':click']()};
}

test('all exact patient messages play their bundled audio with relative project paths', () => {
 const x=setup();
 const expected=['Estou sem dor. Pode continuar.','Estou sentindo dor, mas pode continuar.','Estou com dor. Pare, por favor!'];
 ['comfortable','discomfort','stop'].forEach((key,i)=>{x.click(key);assert.equal(x.nodes['status-title'].textContent,expected[i]);assert.equal(x.clips[i].src,'https://example.com/voz-do-paciente/audio/'+key+'.mp3');assert.equal(x.clips[i].plays,1);});
});
test('switching interrupts audio immediately and ignores stale callbacks', () => {
 const x=setup();x.click('comfortable');const stale=x.clips[0].onended;
 x.click('discomfort');x.click('stop');
 assert.equal(x.clips[0].pauses,1);assert.equal(x.clips[1].pauses,1);assert.equal(x.clips[0].currentTime,0);
 stale();assert.equal(x.nodes.feedback.dataset.tone,'stop');assert.equal(x.nodes['status-title'].textContent,'Estou com dor. Pare, por favor!');
});
test('completion retains selected text and repeated playback restarts at zero', () => {
 const x=setup();x.click('stop');x.clips[2].onplaying();assert.equal(x.nodes.feedback.dataset.state,'speaking');
 x.clips[2].currentTime=3;x.clips[2].onended();assert.equal(x.nodes.feedback.dataset.state,'done');
 x.click('stop');assert.equal(x.clips[2].currentTime,0);assert.equal(x.clips[2].plays,2);
});
test('voice test, volume and rhythm preserve preferences and adjust active audio', () => {
 const x=setup({stored:{volume:65,speed:'0.9'}});assert.equal(Number(x.nodes.volume.value),65);assert.equal(x.nodes.speed.value,'0.9');
 x.click('test-sound');assert.equal(x.clips[3].volume,.65);assert.equal(x.clips[3].playbackRate,.9);
 x.nodes.volume.value='80';x.events['volume:input']();x.nodes.speed.value='1';x.events['speed:change']();
 assert.equal(x.clips[3].volume,.8);assert.equal(x.clips[3].playbackRate,1);assert.deepEqual(JSON.parse(x.saved.get('patient-voice-sound')),{volume:80,speed:'1'});
});
test('failed media invokes Portuguese fallback; switching also cancels speech', async () => {
 const x=setup({mediaRejected:true});x.click('comfortable');await Promise.resolve();
 assert.equal(x.utterances.length,1);assert.equal(x.utterances[0].lang,'pt-BR');assert.equal(x.utterances[0].text,'Estou sem dor. Pode continuar.');
 x.utterances[0].onstart();assert.equal(x.nodes.feedback.dataset.state,'speaking');const stale=x.utterances[0].onerror;
 const before=x.cancelled();x.click('stop');assert.ok(x.cancelled()>before);stale();assert.equal(x.nodes.feedback.dataset.tone,'stop');
});
test('unavailable speech and timeout retain the stop message and report error', () => {
 const x=setup({noSpeech:true});x.click('stop');[...x.timers.values()][0]();
 assert.equal(x.nodes.feedback.dataset.state,'error');assert.equal(x.nodes['status-title'].textContent,'Estou com dor. Pare, por favor!');
 assert.match(x.nodes['status-detail'].textContent,/dentista/);
});
test('blocked storage does not prevent playback; pagehide cancels it', () => {
 const x=setup({storageBlocked:true});x.click('stop');assert.equal(x.clips[2].plays,1);x.events['window:pagehide']();assert.equal(x.clips[2].pauses,1);
});
test('fullscreen uses supported APIs and an unsupported button is hidden', async () => {
 const x=setup();await x.click('fullscreen');assert.ok(x.document.fullscreenElement);x.events['document:fullscreenchange']();assert.equal(x.nodes.fullscreen.attributes['aria-label'],'Sair da tela cheia');
 await x.click('fullscreen');assert.equal(x.document.fullscreenElement,null);assert.equal(setup({fullscreen:false}).nodes.fullscreen.hidden,true);
});
test('selected action exposes aria-pressed and stays operable', () => {
 const x=setup();x.click('comfortable');x.click('stop');
 assert.deepEqual(x.buttons.map(b=>b.attributes['aria-pressed']),['false','false','true']);
 assert.equal(x.buttons[2].disabled,undefined);
});
test('preparation, speaking, completion and error have explicit accessible state labels', () => {
 const x=setup({noSpeech:true});x.click('comfortable');assert.equal(x.nodes['state-label'].textContent,'Preparando a voz');
 x.clips[0].onplaying();assert.equal(x.nodes['state-label'].textContent,'Falando agora');x.clips[0].onended();assert.equal(x.nodes['state-label'].textContent,'Mensagem concluída');
 x.click('stop');x.clips[2].onerror();assert.equal(x.nodes['state-label'].textContent,'Não foi possível falar');
});
test('fullscreen failure does not erase a selected patient message', async () => {
 const x=setup({fullscreenRejected:true});x.click('stop');x.clips[2].onended();await x.click('fullscreen');
 assert.equal(x.nodes['status-title'].textContent,'Estou com dor. Pare, por favor!');assert.match(x.nodes['screen-notice'].textContent,/Tela cheia/);
});
test('legacy entry forwards to canonical root instead of loading stale app or CSS', () => {
 const legacy=readFileSync(path.join(__dirname,'../Voz_do_Paciente_GitHub/index.html'),'utf8');
 assert.ok(/http-equiv="refresh"[^>]*url=\.\.\//i.test(legacy), "legacy entry must redirect to ../");assert.doesNotMatch(legacy,/(?:src|href)="(?:app\.js|style\.css)/);
});
