'use strict';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
var PIN      = '1066';
var STORE    = 'fin_app_v1';
var MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAYS     = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
var DIDX     = {MON:0,TUE:1,WED:2,THU:3,FRI:4,SAT:5,SUN:6};
var FL       = {weekly:'Weekly',fortnightly:'Fortnightly',monthly:'Monthly',yearly:'Yearly'};

// ─── THEME ────────────────────────────────────────────────────────────────────
var DARK={bg:'#0c0c0c',sf:'#131313',sf2:'#0f0f0f',b:'#222',b2:'#2a2a2a',tx:'#efefef',txm:'#848484',txl:'#363636',ac:'#c97b2a',acBg:'#130f00',acBo:'#c97b2a44',tabAc:'#1f1f1f',inBg:'#181818',red:'#e05555',grn:'#4ade80',prog:'#1d1d1d',sub:'#7c6af0'};
var LITE={bg:'#f4efe6',sf:'#ffffff',sf2:'#faf6f0',b:'#e2d9cc',b2:'#d5cab8',tx:'#191208',txm:'#786347',txl:'#b09870',ac:'#c97b2a',acBg:'#fff8ee',acBo:'#c97b2a55',tabAc:'#ffffff',inBg:'#faf6f0',red:'#c0392b',grn:'#1a7a40',prog:'#e2d9cc',sub:'#5b4fc5'};
function T(){var h=new Date().getHours();return(S.themeOv==='lite'||(S.themeOv===null&&h>=6&&h<18))?LITE:DARK;}

// ─── DATE UTILS ───────────────────────────────────────────────────────────────
function p2(n){return String(n).padStart(2,'0');}
function fmtD(d){return p2(d.getDate())+'/'+p2(d.getMonth()+1);}
function getMon(wn,yr){var j4=new Date(yr,0,4),j4d=j4.getDay()||7,m=new Date(j4);m.setDate(j4.getDate()-j4d+1+(wn-1)*7);return m;}
function isoWeek(d){var u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));u.setUTCDate(u.getUTCDate()+4-(u.getUTCDay()||7));var y1=new Date(Date.UTC(u.getUTCFullYear(),0,1));return Math.ceil((((u-y1)/86400000)+1)/7);}
function isoWY(d){var t=new Date(d);t.setDate(d.getDate()+4-(d.getDay()||7));return t.getFullYear();}
function wkMeta(wn,yr){var mon=getMon(wn,yr),sun=new Date(mon);sun.setDate(mon.getDate()+6);return{label:'WEEK '+wn+' ('+fmtD(mon)+' - '+fmtD(sun)+')',mon:mon,startMonth:mon.getMonth()};}
function dayInWk(day,mon){var d=new Date(mon);d.setDate(mon.getDate()+(DIDX[day]||0));return fmtD(d);}
function sk(s){if(!s)return 9999;var p=s.split('/');return parseInt(p[1]||0)*100+parseInt(p[0]||0);}
function srt(arr){return arr.slice().sort(function(a,b){return sk(a.date)-sk(b.date);});}
function wkOfStr(str,yr){var p=str.split('/');if(p.length<2)return null;var d=new Date(yr,parseInt(p[1])-1,parseInt(p[0]));return{week:isoWeek(d),year:isoWY(d)};}
var NOW=new Date(),CW=isoWeek(NOW),CY=isoWY(NOW);

