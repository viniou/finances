‘use strict’;
// ─── SUPABASE ─────────────────────────────────────────────────────────────────
var SB_URL = ‘https://bjdnjdzrmasiaowjmgsz.supabase.co’;
var SB_KEY  = ‘eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZG5qZHpybWFzaWFvd2ptZ3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzOTYzNzQsImV4cCI6MjA5MTk3MjM3NH0.h3inRrmPxUs2oEHeyKHPFHmf7YXgOq9DHXrIaPb4nZQ’;
var DB_ROW  = ‘main’;
var DATA_VER = 4;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
var PIN    = ‘1066’;
var MONTHS = [‘January’,‘February’,‘March’,‘April’,‘May’,‘June’,‘July’,‘August’,‘September’,‘October’,‘November’,‘December’];
var DAYS   = [‘MON’,‘TUE’,‘WED’,‘THU’,‘FRI’,‘SAT’,‘SUN’];
var DIDX   = {MON:0,TUE:1,WED:2,THU:3,FRI:4,SAT:5,SUN:6};
var FL     = {weekly:‘Weekly’,fortnightly:‘Fortnightly’,monthly:‘Monthly’,yearly:‘Yearly’};

// ─── THEME ────────────────────────────────────────────────────────────────────
var DARK = {bg:’#0c0c0c’,sf:’#131313’,sf2:’#0f0f0f’,b:’#222’,b2:’#2a2a2a’,tx:’#efefef’,txm:’#848484’,txl:’#363636’,ac:’#c97b2a’,acBg:’#130f00’,acBo:’#c97b2a44’,tabAc:’#1f1f1f’,inBg:’#181818’,red:’#e05555’,grn:’#4ade80’,prog:’#1d1d1d’,sub:’#7c6af0’};
var LITE = {bg:’#f4efe6’,sf:’#ffffff’,sf2:’#faf6f0’,b:’#e2d9cc’,b2:’#d5cab8’,tx:’#191208’,txm:’#786347’,txl:’#b09870’,ac:’#c97b2a’,acBg:’#fff8ee’,acBo:’#c97b2a55’,tabAc:’#ffffff’,inBg:’#faf6f0’,red:’#c0392b’,grn:’#1a7a40’,prog:’#e2d9cc’,sub:’#5b4fc5’};
function theme(){ var h=new Date().getHours(); return(APP.themeOv===‘lite’||(APP.themeOv===null&&h>=6&&h<18))?LITE:DARK; }

// ─── UTILS ────────────────────────────────────────────────────────────────────
function p2(n){ return String(n).padStart(2,‘0’); }
function fmtD(d){ return p2(d.getDate())+’/’+p2(d.getMonth()+1); }
function getMon(wn,yr){
var j4=new Date(yr,0,4), j4d=j4.getDay()||7, m=new Date(j4);
m.setDate(j4.getDate()-j4d+1+(wn-1)*7); return m;
}
function isoWeek(d){
var u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
u.setUTCDate(u.getUTCDate()+4-(u.getUTCDay()||7));
var y1=new Date(Date.UTC(u.getUTCFullYear(),0,1));
return Math.ceil((((u-y1)/86400000)+1)/7);
}
function isoWY(d){ var t=new Date(d); t.setDate(d.getDate()+4-(d.getDay()||7)); return t.getFullYear(); }
function wkMeta(wn,yr){
var mon=getMon(wn,yr), sun=new Date(mon); sun.setDate(mon.getDate()+6);
return {label:‘WEEK ‘+wn+’ (’+fmtD(mon)+’ - ‘+fmtD(sun)+’)’, mon:mon, sun:sun, startMonth:mon.getMonth()};
}
function dayInWk(day,mon){ var d=new Date(mon); d.setDate(mon.getDate()+(DIDX[day]||0)); return fmtD(d); }
function sk(s){ if(!s||s===’–’)return 9999; var p=s.split(’/’); return parseInt(p[1]||0)*100+parseInt(p[0]||0); }
function sortItems(arr){ return arr.slice().sort(function(a,b){return sk(a.date)-sk(b.date)}); }
function weekOfStr(str,yr){
var p=str.split(’/’); if(p.length<2)return null;
var d=new Date(yr,parseInt(p[1])-1,parseInt(p[0]));
return {week:isoWeek(d),year:isoWY(d)};
}
var NOW=new Date(), CW=isoWeek(NOW), CY=isoWY(NOW);

// ─── FREQUENCY ────────────────────────────────────────────────────────────────
function recFits(r, wn, yr, monISO){
if(!r.active)return false;
if(r.maxTimes!=null&&r.timesUsed>=r.maxTimes)return false;
var f=r.frequency||‘weekly’;
if(f===‘weekly’)return true;
var mon=monISO?new Date(monISO):getMon(wn,yr);
var sun=new Date(mon); sun.setDate(mon.getDate()+6);
if(f===‘monthly’){
var day=r.monthDay||1;
for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){
if(d.getDate()===day)return true;
}
return false;
}
if(f===‘fortnightly’){
if(!r.startDate)return false;
var start=new Date(r.startDate);
for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){
var diff=Math.round((d-start)/86400000);
if(diff>=0&&diff%14===0)return true;
}
return false;
}
if(f===‘yearly’){
if(!r.startDate)return false;
var start=new Date(r.startDate);
for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){
if(d.getDate()===start.getDate()&&d.getMonth()===start.getMonth())return true;
}
return false;
}
return true;
}
function recDate(r, mon){
var f=r.frequency||‘weekly’;
var sun=new Date(mon); sun.setDate(mon.getDate()+6);
if(f===‘monthly’){
var day=r.monthDay||1;
for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){
if(d.getDate()===day)return fmtD(new Date(d));
}
return fmtD(mon);
}
if(f===‘fortnightly’){
if(!r.startDate)return dayInWk(r.day,mon);
var start=new Date(r.startDate);
for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){
var diff=Math.round((d-start)/86400000);
if(diff>=0&&diff%14===0)return fmtD(new Date(d));
}
return dayInWk(r.day,mon);
}
if(f===‘yearly’){
if(!r.startDate)return fmtD(mon);
var start=new Date(r.startDate);
for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){
if(d.getDate()===start.getDate()&&d.getMonth()===start.getMonth())return fmtD(new Date(d));
}
return fmtD(mon);
}
return dayInWk(r.day,mon);
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
var SEED_WEEKS = [
{id:1,weekNum:16,year:2026,label:‘WEEK 16 (13/04 - 19/04)’,startMonth:3,monISO:‘2026-04-13T00:00:00.000Z’,collapsed:false,items:[
{id:101,day:‘THU’,date:‘16/04’,name:‘SCOOTER’,  amount:105, paid:true, recurringId:null},
{id:102,day:‘THU’,date:‘16/04’,name:‘RÃNA’,     amount:325, paid:true, recurringId:null},
{id:103,day:‘FRI’,date:‘17/04’,name:‘AFTERPAY’, amount:200, paid:false,recurringId:null},
{id:104,day:‘SUN’,date:‘19/04’,name:‘RENT’,     amount:530, paid:false,recurringId:null},
{id:105,day:‘SUN’,date:‘19/04’,name:‘UNI’,      amount:500, paid:false,recurringId:null},
]},
{id:2,weekNum:15,year:2026,label:‘WEEK 15 (06/04 - 12/04)’,startMonth:3,monISO:‘2026-04-06T00:00:00.000Z’,collapsed:false,items:[
{id:201,day:‘TUE’,date:‘07/04’,name:‘WAGEPAY’,        amount:213,  paid:true,recurringId:null},
{id:202,day:‘WED’,date:‘08/04’,name:‘BEFOREPAY (2/4)’,amount:79,   paid:true,recurringId:null},
{id:203,day:‘THU’,date:‘09/04’,name:‘SCOOTER’,        amount:105,  paid:true,recurringId:null},
{id:204,day:‘THU’,date:‘09/04’,name:‘GYM’,            amount:44,   paid:true,recurringId:null},
{id:205,day:‘FRI’,date:‘10/04’,name:‘AFTERPAY’,       amount:278,  paid:true,recurringId:null},
{id:206,day:‘SUN’,date:‘12/04’,name:‘RENT’,           amount:530,  paid:true,recurringId:null},
{id:207,day:‘SUN’,date:‘12/04’,name:‘UNI’,            amount:320,  paid:true,recurringId:null},
]},
{id:3,weekNum:14,year:2026,label:‘WEEK 14 (30/03 - 05/04)’,startMonth:2,monISO:‘2026-03-30T00:00:00.000Z’,collapsed:true,items:[
{id:301,day:‘WED’,date:‘01/04’,name:‘BEFOREPAY’,      amount:79,   paid:true,recurringId:null},
{id:302,day:‘THU’,date:‘02/04’,name:‘SCOOTER’,        amount:105,  paid:true,recurringId:null},
{id:303,day:‘THU’,date:‘02/04’,name:‘EXAME DE VISTA’, amount:75,   paid:true,recurringId:null},
{id:304,day:‘THU’,date:‘02/04’,name:‘ALUGUEL DIEGO’,  amount:58,   paid:true,recurringId:null},
{id:305,day:‘FRI’,date:‘03/04’,name:‘AFTERPAY’,       amount:106,  paid:true,recurringId:null},
{id:306,day:‘SUN’,date:‘05/04’,name:‘RENT’,           amount:530,  paid:true,recurringId:null},
]},
{id:4,weekNum:13,year:2026,label:‘WEEK 13 (23/03 - 29/03)’,startMonth:2,monISO:‘2026-03-23T00:00:00.000Z’,collapsed:true,items:[
{id:401,day:‘THU’,date:‘26/03’,name:‘SCOOTER’, amount:105,  paid:true,recurringId:null},
{id:402,day:‘THU’,date:‘26/03’,name:‘GYM’,     amount:44,   paid:true,recurringId:null},
{id:403,day:‘FRI’,date:‘27/03’,name:‘AFTERPAY’,amount:375,  paid:true,recurringId:null},
{id:404,day:‘SUN’,date:‘29/03’,name:‘RENT’,    amount:530,  paid:true,recurringId:null},
]},
{id:5,weekNum:12,year:2026,label:‘WEEK 12 (16/03 - 22/03)’,startMonth:2,monISO:‘2026-03-16T00:00:00.000Z’,collapsed:true,items:[
{id:501,day:‘SUN’,date:‘15/03’,name:‘RÃNA’,         amount:330,  paid:true,recurringId:null},
{id:502,day:‘MON’,date:‘16/03’,name:‘WAGEPAY’,       amount:211,  paid:true,recurringId:null},
{id:503,day:‘WED’,date:‘18/03’,name:‘DIEGO’,         amount:215,  paid:true,recurringId:null},
{id:504,day:‘WED’,date:‘18/03’,name:‘BEFOREPAY 2/4’, amount:52.50,paid:true,recurringId:null},
{id:505,day:‘WED’,date:‘18/03’,name:‘STEPTOPAY’,     amount:160,  paid:true,recurringId:null},
{id:506,day:‘THU’,date:‘19/03’,name:‘SCOOTER’,       amount:105,  paid:true,recurringId:null},
{id:507,day:‘THU’,date:‘19/03’,name:‘PHONE’,         amount:59,   paid:true,recurringId:null},
{id:508,day:‘FRI’,date:‘20/03’,name:‘AFTERPAY’,      amount:21.91,paid:true,recurringId:null},
{id:509,day:‘SUN’,date:‘22/03’,name:‘RENT’,          amount:530,  paid:true,recurringId:null},
{id:510,day:‘SUN’,date:‘22/03’,name:‘BOND’,          amount:500,  paid:true,recurringId:null},
]},
{id:6,weekNum:11,year:2026,label:‘WEEK 11 (09/03 - 15/03)’,startMonth:2,monISO:‘2026-03-09T00:00:00.000Z’,collapsed:true,items:[
{id:601,day:‘MON’,date:‘09/03’,name:‘115 RENT ANNA’, amount:115,  paid:true,recurringId:null},
{id:602,day:‘MON’,date:‘09/03’,name:‘WAGEPAY’,       amount:211,  paid:true,recurringId:null},
{id:603,day:‘TUE’,date:‘10/03’,name:‘TERAPIA’,       amount:57,   paid:true,recurringId:null},
{id:604,day:‘WED’,date:‘11/03’,name:‘AFTERPAY’,      amount:220,  paid:true,recurringId:null},
{id:605,day:‘WED’,date:‘11/03’,name:‘BOND DIEGO’,    amount:450,  paid:true,recurringId:null},
{id:606,day:‘WED’,date:‘11/03’,name:‘BEFOREPAY 1/4’, amount:52.50,paid:true,recurringId:null},
{id:607,day:‘THU’,date:‘12/03’,name:‘GYM’,           amount:43.10,paid:true,recurringId:null},
{id:608,day:‘SAT’,date:‘14/03’,name:‘RENT’,          amount:530,  paid:true,recurringId:null},
]},
{id:7,weekNum:10,year:2026,label:‘WEEK 10 (02/03 - 08/03)’,startMonth:2,monISO:‘2026-03-02T00:00:00.000Z’,collapsed:true,items:[
{id:701,day:‘FRI’,date:‘06/03’,name:‘TERAPIA’,amount:57,paid:true,recurringId:null},
]},
];
var SEED_REC = [
{id:‘r1’,name:‘SCOOTER’, baseAmount:105,day:‘THU’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘weekly’,   category:‘expense’,      monthDay:null,startDate:‘2026-03-02’,linkedDebtId:null},
{id:‘r2’,name:‘GYM’,     baseAmount:44, day:‘THU’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,  category:‘expense’,      monthDay:9,   startDate:‘2026-03-09’,linkedDebtId:null},
{id:‘r3’,name:‘RENT’,    baseAmount:530,day:‘SUN’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘weekly’,   category:‘expense’,      monthDay:null,startDate:‘2026-03-02’,linkedDebtId:null},
{id:‘r4’,name:‘AFTERPAY’,baseAmount:0,  day:‘FRI’,fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:‘weekly’,   category:‘expense’,      monthDay:null,startDate:‘2026-03-02’,linkedDebtId:null},
{id:‘s1’,name:‘WIX’,                 baseAmount:0,  day:‘MON’,fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:1, startDate:‘2026-03-01’,linkedDebtId:null},
{id:‘s2’,name:‘GMAIL’,               baseAmount:11, day:‘MON’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:1, startDate:‘2026-03-01’,linkedDebtId:null},
{id:‘s3’,name:‘GOOGLE DRIVE’,        baseAmount:0,  day:‘MON’,fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:1, startDate:‘2026-03-01’,linkedDebtId:null},
{id:‘s4’,name:‘ICLOUD’,              baseAmount:23, day:‘MON’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:1, startDate:‘2026-03-01’,linkedDebtId:null},
{id:‘s5’,name:‘SPOTIFY’,             baseAmount:0,  day:‘MON’,fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:1, startDate:‘2026-03-01’,linkedDebtId:null},
{id:‘s6’,name:‘HABIT TRACKER ANUAL’, baseAmount:17, day:‘MON’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘yearly’, category:‘subscription’,monthDay:null,startDate:‘2026-11-17’,linkedDebtId:null},
{id:‘s7’,name:‘MEDIA (TRI)’,         baseAmount:0,  day:‘MON’,fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:1, startDate:‘2026-03-01’,linkedDebtId:null},
{id:‘s8’,name:‘GYM APP’,             baseAmount:30, day:‘MON’,fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:‘monthly’,category:‘subscription’,monthDay:12,startDate:‘2026-03-12’,linkedDebtId:null},
];