// ─── FREQUENCY ────────────────────────────────────────────────────────────────
function recFits(r,wn,yr,monISO){
  if(!r.active)return false;
  if(r.maxTimes!=null&&r.timesUsed>=r.maxTimes)return false;
  var f=r.frequency||'weekly';
  if(f==='weekly')return true;
  var mon=monISO?new Date(monISO):getMon(wn,yr);
  var sun=new Date(mon);sun.setDate(mon.getDate()+6);
  if(f==='monthly'){var day=r.monthDay||1;for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){if(d.getDate()===day)return true;}return false;}
  if(f==='fortnightly'){if(!r.startDate)return false;var start=new Date(r.startDate);for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){var diff=Math.round((d-start)/86400000);if(diff>=0&&diff%14===0)return true;}return false;}
  if(f==='yearly'){if(!r.startDate)return false;var start=new Date(r.startDate);for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){if(d.getDate()===start.getDate()&&d.getMonth()===start.getMonth())return true;}return false;}
  return true;
}
function recDate(r,mon){
  var f=r.frequency||'weekly',sun=new Date(mon);sun.setDate(mon.getDate()+6);
  if(f==='monthly'){var day=r.monthDay||1;for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){if(d.getDate()===day)return fmtD(new Date(d));}return fmtD(mon);}
  if(f==='fortnightly'){if(!r.startDate)return dayInWk(r.day,mon);var start=new Date(r.startDate);for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){var diff=Math.round((d-start)/86400000);if(diff>=0&&diff%14===0)return fmtD(new Date(d));}return dayInWk(r.day,mon);}
  if(f==='yearly'){if(!r.startDate)return fmtD(mon);var start=new Date(r.startDate);for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){if(d.getDate()===start.getDate()&&d.getMonth()===start.getMonth())return fmtD(new Date(d));}return fmtD(mon);}
  return dayInWk(r.day,mon);
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────
var SEED_W=[
  {id:1,weekNum:16,year:2026,label:'WEEK 16 (13/04 - 19/04)',startMonth:3,monISO:'2026-04-13T00:00:00.000Z',collapsed:false,items:[
    {id:101,day:'THU',date:'16/04',name:'SCOOTER',  amount:105, paid:true, recurringId:null},
    {id:102,day:'THU',date:'16/04',name:'RÃNA',     amount:325, paid:true, recurringId:null},
    {id:103,day:'FRI',date:'17/04',name:'AFTERPAY', amount:200, paid:false,recurringId:null},
    {id:104,day:'SUN',date:'19/04',name:'RENT',     amount:530, paid:false,recurringId:null},
    {id:105,day:'SUN',date:'19/04',name:'UNI',      amount:500, paid:false,recurringId:null},
  ]},
  {id:2,weekNum:15,year:2026,label:'WEEK 15 (06/04 - 12/04)',startMonth:3,monISO:'2026-04-06T00:00:00.000Z',collapsed:false,items:[
    {id:201,day:'TUE',date:'07/04',name:'WAGEPAY',        amount:213,  paid:true,recurringId:null},
    {id:202,day:'WED',date:'08/04',name:'BEFOREPAY (2/4)',amount:79,   paid:true,recurringId:null},
    {id:203,day:'THU',date:'09/04',name:'SCOOTER',        amount:105,  paid:true,recurringId:null},
    {id:204,day:'THU',date:'09/04',name:'GYM',            amount:44,   paid:true,recurringId:null},
    {id:205,day:'FRI',date:'10/04',name:'AFTERPAY',       amount:278,  paid:true,recurringId:null},
    {id:206,day:'SUN',date:'12/04',name:'RENT',           amount:530,  paid:true,recurringId:null},
    {id:207,day:'SUN',date:'12/04',name:'UNI',            amount:320,  paid:true,recurringId:null},
  ]},
  {id:3,weekNum:14,year:2026,label:'WEEK 14 (30/03 - 05/04)',startMonth:2,monISO:'2026-03-30T00:00:00.000Z',collapsed:true,items:[
    {id:301,day:'WED',date:'01/04',name:'BEFOREPAY',      amount:79,  paid:true,recurringId:null},
    {id:302,day:'THU',date:'02/04',name:'SCOOTER',        amount:105, paid:true,recurringId:null},
    {id:303,day:'THU',date:'02/04',name:'EXAME DE VISTA', amount:75,  paid:true,recurringId:null},
    {id:304,day:'THU',date:'02/04',name:'ALUGUEL DIEGO',  amount:58,  paid:true,recurringId:null},
    {id:305,day:'FRI',date:'03/04',name:'AFTERPAY',       amount:106, paid:true,recurringId:null},
    {id:306,day:'SUN',date:'05/04',name:'RENT',           amount:530, paid:true,recurringId:null},
  ]},
  {id:4,weekNum:13,year:2026,label:'WEEK 13 (23/03 - 29/03)',startMonth:2,monISO:'2026-03-23T00:00:00.000Z',collapsed:true,items:[
    {id:401,day:'THU',date:'26/03',name:'SCOOTER', amount:105, paid:true,recurringId:null},
    {id:402,day:'THU',date:'26/03',name:'GYM',     amount:44,  paid:true,recurringId:null},
    {id:403,day:'FRI',date:'27/03',name:'AFTERPAY',amount:375, paid:true,recurringId:null},
    {id:404,day:'SUN',date:'29/03',name:'RENT',    amount:530, paid:true,recurringId:null},
  ]},
  {id:5,weekNum:12,year:2026,label:'WEEK 12 (16/03 - 22/03)',startMonth:2,monISO:'2026-03-16T00:00:00.000Z',collapsed:true,items:[
    {id:501,day:'SUN',date:'15/03',name:'RÃNA',         amount:330,  paid:true,recurringId:null},
    {id:502,day:'MON',date:'16/03',name:'WAGEPAY',       amount:211,  paid:true,recurringId:null},
    {id:503,day:'WED',date:'18/03',name:'DIEGO',         amount:215,  paid:true,recurringId:null},
    {id:504,day:'WED',date:'18/03',name:'BEFOREPAY 2/4', amount:52.5, paid:true,recurringId:null},
    {id:505,day:'WED',date:'18/03',name:'STEPTOPAY',     amount:160,  paid:true,recurringId:null},
    {id:506,day:'THU',date:'19/03',name:'SCOOTER',       amount:105,  paid:true,recurringId:null},
    {id:507,day:'THU',date:'19/03',name:'PHONE',         amount:59,   paid:true,recurringId:null},
    {id:508,day:'FRI',date:'20/03',name:'AFTERPAY',      amount:21.91,paid:true,recurringId:null},
    {id:509,day:'SUN',date:'22/03',name:'RENT',          amount:530,  paid:true,recurringId:null},
    {id:510,day:'SUN',date:'22/03',name:'BOND',          amount:500,  paid:true,recurringId:null},
  ]},
  {id:6,weekNum:11,year:2026,label:'WEEK 11 (09/03 - 15/03)',startMonth:2,monISO:'2026-03-09T00:00:00.000Z',collapsed:true,items:[
    {id:601,day:'MON',date:'09/03',name:'115 RENT ANNA', amount:115,  paid:true,recurringId:null},
    {id:602,day:'MON',date:'09/03',name:'WAGEPAY',       amount:211,  paid:true,recurringId:null},
    {id:603,day:'TUE',date:'10/03',name:'TERAPIA',       amount:57,   paid:true,recurringId:null},
    {id:604,day:'WED',date:'11/03',name:'AFTERPAY',      amount:220,  paid:true,recurringId:null},
    {id:605,day:'WED',date:'11/03',name:'BOND DIEGO',    amount:450,  paid:true,recurringId:null},
    {id:606,day:'WED',date:'11/03',name:'BEFOREPAY 1/4', amount:52.5, paid:true,recurringId:null},
    {id:607,day:'THU',date:'12/03',name:'GYM',           amount:43.1, paid:true,recurringId:null},
    {id:608,day:'SAT',date:'14/03',name:'RENT',          amount:530,  paid:true,recurringId:null},
  ]},
  {id:7,weekNum:10,year:2026,label:'WEEK 10 (02/03 - 08/03)',startMonth:2,monISO:'2026-03-02T00:00:00.000Z',collapsed:true,items:[
    {id:701,day:'FRI',date:'06/03',name:'TERAPIA',amount:57,paid:true,recurringId:null},
  ]},
];
var SEED_R=[
  {id:'r1',name:'SCOOTER', baseAmount:105,day:'THU',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'weekly',  category:'expense',      monthDay:null,startDate:'2026-03-02',linkedDebtId:null},
  {id:'r2',name:'GYM',     baseAmount:44, day:'THU',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'monthly', category:'expense',      monthDay:9,   startDate:'2026-03-09',linkedDebtId:null},
  {id:'r3',name:'RENT',    baseAmount:530,day:'SUN',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'weekly',  category:'expense',      monthDay:null,startDate:'2026-03-02',linkedDebtId:null},
  {id:'r4',name:'AFTERPAY',baseAmount:0,  day:'FRI',fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:'weekly',  category:'expense',      monthDay:null,startDate:'2026-03-02',linkedDebtId:null},
  {id:'s1',name:'WIX',                 baseAmount:0,  day:'MON',fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:1,   startDate:'2026-03-01',linkedDebtId:null},
  {id:'s2',name:'GMAIL',               baseAmount:11, day:'MON',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:1,   startDate:'2026-03-01',linkedDebtId:null},
  {id:'s3',name:'GOOGLE DRIVE',        baseAmount:0,  day:'MON',fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:1,   startDate:'2026-03-01',linkedDebtId:null},
  {id:'s4',name:'ICLOUD',              baseAmount:23, day:'MON',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:1,   startDate:'2026-03-01',linkedDebtId:null},
  {id:'s5',name:'SPOTIFY',             baseAmount:0,  day:'MON',fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:1,   startDate:'2026-03-01',linkedDebtId:null},
  {id:'s6',name:'HABIT TRACKER ANUAL', baseAmount:17, day:'MON',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'yearly', category:'subscription',monthDay:null,startDate:'2026-11-17',linkedDebtId:null},
  {id:'s7',name:'MEDIA (TRI)',         baseAmount:0,  day:'MON',fixedAmount:false,maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:1,   startDate:'2026-03-01',linkedDebtId:null},
  {id:'s8',name:'GYM APP',             baseAmount:30, day:'MON',fixedAmount:true, maxTimes:null,timesUsed:0,active:true,frequency:'monthly',category:'subscription',monthDay:12,  startDate:'2026-03-12',linkedDebtId:null},
];

// ─── STATE ────────────────────────────────────────────────────────────────────
var S={
  unlocked:false,tab:'weeks',viewYear:2026,themeOv:null,
  weeks:[],rec:[],debts:[],inv:[],
  saveState:'idle',modal:null,addingTo:null,editItem:null,
  editRecId:null,editDbtId:null,editInvId:null,
  varA:{},subsHidden:false,
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function persist(){
  try{
    localStorage.setItem(STORE,JSON.stringify({
      weeks:S.weeks,rec:S.rec,debts:S.debts,inv:S.inv,
      themeOv:S.themeOv,viewYear:S.viewYear
    }));
    S.saveState='saved';
    setTimeout(function(){S.saveState='idle';render();},1500);
  }catch(e){
    S.saveState='error';
    setTimeout(function(){S.saveState='idle';render();},2000);
  }
}
var saveTimer=null;
function save(){
  clearTimeout(saveTimer);
  S.saveState='saving';
  saveTimer=setTimeout(persist,600);
}
function loadStored(){
  try{
    var raw=localStorage.getItem(STORE);
    if(!raw)return false;
    var d=JSON.parse(raw);
    if(!d||!d.weeks||!d.weeks.length)return false;
    S.weeks=d.weeks;S.rec=d.rec||[];S.debts=d.debts||[];
    S.inv=d.inv||[];S.themeOv=d.themeOv||null;S.viewYear=d.viewYear||2026;
    return true;
  }catch(e){return false;}
}
function initData(){
  if(!loadStored()){
    S.weeks=JSON.parse(JSON.stringify(SEED_W));
    S.rec=JSON.parse(JSON.stringify(SEED_R));
    S.debts=[];S.inv=[];
    persist();
  }
}

// ─── DOM ──────────────────────────────────────────────────────────────────────
function el(tag,attrs){
  var e=document.createElement(tag);
  if(attrs){
    Object.keys(attrs).forEach(function(k){
      var v=attrs[k];
      if(v===null||v===undefined||v===false)return;
      if(k==='cls'){e.className=v;}
      else if(k==='css'&&typeof v==='object'){Object.assign(e.style,v);}
      else if(k.length>2&&k[0]==='o'&&k[1]==='n'&&typeof v==='function'){e.addEventListener(k.slice(2),v);}
      else{e.setAttribute(k,String(v));}
    });
  }
  for(var i=2;i<arguments.length;i++){
    var c=arguments[i];
    if(c===null||c===undefined||c===false)continue;
    if(c instanceof Node){e.appendChild(c);}
    else if(Array.isArray(c)){c.forEach(function(x){if(x instanceof Node)e.appendChild(x);});}
    else{e.appendChild(document.createTextNode(String(c)));}
  }
  return e;
}
function svgI(d,sz,col){
  sz=sz||16;col=col||'currentColor';
  var s=document.createElementNS('http://www.w3.org/2000/svg','svg');
  s.setAttribute('width',sz);s.setAttribute('height',sz);s.setAttribute('viewBox','0 0 24 24');
  s.setAttribute('fill','none');s.setAttribute('stroke',col);s.setAttribute('stroke-width','2');
  s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');
  s.style.cssText='flex-shrink:0;display:inline-block;vertical-align:middle;';
  d.split('|').forEach(function(pd){var p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',pd);s.appendChild(p);});
  return s;
}
var IC={
  Plus:'M12 5v14M5 12h14',X:'M18 6 6 18M6 6l12 12',Dn:'m6 9 6 6 6-6',Rt:'m9 18 6-6-6-6',Lt:'m15 18-6-6 6-6',
  Ok:'M20 6 9 17l-5-5',Sun:'M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36-.71.71M6.34 17.66l-.71.71M17.66 17.66l.71.71M6.34 6.34l-.71-.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z',
  Moon:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  Sync:'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5m13 3a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m18 5v-5h-5',
  Trend:'m23 6-9.5 9.5-5-5L1 18',Edit:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7|M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  Tv:'M2 7h20v15H2z|M17 22v2|M7 22v2|M2 17h20',Del:'M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z|M18 9l-6 6|M12 9l6 6',
  Lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z|M7 11V7a5 5 0 0 1 10 0v4',
  Move:'M5 9l-3 3 3 3|M9 5l3-3 3 3|M15 19l-3 3-3-3|M19 9l3 3-3 3|M2 12h20|M12 2v20',
};
function I(n,sz,col){return svgI(IC[n]||'M0 0',sz,col);}

// ─── FORM HELPERS ─────────────────────────────────────────────────────────────
function mkI(ph,val,type,cb,css){
  var t=T(),e=document.createElement('input');
  e.className='inp';e.placeholder=ph||'';e.value=val||'';e.type=type||'text';
  e.style.background=t.inBg;e.style.borderColor=t.b2;e.style.color=t.tx;
  if(css)Object.assign(e.style,css);
  e.addEventListener('input',function(){cb(e.value);});
  return e;
}
function mkSl(opts,val,cb,css){
  var t=T(),e=document.createElement('select');
  e.className='inp';e.style.background=t.inBg;e.style.borderColor=t.b2;e.style.color=t.tx;
  if(css)Object.assign(e.style,css);
  opts.forEach(function(o){var op=document.createElement('option');op.value=o[0];op.textContent=o[1];if(String(o[0])===String(val))op.selected=true;e.appendChild(op);});
  e.addEventListener('change',function(){cb(e.value);});
  return e;
}
function mkSeg(opts,val,cb){
  var t=T(),w=el('div',{cls:'seg',css:{borderColor:t.b2}});
  opts.forEach(function(o){
    var v=o[0],l=o[1],on=String(val)===String(v);
    w.appendChild(el('button',{cls:'seg-btn'+(on?' on':''),css:{color:on?'#fff':t.txm,background:on?t.ac:'none'},onclick:function(){cb(v);}},l));
  });
  return w;
}
function mkSegL(opts,getV,setV,after){
  var t=T(),w=el('div',{cls:'seg',css:{borderColor:t.b2}}),btns={};
  function upd(){Object.keys(btns).forEach(function(v){var on=String(getV())===String(v);btns[v].className='seg-btn'+(on?' on':'');btns[v].style.color=on?'#fff':t.txm;btns[v].style.background=on?t.ac:'none';});}
  opts.forEach(function(o){
    var v=o[0],l=o[1],on=String(getV())===String(v);
    var b=el('button',{cls:'seg-btn'+(on?' on':''),css:{color:on?'#fff':t.txm,background:on?t.ac:'none'},onclick:function(){setV(v);upd();if(after)after();}},l);
    btns[v]=b;w.appendChild(b);
  });
  return w;
}
function mkF(lbl,child){var t=T();return el('div',{cls:'fld'},el('span',{cls:'fld-lbl',css:{color:t.txm}},lbl),child);}
function mkOv(content,small){
  var t=T(),ov=el('div',{cls:'overlay',onclick:function(){S.modal=null;S.editItem=null;S.editRecId=null;S.editDbtId=null;S.editInvId=null;render();}});
  var box=el('div',{cls:(small?'modal-sm':'modal')+' fadein',css:{background:t.sf,borderColor:t.b2}});
  box.addEventListener('click',function(e){e.stopPropagation();});
  box.appendChild(content);ov.appendChild(box);return ov;
}
function mkMH(title,close){
  var t=T();
  return el('div',{cls:'modal-hdr'},el('span',{cls:'modal-title',css:{color:t.tx}},title),el('button',{css:{background:'none',border:'none',color:t.txl,display:'flex'},onclick:close},I('X',18,t.txl)));
}

// ─── PIN ──────────────────────────────────────────────────────────────────────
function renderPin(){
  var t=T(),ent='';
  var root=el('div',{cls:'screen',css:{background:t.bg,color:t.tx}});
  var dw=el('div',{cls:'pin-dots'});
  var dots=[];
  for(var i=0;i<4;i++){var d=el('div',{cls:'pin-dot',css:{borderColor:t.b2}});dw.appendChild(d);dots.push(d);}
  function upd(){dots.forEach(function(d,i){d.style.background=ent.length>i?t.ac:'none';});}
  function press(k){
    if(ent.length>=4)return;
    ent+=k;upd();
    if(ent.length===4){
      if(ent===PIN){setTimeout(function(){S.unlocked=true;render();},200);}
      else{dw.classList.add('shake');setTimeout(function(){ent='';upd();dw.classList.remove('shake');},600);}
    }
  }
  var grid=el('div',{cls:'pin-grid'});
  [1,2,3,4,5,6,7,8,9,'',0,'del'].forEach(function(k){
    if(k===''){grid.appendChild(el('div',{}));return;}
    if(k==='del'){grid.appendChild(el('button',{cls:'pin-del',css:{color:t.txm},onclick:function(){ent=ent.slice(0,-1);upd();}},I('Del',22,t.txm)));return;}
    grid.appendChild(el('button',{cls:'pin-key',css:{borderColor:t.b2,color:t.tx},onclick:function(){press(String(k));}},''+k));
  });
  root.appendChild(el('div',{css:{fontSize:'10px',color:t.txl,fontWeight:'700',letterSpacing:'3px',marginBottom:'8px'}},'FINANCES'));
  root.appendChild(el('h2',{css:{fontSize:'26px',fontWeight:'800',marginBottom:'36px'}},'Enter PIN'));
  root.appendChild(dw);root.appendChild(grid);
  return root;
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function renderRecM(){
  var t=T();
  var ex=S.editRecId?S.rec.find(function(r){return r.id===S.editRecId;}):null;
  var F={name:ex?ex.name:'',baseAmount:ex?String(ex.baseAmount||''):'',day:ex?ex.day:'MON',fixedAmount:ex?ex.fixedAmount!==false:true,maxTimes:ex&&ex.maxTimes!=null?String(ex.maxTimes):'',frequency:ex?ex.frequency||'weekly':'weekly',category:ex?ex.category||'expense':'expense',linkedDebtId:ex&&ex.linkedDebtId?ex.linkedDebtId:'',monthDay:ex&&ex.monthDay?ex.monthDay:1,startDate:ex&&ex.startDate?ex.startDate:''};
  var close=function(){S.modal=null;S.editRecId=null;render();};
  var wrap=el('div',{});
  wrap.appendChild(mkMH('Recurring Expenses',close));

  if(!S.editRecId){
    var expenses=S.rec.filter(function(r){return r.category!=='subscription';});
    var subs=S.rec.filter(function(r){return r.category==='subscription';});
    function chip(r){
      return el('div',{cls:'rec-chip',css:{background:t.sf2,borderColor:t.b}},
        el('div',{css:{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}},
          el('span',{css:{color:r.active?t.ac:t.txl,fontSize:'10px'}},'●'),
          r.category==='subscription'?I('Tv',10,t.sub):el('span',{}),
          el('span',{css:{color:t.tx}},r.name),
          el('span',{css:{color:t.txm,fontSize:'11px'}},FL[r.frequency||'weekly']+(r.fixedAmount?' · $'+r.baseAmount:' · var'))
        ),
        el('div',{css:{display:'flex',gap:'4px'}},
          el('button',{css:{background:'none',border:'none',color:t.txm,padding:'2px',display:'flex'},onclick:function(){S.editRecId=r.id;render();}},I('Edit',11,t.txm)),
          el('button',{css:{background:'none',border:'none',color:t.txl,padding:'2px',display:'flex'},onclick:function(){S.rec=S.rec.filter(function(x){return x.id!==r.id;});save();render();}},I('X',11,t.txl))
        )
      );
    }
    if(expenses.length){
      var el2=el('div',{css:{marginBottom:'10px',maxHeight:'130px',overflowY:'auto'}});
      expenses.forEach(function(r){el2.appendChild(chip(r));});
      wrap.appendChild(el2);
    }
    if(subs.length){
      var open=!S.subsHidden;
      var tlbl=el('span',{css:{fontSize:'11px',color:t.txm,fontWeight:'600'}},open?'▼ Hide':'▶ Show');
      var slist=el('div',{css:{marginBottom:'10px',maxHeight:'130px',overflowY:'auto'}});
      subs.forEach(function(r){slist.appendChild(chip(r));});
      if(!open)slist.style.display='none';
      var shdr=el('div',{css:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px',cursor:'pointer'}},
        el('div',{css:{display:'flex',alignItems:'center',gap:'6px'}},I('Tv',12,t.sub),el('span',{css:{fontSize:'12px',fontWeight:'700',color:t.sub}},'SUBSCRIPTIONS ('+subs.length+')')),
        tlbl
      );
      shdr.addEventListener('click',function(){open=!open;S.subsHidden=!open;slist.style.display=open?'':'none';tlbl.textContent=open?'▼ Hide':'▶ Show';});
      wrap.appendChild(shdr);wrap.appendChild(slist);
    }
  }

  var form=el('div',{css:{borderTop:S.editRecId?'none':'1px solid '+t.b,paddingTop:S.editRecId?'0':'14px'}});
  form.appendChild(el('div',{css:{fontWeight:'700',fontSize:'13px',color:t.tx,marginBottom:'12px'}},S.editRecId?'Edit':'New Recurring'));
  var nI=mkI('RENT, SCOOTER...',F.name,'text',function(v){F.name=v.toUpperCase();nI.value=F.name;});
  form.appendChild(mkF('NAME',nI));
  form.appendChild(mkF('CATEGORY',mkSegL([['expense','Expense'],['subscription','Subscription 🔔']],function(){return F.category;},function(v){F.category=v;})));
  form.appendChild(mkF('FREQUENCY',mkSegL([['weekly','Weekly'],['fortnightly','Fortnightly'],['monthly','Monthly'],['yearly','Yearly']],function(){return F.frequency;},function(v){F.frequency=v;},function(){
    dayFld.style.display=(F.frequency==='monthly'||F.frequency==='yearly')?'none':'';
    mdFld.style.display=F.frequency==='monthly'?'':'none';
    sdFld.style.display=(F.frequency==='fortnightly'||F.frequency==='yearly')?'':'none';
  })));
  var dRow=el('div',{cls:'two-col'});
  var dayFld=mkF('DAY OF WEEK',mkSl(DAYS.map(function(d){return[d,d];}),F.day,function(v){F.day=v;}));
  dayFld.style.display=(F.frequency==='monthly'||F.frequency==='yearly')?'none':'';
  var maxI=mkI('e.g. 4',F.maxTimes,'number',function(v){F.maxTimes=v;});
  dRow.appendChild(dayFld);dRow.appendChild(mkF('MAX TIMES (∞=blank)',maxI));
  form.appendChild(dRow);
  var mdOpts=Array.from({length:28},function(_,i){return[String(i+1),'Day '+(i+1)];});
  var mdFld=mkF('DAY OF MONTH',mkSl(mdOpts,String(F.monthDay||1),function(v){F.monthDay=parseInt(v);}));
  mdFld.style.display=F.frequency==='monthly'?'':'none';
  form.appendChild(mdFld);
  var sdI=mkI('',F.startDate,'date',function(v){F.startDate=v;});
  var sdFld=mkF('START / ANNUAL DATE',sdI);
  sdFld.style.display=(F.frequency==='fortnightly'||F.frequency==='yearly')?'':'none';
  form.appendChild(sdFld);
  var amtI=mkI('0',F.baseAmount,'number',function(v){F.baseAmount=v;});
  var amtFld=mkF('AMOUNT',amtI);
  var varTip=el('div',{css:{background:t.acBg,border:'1px solid '+t.acBo,borderRadius:'8px',padding:'10px 12px',fontSize:'13px',color:t.ac,marginBottom:'12px'}},'💡 Blank each week — fill on the row.');
  form.appendChild(mkF('AMOUNT TYPE',mkSegL([['fixed','Fixed'],['variable','Variable']],function(){return F.fixedAmount?'fixed':'variable';},function(v){F.fixedAmount=v==='fixed';},function(){amtFld.style.display=F.fixedAmount?'':'none';varTip.style.display=F.fixedAmount?'none':'';})));
  amtFld.style.display=F.fixedAmount?'':'none';varTip.style.display=F.fixedAmount?'none':'';
  form.appendChild(amtFld);form.appendChild(varTip);
  form.appendChild(mkF('LINK TO DEBT',mkSl([['','None']].concat(S.debts.map(function(d){return[d.id,d.name];})),F.linkedDebtId||'',function(v){F.linkedDebtId=v;})));
  var bRow=el('div',{css:{display:'flex',gap:'8px',marginTop:'4px'}});
  bRow.appendChild(el('button',{cls:'btn-p',onclick:function(){
    if(!F.name)return;
    var rec={name:F.name,baseAmount:parseFloat(F.baseAmount)||0,day:F.day,fixedAmount:F.fixedAmount,maxTimes:F.maxTimes?parseInt(F.maxTimes):null,frequency:F.frequency,category:F.category,linkedDebtId:F.linkedDebtId||null,monthDay:F.monthDay||1,startDate:F.startDate||''};
    if(S.editRecId){S.rec=S.rec.map(function(r){return r.id!==S.editRecId?r:Object.assign({},r,rec);});S.editRecId=null;}
    else S.rec=S.rec.concat([Object.assign({id:'r'+Date.now(),timesUsed:0,active:true},rec)]);
    S.modal=null;save();render();
  }},S.editRecId?'Save':'Add'));
  if(S.editRecId)bRow.appendChild(el('button',{cls:'btn-g',css:{borderColor:t.b2,color:t.txm},onclick:function(){S.editRecId=null;render();}},'Cancel'));
  form.appendChild(bRow);wrap.appendChild(form);
  return mkOv(wrap);
}
function renderDebtM(){
  var t=T(),ex=S.editDbtId?S.debts.find(function(d){return d.id===S.editDbtId;}):null;
  var F={name:ex?ex.name:'',total:ex?String(ex.total||''):'',paid:ex?String(ex.paid||''):'',installment:ex?String(ex.installment||''):'',note:ex?ex.note||'':''};
  var close=function(){S.modal=null;S.editDbtId=null;render();};
  var w=el('div',{});w.appendChild(mkMH(S.editDbtId?'Edit Debt':'New Debt',close));
  w.appendChild(mkF('NAME',mkI('AFTERPAY, LOAN...',F.name,'text',function(v){F.name=v.toUpperCase();})));
  var r=el('div',{cls:'two-col'});r.appendChild(mkF('TOTAL',mkI('',F.total,'number',function(v){F.total=v;})));r.appendChild(mkF('PAID SO FAR',mkI('',F.paid,'number',function(v){F.paid=v;})));
  w.appendChild(r);w.appendChild(mkF('INSTALLMENT',mkI('',F.installment,'number',function(v){F.installment=v;})));w.appendChild(mkF('NOTE',mkI('',F.note,'text',function(v){F.note=v;})));
  w.appendChild(el('button',{cls:'btn-p',css:{width:'100%',justifyContent:'center'},onclick:function(){
    if(!F.name||!F.total)return;
    var d={name:F.name,total:parseFloat(F.total)||0,paid:parseFloat(F.paid)||0,installment:parseFloat(F.installment)||0,note:F.note,autoFromRecId:null};
    if(S.editDbtId){S.debts=S.debts.map(function(x){return x.id!==S.editDbtId?x:Object.assign({},x,d);});S.editDbtId=null;}
    else S.debts=S.debts.concat([Object.assign({id:'d'+Date.now()},d)]);
    S.modal=null;save();render();
  }},S.editDbtId?'Save':'Add'));
  return mkOv(w);
}
function renderInvM(){
  var t=T(),ex=S.editInvId?S.inv.find(function(i){return i.id===S.editInvId;}):null;
  var F={name:ex?ex.name:'',contributed:ex?String(ex.contributed||''):'',currentValue:ex?String(ex.currentValue||''):'',startDate:ex?ex.startDate||'':'',note:ex?ex.note||'':''};
  var close=function(){S.modal=null;S.editInvId=null;render();};
  var w=el('div',{});w.appendChild(mkMH(S.editInvId?'Edit Investment':'New Investment',close));
  w.appendChild(mkF('NAME',mkI('CDB, Treasury Bond...',F.name,'text',function(v){F.name=v;})));
  var r=el('div',{cls:'two-col'});r.appendChild(mkF('INVESTED ($)',mkI('',F.contributed,'number',function(v){F.contributed=v;})));r.appendChild(mkF('CURRENT VALUE ($)',mkI('',F.currentValue,'number',function(v){F.currentValue=v;})));
  w.appendChild(r);w.appendChild(mkF('START DATE',mkI('',F.startDate,'date',function(v){F.startDate=v;})));w.appendChild(mkF('NOTE',mkI('',F.note,'text',function(v){F.note=v;})));
  w.appendChild(el('button',{cls:'btn-p',css:{width:'100%',justifyContent:'center'},onclick:function(){
    if(!F.name||!F.contributed)return;
    var x={name:F.name,contributed:parseFloat(F.contributed)||0,currentValue:parseFloat(F.currentValue)||parseFloat(F.contributed)||0,startDate:F.startDate,note:F.note};
    if(S.editInvId){S.inv=S.inv.map(function(i){return i.id!==S.editInvId?i:Object.assign({},i,x);});S.editInvId=null;}
    else S.inv=S.inv.concat([Object.assign({id:'i'+Date.now()},x)]);
    S.modal=null;save();render();
  }},S.editInvId?'Save':'Add'));
  return mkOv(w);
}
function renderEditM(){
  var t=T(),item=S.editItem;
  var F={name:item.name,amount:String(item.amount||''),day:item.day,date:item.date};
  var close=function(){S.modal=null;S.editItem=null;render();};
  var w=el('div',{});w.appendChild(mkMH('Edit Entry',close));
  w.appendChild(mkF('NAME',mkI('',F.name,'text',function(v){F.name=v;})));
  w.appendChild(mkF('AMOUNT',mkI('',F.amount,'number',function(v){F.amount=v;})));
  var r=el('div',{cls:'two-col'});
  r.appendChild(mkF('DAY',mkSl(DAYS.map(function(d){return[d,d];}),F.day,function(v){F.day=v;})));
  r.appendChild(mkF('DATE (DD/MM)',mkI('17/04',F.date,'text',function(v){F.date=v;})));
  w.appendChild(r);
  w.appendChild(el('div',{css:{display:'flex',gap:'8px',marginTop:'4px'}},
    el('button',{cls:'btn-p',onclick:function(){
      if(!/^\d{1,2}\/\d{1,2}$/.test(F.date.trim())){alert('Date must be DD/MM');return;}
      var upd=Object.assign({},item,{name:F.name.toUpperCase(),amount:parseFloat(F.amount)||0,day:F.day,date:F.date.trim()});
      var refYr=S.weeks.length?S.weeks[0].year:CY;
      var ti=wkOfStr(F.date.trim(),refYr);
      var src=S.weeks.find(function(w){return w.items.some(function(i){return i.id===item.id;});});
      var same=!ti||!src||(ti.week===src.weekNum&&ti.year===src.year);
      if(same){
        S.weeks=S.weeks.map(function(w){
          if(w.id!==src.id)return w;
          return Object.assign({},w,{items:srt(w.items.map(function(i){return i.id!==item.id?i:upd;}))});
        });
      }else{
        S.weeks=S.weeks.map(function(w){
          if(w.id!==src.id)return w;
          return Object.assign({},w,{items:w.items.filter(function(i){return i.id!==item.id;})});
        });
        var dest=S.weeks.find(function(w){return w.weekNum===ti.week&&w.year===ti.year;});
        if(dest){
          S.weeks=S.weeks.map(function(w){
            if(w.id!==dest.id)return w;
            return Object.assign({},w,{items:srt(w.items.concat([upd]))});
          });
        }else{
          var m=wkMeta(ti.week,ti.year);
          S.weeks=[{id:Date.now(),weekNum:ti.week,year:ti.year,label:m.label,startMonth:m.startMonth,monISO:m.mon.toISOString(),collapsed:false,items:[upd]}].concat(S.weeks);
          S.viewYear=ti.year;
        }
      }
      S.modal=null;S.editItem=null;save();render();
    }},'Save'),
    el('button',{cls:'btn-g',css:{borderColor:t.b2,color:t.txm},onclick:close},'Cancel')
  ));
  return mkOv(w,true);
}

// ─── ACTIONS ──────────────────────────────────────────────────────────────────
function addWk(){
  var sorted=S.weeks.slice().sort(function(a,b){return b.year!==a.year?b.year-a.year:b.weekNum-a.weekNum;});
  var last=sorted[0],nw=last?last.weekNum+1:CW,ny=last?last.year:CY;
  if(nw>52){nw=1;ny++;}
  var m=wkMeta(nw,ny);
  var active=S.rec.filter(function(r){return recFits(r,nw,ny,m.mon.toISOString());});
  var items=srt(active.map(function(r){return{id:Date.now()+Math.random(),day:r.day,date:recDate(r,m.mon),name:r.name+(r.category==='subscription'?' 🔔':''),amount:r.fixedAmount?r.baseAmount:0,paid:false,recurringId:r.id,isSub:r.category==='subscription'};}));
  S.weeks=[{id:Date.now(),weekNum:nw,year:ny,label:m.label,startMonth:m.startMonth,monISO:m.mon.toISOString(),collapsed:false,items:items}].concat(S.weeks);
  S.viewYear=ny;save();render();
}
function togPaid(wid,iid){
  S.weeks=S.weeks.map(function(w){
    if(w.id!==wid)return w;
    return Object.assign({},w,{items:w.items.map(function(i){
      if(i.id!==iid)return i;
      var np=!i.paid;
      if(i.recurringId){
        S.rec=S.rec.map(function(r){
          if(r.id!==i.recurringId)return r;
          var nu=r.timesUsed+(np?1:-1);
          return Object.assign({},r,{timesUsed:Math.max(0,nu),active:r.maxTimes==null||nu<r.maxTimes});
        });
        var lr=S.rec.find(function(r){return r.id===i.recurringId&&r.linkedDebtId;});
        if(lr){
          S.debts=S.debts.map(function(d){
            if(d.id!==lr.linkedDebtId)return d;
            var np2=np?d.paid+lr.baseAmount:Math.max(0,d.paid-lr.baseAmount);
            return Object.assign({},d,{paid:Math.min(np2,d.total)});
          });
        }
      }
      return Object.assign({},i,{paid:np});
    })});
  });
  save();render();
}
function delI(wid,iid){
  S.weeks=S.weeks.map(function(w){
    if(w.id!==wid)return w;
    return Object.assign({},w,{items:w.items.filter(function(i){return i.id!==iid;})});
  });
  save();render();
}
function delW(wid){S.weeks=S.weeks.filter(function(w){return w.id!==wid;});save();render();}
function togCol(wid){S.weeks=S.weeks.map(function(w){return w.id!==wid?w:Object.assign({},w,{collapsed:!w.collapsed});});render();}
function applyVar(wid,item){
  var k=wid+'_'+item.id,v=parseFloat(S.varA[k]);
  if(isNaN(v))return;
  S.weeks=S.weeks.map(function(w){
    if(w.id!==wid)return w;
    return Object.assign({},w,{items:w.items.map(function(i){return i.id!==item.id?i:Object.assign({},i,{amount:v});})});
  });
  delete S.varA[k];save();render();
}
function addItem(wid,lF){
  if(!lF.name||!lF.amount)return;
  var w=S.weeks.find(function(x){return x.id===wid;});if(!w)return;
  var mon=new Date(w.monISO);
  var entry={id:Date.now(),day:lF.day,date:dayInWk(lF.day,mon),name:lF.name,amount:parseFloat(lF.amount)||0,paid:false,recurringId:null};
  S.weeks=S.weeks.map(function(x){
    if(x.id!==wid)return x;
    return Object.assign({},x,{items:srt(x.items.concat([entry]))});
  });
  S.addingTo=null;save();render();
}
function grpWks(){
  var yw=S.weeks.filter(function(w){return w.year===S.viewYear;}),map={};
  yw.forEach(function(w){var m=w.startMonth||0;if(!map[m])map[m]=[];map[m].push(w);});
  Object.keys(map).forEach(function(m){map[m].sort(function(a,b){return b.weekNum-a.weekNum;});});
  return Object.entries(map).sort(function(a,b){return Number(b[0])-Number(a[0]);});
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render(){
  var root=document.getElementById('root');
  if(!root)return;
  root.innerHTML='';
  var t=T();

  if(!S.unlocked){root.appendChild(renderPin());return;}

  var app=el('div',{cls:'app',css:{background:t.bg,color:t.tx}});

  // Header
  var sdot=S.saveState==='saving'?t.ac:S.saveState==='saved'?t.grn:S.saveState==='error'?t.red:'transparent';
  var slbl=S.saveState==='saving'?'SAVING...':S.saveState==='saved'?'SAVED':S.saveState==='error'?'ERR':'';
  app.appendChild(el('div',{cls:'hdr',css:{background:t.bg,borderBottom:'1px solid '+t.b}},
    el('div',{},
      el('div',{css:{fontSize:'10px',color:t.txl,fontWeight:'700',letterSpacing:'3px',marginBottom:'3px'}},'FINANCES'),
      el('div',{cls:'hdr-yr'},
        el('button',{cls:'ibtn',css:{borderColor:t.b2,color:t.txm,width:'26px',height:'26px',borderRadius:'6px'},onclick:function(){S.viewYear--;render();}},I('Lt',13,t.txm)),
        el('h1',''+S.viewYear),
        el('button',{cls:'ibtn',css:{borderColor:t.b2,color:t.txm,width:'26px',height:'26px',borderRadius:'6px'},onclick:function(){S.viewYear++;render();}},I('Rt',13,t.txm))
      )
    ),
    el('div',{cls:'hdr-r'},
      el('div',{css:{display:'flex',alignItems:'center',gap:'5px'}},
        el('div',{cls:'save-dot'+(S.saveState==='saving'?' pulse':''),css:{background:sdot}}),
        el('span',{css:{fontSize:'10px',color:S.saveState==='saved'?t.grn:S.saveState==='error'?t.red:t.txl,fontWeight:'600',letterSpacing:'1px'}},slbl)
      ),
      el('button',{cls:'ibtn',css:{borderColor:t.b2,color:t.txm},onclick:function(){S.themeOv=S.themeOv===null?(t===LITE?'dark':'lite'):S.themeOv==='dark'?'lite':'dark';render();}},t===LITE?I('Moon',15,t.txm):I('Sun',15,t.txm)),
      S.themeOv!==null?el('button',{cls:'ibtn pill',css:{borderColor:t.b2,color:t.txm},onclick:function(){S.themeOv=null;render();}},'AUTO'):el('span',{}),
      el('button',{cls:'ibtn',css:{borderColor:t.b2,color:t.txm},onclick:function(){S.unlocked=false;render();}},I('Lock',15,t.txm))
    )
  ));

  // Tabs
  var tabs=el('div',{cls:'tabs',css:{borderColor:t.b}});
  [['weeks','WEEKS'],['debts','DEBTS'],['investments','INVESTMENTS'],['subs','SUBSCRIPTIONS']].forEach(function(p){
    tabs.appendChild(el('button',{cls:'tab',css:{color:S.tab===p[0]?t.ac:t.txm,background:S.tab===p[0]?t.tabAc:'none'},onclick:function(){S.tab=p[0];render();}},p[1]));
  });
  app.appendChild(tabs);

  var body=el('div',{cls:'body'});

  // WEEKS
  if(S.tab==='weeks'){
    body.appendChild(el('div',{cls:'toolbar'},
      el('button',{cls:'btn-p',onclick:addWk},I('Plus',14,'#fff'),' Next Week'),
      el('button',{cls:'btn-g',css:{borderColor:t.b2,color:t.txm},onclick:function(){S.editRecId=null;S.modal='rec';render();}},I('Sync',13,t.txm),' Recurring')
    ));
    var grp=grpWks();
    if(!grp.length)body.appendChild(el('div',{cls:'empty',css:{color:t.txl}},'No weeks for '+S.viewYear+'. Click "Next Week".'));
    grp.forEach(function(pair){
      var mI=pair[0],mWks=pair[1];
      body.appendChild(el('div',{cls:'m-hdr',css:{color:t.txm,borderColor:t.b}},MONTHS[mI]));
      mWks.forEach(function(wk){
        var tAmt=wk.items.reduce(function(s,i){return s+i.amount;},0);
        var done=wk.items.length>0&&wk.items.every(function(i){return i.paid;});
        var pct=wk.items.length?(wk.items.filter(function(i){return i.paid;}).length/wk.items.length)*100:0;
        var ww=el('div',{cls:'w-wrap'});
        ww.appendChild(el('div',{cls:'w-hdr',css:{background:done?t.acBg:t.sf,borderColor:done?t.acBo:t.b,borderRadius:wk.collapsed?'12px':'12px 12px 0 0'},onclick:function(){togCol(wk.id);}},
          el('span',{css:{color:t.txl,display:'flex'}},wk.collapsed?I('Rt',14,t.txl):I('Dn',14,t.txl)),
          el('span',{css:{fontWeight:'800',fontSize:'13px',flex:'1',color:done?t.ac:t.tx}},wk.label),
          done?el('span',{css:{fontSize:'11px',color:t.ac,fontWeight:'700',letterSpacing:'1.5px'}},'✓ DONE'):wk.items.length?el('span',{css:{fontSize:'12px',color:t.txm}},wk.items.filter(function(i){return i.paid;}).length+'/'+wk.items.length):el('span',{}),
          el('span',{cls:'mono',css:{fontSize:'13px',color:done?t.ac:t.txm,marginLeft:'4px'}},tAmt?String(tAmt):''),
          el('button',{css:{background:'none',border:'none',color:t.txl,padding:'2px 4px',marginLeft:'2px',display:'flex'},onclick:function(e){e.stopPropagation();delW(wk.id);}},I('X',13,t.txl))
        ));
        if(!wk.collapsed){
          var wb=el('div',{cls:'w-body',css:{background:t.sf2,borderColor:t.b}});
          if(wk.items.length){var bar=el('div',{cls:'w-bar',css:{background:t.prog}});bar.appendChild(el('div',{cls:'w-bar-fill',css:{width:pct+'%'}}));wb.appendChild(bar);}
          wk.items.forEach(function(item){
            var rE=item.recurringId?S.rec.find(function(r){return r.id===item.recurringId;}):null;
            var isVar=rE&&!rE.fixedAmount,isSub=item.isSub||(rE&&rE.category==='subscription');
            var vk=wk.id+'_'+item.id;
            var row=el('div',{cls:'irow'+(item.paid?' paid':''),css:{borderColor:t.b}});
            row.appendChild(el('button',{cls:'cb'+(item.paid?' on':''),css:{borderColor:t.b2},onclick:function(){togPaid(wk.id,item.id);}},item.paid?I('Ok',11,'#fff'):el('span',{})));
            row.appendChild(isSub?I('Tv',9,t.sub):(item.recurringId?I('Sync',9,t.ac):el('span',{css:{width:'0'}})));
            row.appendChild(el('span',{css:{fontSize:'10px',color:t.txl,fontWeight:'700',width:'28px',flexShrink:'0'}},item.day));
            row.appendChild(el('span',{css:{fontSize:'11px',color:t.txm,width:'38px',flexShrink:'0',borderBottom:'1px solid '+t.b,cursor:'pointer',textDecoration:'underline dotted'},onclick:function(){S.editItem=item;S.modal='editItem';render();}},item.date));
            row.appendChild(el('span',{css:{flex:'1',fontWeight:'600',fontSize:'14px',color:isSub?t.sub:t.tx}},item.name));
            if(isVar&&!item.paid){
              var vw=el('div',{css:{display:'flex',alignItems:'center',gap:'5px'}});
              vw.appendChild(el('span',{cls:'mono',css:{fontSize:'13px',color:t.txl}},'='));
              var vi=document.createElement('input');vi.className='inp-sm';vi.type='number';vi.placeholder='—';
              vi.style.background=t.inBg;vi.style.color=t.tx;
              vi.value=S.varA[vk]!==undefined?S.varA[vk]:(item.amount||'');
              vi.addEventListener('input',function(){S.varA[vk]=vi.value;});
              vi.addEventListener('blur',function(){applyVar(wk.id,item);});
              vi.addEventListener('keydown',function(e){if(e.key==='Enter')applyVar(wk.id,item);});
              vw.appendChild(vi);row.appendChild(vw);
            }else{
              row.appendChild(el('span',{cls:'mono',css:{fontSize:'14px',fontWeight:'500',color:item.paid?t.txl:t.tx}},'= '+(item.amount||'–')));
            }
            row.appendChild(el('button',{css:{background:'none',border:'none',color:t.txm,padding:'3px',display:'flex',opacity:'.5'},onclick:function(){S.editItem=item;S.modal='editItem';render();}},I('Edit',12,t.txm)));
            row.appendChild(el('button',{cls:'del-btn',css:{color:t.txl},onclick:function(){delI(wk.id,item.id);}},I('X',12,t.txl)));
            wb.appendChild(row);
          });
          if(S.addingTo===wk.id){
            var lF={day:'MON',name:'',amount:''};
            var af=el('div',{cls:'add-form'});
            var hint=el('div',{css:{fontSize:'10px',color:t.ac,marginBottom:'2px',minHeight:'14px'}});
            function updH(){hint.textContent='→ '+dayInWk(lF.day,new Date(wk.monISO));}updH();
            var ag=el('div',{cls:'add-grid'});
            var dS=mkSl(DAYS.map(function(d){return[d,d];}),lF.day,function(v){lF.day=v;updH();});
            var nI=mkI('NAME','','text',function(v){lF.name=v.toUpperCase();nI.value=lF.name;});
            var aI=mkI('Amount','','number',function(v){lF.amount=v;});
            aI.addEventListener('keydown',function(e){if(e.key==='Enter')addItem(wk.id,lF);});
            ag.appendChild(dS);ag.appendChild(nI);ag.appendChild(aI);
            af.appendChild(hint);af.appendChild(ag);
            af.appendChild(el('div',{css:{display:'flex',gap:'8px'}},
              el('button',{cls:'btn-p',onclick:function(){addItem(wk.id,lF);}},'Add'),
              el('button',{cls:'btn-g',css:{borderColor:t.b2,color:t.txm},onclick:function(){S.addingTo=null;render();}},'Cancel')
            ));
            wb.appendChild(af);
          }else{
            var gb=el('button',{cls:'ghost-add',css:{color:t.txl},onclick:function(){S.addingTo=wk.id;render();}},I('Plus',13,'currentColor'),' add entry');
            gb.addEventListener('mouseenter',function(){gb.style.color=t.ac;});
            gb.addEventListener('mouseleave',function(){gb.style.color=t.txl;});
            wb.appendChild(gb);
          }
          if(wk.items.length)wb.appendChild(el('div',{cls:'w-foot',css:{borderColor:t.b}},el('span',{css:{fontSize:'11px',color:t.txl}},wk.items.filter(function(i){return i.paid;}).length+' of '+wk.items.length+' paid'),el('span',{cls:'mono',css:{fontWeight:'700',fontSize:'13px',color:t.ac,letterSpacing:'1px'}},'TOTAL = '+tAmt)));
          ww.appendChild(wb);
        }
        body.appendChild(ww);
      });
    });
  }

  // DEBTS
  if(S.tab==='debts'){
    var totD=S.debts.reduce(function(s,d){return s+(d.total-d.paid);},0);
    body.appendChild(el('div',{cls:'totals-hdr'},
      el('div',{},el('div',{cls:'totals-lbl',css:{color:t.txl}},'TOTAL OUTSTANDING'),el('div',{cls:'mono',css:{fontSize:'26px',fontWeight:'500',color:t.red}},'$ '+totD.toLocaleString())),
      el('button',{cls:'btn-p',onclick:function(){S.editDbtId=null;S.modal='debt';render();}},I('Plus',14,'#fff'),' Add Debt')
    ));
    S.debts.forEach(function(d){
      var rem=d.total-d.paid,pct=Math.min((d.paid/d.total)*100,100),done=rem<=0;
      var lr=S.rec.find(function(r){return r.linkedDebtId===d.id;});
      var card=el('div',{cls:'card',css:{background:done?t.acBg:t.sf,borderColor:done?t.acBo:t.b}});
      card.appendChild(el('div',{css:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}},
        el('div',{},
          el('div',{css:{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}},
            el('span',{css:{fontWeight:'700',fontSize:'15px'}},d.name),
            lr?el('span',{cls:'badge',css:{color:t.ac,background:t.acBg,borderColor:t.acBo}},'AUTO'):el('span',{}),
            done?el('span',{cls:'badge',css:{color:'#4ade80',background:'#0d2210',borderColor:'#4ade8033'}},'✓ PAID OFF'):el('span',{})
          ),
          d.note?el('div',{css:{fontSize:'12px',color:t.txm,marginTop:'2px'}},d.note):el('span',{})
        ),
        el('div',{css:{display:'flex',gap:'6px'}},
          el('button',{cls:'btn-g',css:{padding:'5px 9px',borderColor:t.b2,color:t.txm},onclick:function(){S.editDbtId=d.id;S.modal='debt';render();}},I('Edit',12,t.txm)),
          el('button',{cls:'btn-g',css:{padding:'5px 9px',borderColor:t.b2,color:t.txm},onclick:function(){S.debts=S.debts.filter(function(x){return x.id!==d.id;});save();render();}},I('X',12,t.txm))
        )
      ));
      var mg=el('div',{cls:'mini-grid'});
      [['Total',d.total,t.tx],['Paid',d.paid,t.grn],['Remaining',rem,done?t.grn:t.red]].forEach(function(row){
        mg.appendChild(el('div',{cls:'mini-cell',css:{background:t.sf2}},el('div',{css:{fontSize:'10px',color:t.txl,fontWeight:'700',letterSpacing:'1px',marginBottom:'3px'}},row[0]),el('div',{cls:'mono',css:{fontSize:'15px',fontWeight:'500',color:row[2]}},String(row[1]))));
      });
      card.appendChild(mg);
      card.appendChild(el('div',{cls:'prog-track',css:{background:t.prog}},el('div',{cls:'prog-fill',css:{width:pct+'%',background:t.grn}})));
      card.appendChild(el('div',{css:{display:'flex',justifyContent:'space-between',fontSize:'12px',color:t.txl}},
        el('span',{},pct.toFixed(0)+'% paid'),
        d.installment>0&&!done?el('span',{},'~'+Math.ceil(rem/d.installment)+' left'):el('span',{}),
        lr?el('span',{css:{color:t.ac}},'↻ '+FL[lr.frequency||'weekly']):el('span',{})
      ));
      body.appendChild(card);
    });
    if(!S.debts.length)body.appendChild(el('div',{cls:'empty',css:{color:t.txl}},'No active debts 🎉'));
  }

  // INVESTMENTS
  if(S.tab==='investments'){
    var tI=S.inv.reduce(function(s,i){return s+i.contributed;},0);
    var tV=S.inv.reduce(function(s,i){return s+i.currentValue;},0);
    var tR=tV-tI;
    body.appendChild(el('div',{css:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}},
      el('div',{cls:'totals-pair'},
        el('div',{},el('div',{cls:'totals-lbl',css:{color:t.txl}},'INVESTED'),el('div',{cls:'mono',css:{fontSize:'20px',fontWeight:'500'}},'$ '+tI.toLocaleString())),
        el('div',{},el('div',{cls:'totals-lbl',css:{color:t.txl}},'RETURN'),el('div',{cls:'mono',css:{fontSize:'20px',fontWeight:'500',color:tR>=0?t.grn:t.red}},(tR>=0?'+':'')+tR.toFixed(0)))
      ),
      el('button',{cls:'btn-p',onclick:function(){S.editInvId=null;S.modal='inv';render();}},I('Plus',14,'#fff'),' Add')
    ));
    S.inv.forEach(function(x){
      var ret=x.currentValue-x.contributed,rp=x.contributed?((ret/x.contributed)*100).toFixed(2):'0';
      var card=el('div',{cls:'card',css:{background:t.sf,borderColor:t.b}});
      card.appendChild(el('div',{css:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}},
        el('div',{css:{display:'flex',alignItems:'center',gap:'8px'}},
          el('div',{css:{background:t.acBg,border:'1px solid '+t.acBo,borderRadius:'8px',padding:'6px 8px',display:'flex'}},I('Trend',15,t.ac)),
          el('div',{},el('div',{css:{fontWeight:'700',fontSize:'15px'}},x.name),x.note?el('div',{css:{fontSize:'12px',color:t.txm}},x.note):el('span',{}))
        ),
        el('div',{css:{display:'flex',gap:'6px'}},
          el('button',{cls:'btn-g',css:{padding:'5px 9px',borderColor:t.b2,color:t.txm},onclick:function(){S.editInvId=x.id;S.modal='inv';render();}},I('Edit',12,t.txm)),
          el('button',{cls:'btn-g',css:{padding:'5px 9px',borderColor:t.b2,color:t.txm},onclick:function(){S.inv=S.inv.filter(function(i){return i.id!==x.id;});save();render();}},I('X',12,t.txm))
        )
      ));
      var mg2=el('div',{cls:'mini-grid'});
      [['Invested','$ '+x.contributed,''],['Current','$ '+x.currentValue,t.grn],['Return',(ret>=0?'+':'')+ret.toFixed(0)+' ('+rp+'%)',ret>=0?t.grn:t.red]].forEach(function(row){
        mg2.appendChild(el('div',{cls:'mini-cell',css:{background:t.sf2}},el('div',{css:{fontSize:'10px',color:t.txl,fontWeight:'700',letterSpacing:'1px',marginBottom:'3px'}},row[0]),el('div',{cls:'mono',css:{fontSize:'13px',fontWeight:'500',color:row[2]||t.tx}},row[1])));
      });
      card.appendChild(mg2);body.appendChild(card);
    });
    if(!S.inv.length)body.appendChild(el('div',{cls:'empty',css:{color:t.txl}},'No investments yet'));
  }

  // SUBSCRIPTIONS
  if(S.tab==='subs'){
    var subs=S.rec.filter(function(r){return r.category==='subscription';});
    var mCost=subs.filter(function(r){return r.active;}).reduce(function(s,r){var m=r.frequency==='weekly'?4:r.frequency==='fortnightly'?2:r.frequency==='yearly'?1/12:1;return s+r.baseAmount*m;},0);
    body.appendChild(el('div',{cls:'totals-hdr'},
      el('div',{},el('div',{cls:'totals-lbl',css:{color:t.txl}},'MONTHLY COST'),el('div',{cls:'mono',css:{fontSize:'26px',fontWeight:'500',color:t.sub}},'$ '+mCost.toFixed(0))),
      el('button',{cls:'btn-p',onclick:function(){S.editRecId=null;S.modal='rec';render();}},I('Plus',14,'#fff'),' Add')
    ));
    subs.forEach(function(r){
      body.appendChild(el('div',{cls:'sub-card',css:{background:t.sf,borderColor:t.b}},
        el('div',{css:{width:'40px',height:'40px',borderRadius:'10px',background:t.sub+'22',border:'1px solid '+t.sub+'44',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:'0'}},I('Tv',18,t.sub)),
        el('div',{css:{flex:'1'}},
          el('div',{css:{fontWeight:'700',fontSize:'15px'}},r.name),
          el('div',{css:{fontSize:'12px',color:t.txm}},FL[r.frequency||'monthly']+(r.monthDay&&r.frequency==='monthly'?' · Day '+r.monthDay:r.startDate&&r.frequency==='yearly'?' · '+r.startDate.slice(5).replace('-','/'):''))
        ),
        el('div',{cls:'mono',css:{fontSize:'16px',fontWeight:'500',color:r.active?t.sub:t.txl}},'$ '+r.baseAmount),
        el('div',{css:{display:'flex',gap:'6px'}},
          el('button',{cls:'btn-g',css:{padding:'5px 9px',borderColor:t.b2,color:t.txm},onclick:function(){S.editRecId=r.id;S.modal='rec';render();}},I('Edit',12,t.txm)),
          el('button',{cls:'btn-g',css:{padding:'5px 9px',borderColor:t.b2,color:t.txm},onclick:function(){S.rec=S.rec.map(function(x){return x.id!==r.id?x:Object.assign({},x,{active:!x.active});});save();render();}},r.active?'⏸':'▶')
        )
      ));
    });
    if(!subs.length)body.appendChild(el('div',{cls:'empty',css:{color:t.txl}},'No subscriptions yet.'));
  }

  app.appendChild(body);
  root.appendChild(app);

  if(S.modal==='rec')     root.appendChild(renderRecM());
  if(S.modal==='debt')    root.appendChild(renderDebtM());
  if(S.modal==='inv')     root.appendChild(renderInvM());
  if(S.modal==='editItem'&&S.editItem) root.appendChild(renderEditM());
}

// ─── BOOT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  var lt;
  document.addEventListener('pointerdown',function(){clearTimeout(lt);lt=setTimeout(function(){S.unlocked=false;render();},600000);});
  initData();
  render();
});