// ─── APP STATE ────────────────────────────────────────────────────────────────
var APP = {
unlocked:false, tab:‘weeks’, viewYear:2026, themeOv:null,
weeks:[], rec:[], debts:[], inv:[],
saveState:‘idle’, modal:null, addingTo:null, editItem:null,
editRecId:null, editDbtId:null, editInvId:null,
varA:{}, loading:true, sbErr:null, subsHidden:false,
};
var sbClient=null, saveTimer=null;

// ─── SUPABASE INIT ────────────────────────────────────────────────────────────
function saveLocal(){
try{ localStorage.setItem(‘fin_v4’, JSON.stringify({weeks:APP.weeks,rec:APP.rec,debts:APP.debts,inv:APP.inv,themeOv:APP.themeOv,viewYear:APP.viewYear})); }catch(e){}
}
function loadLocal(){
try{
var raw=localStorage.getItem(‘fin_v4’);
if(!raw)return false;
var d=JSON.parse(raw);
if(!d||!d.weeks||!d.weeks.length)return false;
APP.weeks=d.weeks; APP.rec=d.rec||[]; APP.debts=d.debts||[];
APP.inv=d.inv||[]; APP.themeOv=d.themeOv||null; APP.viewYear=d.viewYear||2026;
return true;
}catch(e){return false;}
}
function initDB(){
// Load from localStorage immediately so app works offline too
var hasLocal = loadLocal();
if(hasLocal){ APP.loading=false; }
try{
sbClient=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
loadData();
}catch(e){
APP.sbErr=‘Cloud sync unavailable’; APP.loading=false; render();
}
}
function cloneJSON(x){ return JSON.parse(JSON.stringify(x)); }

async function loadData(){
if(!APP.unlocked) { APP.loading=true; render(); }
try{
var res=await sbClient.from(‘finances_data’).select(‘id,data’).eq(‘id’,DB_ROW);
if(res.error)throw res.error;
var row=res.data&&res.data[0];
if(row&&row.data&&(row.data.dataVer||0)>=DATA_VER){
var d=row.data;
APP.weeks=d.weeks||[]; APP.rec=d.rec||[];
APP.debts=d.debts||[]; APP.inv=d.inv||[];
APP.themeOv=d.themeOv||null; APP.viewYear=d.viewYear||2026;
}else{
// First load or outdated — use seed, merge existing rec if any
APP.weeks=cloneJSON(SEED_WEEKS);
var existingRec=(row&&row.data&&row.data.rec)||[];
var merged=cloneJSON(SEED_REC);
existingRec.forEach(function(r){
if(!merged.find(function(x){return x.id===r.id}))merged.push(r);
});
APP.rec=merged;
APP.debts=(row&&row.data&&row.data.debts)||[];
APP.inv=(row&&row.data&&row.data.inv)||[];
APP.themeOv=(row&&row.data&&row.data.themeOv)||null;
APP.viewYear=(row&&row.data&&row.data.viewYear)||2026;
saveNow();
}
}catch(e){
console.error(‘Load error:’,e);
APP.sbErr=’Load error: ’+e.message;
APP.weeks=cloneJSON(SEED_WEEKS); APP.rec=cloneJSON(SEED_REC);
APP.debts=[]; APP.inv=[];
}
APP.loading=false; render();
}

async function saveNow(){
if(!sbClient)return;
saveLocal(); // always save locally first
try{
var res=await sbClient.from(‘finances_data’).upsert({
id:DB_ROW,
data:{weeks:APP.weeks,rec:APP.rec,debts:APP.debts,inv:APP.inv,
themeOv:APP.themeOv,viewYear:APP.viewYear,dataVer:DATA_VER},
updated_at:new Date().toISOString()
},{onConflict:‘id’});
if(res.error)throw res.error;
APP.saveState=‘saved’; render();
setTimeout(function(){APP.saveState=‘idle’;render();},2000);
}catch(e){
APP.saveState=‘error’; render();
setTimeout(function(){APP.saveState=‘idle’;render();},3000);
}
}
function save(){
clearTimeout(saveTimer);
APP.saveState=‘saving’;
saveTimer=setTimeout(saveNow,900);
}

// ─── DOM HELPER ───────────────────────────────────────────────────────────────
function el(tag,attrs){
var e=document.createElement(tag);
if(attrs)Object.keys(attrs).forEach(function(k){
var v=attrs[k];
if(k===‘cls’)e.className=v;
else if(k===‘css’&&typeof v===‘object’)Object.assign(e.style,v);
else if(k.slice(0,2)===‘on’&&typeof v===‘function’)e.addEventListener(k.slice(2),v);
else if(v!=null&&v!==false&&v!==undefined)e.setAttribute(k,String(v));
});
for(var i=2;i<arguments.length;i++){
var c=arguments[i];
if(c==null||c===false||c===undefined)continue;
if(Array.isArray(c)){c.forEach(function(x){if(x instanceof Node)e.appendChild(x)});}
else if(c instanceof Node)e.appendChild(c);
else e.appendChild(document.createTextNode(String(c)));
}
return e;
}
function svgI(paths,sz,col){
sz=sz||16; col=col||‘currentColor’;
var s=document.createElementNS(‘http://www.w3.org/2000/svg’,‘svg’);
s.setAttribute(‘width’,sz);s.setAttribute(‘height’,sz);s.setAttribute(‘viewBox’,‘0 0 24 24’);
s.setAttribute(‘fill’,‘none’);s.setAttribute(‘stroke’,col);s.setAttribute(‘stroke-width’,‘2’);
s.setAttribute(‘stroke-linecap’,‘round’);s.setAttribute(‘stroke-linejoin’,‘round’);
s.style.cssText=‘flex-shrink:0;display:inline-block;vertical-align:middle;’;
paths.split(’|’).forEach(function(d){var p=document.createElementNS(‘http://www.w3.org/2000/svg’,‘path’);p.setAttribute(‘d’,d);s.appendChild(p)});
return s;
}
var IC={
Plus:‘M12 5v14M5 12h14’, X:‘M18 6 6 18M6 6l12 12’, Dn:‘m6 9 6 6 6-6’, Rt:‘m9 18 6-6-6-6’, Lt:‘m15 18-6-6 6-6’,
Ok:‘M20 6 9 17l-5-5’,
Sun:‘M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36-.71.71M6.34 17.66l-.71.71M17.66 17.66l.71.71M6.34 6.34l-.71-.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z’,
Moon:‘M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z’,
Sync:‘M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5m13 3a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m18 5v-5h-5’,
Trend:‘m23 6-9.5 9.5-5-5L1 18’,
Edit:‘M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7|M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z’,
Tv:‘M2 7h20v15H2z|M17 22v2|M7 22v2|M2 17h20’,
Del:‘M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z|M18 9l-6 6|M12 9l6 6’,
Lock:‘M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z|M7 11V7a5 5 0 0 1 10 0v4’,
Move:‘M5 9l-3 3 3 3|M9 5l3-3 3 3|M15 19l-3 3-3-3|M19 9l3 3-3 3|M2 12h20|M12 2v20’,
};
function I(n,sz,col){return svgI(IC[n]||‘M0 0’,sz,col);}

// ─── FORM HELPERS (cursor-safe) ───────────────────────────────────────────────
function mkInp(ph,val,type,onInput,css){
var e=document.createElement(‘input’);
e.className=‘inp’; e.placeholder=ph||’’; e.value=val||’’; e.type=type||‘text’;
var t=theme(); e.style.background=t.inBg; e.style.borderColor=t.b2; e.style.color=t.tx;
if(css)Object.assign(e.style,css);
e.addEventListener(‘input’,function(){onInput(e.value)});
return e;
}
function mkSel(opts,val,onChange,css){
var t=theme(), e=document.createElement(‘select’);
e.className=‘inp’; e.style.background=t.inBg; e.style.borderColor=t.b2; e.style.color=t.tx;
if(css)Object.assign(e.style,css);
opts.forEach(function(o){
var opt=document.createElement(‘option’); opt.value=o[0]; opt.textContent=o[1];
if(String(o[0])===String(val))opt.selected=true;
e.appendChild(opt);
});
e.addEventListener(‘change’,function(){onChange(e.value)});
return e;
}
function mkSeg(opts,val,onChange){
var t=theme(), wrap=el(‘div’,{cls:‘seg’,css:{borderColor:t.b2}});
opts.forEach(function(o){
var v=o[0],lbl=o[1],on=String(val)===String(v);
var btn=el(‘button’,{cls:‘seg-btn’+(on?’ on’:’’),
css:{color:on?’#fff’:t.txm,background:on?t.ac:‘none’},
onclick:function(){onChange(v);}},lbl);
wrap.appendChild(btn);
});
return wrap;
}
// Seg that updates itself in-place (NO global render)
function mkSegLive(opts,getVal,setVal,afterChange){
var t=theme(), wrap=el(‘div’,{cls:‘seg’,css:{borderColor:t.b2}});
var btns={};
function refresh(){
var cur=getVal();
Object.keys(btns).forEach(function(v){
var on=String(cur)===String(v);
btns[v].className=‘seg-btn’+(on?’ on’:’’);
btns[v].style.color=on?’#fff’:t.txm;
btns[v].style.background=on?t.ac:‘none’;
});
}
opts.forEach(function(o){
var v=o[0],lbl=o[1],on=String(getVal())===String(v);
var btn=el(‘button’,{cls:‘seg-btn’+(on?’ on’:’’),
css:{color:on?’#fff’:t.txm,background:on?t.ac:‘none’},
onclick:function(){setVal(v);refresh();if(afterChange)afterChange();}},lbl);
btns[v]=btn; wrap.appendChild(btn);
});
return wrap;
}
function mkFld(lbl,child){
var t=theme();
return el(‘div’,{cls:‘fld’},el(‘span’,{cls:‘fld-lbl’,css:{color:t.txm}},lbl),child);
}

// ─── OVERLAY HELPERS ─────────────────────────────────────────────────────────
function mkOverlay(content,small){
var t=theme();
var ov=el(‘div’,{cls:‘overlay’,onclick:function(){APP.modal=null;APP.editItem=null;APP.editRecId=null;APP.editDbtId=null;APP.editInvId=null;render();}});
var box=el(‘div’,{cls:(small?‘modal-sm’:‘modal’)+’ fadein’,css:{background:t.sf,borderColor:t.b2}});
box.addEventListener(‘click’,function(e){e.stopPropagation()});
box.appendChild(content); ov.appendChild(box); return ov;
}
function mkMhdr(title,onClose){
var t=theme();
return el(‘div’,{cls:‘modal-hdr’},
el(‘span’,{cls:‘modal-title’,css:{color:t.tx}},title),
el(‘button’,{css:{background:‘none’,border:‘none’,color:t.txl,display:‘flex’},onclick:onClose},I(‘X’,18,t.txl))
);
}

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
function renderPin(){
var t=theme(); var entered=’’;
var root=el(‘div’,{cls:‘screen’,css:{background:t.bg,color:t.tx}});
var dotsWrap=el(‘div’,{cls:‘pin-dots’});
var dots=[]; for(var i=0;i<4;i++){var d=el(‘div’,{cls:‘pin-dot’,css:{borderColor:t.b2}});dotsWrap.appendChild(d);dots.push(d);}
function upd(){dots.forEach(function(d,i){d.style.background=entered.length>i?t.ac:‘none’});}
function press(k){
if(entered.length>=4)return;
entered+=k; upd();
if(entered.length===4){
if(entered===PIN){setTimeout(function(){APP.unlocked=true;render();},200);}
else{dotsWrap.classList.add(‘shake’);setTimeout(function(){entered=’’;upd();dotsWrap.classList.remove(‘shake’);},600);}
}
}
var grid=el(‘div’,{cls:‘pin-grid’});
[1,2,3,4,5,6,7,8,9,’’,0,‘del’].forEach(function(k,i){
if(k===’’){grid.appendChild(el(‘div’,{}));return;}
if(k===‘del’){grid.appendChild(el(‘button’,{cls:‘pin-del’,css:{color:t.txm},onclick:function(){entered=entered.slice(0,-1);upd();}},I(‘Del’,22,t.txm)));return;}
grid.appendChild(el(‘button’,{cls:‘pin-key’,css:{borderColor:t.b2,color:t.tx},onclick:function(){press(String(k));}},’’+k));
});
root.appendChild(el(‘div’,{css:{fontSize:‘10px’,color:t.txl,fontWeight:700,letterSpacing:‘3px’,marginBottom:‘8px’}},‘FINANCES’));
root.appendChild(el(‘h2’,{css:{fontSize:‘26px’,fontWeight:800,marginBottom:‘36px’}},‘Enter PIN’));
root.appendChild(dotsWrap); root.appendChild(grid);
return root;
}

// ─── RECURRING MODAL (cursor-safe: no global render on input) ─────────────────
function renderRecModal(){
var t=theme();
var existing=APP.editRecId?APP.rec.find(function(r){return r.id===APP.editRecId}):null;
var F={
name:existing?existing.name:’’,
baseAmount:existing?String(existing.baseAmount||’’):’’,
day:existing?existing.day:‘MON’,
fixedAmount:existing?existing.fixedAmount!==false:true,
maxTimes:existing&&existing.maxTimes!=null?String(existing.maxTimes):’’,
frequency:existing?existing.frequency||‘weekly’:‘weekly’,
category:existing?existing.category||‘expense’:‘expense’,
linkedDebtId:existing&&existing.linkedDebtId?existing.linkedDebtId:’’,
monthDay:existing&&existing.monthDay?existing.monthDay:1,
startDate:existing&&existing.startDate?existing.startDate:’’,
};
var close=function(){APP.modal=null;APP.editRecId=null;render();};
var wrap=el(‘div’,{});
wrap.appendChild(mkMhdr(‘Recurring Expenses’,close));

// List existing (only when not editing)
if(!APP.editRecId){
var expenses=APP.rec.filter(function(r){return r.category!==‘subscription’});
var subs=APP.rec.filter(function(r){return r.category===‘subscription’});
function makeChip(r){
return el(‘div’,{cls:‘rec-chip’,css:{background:t.sf2,borderColor:t.b}},
el(‘div’,{css:{display:‘flex’,alignItems:‘center’,gap:‘8px’,flexWrap:‘wrap’}},
el(‘span’,{css:{color:r.active?t.ac:t.txl,fontSize:‘10px’}},‘●’),
r.category===‘subscription’?I(‘Tv’,10,t.sub):el(‘span’,{}),
el(‘span’,{css:{color:t.tx}},r.name),
el(‘span’,{css:{color:t.txm,fontSize:‘11px’}},FL[r.frequency||‘weekly’]+(r.fixedAmount?’ · $’+r.baseAmount:’ · var’))
),
el(‘div’,{css:{display:‘flex’,gap:‘4px’}},
el(‘button’,{css:{background:‘none’,border:‘none’,color:t.txm,padding:‘2px’,display:‘flex’},onclick:function(){APP.editRecId=r.id;render();}},I(‘Edit’,11,t.txm)),
el(‘button’,{css:{background:‘none’,border:‘none’,color:t.txl,padding:‘2px’,display:‘flex’},onclick:function(){APP.rec=APP.rec.filter(function(x){return x.id!==r.id});save();render();}},I(‘X’,11,t.txl))
)
);
}
if(expenses.length){
var el2=el(‘div’,{css:{marginBottom:‘10px’,maxHeight:‘130px’,overflowY:‘auto’}});
expenses.forEach(function(r){el2.appendChild(makeChip(r))});
wrap.appendChild(el2);
}
if(subs.length){
var subsOpen=!APP.subsHidden;
var toggleLbl=el(‘span’,{css:{fontSize:‘11px’,color:t.txm,fontWeight:‘600’}},subsOpen?‘▼ Hide’:‘▶ Show’);
var subList=el(‘div’,{css:{marginBottom:‘10px’,maxHeight:‘130px’,overflowY:‘auto’}});
subs.forEach(function(r){subList.appendChild(makeChip(r))});
if(!subsOpen)subList.style.display=‘none’;
var subHdr=el(‘div’,{css:{display:‘flex’,alignItems:‘center’,justifyContent:‘space-between’,marginBottom:‘6px’,cursor:‘pointer’}},
el(‘div’,{css:{display:‘flex’,alignItems:‘center’,gap:‘6px’}},I(‘Tv’,12,t.sub),el(‘span’,{css:{fontSize:‘12px’,fontWeight:‘700’,color:t.sub}},‘SUBSCRIPTIONS (’+subs.length+’)’)),
toggleLbl
);
subHdr.addEventListener(‘click’,function(){
subsOpen=!subsOpen; APP.subsHidden=!subsOpen;
subList.style.display=subsOpen?’’:‘none’;
toggleLbl.textContent=subsOpen?‘▼ Hide’:‘▶ Show’;
});
wrap.appendChild(subHdr); wrap.appendChild(subList);
}
}

// FORM — all inputs use local F object, never call render()
var formDiv=el(‘div’,{css:{borderTop:APP.editRecId?‘none’:’1px solid ’+t.b,paddingTop:APP.editRecId?‘0’:‘14px’}});
formDiv.appendChild(el(‘div’,{css:{fontWeight:‘700’,fontSize:‘13px’,color:t.tx,marginBottom:‘12px’}},APP.editRecId?‘Edit’:‘New Recurring’));

// Name
var nameEl=mkInp(‘RENT, SCOOTER…’,F.name,‘text’,function(v){F.name=v.toUpperCase();nameEl.value=F.name});
formDiv.appendChild(mkFld(‘NAME’,nameEl));

// Category seg (live, no render)
var catSeg=mkSegLive([[‘expense’,‘Expense’],[‘subscription’,‘Subscription 🔔’]],function(){return F.category;},function(v){F.category=v});
formDiv.appendChild(mkFld(‘CATEGORY’,catSeg));

// Frequency seg (live, triggers show/hide)
var freqSeg=mkSegLive([[‘weekly’,‘Weekly’],[‘fortnightly’,‘Fortnightly’],[‘monthly’,‘Monthly’],[‘yearly’,‘Yearly’]],function(){return F.frequency;},function(v){F.frequency=v;},function(){
dayFld.style.display=(F.frequency===‘monthly’||F.frequency===‘yearly’)?‘none’:’’;
mdFld.style.display=F.frequency===‘monthly’?’’:‘none’;
sdFld.style.display=(F.frequency===‘fortnightly’||F.frequency===‘yearly’)?’’:‘none’;
});
formDiv.appendChild(mkFld(‘FREQUENCY’,freqSeg));

// Day + Max row
var dayRow=el(‘div’,{cls:‘two-col’});
var dayFld=mkFld(‘DAY OF WEEK’,mkSel(DAYS.map(function(d){return[d,d]}),F.day,function(v){F.day=v}));
dayFld.style.display=(F.frequency===‘monthly’||F.frequency===‘yearly’)?‘none’:’’;
var maxEl=mkInp(‘e.g. 4’,F.maxTimes,‘number’,function(v){F.maxTimes=v});
dayRow.appendChild(dayFld);
dayRow.appendChild(mkFld(‘MAX TIMES (∞=blank)’,maxEl));
formDiv.appendChild(dayRow);

// Month day
var mdOpts=Array.from({length:28},function(_,i){return[String(i+1),‘Day ‘+(i+1)]});
var mdFld=mkFld(‘DAY OF MONTH’,mkSel(mdOpts,String(F.monthDay||1),function(v){F.monthDay=parseInt(v)}));
mdFld.style.display=F.frequency===‘monthly’?’’:‘none’;
formDiv.appendChild(mdFld);

// Start date
var sdEl=mkInp(’’,F.startDate,‘date’,function(v){F.startDate=v});
var sdFld=mkFld(‘START / ANNUAL DATE’,sdEl);
sdFld.style.display=(F.frequency===‘fortnightly’||F.frequency===‘yearly’)?’’:‘none’;
formDiv.appendChild(sdFld);

// Amount type
var amtSeg=mkSegLive([[‘fixed’,‘Fixed’],[‘variable’,‘Variable’]],function(){return F.fixedAmount?‘fixed’:‘variable’;},function(v){F.fixedAmount=v===‘fixed’;},function(){
amtFld.style.display=F.fixedAmount?’’:‘none’;
varTip.style.display=F.fixedAmount?‘none’:’’;
});
formDiv.appendChild(mkFld(‘AMOUNT TYPE’,amtSeg));
var amtEl=mkInp(‘0’,F.baseAmount,‘number’,function(v){F.baseAmount=v});
var amtFld=mkFld(‘AMOUNT’,amtEl);
amtFld.style.display=F.fixedAmount?’’:‘none’;
formDiv.appendChild(amtFld);
var varTip=el(‘div’,{css:{background:t.acBg,border:‘1px solid ‘+t.acBo,borderRadius:‘8px’,padding:‘10px 12px’,fontSize:‘13px’,color:t.ac,marginBottom:‘12px’}},‘💡 Amount blank each week — fill on the row.’);
varTip.style.display=F.fixedAmount?‘none’:’’;
formDiv.appendChild(varTip);

// Link to debt
var debtOpts=[[’’,‘None’]].concat(APP.debts.map(function(d){return[d.id,d.name]}));
formDiv.appendChild(mkFld(‘LINK TO DEBT’,mkSel(debtOpts,F.linkedDebtId||’’,function(v){F.linkedDebtId=v})));

// Save button
var btnRow=el(‘div’,{css:{display:‘flex’,gap:‘8px’,marginTop:‘4px’}});
btnRow.appendChild(el(‘button’,{cls:‘btn-p’,onclick:function(){
if(!F.name)return;
var rec={name:F.name,baseAmount:parseFloat(F.baseAmount)||0,day:F.day,
fixedAmount:F.fixedAmount,maxTimes:F.maxTimes?parseInt(F.maxTimes):null,
frequency:F.frequency,category:F.category,linkedDebtId:F.linkedDebtId||null,
monthDay:F.monthDay||1,startDate:F.startDate||’’};
if(APP.editRecId){APP.rec=APP.rec.map(function(r){return r.id!==APP.editRecId?r:Object.assign({},r,rec)});APP.editRecId=null;}
else APP.rec=APP.rec.concat([Object.assign({id:‘r’+Date.now(),timesUsed:0,active:true},rec)]);
APP.modal=null; save(); render();
}},APP.editRecId?‘Save’:‘Add’));
if(APP.editRecId) btnRow.appendChild(el(‘button’,{cls:‘btn-g’,css:{borderColor:t.b2,color:t.txm},onclick:function(){APP.editRecId=null;render();}},‘Cancel’));
formDiv.appendChild(btnRow);
wrap.appendChild(formDiv);
return mkOverlay(wrap);
}

// ─── DEBT MODAL ───────────────────────────────────────────────────────────────
function renderDebtModal(){
var t=theme();
var ex=APP.editDbtId?APP.debts.find(function(d){return d.id===APP.editDbtId}):null;
var F={name:ex?ex.name:’’,total:ex?String(ex.total||’’):’’,paid:ex?String(ex.paid||’’):’’,installment:ex?String(ex.installment||’’):’’,note:ex?ex.note||’’:’’};
var close=function(){APP.modal=null;APP.editDbtId=null;render();};
var wrap=el(‘div’,{}); wrap.appendChild(mkMhdr(APP.editDbtId?‘Edit Debt’:‘New Debt’,close));
wrap.appendChild(mkFld(‘NAME’,mkInp(‘AFTERPAY, LOAN…’,F.name,‘text’,function(v){F.name=v.toUpperCase()})));
var row=el(‘div’,{cls:‘two-col’});
row.appendChild(mkFld(‘TOTAL’,mkInp(’’,F.total,‘number’,function(v){F.total=v})));
row.appendChild(mkFld(‘PAID SO FAR’,mkInp(’’,F.paid,‘number’,function(v){F.paid=v})));
wrap.appendChild(row);
wrap.appendChild(mkFld(‘INSTALLMENT’,mkInp(’’,F.installment,‘number’,function(v){F.installment=v})));
wrap.appendChild(mkFld(‘NOTE’,mkInp(’’,F.note,‘text’,function(v){F.note=v})));
wrap.appendChild(el(‘button’,{cls:‘btn-p’,css:{width:‘100%’,justifyContent:‘center’},onclick:function(){
if(!F.name||!F.total)return;
var d={name:F.name,total:parseFloat(F.total)||0,paid:parseFloat(F.paid)||0,installment:parseFloat(F.installment)||0,note:F.note,autoFromRecId:null};
if(APP.editDbtId){APP.debts=APP.debts.map(function(x){return x.id!==APP.editDbtId?x:Object.assign({},x,d)});APP.editDbtId=null;}
else APP.debts=APP.debts.concat([Object.assign({id:‘d’+Date.now()},d)]);
APP.modal=null; save(); render();
}},APP.editDbtId?‘Save’:‘Add’));
return mkOverlay(wrap);
}

// ─── INVESTMENT MODAL ─────────────────────────────────────────────────────────
function renderInvModal(){
var t=theme();
var ex=APP.editInvId?APP.inv.find(function(i){return i.id===APP.editInvId}):null;
var F={name:ex?ex.name:’’,contributed:ex?String(ex.contributed||’’):’’,currentValue:ex?String(ex.currentValue||’’):’’,startDate:ex?ex.startDate||’’:’’,note:ex?ex.note||’’:’’};
var close=function(){APP.modal=null;APP.editInvId=null;render();};
var wrap=el(‘div’,{}); wrap.appendChild(mkMhdr(APP.editInvId?‘Edit Investment’:‘New Investment’,close));
wrap.appendChild(mkFld(‘NAME’,mkInp(‘CDB, Treasury Bond…’,F.name,‘text’,function(v){F.name=v})));
var row=el(‘div’,{cls:‘two-col’});
row.appendChild(mkFld(‘INVESTED ($)’,mkInp(’’,F.contributed,‘number’,function(v){F.contributed=v})));
row.appendChild(mkFld(‘CURRENT VALUE ($)’,mkInp(’’,F.currentValue,‘number’,function(v){F.currentValue=v})));
wrap.appendChild(row);
wrap.appendChild(mkFld(‘START DATE’,mkInp(’’,F.startDate,‘date’,function(v){F.startDate=v})));
wrap.appendChild(mkFld(‘NOTE’,mkInp(’’,F.note,‘text’,function(v){F.note=v})));
wrap.appendChild(el(‘button’,{cls:‘btn-p’,css:{width:‘100%’,justifyContent:‘center’},onclick:function(){
if(!F.name||!F.contributed)return;
var x={name:F.name,contributed:parseFloat(F.contributed)||0,currentValue:parseFloat(F.currentValue)||parseFloat(F.contributed)||0,startDate:F.startDate,note:F.note};
if(APP.editInvId){APP.inv=APP.inv.map(function(i){return i.id!==APP.editInvId?i:Object.assign({},i,x)});APP.editInvId=null;}
else APP.inv=APP.inv.concat([Object.assign({id:‘i’+Date.now()},x)]);
APP.modal=null; save(); render();
}},APP.editInvId?‘Save’:‘Add’));
return mkOverlay(wrap);
}

// ─── EDIT ITEM MODAL ─────────────────────────────────────────────────────────
function renderEditModal(){
var t=theme(), item=APP.editItem;
var F={name:item.name,amount:String(item.amount||’’),day:item.day,date:item.date};
var close=function(){APP.modal=null;APP.editItem=null;render();};
var wrap=el(‘div’,{}); wrap.appendChild(mkMhdr(‘Edit Entry’,close));
wrap.appendChild(mkFld(‘NAME’,mkInp(’’,F.name,‘text’,function(v){F.name=v})));
wrap.appendChild(mkFld(‘AMOUNT’,mkInp(’’,F.amount,‘number’,function(v){F.amount=v})));
var row=el(‘div’,{cls:‘two-col’});
row.appendChild(mkFld(‘DAY’,mkSel(DAYS.map(function(d){return[d,d]}),F.day,function(v){F.day=v})));
row.appendChild(mkFld(‘DATE (DD/MM)’,mkInp(‘17/04’,F.date,‘text’,function(v){F.date=v})));
wrap.appendChild(row);
wrap.appendChild(el(‘div’,{css:{display:‘flex’,gap:‘8px’,marginTop:‘4px’}},
el(‘button’,{cls:‘btn-p’,onclick:function(){
if(!/^\d{1,2}/\d{1,2}$/.test(F.date.trim())){alert(‘Date must be DD/MM’);return;}
var updated=Object.assign({},item,{name:F.name.toUpperCase(),amount:parseFloat(F.amount)||0,day:F.day,date:F.date.trim()});
var refYear=APP.weeks.length?APP.weeks[0].year:CY;
var ti=weekOfStr(F.date.trim(),refYear);
var src=APP.weeks.find(function(w){return w.items.some(function(i){return i.id===item.id})});
var same=!ti||!src||(ti.week===src.weekNum&&ti.year===src.year);
if(same){
APP.weeks=APP.weeks.map(function(w){
return w.id!==src.id?w:Object.assign({},w,{items:sortItems(w.items.map(function(i){return i.id!==item.id?i:updated}))});
});
}else{
APP.weeks=APP.weeks.map(function(w){return w.id!==src.id?w:Object.assign({},w,{items:w.items.filter(function(i){return i.id!==item.id})})});
var dest=APP.weeks.find(function(w){return w.weekNum===ti.week&&w.year===ti.year});
if(dest){APP.weeks=APP.weeks.map(function(w){return w.id!==dest.id?w:Object.assign({},w,{items:sortItems(w.items.concat([updated]))})});}
else{var m=wkMeta(ti.week,ti.year);APP.weeks=[{id:Date.now(),weekNum:ti.week,year:ti.year,label:m.label,startMonth:m.startMonth,monISO:m.mon.toISOString(),collapsed:false,items:[updated]}].concat(APP.weeks);APP.viewYear=ti.year;}
}
APP.modal=null;APP.editItem=null;save();render();
}},‘Save’),
el(‘button’,{cls:‘btn-g’,css:{borderColor:t.b2,color:t.txm},onclick:close},‘Cancel’)
));
return mkOverlay(wrap,true);
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────
function addNextWeek(){
var sorted=APP.weeks.slice().sort(function(a,b){return b.year!==a.year?b.year-a.year:b.weekNum-a.weekNum});
var last=sorted[0], nw=last?last.weekNum+1:CW, ny=last?last.year:CY;
if(nw>52){nw=1;ny++;}
var m=wkMeta(nw,ny);
var active=APP.rec.filter(function(r){return recFits(r,nw,ny,m.mon.toISOString())});
var items=sortItems(active.map(function(r){
return {id:Date.now()+Math.random(),day:r.day,date:recDate(r,m.mon),
name:r.name+(r.category===‘subscription’?’ 🔔’:’’),
amount:r.fixedAmount?r.baseAmount:0,paid:false,recurringId:r.id,isSub:r.category===‘subscription’};
}));
APP.weeks=[{id:Date.now(),weekNum:nw,year:ny,label:m.label,startMonth:m.startMonth,monISO:m.mon.toISOString(),collapsed:false,items:items}].concat(APP.weeks);
APP.viewYear=ny; save(); render();
}

function togglePaid(wid,iid){
APP.weeks=APP.weeks.map(function(w){
if(w.id!==wid)return w;
return Object.assign({},w,{items:w.items.map(function(i){
if(i.id!==iid)return i;
var np=!i.paid;
if(i.recurringId){
APP.rec=APP.rec.map(function(r){
if(r.id!==i.recurringId)return r;
var nu=r.timesUsed+(np?1:-1);
return Object.assign({},r,{timesUsed:Math.max(0,nu),active:r.maxTimes==null||nu<r.maxTimes});
});
var lr=APP.rec.find(function(r){return r.id===i.recurringId&&r.linkedDebtId});
if(lr){
APP.debts=APP.debts.map(function(d){
if(d.id!==lr.linkedDebtId)return d;
var np2=np?d.paid+lr.baseAmount:Math.max(0,d.paid-lr.baseAmount);
if(np2>=d.total)APP.rec=APP.rec.map(function(r){return r.id===lr.id?Object.assign({},r,{active:false}):r});
return Object.assign({},d,{paid:Math.min(np2,d.total)});
});
}
}
return Object.assign({},i,{paid:np});
})});
});
save(); render();
}

function delItem(wid,iid){APP.weeks=APP.weeks.map(function(w){return w.id!==wid?w:Object.assign({},w,{items:w.items.filter(function(i){return i.id!==iid})})});save();render();}
function delWeek(wid){APP.weeks=APP.weeks.filter(function(w){return w.id!==wid});save();render();}
function togCol(wid){APP.weeks=APP.weeks.map(function(w){return w.id!==wid?w:Object.assign({},w,{collapsed:!w.collapsed})});render();}
function applyVar(wid,item){
var k=wid+’_’+item.id, v=parseFloat(APP.varA[k]);
if(isNaN(v))return;
APP.weeks=APP.weeks.map(function(w){return w.id!==wid?w:Object.assign({},w,{items:w.items.map(function(i){return i.id!==item.id?i:Object.assign({},i,{amount:v})})})});
delete APP.varA[k]; save(); render();
}
function groupWeeks(){
var yw=APP.weeks.filter(function(w){return w.year===APP.viewYear}), map={};
yw.forEach(function(w){var m=w.startMonth||0; if(!map[m])map[m]=[]; map[m].push(w)});
Object.keys(map).forEach(function(m){map[m].sort(function(a,b){return b.weekNum-a.weekNum})});
return Object.entries(map).sort(function(a,b){return Number(b[0])-Number(a[0])});
}

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────
function render(){
var root=document.getElementById(‘root’);
root.innerHTML=’’;
var t=theme();

// Only block on loading screen BEFORE PIN is entered
if(APP.loading && !APP.unlocked){
root.appendChild(el(‘div’,{css:{minHeight:‘100vh’,display:‘flex’,flexDirection:‘column’,alignItems:‘center’,justifyContent:‘center’,background:t.bg}},
el(‘div’,{css:{fontSize:‘14px’,color:t.txm}},‘Connecting…’),
APP.sbErr?el(‘div’,{css:{color:t.red,fontSize:‘12px’,marginTop:‘12px’,maxWidth:‘280px’,textAlign:‘center’,lineHeight:‘1.6’}},APP.sbErr):el(‘span’,{})
));
return;
}
if(!APP.unlocked){root.appendChild(renderPin());return;}

var app=el(‘div’,{cls:‘app’,css:{background:t.bg,color:t.tx}});

// HEADER
var saveDot=APP.saveState===‘saving’?t.ac:APP.saveState===‘saved’?t.grn:APP.saveState===‘error’?t.red:‘transparent’;
var saveLbl=APP.saveState===‘saving’?‘SAVING…’:APP.saveState===‘saved’?‘SAVED’:APP.saveState===‘error’?‘ERR’:’’;
var hdr=el(‘div’,{cls:‘hdr’,css:{background:t.bg,borderBottom:‘1px solid ‘+t.b}},
el(‘div’,{},
el(‘div’,{css:{fontSize:‘10px’,color:t.txl,fontWeight:‘700’,letterSpacing:‘3px’,marginBottom:‘3px’}},‘FINANCES’),
el(‘div’,{cls:‘hdr-yr’},
el(‘button’,{cls:‘ibtn’,css:{borderColor:t.b2,color:t.txm,width:‘26px’,height:‘26px’,borderRadius:‘6px’},onclick:function(){APP.viewYear–;render();}},I(‘Lt’,13,t.txm)),
el(‘h1’,’’+APP.viewYear),
el(‘button’,{cls:‘ibtn’,css:{borderColor:t.b2,color:t.txm,width:‘26px’,height:‘26px’,borderRadius:‘6px’},onclick:function(){APP.viewYear++;render();}},I(‘Rt’,13,t.txm))
)
),
el(‘div’,{cls:‘hdr-r’},
el(‘div’,{css:{display:‘flex’,alignItems:‘center’,gap:‘5px’}},
el(‘div’,{cls:‘save-dot’+(APP.saveState===‘saving’?’ pulse’:’’),css:{background:saveDot}}),
el(‘span’,{css:{fontSize:‘10px’,color:APP.saveState===‘saved’?t.grn:APP.saveState===‘error’?t.red:t.txl,fontWeight:‘600’,letterSpacing:‘1px’}},saveLbl)
),
el(‘button’,{cls:‘ibtn’,css:{borderColor:t.b2,color:t.txm},onclick:function(){APP.themeOv=APP.themeOv===null?(t===LITE?‘dark’:‘lite’):APP.themeOv===‘dark’?‘lite’:‘dark’;render();}},t===LITE?I(‘Moon’,15,t.txm):I(‘Sun’,15,t.txm)),
APP.themeOv!==null?el(‘button’,{cls:‘ibtn pill’,css:{borderColor:t.b2,color:t.txm},onclick:function(){APP.themeOv=null;render();}},‘AUTO’):el(‘span’,{}),
el(‘button’,{cls:‘ibtn’,css:{borderColor:t.b2,color:t.txm},onclick:function(){APP.unlocked=false;render();}},I(‘Lock’,15,t.txm))
)
);
app.appendChild(hdr);

// TABS
var tabs=el(‘div’,{cls:‘tabs’,css:{borderColor:t.b}});
[[‘weeks’,‘WEEKS’],[‘debts’,‘DEBTS’],[‘investments’,‘INVESTMENTS’],[‘subs’,‘SUBSCRIPTIONS’]].forEach(function(pair){
tabs.appendChild(el(‘button’,{cls:‘tab’,css:{color:APP.tab===pair[0]?t.ac:t.txm,background:APP.tab===pair[0]?t.tabAc:‘none’},onclick:function(){APP.tab=pair[0];render();}},pair[1]));
});
app.appendChild(tabs);

var body=el(‘div’,{cls:‘body’});

// ── WEEKS ──
if(APP.tab===‘weeks’){
body.appendChild(el(‘div’,{cls:‘toolbar’},
el(‘button’,{cls:‘btn-p’,onclick:addNextWeek},I(‘Plus’,14,’#fff’),’ Next Week’),
el(‘button’,{cls:‘btn-g’,css:{borderColor:t.b2,color:t.txm},onclick:function(){APP.editRecId=null;APP.modal=‘rec’;render();}},I(‘Sync’,13,t.txm),’ Recurring’)
));
var grouped=groupWeeks();
if(!grouped.length)body.appendChild(el(‘div’,{cls:‘empty’,css:{color:t.txl}},‘No weeks for ‘+APP.viewYear+’. Click “Next Week”.’));
grouped.forEach(function(pair){
var mIdx=pair[0], mWks=pair[1];
body.appendChild(el(‘div’,{cls:‘m-hdr’,css:{color:t.txm,borderColor:t.b}},MONTHS[mIdx]));
mWks.forEach(function(week){
var pAmt=week.items.filter(function(i){return i.paid}).reduce(function(s,i){return s+i.amount;},0);
var tAmt=week.items.reduce(function(s,i){return s+i.amount;},0);
var done=week.items.length>0&&week.items.every(function(i){return i.paid});
var pct=week.items.length?(week.items.filter(function(i){return i.paid}).length/week.items.length)*100:0;
var ww=el(‘div’,{cls:‘w-wrap’});
var whdr=el(‘div’,{cls:‘w-hdr’,css:{background:done?t.acBg:t.sf,borderColor:done?t.acBo:t.b,borderRadius:week.collapsed?‘12px’:‘12px 12px 0 0’},onclick:function(){togCol(week.id);}},
el(‘span’,{css:{color:t.txl,display:‘flex’}},week.collapsed?I(‘Rt’,14,t.txl):I(‘Dn’,14,t.txl)),
el(‘span’,{css:{fontWeight:‘800’,fontSize:‘13px’,flex:‘1’,color:done?t.ac:t.tx}},week.label),
done?el(‘span’,{css:{fontSize:‘11px’,color:t.ac,fontWeight:‘700’,letterSpacing:‘1.5px’}},‘✓ DONE’):week.items.length?el(‘span’,{css:{fontSize:‘12px’,color:t.txm}},week.items.filter(function(i){return i.paid}).length+’/’+week.items.length):el(‘span’,{}),
el(‘span’,{cls:‘mono’,css:{fontSize:‘13px’,color:done?t.ac:t.txm,marginLeft:‘4px’}},tAmt>0?String(tAmt):’’),
el(‘button’,{css:{background:‘none’,border:‘none’,color:t.txl,padding:‘2px 4px’,marginLeft:‘2px’,display:‘flex’},onclick:function(e){e.stopPropagation();delWeek(week.id);}},I(‘X’,13,t.txl))
);
ww.appendChild(whdr);
if(!week.collapsed){
var wb=el(‘div’,{cls:‘w-body’,css:{background:t.sf2,borderColor:t.b}});
if(week.items.length){var bar=el(‘div’,{cls:‘w-bar’,css:{background:t.prog}});bar.appendChild(el(‘div’,{cls:‘w-bar-fill’,css:{width:pct+’%’}}));wb.appendChild(bar);}
week.items.forEach(function(item){
var rE=item.recurringId?APP.rec.find(function(r){return r.id===item.recurringId}):null;
var isVar=rE&&!rE.fixedAmount, isSub=item.isSub||(rE&&rE.category===‘subscription’);
var vk=week.id+’_’+item.id;
var row=el(‘div’,{cls:‘irow’+(item.paid?’ paid’:’’),css:{borderColor:t.b}});
row.appendChild(el(‘button’,{cls:‘cb’+(item.paid?’ on’:’’),css:{borderColor:t.b2},onclick:function(){togglePaid(week.id,item.id);}},item.paid?I(‘Ok’,11,’#fff’):el(‘span’,{})));
row.appendChild(isSub?I(‘Tv’,9,t.sub):(item.recurringId?I(‘Sync’,9,t.ac):el(‘span’,{css:{width:‘0px’}})));
row.appendChild(el(‘span’,{css:{fontSize:‘10px’,color:t.txl,fontWeight:‘700’,width:‘28px’,flexShrink:‘0’}},item.day));
var dateEl=el(‘span’,{css:{fontSize:‘11px’,color:t.txm,width:‘38px’,flexShrink:‘0’,borderBottom:‘1px solid ‘+t.b,cursor:‘pointer’,textDecoration:‘underline dotted’},onclick:function(){APP.editItem=item;APP.modal=‘editItem’;render();}},item.date);
row.appendChild(dateEl);
row.appendChild(el(‘span’,{css:{flex:‘1’,fontWeight:‘600’,fontSize:‘14px’,color:isSub?t.sub:t.tx}},item.name));
if(isVar&&!item.paid){
var vw=el(‘div’,{css:{display:‘flex’,alignItems:‘center’,gap:‘5px’}});
vw.appendChild(el(‘span’,{cls:‘mono’,css:{fontSize:‘13px’,color:t.txl}},’=’));
var vi=document.createElement(‘input’); vi.className=‘inp-sm’; vi.type=‘number’; vi.placeholder=’—’;
vi.style.background=t.inBg; vi.style.color=t.tx;
vi.value=APP.varA[vk]!==undefined?APP.varA[vk]:(item.amount||’’);
vi.addEventListener(‘input’,function(){APP.varA[vk]=vi.value});
vi.addEventListener(‘blur’,function(){applyVar(week.id,item)});
vi.addEventListener(‘keydown’,function(e){if(e.key===‘Enter’)applyVar(week.id,item)});
vw.appendChild(vi); row.appendChild(vw);
}else{
row.appendChild(el(‘span’,{cls:‘mono’,css:{fontSize:‘14px’,fontWeight:‘500’,color:item.paid?t.txl:t.tx}},’= ‘+(item.amount||’–’)));
}
row.appendChild(el(‘button’,{css:{background:‘none’,border:‘none’,color:t.txm,padding:‘3px’,display:‘flex’,opacity:’.55’},onclick:function(){APP.editItem=item;APP.modal=‘editItem’;render();}},I(‘Edit’,12,t.txm)));
row.appendChild(el(‘button’,{cls:‘del-btn’,css:{color:t.txl},onclick:function(){delItem(week.id,item.id);}},I(‘X’,12,t.txl)));
wb.appendChild(row);
});
// Add item form
if(APP.addingTo===week.id){
var localF={day:‘MON’,name:’’,amount:’’};
var af=el(‘div’,{cls:‘add-form’});
var dateHint=el(‘div’,{css:{fontSize:‘10px’,color:t.ac,marginBottom:‘2px’,minHeight:‘14px’}});
function updHint(){dateHint.textContent=‘→ ‘+dayInWk(localF.day,new Date(week.monISO));}
updHint();
var ag=el(‘div’,{cls:‘add-grid’});
var dSel=mkSel(DAYS.map(function(d){return[d,d]}),localF.day,function(v){localF.day=v;updHint()});
var nInp=mkInp(‘NAME’,’’,‘text’,function(v){localF.name=v.toUpperCase();nInp.value=localF.name});
var aInp=mkInp(‘Amount’,’’,‘number’,function(v){localF.amount=v});
aInp.addEventListener(‘keydown’,function(e){if(e.key===‘Enter’)commitAdd(week.id,localF)});
ag.appendChild(dSel); ag.appendChild(nInp); ag.appendChild(aInp);
af.appendChild(dateHint); af.appendChild(ag);
af.appendChild(el(‘div’,{css:{display:‘flex’,gap:‘8px’}},
el(‘button’,{cls:‘btn-p’,onclick:function(){commitAdd(week.id,localF);}},‘Add’),
el(‘button’,{cls:‘btn-g’,css:{borderColor:t.b2,color:t.txm},onclick:function(){APP.addingTo=null;render();}},‘Cancel’)
));
wb.appendChild(af);
}else{
var gb=el(‘button’,{cls:‘ghost-add’,css:{color:t.txl},onclick:function(){APP.addingTo=week.id;render();}},I(‘Plus’,13,‘currentColor’),’ add entry’);
gb.addEventListener(‘mouseenter’,function(){gb.style.color=t.ac});
gb.addEventListener(‘mouseleave’,function(){gb.style.color=t.txl});
wb.appendChild(gb);
}
if(week.items.length) wb.appendChild(el(‘div’,{cls:‘w-foot’,css:{borderColor:t.b}},el(‘span’,{css:{fontSize:‘11px’,color:t.txl}},week.items.filter(function(i){return i.paid}).length+’ of ‘+week.items.length+’ paid’),el(‘span’,{cls:‘mono’,css:{fontWeight:‘700’,fontSize:‘13px’,color:t.ac,letterSpacing:‘1px’}},’TOTAL = ’+tAmt)));
ww.appendChild(wb);
}
body.appendChild(ww);
});
});
}

// ── DEBTS ──
if(APP.tab===‘debts’){
var totD=APP.debts.reduce(function(s,d){return s+(d.total-d.paid);},0);
body.appendChild(el(‘div’,{cls:‘totals-hdr’},
el(‘div’,{},el(‘div’,{cls:‘totals-lbl’,css:{color:t.txl}},‘TOTAL OUTSTANDING’),el(‘div’,{cls:‘mono’,css:{fontSize:‘26px’,fontWeight:‘500’,color:t.red}},’$ ‘+totD.toLocaleString())),
el(‘button’,{cls:‘btn-p’,onclick:function(){APP.editDbtId=null;APP.modal=‘debt’;render();}},I(‘Plus’,14,’#fff’),’ Add Debt’)
));
APP.debts.forEach(function(d){
var rem=d.total-d.paid, pct=Math.min((d.paid/d.total)*100,100), done=rem<=0;
var lr=APP.rec.find(function(r){return r.linkedDebtId===d.id});
var card=el(‘div’,{cls:‘card’,css:{background:done?t.acBg:t.sf,borderColor:done?t.acBo:t.b}});
card.appendChild(el(‘div’,{css:{display:‘flex’,justifyContent:‘space-between’,alignItems:‘flex-start’,marginBottom:‘10px’}},
el(‘div’,{},
el(‘div’,{css:{display:‘flex’,alignItems:‘center’,gap:‘8px’,flexWrap:‘wrap’}},
el(‘span’,{css:{fontWeight:‘700’,fontSize:‘15px’}},d.name),
lr?el(‘span’,{cls:‘badge’,css:{color:t.ac,background:t.acBg,borderColor:t.acBo}},‘AUTO’):el(‘span’,{}),
done?el(‘span’,{cls:‘badge’,css:{color:’#4ade80’,background:’#0d2210’,borderColor:’#4ade8033’}},‘✓ PAID OFF’):el(‘span’,{})
),
d.note?el(‘div’,{css:{fontSize:‘12px’,color:t.txm,marginTop:‘2px’}},d.note):el(‘span’,{})
),
el(‘div’,{css:{display:‘flex’,gap:‘6px’}},
el(‘button’,{cls:‘btn-g’,css:{padding:‘5px 9px’,borderColor:t.b2,color:t.txm},onclick:function(){APP.editDbtId=d.id;APP.modal=‘debt’;render();}},I(‘Edit’,12,t.txm)),
el(‘button’,{cls:‘btn-g’,css:{padding:‘5px 9px’,borderColor:t.b2,color:t.txm},onclick:function(){APP.debts=APP.debts.filter(function(x){return x.id!==d.id});save();render();}},I(‘X’,12,t.txm))
)
));
var mg=el(‘div’,{cls:‘mini-grid’});
[[‘Total’,d.total,t.tx],[‘Paid’,d.paid,t.grn],[‘Remaining’,rem,done?t.grn:t.red]].forEach(function(row){
mg.appendChild(el(‘div’,{cls:‘mini-cell’,css:{background:t.sf2}},el(‘div’,{css:{fontSize:‘10px’,color:t.txl,fontWeight:‘700’,letterSpacing:‘1px’,marginBottom:‘3px’}},row[0]),el(‘div’,{cls:‘mono’,css:{fontSize:‘15px’,fontWeight:‘500’,color:row[2]}},String(row[1]))));
});
card.appendChild(mg);
card.appendChild(el(‘div’,{cls:‘prog-track’,css:{background:t.prog}},el(‘div’,{cls:‘prog-fill’,css:{width:pct+’%’,background:t.grn}})));
card.appendChild(el(‘div’,{css:{display:‘flex’,justifyContent:‘space-between’,fontSize:‘12px’,color:t.txl}},
el(‘span’,{},pct.toFixed(0)+’% paid’),
d.installment>0&&!done?el(‘span’,{},’~’+Math.ceil(rem/d.installment)+’ left’):el(‘span’,{}),
lr?el(‘span’,{css:{color:t.ac}},’↻ ’+FL[lr.frequency||‘weekly’]):el(‘span’,{})
));
body.appendChild(card);
});
if(!APP.debts.length)body.appendChild(el(‘div’,{cls:‘empty’,css:{color:t.txl}},‘No active debts 🎉’));
}

// ── INVESTMENTS ──
if(APP.tab===‘investments’){
var tI=APP.inv.reduce(function(s,i){return s+i.contributed;},0);
var tV=APP.inv.reduce(function(s,i){return s+i.currentValue;},0);
var tR=tV-tI;
body.appendChild(el(‘div’,{css:{display:‘flex’,justifyContent:‘space-between’,alignItems:‘flex-start’,marginBottom:‘16px’,flexWrap:‘wrap’,gap:‘10px’}},
el(‘div’,{cls:‘totals-pair’},
el(‘div’,{},el(‘div’,{cls:‘totals-lbl’,css:{color:t.txl}},‘INVESTED’),el(‘div’,{cls:‘mono’,css:{fontSize:‘20px’,fontWeight:‘500’}},’$ ‘+tI.toLocaleString())),
el(‘div’,{},el(‘div’,{cls:‘totals-lbl’,css:{color:t.txl}},‘RETURN’),el(‘div’,{cls:‘mono’,css:{fontSize:‘20px’,fontWeight:‘500’,color:tR>=0?t.grn:t.red}},(tR>=0?’+’:’’)+tR.toFixed(0)))
),
el(‘button’,{cls:‘btn-p’,onclick:function(){APP.editInvId=null;APP.modal=‘inv’;render();}},I(‘Plus’,14,’#fff’),’ Add’)
));
APP.inv.forEach(function(x){
var ret=x.currentValue-x.contributed, rp=((ret/x.contributed)*100).toFixed(2);
var card=el(‘div’,{cls:‘card’,css:{background:t.sf,borderColor:t.b}});
card.appendChild(el(‘div’,{css:{display:‘flex’,justifyContent:‘space-between’,alignItems:‘flex-start’,marginBottom:‘12px’}},
el(‘div’,{css:{display:‘flex’,alignItems:‘center’,gap:‘8px’}},
el(‘div’,{css:{background:t.acBg,border:‘1px solid ‘+t.acBo,borderRadius:‘8px’,padding:‘6px 8px’,display:‘flex’}},I(‘Trend’,15,t.ac)),
el(‘div’,{},el(‘div’,{css:{fontWeight:‘700’,fontSize:‘15px’}},x.name),x.note?el(‘div’,{css:{fontSize:‘12px’,color:t.txm}},x.note):el(‘span’,{}))
),
el(‘div’,{css:{display:‘flex’,gap:‘6px’}},
el(‘button’,{cls:‘btn-g’,css:{padding:‘5px 9px’,borderColor:t.b2,color:t.txm},onclick:function(){APP.editInvId=x.id;APP.modal=‘inv’;render();}},I(‘Edit’,12,t.txm)),
el(‘button’,{cls:‘btn-g’,css:{padding:‘5px 9px’,borderColor:t.b2,color:t.txm},onclick:function(){APP.inv=APP.inv.filter(function(i){return i.id!==x.id});save();render();}},I(‘X’,12,t.txm))
)
));
var mg2=el(‘div’,{cls:‘mini-grid’});
[[‘Invested’,’$ ‘+x.contributed,’’],[‘Current’,’$ ‘+x.currentValue,t.grn],[‘Return’,(ret>=0?’+’:’’)+ret.toFixed(0)+’ (’+rp+’%)’,ret>=0?t.grn:t.red]].forEach(function(row){
mg2.appendChild(el(‘div’,{cls:‘mini-cell’,css:{background:t.sf2}},el(‘div’,{css:{fontSize:‘10px’,color:t.txl,fontWeight:‘700’,letterSpacing:‘1px’,marginBottom:‘3px’}},row[0]),el(‘div’,{cls:‘mono’,css:{fontSize:‘13px’,fontWeight:‘500’,color:row[2]||t.tx}},row[1])));
});
card.appendChild(mg2);
body.appendChild(card);
});
if(!APP.inv.length)body.appendChild(el(‘div’,{cls:‘empty’,css:{color:t.txl}},‘No investments yet’));
}

// ── SUBSCRIPTIONS ──
if(APP.tab===‘subs’){
var subs=APP.rec.filter(function(r){return r.category===‘subscription’});
var mCost=subs.filter(function(r){return r.active}).reduce(function(s,r){
var m=r.frequency===‘weekly’?4:r.frequency===‘fortnightly’?2:r.frequency===‘yearly’?1/12:1;
return s+r.baseAmount*m;
},0);
body.appendChild(el(‘div’,{cls:‘totals-hdr’},
el(‘div’,{},el(‘div’,{cls:‘totals-lbl’,css:{color:t.txl}},‘MONTHLY COST’),el(‘div’,{cls:‘mono’,css:{fontSize:‘26px’,fontWeight:‘500’,color:t.sub}},’$ ‘+mCost.toFixed(0))),
el(‘button’,{cls:‘btn-p’,onclick:function(){APP.editRecId=null;APP.modal=‘rec’;render();}},I(‘Plus’,14,’#fff’),’ Add’)
));
subs.forEach(function(r){
body.appendChild(el(‘div’,{cls:‘sub-card’,css:{background:t.sf,borderColor:t.b}},
el(‘div’,{css:{width:‘40px’,height:‘40px’,borderRadius:‘10px’,background:t.sub+‘22’,border:‘1px solid ‘+t.sub+‘44’,display:‘flex’,alignItems:‘center’,justifyContent:‘center’,flexShrink:‘0’}},I(‘Tv’,18,t.sub)),
el(‘div’,{css:{flex:‘1’}},
el(‘div’,{css:{fontWeight:‘700’,fontSize:‘15px’}},r.name),
el(‘div’,{css:{fontSize:‘12px’,color:t.txm}},FL[r.frequency||‘monthly’]+(r.monthDay&&r.frequency===‘monthly’?’ · Day ‘+r.monthDay:r.startDate&&r.frequency===‘yearly’?’ · ‘+r.startDate.slice(5).replace(’-’,’/’):’’))
),
el(‘div’,{cls:‘mono’,css:{fontSize:‘16px’,fontWeight:‘500’,color:r.active?t.sub:t.txl}},’$ ’+r.baseAmount),
el(‘div’,{css:{display:‘flex’,gap:‘6px’}},
el(‘button’,{cls:‘btn-g’,css:{padding:‘5px 9px’,borderColor:t.b2,color:t.txm},onclick:function(){APP.editRecId=r.id;APP.modal=‘rec’;render();}},I(‘Edit’,12,t.txm)),
el(‘button’,{cls:‘btn-g’,css:{padding:‘5px 9px’,borderColor:t.b2,color:t.txm},onclick:function(){APP.rec=APP.rec.map(function(x){return x.id!==r.id?x:Object.assign({},x,{active:!x.active})});save();render();}},r.active?‘⏸’:‘▶’)
)
));
});
if(!subs.length)body.appendChild(el(‘div’,{cls:‘empty’,css:{color:t.txl}},‘No subscriptions yet.’));
}

app.appendChild(body);
document.getElementById(‘root’).appendChild(app);

// MODALS
if(APP.modal===‘rec’)      document.getElementById(‘root’).appendChild(renderRecModal());
if(APP.modal===‘debt’)     document.getElementById(‘root’).appendChild(renderDebtModal());
if(APP.modal===‘inv’)      document.getElementById(‘root’).appendChild(renderInvModal());
if(APP.modal===‘editItem’&&APP.editItem) document.getElementById(‘root’).appendChild(renderEditModal());
}

function commitAdd(wid,localF){
if(!localF.name||!localF.amount)return;
var w=APP.weeks.find(function(x){return x.id===wid}); if(!w)return;
var mon=new Date(w.monISO);
var entry={id:Date.now(),day:localF.day,date:dayInWk(localF.day,mon),name:localF.name,amount:parseFloat(localF.amount)||0,paid:false,recurringId:null};
APP.weeks=APP.weeks.map(function(x){return x.id!==wid?x:Object.assign({},x,{items:sortItems(x.items.concat([entry]))})});
APP.addingTo=null; save(); render();
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener(‘DOMContentLoaded’,function(){
var lt;
document.addEventListener(‘pointerdown’,function(){clearTimeout(lt);lt=setTimeout(function(){APP.unlocked=false;render();},600000)});
render();
initDB();
});
