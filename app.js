'use strict';

var PIN = '1066';
var SAVE_KEY = 'fin_v1';

// THEME
var C = {
  bg:'#0c0c0c', sf:'#131313', sf2:'#0f0f0f', b:'#222', b2:'#2a2a2a',
  tx:'#efefef', txm:'#848484', txl:'#363636',
  ac:'#c97b2a', acBg:'#130f00', acBo:'#c97b2a44',
  tabAc:'#1f1f1f', inBg:'#181818',
  red:'#e05555', grn:'#4ade80', prog:'#1d1d1d', sub:'#7c6af0'
};

// DATA
var WEEKS = [];
var REC   = [];
var DEBTS = [];
var INV   = [];
var VIEW_YEAR = 2026;
var THEME_OV  = null;
var TAB = 'weeks';
var MODAL = null;
var ADDING_TO = null;
var EDIT_ITEM = null;
var EDIT_REC  = null;
var EDIT_DBT  = null;
var EDIT_INV  = null;
var SUBS_OPEN = true;
var VAR_VALS  = {};
var UNLOCKED  = false;

var MONTHS = ['January','February','March','April','May','June','July','August',
              'September','October','November','December'];
var DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
var DIDX = {MON:0,TUE:1,WED:2,THU:3,FRI:4,SAT:5,SUN:6};
var FL = {weekly:'Weekly',fortnightly:'Fortnightly',monthly:'Monthly',yearly:'Yearly'};

// ── DATE HELPERS ──────────────────────────────────────────────────────────────
function p2(n){ return ('0'+n).slice(-2); }
function fmt(d){ return p2(d.getDate())+'/'+p2(d.getMonth()+1); }

function getMonday(wn, yr) {
  var j4 = new Date(yr, 0, 4);
  var day = j4.getDay() || 7;
  var mon = new Date(j4);
  mon.setDate(j4.getDate() - day + 1 + (wn-1)*7);
  return mon;
}
function getISOWeek(d) {
  var tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  var y1 = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil((((tmp - y1) / 86400000) + 1) / 7);
}
function getISOYear(d) {
  var tmp = new Date(d);
  tmp.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return tmp.getFullYear();
}
function weekMeta(wn, yr) {
  var mon = getMonday(wn, yr);
  var sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  return {
    label: 'WEEK ' + wn + ' (' + fmt(mon) + ' - ' + fmt(sun) + ')',
    mon: mon,
    startMonth: mon.getMonth()
  };
}
function dayDate(day, mon) {
  var d = new Date(mon);
  d.setDate(mon.getDate() + (DIDX[day] || 0));
  return fmt(d);
}
function sortKey(s) {
  if (!s) return 9999;
  var p = s.split('/');
  return parseInt(p[1]||0)*100 + parseInt(p[0]||0);
}
function sortItems(arr) {
  return arr.slice().sort(function(a,b){ return sortKey(a.date) - sortKey(b.date); });
}

var NOW = new Date();
var CW = getISOWeek(NOW);
var CY = getISOYear(NOW);

// ── SEED ──────────────────────────────────────────────────────────────────────
function loadSeed() {
  WEEKS = [
    {id:1,wn:16,yr:2026,label:'WEEK 16 (13/04 - 19/04)',sm:3,mon:'2026-04-13',collapsed:false,items:[
      {id:101,day:'THU',date:'16/04',name:'SCOOTER',  amt:105, paid:true},
      {id:102,day:'THU',date:'16/04',name:'RÃNA',     amt:325, paid:true},
      {id:103,day:'FRI',date:'17/04',name:'AFTERPAY', amt:200, paid:false},
      {id:104,day:'SUN',date:'19/04',name:'RENT',     amt:530, paid:false},
      {id:105,day:'SUN',date:'19/04',name:'UNI',      amt:500, paid:false},
    ]},
    {id:2,wn:15,yr:2026,label:'WEEK 15 (06/04 - 12/04)',sm:3,mon:'2026-04-06',collapsed:false,items:[
      {id:201,day:'TUE',date:'07/04',name:'WAGEPAY',        amt:213,  paid:true},
      {id:202,day:'WED',date:'08/04',name:'BEFOREPAY (2/4)',amt:79,   paid:true},
      {id:203,day:'THU',date:'09/04',name:'SCOOTER',        amt:105,  paid:true},
      {id:204,day:'THU',date:'09/04',name:'GYM',            amt:44,   paid:true},
      {id:205,day:'FRI',date:'10/04',name:'AFTERPAY',       amt:278,  paid:true},
      {id:206,day:'SUN',date:'12/04',name:'RENT',           amt:530,  paid:true},
      {id:207,day:'SUN',date:'12/04',name:'UNI',            amt:320,  paid:true},
    ]},
    {id:3,wn:14,yr:2026,label:'WEEK 14 (30/03 - 05/04)',sm:2,mon:'2026-03-30',collapsed:true,items:[
      {id:301,day:'WED',date:'01/04',name:'BEFOREPAY',     amt:79,  paid:true},
      {id:302,day:'THU',date:'02/04',name:'SCOOTER',       amt:105, paid:true},
      {id:303,day:'THU',date:'02/04',name:'EXAME DE VISTA',amt:75,  paid:true},
      {id:304,day:'THU',date:'02/04',name:'ALUGUEL DIEGO', amt:58,  paid:true},
      {id:305,day:'FRI',date:'03/04',name:'AFTERPAY',      amt:106, paid:true},
      {id:306,day:'SUN',date:'05/04',name:'RENT',          amt:530, paid:true},
    ]},
    {id:4,wn:13,yr:2026,label:'WEEK 13 (23/03 - 29/03)',sm:2,mon:'2026-03-23',collapsed:true,items:[
      {id:401,day:'THU',date:'26/03',name:'SCOOTER', amt:105, paid:true},
      {id:402,day:'THU',date:'26/03',name:'GYM',     amt:44,  paid:true},
      {id:403,day:'FRI',date:'27/03',name:'AFTERPAY',amt:375, paid:true},
      {id:404,day:'SUN',date:'29/03',name:'RENT',    amt:530, paid:true},
    ]},
    {id:5,wn:12,yr:2026,label:'WEEK 12 (16/03 - 22/03)',sm:2,mon:'2026-03-16',collapsed:true,items:[
      {id:501,day:'SUN',date:'15/03',name:'RÃNA',        amt:330,  paid:true},
      {id:502,day:'MON',date:'16/03',name:'WAGEPAY',      amt:211,  paid:true},
      {id:503,day:'WED',date:'18/03',name:'DIEGO',        amt:215,  paid:true},
      {id:504,day:'WED',date:'18/03',name:'BEFOREPAY 2/4',amt:52.5, paid:true},
      {id:505,day:'WED',date:'18/03',name:'STEPTOPAY',    amt:160,  paid:true},
      {id:506,day:'THU',date:'19/03',name:'SCOOTER',      amt:105,  paid:true},
      {id:507,day:'THU',date:'19/03',name:'PHONE',        amt:59,   paid:true},
      {id:508,day:'FRI',date:'20/03',name:'AFTERPAY',     amt:21.91,paid:true},
      {id:509,day:'SUN',date:'22/03',name:'RENT',         amt:530,  paid:true},
      {id:510,day:'SUN',date:'22/03',name:'BOND',         amt:500,  paid:true},
    ]},
    {id:6,wn:11,yr:2026,label:'WEEK 11 (09/03 - 15/03)',sm:2,mon:'2026-03-09',collapsed:true,items:[
      {id:601,day:'MON',date:'09/03',name:'115 RENT ANNA',amt:115,  paid:true},
      {id:602,day:'MON',date:'09/03',name:'WAGEPAY',      amt:211,  paid:true},
      {id:603,day:'TUE',date:'10/03',name:'TERAPIA',      amt:57,   paid:true},
      {id:604,day:'WED',date:'11/03',name:'AFTERPAY',     amt:220,  paid:true},
      {id:605,day:'WED',date:'11/03',name:'BOND DIEGO',   amt:450,  paid:true},
      {id:606,day:'WED',date:'11/03',name:'BEFOREPAY 1/4',amt:52.5, paid:true},
      {id:607,day:'THU',date:'12/03',name:'GYM',          amt:43.1, paid:true},
      {id:608,day:'SAT',date:'14/03',name:'RENT',         amt:530,  paid:true},
    ]},
    {id:7,wn:10,yr:2026,label:'WEEK 10 (02/03 - 08/03)',sm:2,mon:'2026-03-02',collapsed:true,items:[
      {id:701,day:'FRI',date:'06/03',name:'TERAPIA',amt:57,paid:true},
    ]},
  ];
  REC = [
    {id:'r1',name:'SCOOTER', amt:105,day:'THU',fixed:true, freq:'weekly', cat:'expense',     mday:0, sd:'',active:true,used:0,max:0},
    {id:'r2',name:'GYM',     amt:44, day:'THU',fixed:true, freq:'monthly',cat:'expense',     mday:9, sd:'',active:true,used:0,max:0},
    {id:'r3',name:'RENT',    amt:530,day:'SUN',fixed:true, freq:'weekly', cat:'expense',     mday:0, sd:'',active:true,used:0,max:0},
    {id:'r4',name:'AFTERPAY',amt:0,  day:'FRI',fixed:false,freq:'weekly', cat:'expense',     mday:0, sd:'',active:true,used:0,max:0},
    {id:'s1',name:'WIX',                amt:0,  day:'MON',fixed:false,freq:'monthly',cat:'subscription',mday:1, sd:'',active:true,used:0,max:0},
    {id:'s2',name:'GMAIL',              amt:11, day:'MON',fixed:true, freq:'monthly',cat:'subscription',mday:1, sd:'',active:true,used:0,max:0},
    {id:'s3',name:'GOOGLE DRIVE',       amt:0,  day:'MON',fixed:false,freq:'monthly',cat:'subscription',mday:1, sd:'',active:true,used:0,max:0},
    {id:'s4',name:'ICLOUD',             amt:23, day:'MON',fixed:true, freq:'monthly',cat:'subscription',mday:1, sd:'',active:true,used:0,max:0},
    {id:'s5',name:'SPOTIFY',            amt:0,  day:'MON',fixed:false,freq:'monthly',cat:'subscription',mday:1, sd:'',active:true,used:0,max:0},
    {id:'s6',name:'HABIT TRACKER ANUAL',amt:17, day:'MON',fixed:true, freq:'yearly', cat:'subscription',mday:0, sd:'2026-11-17',active:true,used:0,max:0},
    {id:'s7',name:'MEDIA (TRI)',        amt:0,  day:'MON',fixed:false,freq:'monthly',cat:'subscription',mday:1, sd:'',active:true,used:0,max:0},
    {id:'s8',name:'GYM APP',            amt:30, day:'MON',fixed:true, freq:'monthly',cat:'subscription',mday:12,sd:'',active:true,used:0,max:0},
  ];
  DEBTS = [];
  INV   = [];
}

// ── PERSIST ───────────────────────────────────────────────────────────────────
function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      weeks: WEEKS, rec: REC, debts: DEBTS, inv: INV,
      year: VIEW_YEAR, theme: THEME_OV
    }));
  } catch(e) {}
  render();
}

function loadData() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { loadSeed(); save(); return; }
    var d = JSON.parse(raw);
    if (!d || !d.weeks || !d.weeks.length) { loadSeed(); save(); return; }
    WEEKS = d.weeks;
    REC   = d.rec   || [];
    DEBTS = d.debts || [];
    INV   = d.inv   || [];
    VIEW_YEAR = d.year  || 2026;
    THEME_OV  = d.theme || null;
  } catch(e) {
    loadSeed(); save();
  }
}

// ── RENDER HELPERS ────────────────────────────────────────────────────────────
function div(cls, css) {
  var e = document.createElement('div');
  if (cls) e.className = cls;
  if (css) Object.assign(e.style, css);
  return e;
}
function btn(text, cls, css, onclick) {
  var e = document.createElement('button');
  e.className = cls || '';
  if (css) Object.assign(e.style, css);
  if (typeof text === 'string') e.textContent = text;
  else if (text instanceof Node) e.appendChild(text);
  e.addEventListener('click', onclick);
  return e;
}
function span(text, css) {
  var e = document.createElement('span');
  e.textContent = text;
  if (css) Object.assign(e.style, css);
  return e;
}
function inp(ph, val, type, css) {
  var e = document.createElement('input');
  e.className = 'inp';
  e.placeholder = ph || '';
  e.value = val || '';
  e.type = type || 'text';
  e.style.background = C.inBg;
  e.style.borderColor = C.b2;
  e.style.color = C.tx;
  if (css) Object.assign(e.style, css);
  return e;
}
function sel(opts, val, css) {
  var e = document.createElement('select');
  e.className = 'inp';
  e.style.background = C.inBg;
  e.style.borderColor = C.b2;
  e.style.color = C.tx;
  if (css) Object.assign(e.style, css);
  opts.forEach(function(o) {
    var op = document.createElement('option');
    op.value = o[0]; op.textContent = o[1];
    if (String(o[0]) === String(val)) op.selected = true;
    e.appendChild(op);
  });
  return e;
}
function fld(label, child) {
  var w = div('fld');
  var l = document.createElement('span');
  l.className = 'fld-lbl';
  l.textContent = label;
  l.style.color = C.txm;
  w.appendChild(l);
  w.appendChild(child);
  return w;
}
function svgIcon(paths, sz, col) {
  sz = sz || 16; col = col || 'currentColor';
  var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('width', sz); s.setAttribute('height', sz);
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
  s.setAttribute('stroke', col); s.setAttribute('stroke-width', '2');
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  s.style.cssText = 'flex-shrink:0;display:inline-block;vertical-align:middle;';
  paths.split('|').forEach(function(d) {
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d); s.appendChild(p);
  });
  return s;
}
var ICONS = {
  Plus:'M12 5v14M5 12h14', X:'M18 6 6 18M6 6l12 12',
  Dn:'m6 9 6 6 6-6', Rt:'m9 18 6-6-6-6', Lt:'m15 18-6-6 6-6',
  Ok:'M20 6 9 17l-5-5',
  Sun:'M12 3v1m0 16v1m9-9h-1M4 12H3m15.36-6.36-.71.71M6.34 17.66l-.71.71M17.66 17.66l.71.71M6.34 6.34l-.71-.71M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z',
  Moon:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  Sync:'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 3v5h5m13 3a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16m18 5v-5h-5',
  Trend:'m23 6-9.5 9.5-5-5L1 18',
  Edit:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7|M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  Tv:'M2 7h20v15H2z|M17 22v2|M7 22v2|M2 17h20',
  Del:'M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z|M18 9l-6 6|M12 9l6 6',
  Lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z|M7 11V7a5 5 0 0 1 10 0v4',
};
function I(n, sz, col) { return svgIcon(ICONS[n] || 'M0 0', sz, col); }

function overlay(content, small) {
  var ov = div('overlay');
  ov.addEventListener('click', function() { MODAL=null; EDIT_ITEM=null; EDIT_REC=null; EDIT_DBT=null; EDIT_INV=null; render(); });
  var box = div((small ? 'modal-sm' : 'modal') + ' fadein');
  box.style.background = C.sf;
  box.style.borderColor = C.b2;
  box.addEventListener('click', function(e) { e.stopPropagation(); });
  box.appendChild(content);
  ov.appendChild(box);
  return ov;
}
function mhdr(title, closeFn) {
  var w = div('modal-hdr');
  var t = span(title, {color: C.tx, fontWeight:'700', fontSize:'16px'});
  var b = btn(I('X',18,C.txl), '', {background:'none',border:'none',color:C.txl,display:'flex'}, closeFn);
  w.appendChild(t); w.appendChild(b);
  return w;
}

// ── PIN ───────────────────────────────────────────────────────────────────────
function renderPin() {
  var root = document.getElementById('root');
  root.innerHTML = '';
  var scr = div('screen', {background: C.bg, color: C.tx});

  var title = document.createElement('h2');
  title.textContent = 'Enter PIN';
  title.style.cssText = 'font-size:26px;font-weight:800;margin-bottom:36px;';

  var dotsWrap = div('pin-dots');
  var dots = [];
  for (var i = 0; i < 4; i++) {
    var d = div('pin-dot', {borderColor: C.b2});
    dotsWrap.appendChild(d);
    dots.push(d);
  }

  var entered = '';
  function updateDots() {
    dots.forEach(function(d, i) {
      d.style.background = entered.length > i ? C.ac : 'none';
    });
  }
  function press(k) {
    if (entered.length >= 4) return;
    entered += k;
    updateDots();
    if (entered.length === 4) {
      if (entered === PIN) {
        setTimeout(function() { UNLOCKED = true; render(); }, 200);
      } else {
        dotsWrap.classList.add('shake');
        setTimeout(function() { entered = ''; updateDots(); dotsWrap.classList.remove('shake'); }, 600);
      }
    }
  }

  var grid = div('pin-grid');
  [1,2,3,4,5,6,7,8,9,'',0,'←'].forEach(function(k) {
    if (k === '') { grid.appendChild(div('')); return; }
    if (k === '←') {
      var b = div('pin-del', {color: C.txm, cursor:'pointer'});
      b.textContent = '←';
      b.style.cssText = 'height:72px;border-radius:50%;border:none;background:none;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;color:'+C.txm;
      b.addEventListener('click', function() { entered = entered.slice(0,-1); updateDots(); });
      grid.appendChild(b);
      return;
    }
    var b = document.createElement('button');
    b.className = 'pin-key';
    b.textContent = String(k);
    b.style.borderColor = C.b2;
    b.style.color = C.tx;
    b.style.background = C.sf;
    b.addEventListener('click', function() { press(String(k)); });
    grid.appendChild(b);
  });

  var lbl = span('FINANCES', {fontSize:'10px',color:C.txl,fontWeight:'700',letterSpacing:'3px',marginBottom:'8px',display:'block'});
  scr.appendChild(lbl);
  scr.appendChild(title);
  scr.appendChild(dotsWrap);
  scr.appendChild(grid);
  root.appendChild(scr);
}

// ── MAIN RENDER ───────────────────────────────────────────────────────────────
function render() {
  if (!UNLOCKED) { renderPin(); return; }

  var root = document.getElementById('root');
  root.innerHTML = '';

  var app = div('app', {background: C.bg, color: C.tx});

  // HEADER
  var hdr = div('hdr', {background: C.bg, borderBottom: '1px solid '+C.b});
  var hl = div('', {});
  var hlbl = span('FINANCES', {fontSize:'10px',color:C.txl,fontWeight:'700',letterSpacing:'3px',display:'block',marginBottom:'3px'});
  var hyr = div('hdr-yr');
  var prevBtn = document.createElement('button');
  prevBtn.className = 'ibtn';
  prevBtn.style.cssText = 'border-color:'+C.b2+';color:'+C.txm+';width:26px;height:26px;border-radius:6px;';
  prevBtn.appendChild(I('Lt',13,C.txm));
  prevBtn.addEventListener('click', function() { VIEW_YEAR--; save(); });
  var yrSpan = document.createElement('h1');
  yrSpan.textContent = VIEW_YEAR;
  yrSpan.style.cssText = 'font-size:21px;font-weight:800;';
  var nextBtn = document.createElement('button');
  nextBtn.className = 'ibtn';
  nextBtn.style.cssText = 'border-color:'+C.b2+';color:'+C.txm+';width:26px;height:26px;border-radius:6px;';
  nextBtn.appendChild(I('Rt',13,C.txm));
  nextBtn.addEventListener('click', function() { VIEW_YEAR++; save(); });
  hyr.appendChild(prevBtn); hyr.appendChild(yrSpan); hyr.appendChild(nextBtn);
  hl.appendChild(hlbl); hl.appendChild(hyr);

  var hr = div('hdr-r');
  var thBtn = document.createElement('button');
  thBtn.className = 'ibtn';
  thBtn.style.borderColor = C.b2;
  thBtn.appendChild(I(C === DARK ? 'Sun' : 'Moon', 15, C.txm));
  thBtn.addEventListener('click', function() {
    THEME_OV = THEME_OV === 'dark' ? 'lite' : 'dark';
    C = THEME_OV === 'lite' ? {bg:'#f4efe6',sf:'#ffffff',sf2:'#faf6f0',b:'#e2d9cc',b2:'#d5cab8',tx:'#191208',txm:'#786347',txl:'#b09870',ac:'#c97b2a',acBg:'#fff8ee',acBo:'#c97b2a55',tabAc:'#ffffff',inBg:'#faf6f0',red:'#c0392b',grn:'#1a7a40',prog:'#e2d9cc',sub:'#5b4fc5'} : {bg:'#0c0c0c',sf:'#131313',sf2:'#0f0f0f',b:'#222',b2:'#2a2a2a',tx:'#efefef',txm:'#848484',txl:'#363636',ac:'#c97b2a',acBg:'#130f00',acBo:'#c97b2a44',tabAc:'#1f1f1f',inBg:'#181818',red:'#e05555',grn:'#4ade80',prog:'#1d1d1d',sub:'#7c6af0'};
    save();
  });
  var lockBtn = document.createElement('button');
  lockBtn.className = 'ibtn';
  lockBtn.style.borderColor = C.b2;
  lockBtn.appendChild(I('Lock',15,C.txm));
  lockBtn.addEventListener('click', function() { UNLOCKED = false; renderPin(); });
  hr.appendChild(thBtn); hr.appendChild(lockBtn);
  hdr.appendChild(hl); hdr.appendChild(hr);
  app.appendChild(hdr);

  // TABS
  var tabBar = div('tabs', {borderColor: C.b});
  [['weeks','WEEKS'],['debts','DEBTS'],['investments','INVESTMENTS'],['subs','SUBSCRIPTIONS']].forEach(function(p) {
    var tb = document.createElement('button');
    tb.className = 'tab';
    tb.textContent = p[1];
    tb.style.color = TAB === p[0] ? C.ac : C.txm;
    tb.style.background = TAB === p[0] ? C.tabAc : 'none';
    tb.addEventListener('click', function() { TAB = p[0]; render(); });
    tabBar.appendChild(tb);
  });
  app.appendChild(tabBar);

  var body = div('body');

  if (TAB === 'weeks') renderWeeks(body);
  else if (TAB === 'debts') renderDebts(body);
  else if (TAB === 'investments') renderInvestments(body);
  else if (TAB === 'subs') renderSubs(body);

  app.appendChild(body);
  root.appendChild(app);

  // MODALS
  if (MODAL === 'rec')      root.appendChild(renderRecModal());
  if (MODAL === 'debt')     root.appendChild(renderDebtModal());
  if (MODAL === 'inv')      root.appendChild(renderInvModal());
  if (MODAL === 'editItem' && EDIT_ITEM) root.appendChild(renderEditModal());
}

// ── WEEKS TAB ────────────────────────────────────────────────────────────────
function renderWeeks(body) {
  var toolbar = div('toolbar');
  var nwBtn = document.createElement('button');
  nwBtn.className = 'btn-p';
  nwBtn.appendChild(I('Plus',14,'#fff'));
  nwBtn.appendChild(document.createTextNode(' Next Week'));
  nwBtn.addEventListener('click', addNextWeek);
  var recBtn = document.createElement('button');
  recBtn.className = 'btn-g';
  recBtn.style.borderColor = C.b2; recBtn.style.color = C.txm;
  recBtn.appendChild(I('Sync',13,C.txm));
  recBtn.appendChild(document.createTextNode(' Recurring'));
  recBtn.addEventListener('click', function() { MODAL = 'rec'; EDIT_REC = null; render(); });
  toolbar.appendChild(nwBtn); toolbar.appendChild(recBtn);
  body.appendChild(toolbar);

  var grouped = {};
  WEEKS.filter(function(w) { return w.yr === VIEW_YEAR; }).forEach(function(w) {
    var m = w.sm || 0;
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(w);
  });
  var months = Object.keys(grouped).map(Number).sort(function(a,b){return b-a;});

  if (!months.length) {
    var emp = div('empty', {color: C.txl});
    emp.textContent = 'No weeks for ' + VIEW_YEAR + '. Click "Next Week".';
    body.appendChild(emp);
    return;
  }

  months.forEach(function(m) {
    var mhd = div('m-hdr', {color: C.txm, borderColor: C.b});
    mhd.textContent = MONTHS[m];
    body.appendChild(mhd);

    grouped[m].slice().sort(function(a,b){return b.wn-a.wn;}).forEach(function(wk) {
      body.appendChild(buildWeek(wk));
    });
  });
}

function buildWeek(wk) {
  var total = wk.items.reduce(function(s,i){return s+i.amt;},0);
  var paid  = wk.items.filter(function(i){return i.paid;});
  var done  = wk.items.length > 0 && paid.length === wk.items.length;
  var pct   = wk.items.length ? (paid.length / wk.items.length) * 100 : 0;

  var wrap = div('w-wrap');
  var hdr = div('w-hdr', {
    background: done ? C.acBg : C.sf,
    borderColor: done ? C.acBo : C.b,
    borderRadius: wk.collapsed ? '12px' : '12px 12px 0 0'
  });
  hdr.appendChild(svgIcon(wk.collapsed ? ICONS.Rt : ICONS.Dn, 14, C.txl));
  var wlbl = span(wk.label, {fontWeight:'800',fontSize:'13px',flex:'1',color: done ? C.ac : C.tx, marginLeft:'4px'});
  hdr.appendChild(wlbl);
  if (done) {
    hdr.appendChild(span('✓ DONE', {fontSize:'11px',color:C.ac,fontWeight:'700',letterSpacing:'1.5px'}));
  } else if (wk.items.length) {
    hdr.appendChild(span(paid.length+'/'+wk.items.length, {fontSize:'12px',color:C.txm}));
  }
  if (total) hdr.appendChild(span(String(total), {fontFamily:'DM Mono,monospace',fontSize:'13px',color:done?C.ac:C.txm,marginLeft:'4px'}));

  var delW = document.createElement('button');
  delW.style.cssText = 'background:none;border:none;color:'+C.txl+';padding:2px 4px;margin-left:2px;display:flex;cursor:pointer;';
  delW.appendChild(I('X',13,C.txl));
  delW.addEventListener('click', function(e) { e.stopPropagation(); WEEKS = WEEKS.filter(function(x){return x.id!==wk.id;}); save(); });
  hdr.appendChild(delW);

  hdr.addEventListener('click', function() {
    WEEKS.forEach(function(w){if(w.id===wk.id)w.collapsed=!w.collapsed;});
    render();
  });
  wrap.appendChild(hdr);

  if (!wk.collapsed) {
    var wb = div('w-body', {background: C.sf2, borderColor: C.b});
    if (wk.items.length) {
      var bar = div('w-bar', {background: C.prog});
      var fill = div('w-bar-fill', {width: pct+'%'});
      bar.appendChild(fill); wb.appendChild(bar);
    }
    wk.items.forEach(function(item) {
      wb.appendChild(buildItem(wk, item));
    });

    // Add form
    if (ADDING_TO === wk.id) {
      wb.appendChild(buildAddForm(wk));
    } else {
      var addBtn = document.createElement('button');
      addBtn.className = 'ghost-add';
      addBtn.style.color = C.txl;
      addBtn.appendChild(I('Plus',13,'currentColor'));
      addBtn.appendChild(document.createTextNode(' add entry'));
      addBtn.addEventListener('mouseenter', function(){addBtn.style.color=C.ac;});
      addBtn.addEventListener('mouseleave', function(){addBtn.style.color=C.txl;});
      addBtn.addEventListener('click', function() { ADDING_TO = wk.id; render(); });
      wb.appendChild(addBtn);
    }

    if (wk.items.length) {
      var foot = div('w-foot', {borderColor: C.b});
      foot.appendChild(span(paid.length+' of '+wk.items.length+' paid', {fontSize:'11px',color:C.txl}));
      foot.appendChild(span('TOTAL = '+total, {fontFamily:'DM Mono,monospace',fontWeight:'700',fontSize:'13px',color:C.ac,letterSpacing:'1px'}));
      wb.appendChild(foot);
    }
    wrap.appendChild(wb);
  }
  return wrap;
}

function buildItem(wk, item) {
  var vk = wk.id+'_'+item.id;
  var row = div('irow' + (item.paid ? ' paid' : ''), {borderColor: C.b});

  var cb = document.createElement('button');
  cb.className = 'cb' + (item.paid ? ' on' : '');
  cb.style.borderColor = C.b2;
  if (item.paid) cb.appendChild(I('Ok',11,'#fff'));
  cb.addEventListener('click', function() {
    item.paid = !item.paid;
    save();
  });
  row.appendChild(cb);

  var isSub = false;
  var isRec = false;
  if (item.rid) {
    var r = REC.find(function(r){return r.id===item.rid;});
    if (r) { isSub = r.cat==='subscription'; isRec = true; }
  }
  if (isSub) row.appendChild(I('Tv',9,C.sub));
  else if (isRec) row.appendChild(I('Sync',9,C.ac));
  else { var sp = document.createElement('span'); sp.style.width='0'; row.appendChild(sp); }

  row.appendChild(span(item.day, {fontSize:'10px',color:C.txl,fontWeight:'700',width:'28px',flexShrink:'0'}));

  var dateEl = span(item.date, {fontSize:'11px',color:C.txm,width:'38px',flexShrink:'0',borderBottom:'1px solid '+C.b,cursor:'pointer',textDecoration:'underline dotted'});
  dateEl.addEventListener('click', function() { EDIT_ITEM = item; MODAL = 'editItem'; render(); });
  row.appendChild(dateEl);

  row.appendChild(span(item.name, {flex:'1',fontWeight:'600',fontSize:'14px',color:isSub?C.sub:C.tx}));

  var r2 = item.rid ? REC.find(function(r){return r.id===item.rid;}) : null;
  if (r2 && !r2.fixed && !item.paid) {
    var vw = div('', {display:'flex',alignItems:'center',gap:'5px'});
    vw.appendChild(span('=', {fontFamily:'DM Mono,monospace',fontSize:'13px',color:C.txl}));
    var vi = document.createElement('input');
    vi.className = 'inp-sm';
    vi.type = 'number'; vi.placeholder = '—';
    vi.style.background = C.inBg; vi.style.color = C.tx;
    vi.value = VAR_VALS[vk] !== undefined ? VAR_VALS[vk] : (item.amt || '');
    vi.addEventListener('input', function() { VAR_VALS[vk] = vi.value; });
    vi.addEventListener('blur', function() {
      var v = parseFloat(VAR_VALS[vk]);
      if (!isNaN(v)) { item.amt = v; delete VAR_VALS[vk]; save(); }
    });
    vi.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { var v = parseFloat(vi.value); if (!isNaN(v)) { item.amt = v; save(); } }
    });
    vw.appendChild(vi); row.appendChild(vw);
  } else {
    row.appendChild(span('= '+(item.amt||'–'), {fontFamily:'DM Mono,monospace',fontSize:'14px',fontWeight:'500',color:item.paid?C.txl:C.tx}));
  }

  var editBtn = document.createElement('button');
  editBtn.style.cssText = 'background:none;border:none;color:'+C.txm+';padding:3px;display:flex;opacity:.5;cursor:pointer;';
  editBtn.appendChild(I('Edit',12,C.txm));
  editBtn.addEventListener('click', function() { EDIT_ITEM = item; MODAL = 'editItem'; render(); });
  row.appendChild(editBtn);

  var delBtn = document.createElement('button');
  delBtn.className = 'del-btn';
  delBtn.style.color = C.txl;
  delBtn.appendChild(I('X',12,C.txl));
  delBtn.addEventListener('click', function() {
    wk.items = wk.items.filter(function(i){return i.id!==item.id;});
    save();
  });
  row.appendChild(delBtn);
  return row;
}

function buildAddForm(wk) {
  var af = div('add-form');
  var localDay = 'MON', localName = '', localAmt = '';

  var hint = span('→ '+dayDate('MON', new Date(wk.mon)), {fontSize:'10px',color:C.ac,marginBottom:'2px',display:'block'});
  var grid = div('add-grid');

  var dSel = sel(DAYS.map(function(d){return[d,d];}), 'MON');
  dSel.addEventListener('change', function() {
    localDay = dSel.value;
    hint.textContent = '→ ' + dayDate(localDay, new Date(wk.mon));
  });

  var nInp = inp('NAME', '', 'text');
  nInp.addEventListener('input', function() {
    localName = nInp.value.toUpperCase();
    nInp.value = localName;
  });

  var aInp = inp('Amount', '', 'number');
  aInp.addEventListener('input', function() { localAmt = aInp.value; });
  aInp.addEventListener('keydown', function(e) { if (e.key === 'Enter') doAdd(); });

  grid.appendChild(dSel); grid.appendChild(nInp); grid.appendChild(aInp);
  af.appendChild(hint); af.appendChild(grid);

  var acts = div('', {display:'flex',gap:'8px'});
  var addB = document.createElement('button');
  addB.className = 'btn-p'; addB.textContent = 'Add';
  addB.addEventListener('click', doAdd);
  var canB = document.createElement('button');
  canB.className = 'btn-g'; canB.textContent = 'Cancel';
  canB.style.borderColor = C.b2; canB.style.color = C.txm;
  canB.addEventListener('click', function() { ADDING_TO = null; render(); });
  acts.appendChild(addB); acts.appendChild(canB);
  af.appendChild(acts);

  function doAdd() {
    if (!localName || !localAmt) return;
    wk.items = srt(wk.items.concat([{
      id: Date.now(), day: localDay,
      date: dayDate(localDay, new Date(wk.mon)),
      name: localName, amt: parseFloat(localAmt)||0, paid: false, rid: null
    }]));
    ADDING_TO = null; save();
  }
  return af;
}

// ── DEBTS TAB ────────────────────────────────────────────────────────────────
function renderDebts(body) {
  var tot = DEBTS.reduce(function(s,d){return s+(d.total-d.paid);},0);
  var th = div('totals-hdr');
  var tl = div('');
  tl.appendChild(span('TOTAL OUTSTANDING',{fontSize:'10px',fontWeight:'700',letterSpacing:'2px',color:C.txl,display:'block',marginBottom:'3px'}));
  tl.appendChild(span('$ '+tot.toLocaleString(),{fontFamily:'DM Mono,monospace',fontSize:'26px',fontWeight:'500',color:C.red}));
  var ab = document.createElement('button');
  ab.className = 'btn-p';
  ab.appendChild(I('Plus',14,'#fff')); ab.appendChild(document.createTextNode(' Add Debt'));
  ab.addEventListener('click', function(){MODAL='debt';EDIT_DBT=null;render();});
  th.appendChild(tl); th.appendChild(ab); body.appendChild(th);

  if (!DEBTS.length) { var e=div('empty',{color:C.txl}); e.textContent='No active debts 🎉'; body.appendChild(e); return; }

  DEBTS.forEach(function(d) {
    var rem = d.total-d.paid, pct = Math.min((d.paid/d.total)*100,100), done = rem<=0;
    var card = div('card', {background:done?C.acBg:C.sf, borderColor:done?C.acBo:C.b});

    var top = div('',{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'});
    var tl2 = div('');
    var nrow = div('',{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'});
    nrow.appendChild(span(d.name,{fontWeight:'700',fontSize:'15px'}));
    if (done) { var b=div('badge',{color:'#4ade80',background:'#0d2210',borderColor:'#4ade8033'}); b.textContent='✓ PAID OFF'; nrow.appendChild(b); }
    tl2.appendChild(nrow);
    if (d.note) tl2.appendChild(span(d.note,{fontSize:'12px',color:C.txm,marginTop:'2px',display:'block'}));
    var brow = div('',{display:'flex',gap:'6px'});
    var eb=document.createElement('button'); eb.className='btn-g'; eb.style.cssText='padding:5px 9px;border-color:'+C.b2+';color:'+C.txm; eb.appendChild(I('Edit',12,C.txm));
    eb.addEventListener('click',function(){EDIT_DBT=d;MODAL='debt';render();});
    var xb=document.createElement('button'); xb.className='btn-g'; xb.style.cssText='padding:5px 9px;border-color:'+C.b2+';color:'+C.txm; xb.appendChild(I('X',12,C.txm));
    xb.addEventListener('click',function(){DEBTS=DEBTS.filter(function(x){return x.id!==d.id;});save();});
    brow.appendChild(eb); brow.appendChild(xb);
    top.appendChild(tl2); top.appendChild(brow); card.appendChild(top);

    var mg = div('mini-grid');
    [['Total',d.total,C.tx],['Paid',d.paid,C.grn],['Remaining',rem,done?C.grn:C.red]].forEach(function(r){
      var mc=div('mini-cell',{background:C.sf2});
      mc.appendChild(span(r[0],{fontSize:'10px',color:C.txl,fontWeight:'700',letterSpacing:'1px',display:'block',marginBottom:'3px'}));
      mc.appendChild(span(String(r[1]),{fontFamily:'DM Mono,monospace',fontSize:'15px',fontWeight:'500',color:r[2]}));
      mg.appendChild(mc);
    });
    card.appendChild(mg);
    var pt=div('prog-track',{background:C.prog}); var pf=div('prog-fill',{width:pct+'%',background:C.grn}); pt.appendChild(pf); card.appendChild(pt);
    var bot=div('',{display:'flex',justifyContent:'space-between',fontSize:'12px',color:C.txl});
    bot.appendChild(span(pct.toFixed(0)+'% paid'));
    if(d.installment>0&&!done) bot.appendChild(span('~'+Math.ceil(rem/d.installment)+' left'));
    card.appendChild(bot);
    body.appendChild(card);
  });
}

// ── INVESTMENTS TAB ──────────────────────────────────────────────────────────
function renderInvestments(body) {
  var tI=INV.reduce(function(s,i){return s+i.contributed;},0);
  var tV=INV.reduce(function(s,i){return s+i.currentValue;},0);
  var tR=tV-tI;
  var th=div('',{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',flexWrap:'wrap',gap:'10px'});
  var tp=div('totals-pair');
  var tld=div(''); tld.appendChild(span('INVESTED',{fontSize:'10px',fontWeight:'700',letterSpacing:'2px',color:C.txl,display:'block',marginBottom:'3px'})); tld.appendChild(span('$ '+tI.toLocaleString(),{fontFamily:'DM Mono,monospace',fontSize:'20px',fontWeight:'500'}));
  var trd=div(''); trd.appendChild(span('RETURN',{fontSize:'10px',fontWeight:'700',letterSpacing:'2px',color:C.txl,display:'block',marginBottom:'3px'})); trd.appendChild(span((tR>=0?'+':'')+tR.toFixed(0),{fontFamily:'DM Mono,monospace',fontSize:'20px',fontWeight:'500',color:tR>=0?C.grn:C.red}));
  tp.appendChild(tld); tp.appendChild(trd);
  var ab=document.createElement('button'); ab.className='btn-p'; ab.appendChild(I('Plus',14,'#fff')); ab.appendChild(document.createTextNode(' Add'));
  ab.addEventListener('click',function(){MODAL='inv';EDIT_INV=null;render();});
  th.appendChild(tp); th.appendChild(ab); body.appendChild(th);

  if(!INV.length){var e=div('empty',{color:C.txl});e.textContent='No investments yet';body.appendChild(e);return;}
  INV.forEach(function(x){
    var ret=x.currentValue-x.contributed,rp=x.contributed?((ret/x.contributed)*100).toFixed(2):'0';
    var card=div('card',{background:C.sf,borderColor:C.b});
    var top=div('',{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'});
    var il=div('',{display:'flex',alignItems:'center',gap:'8px'});
    var ic=div('',{background:C.acBg,border:'1px solid '+C.acBo,borderRadius:'8px',padding:'6px 8px',display:'flex'});
    ic.appendChild(I('Trend',15,C.ac)); il.appendChild(ic);
    var info=div(''); info.appendChild(span(x.name,{fontWeight:'700',fontSize:'15px',display:'block'}));
    if(x.note)info.appendChild(span(x.note,{fontSize:'12px',color:C.txm,display:'block'}));
    il.appendChild(info);
    var brow=div('',{display:'flex',gap:'6px'});
    var eb=document.createElement('button');eb.className='btn-g';eb.style.cssText='padding:5px 9px;border-color:'+C.b2+';color:'+C.txm;eb.appendChild(I('Edit',12,C.txm));
    eb.addEventListener('click',function(){EDIT_INV=x;MODAL='inv';render();});
    var xb=document.createElement('button');xb.className='btn-g';xb.style.cssText='padding:5px 9px;border-color:'+C.b2+';color:'+C.txm;xb.appendChild(I('X',12,C.txm));
    xb.addEventListener('click',function(){INV=INV.filter(function(i){return i.id!==x.id;});save();});
    brow.appendChild(eb);brow.appendChild(xb);top.appendChild(il);top.appendChild(brow);card.appendChild(top);
    var mg=div('mini-grid');
    [['Invested','$ '+x.contributed,''],['Current','$ '+x.currentValue,C.grn],['Return',(ret>=0?'+':'')+ret.toFixed(0)+' ('+rp+'%)',ret>=0?C.grn:C.red]].forEach(function(r){
      var mc=div('mini-cell',{background:C.sf2});
      mc.appendChild(span(r[0],{fontSize:'10px',color:C.txl,fontWeight:'700',letterSpacing:'1px',display:'block',marginBottom:'3px'}));
      mc.appendChild(span(r[1],{fontFamily:'DM Mono,monospace',fontSize:'13px',fontWeight:'500',color:r[2]||C.tx}));
      mg.appendChild(mc);
    });
    card.appendChild(mg);body.appendChild(card);
  });
}

// ── SUBSCRIPTIONS TAB ────────────────────────────────────────────────────────
function renderSubs(body) {
  var subs=REC.filter(function(r){return r.cat==='subscription';});
  var mc=subs.filter(function(r){return r.active;}).reduce(function(s,r){
    var m=r.freq==='weekly'?4:r.freq==='fortnightly'?2:r.freq==='yearly'?1/12:1;
    return s+r.amt*m;
  },0);
  var th=div('totals-hdr');
  var tl=div(''); tl.appendChild(span('MONTHLY COST',{fontSize:'10px',fontWeight:'700',letterSpacing:'2px',color:C.txl,display:'block',marginBottom:'3px'})); tl.appendChild(span('$ '+mc.toFixed(0),{fontFamily:'DM Mono,monospace',fontSize:'26px',fontWeight:'500',color:C.sub}));
  var ab=document.createElement('button');ab.className='btn-p';ab.appendChild(I('Plus',14,'#fff'));ab.appendChild(document.createTextNode(' Add'));
  ab.addEventListener('click',function(){MODAL='rec';EDIT_REC=null;render();});
  th.appendChild(tl);th.appendChild(ab);body.appendChild(th);
  if(!subs.length){var e=div('empty',{color:C.txl});e.textContent='No subscriptions yet.';body.appendChild(e);return;}
  subs.forEach(function(r){
    var sc=div('sub-card',{background:C.sf,borderColor:C.b});
    var ic=div('',{width:'40px',height:'40px',borderRadius:'10px',background:C.sub+'22',border:'1px solid '+C.sub+'44',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:'0'});
    ic.appendChild(I('Tv',18,C.sub));
    var inf=div('',{flex:'1'});
    inf.appendChild(span(r.name,{fontWeight:'700',fontSize:'15px',display:'block'}));
    inf.appendChild(span(FL[r.freq||'monthly'],{fontSize:'12px',color:C.txm}));
    var brow=div('',{display:'flex',gap:'6px'});
    var eb=document.createElement('button');eb.className='btn-g';eb.style.cssText='padding:5px 9px;border-color:'+C.b2+';color:'+C.txm;eb.appendChild(I('Edit',12,C.txm));
    eb.addEventListener('click',function(){EDIT_REC=r;MODAL='rec';render();});
    var tb=document.createElement('button');tb.className='btn-g';tb.style.cssText='padding:5px 9px;border-color:'+C.b2+';color:'+C.txm;tb.textContent=r.active?'⏸':'▶';
    tb.addEventListener('click',function(){r.active=!r.active;save();});
    brow.appendChild(eb);brow.appendChild(tb);
    sc.appendChild(ic);sc.appendChild(inf);sc.appendChild(span('$ '+r.amt,{fontFamily:'DM Mono,monospace',fontSize:'16px',fontWeight:'500',color:r.active?C.sub:C.txl}));sc.appendChild(brow);
    body.appendChild(sc);
  });
}

// ── RECURRING MODAL (CURSOR-SAFE) ────────────────────────────────────────────
function renderRecModal() {
  var ex = EDIT_REC;
  var F = {
    name: ex?ex.name:'', amt: ex?String(ex.amt||''):'',
    day: ex?ex.day:'MON', fixed: ex?ex.fixed!==false:true,
    maxT: ex&&ex.max?String(ex.max):'', freq: ex?ex.freq||'weekly':'weekly',
    cat: ex?ex.cat||'expense':'expense', mday: ex&&ex.mday?ex.mday:1,
    sd: ex&&ex.sd?ex.sd:'', link: ex&&ex.link?ex.link:''
  };
  var close = function(){MODAL=null;EDIT_REC=null;render();};
  var wrap = div('');
  wrap.appendChild(mhdr('Recurring',close));

  // List existing
  if (!EDIT_REC) {
    var expenses = REC.filter(function(r){return r.cat!=='subscription';});
    var subs = REC.filter(function(r){return r.cat==='subscription';});
    function makeChip(r){
      var chip=div('rec-chip',{background:C.sf2,borderColor:C.b});
      var info=div('',{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'});
      info.appendChild(span('●',{color:r.active?C.ac:C.txl,fontSize:'10px'}));
      if(r.cat==='subscription')info.appendChild(I('Tv',10,C.sub));
      info.appendChild(span(r.name,{color:C.tx}));
      info.appendChild(span(FL[r.freq||'weekly']+(r.fixed?' · $'+r.amt:' · var'),{color:C.txm,fontSize:'11px'}));
      var brow=div('',{display:'flex',gap:'4px'});
      var eb=document.createElement('button');eb.style.cssText='background:none;border:none;color:'+C.txm+';padding:2px;display:flex;cursor:pointer;';eb.appendChild(I('Edit',11,C.txm));
      eb.addEventListener('click',function(){EDIT_REC=r;render();});
      var xb=document.createElement('button');xb.style.cssText='background:none;border:none;color:'+C.txl+';padding:2px;display:flex;cursor:pointer;';xb.appendChild(I('X',11,C.txl));
      xb.addEventListener('click',function(){REC=REC.filter(function(x){return x.id!==r.id;});save();render();});
      brow.appendChild(eb);brow.appendChild(xb);chip.appendChild(info);chip.appendChild(brow);
      return chip;
    }
    if(expenses.length){var el2=div('',{marginBottom:'10px',maxHeight:'130px',overflowY:'auto'});expenses.forEach(function(r){el2.appendChild(makeChip(r));});wrap.appendChild(el2);}
    if(subs.length){
      var shdr=div('',{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px',cursor:'pointer'});
      var stitle=div('',{display:'flex',alignItems:'center',gap:'6px'});stitle.appendChild(I('Tv',12,C.sub));stitle.appendChild(span('SUBSCRIPTIONS ('+subs.length+')',{fontSize:'12px',fontWeight:'700',color:C.sub}));
      var stgl=span(SUBS_OPEN?'▼ Hide':'▶ Show',{fontSize:'11px',color:C.txm,fontWeight:'600'});
      shdr.appendChild(stitle);shdr.appendChild(stgl);
      var slist=div('',{marginBottom:'10px',maxHeight:'130px',overflowY:'auto'});
      subs.forEach(function(r){slist.appendChild(makeChip(r));});
      slist.style.display=SUBS_OPEN?'':'none';
      shdr.addEventListener('click',function(){SUBS_OPEN=!SUBS_OPEN;slist.style.display=SUBS_OPEN?'':'none';stgl.textContent=SUBS_OPEN?'▼ Hide':'▶ Show';});
      wrap.appendChild(shdr);wrap.appendChild(slist);
    }
  }

  var form = div('',{borderTop:EDIT_REC?'none':'1px solid '+C.b,paddingTop:EDIT_REC?'0':'14px'});
  form.appendChild(span(EDIT_REC?'Edit':'New Recurring',{fontWeight:'700',fontSize:'13px',color:C.tx,display:'block',marginBottom:'12px'}));

  // NAME — cursor safe
  var nInp = inp('RENT, SCOOTER...', F.name);
  nInp.addEventListener('input',function(){F.name=nInp.value.toUpperCase();nInp.value=F.name;});
  form.appendChild(fld('NAME',nInp));

  // CATEGORY
  function makeSeg2(opts,getV,setV,after){
    var w=div('seg',{borderColor:C.b2}),btns={};
    function upd(){Object.keys(btns).forEach(function(v){var on=String(getV())===String(v);btns[v].className='seg-btn'+(on?' on':'');btns[v].style.color=on?'#fff':C.txm;btns[v].style.background=on?C.ac:'none';});}
    opts.forEach(function(o){var v=o[0],l=o[1],on=String(getV())===String(v);var b=document.createElement('button');b.className='seg-btn'+(on?' on':'');b.style.color=on?'#fff':C.txm;b.style.background=on?C.ac:'none';b.textContent=l;b.addEventListener('click',function(){setV(v);upd();if(after)after();});btns[v]=b;w.appendChild(b);});
    return w;
  }
  form.appendChild(fld('CATEGORY',makeSeg2([['expense','Expense'],['subscription','Sub 🔔']],function(){return F.cat;},function(v){F.cat=v;})));
  form.appendChild(fld('FREQUENCY',makeSeg2([['weekly','Weekly'],['fortnightly','Fortnight'],['monthly','Monthly'],['yearly','Yearly']],function(){return F.freq;},function(v){F.freq=v;},function(){
    dayFld.style.display=(F.freq==='monthly'||F.freq==='yearly')?'none':'';
    mdFld.style.display=F.freq==='monthly'?'':'none';
    sdFld.style.display=(F.freq==='fortnightly'||F.freq==='yearly')?'':'none';
  })));

  var drow=div('two-col');
  var dayFld=fld('DAY',sel(DAYS.map(function(d){return[d,d];}),F.day,function(){}));
  dayFld.querySelector('select').addEventListener('change',function(e){F.day=e.target.value;});
  dayFld.style.display=(F.freq==='monthly'||F.freq==='yearly')?'none':'';
  var maxI=inp('∞',F.maxT,'number'); maxI.addEventListener('input',function(){F.maxT=maxI.value;});
  drow.appendChild(dayFld); drow.appendChild(fld('MAX TIMES',maxI)); form.appendChild(drow);

  var mdSel=sel(Array.from({length:28},function(_,i){return[String(i+1),'Day '+(i+1)];}),String(F.mday));
  mdSel.addEventListener('change',function(){F.mday=parseInt(mdSel.value);});
  var mdFld=fld('DAY OF MONTH',mdSel); mdFld.style.display=F.freq==='monthly'?'':'none'; form.appendChild(mdFld);

  var sdI=inp('',F.sd,'date'); sdI.addEventListener('change',function(){F.sd=sdI.value;});
  var sdFld=fld('START / ANNUAL DATE',sdI); sdFld.style.display=(F.freq==='fortnightly'||F.freq==='yearly')?'':'none'; form.appendChild(sdFld);

  var amtI=inp('0',F.amt,'number'); amtI.addEventListener('input',function(){F.amt=amtI.value;});
  var amtFld=fld('AMOUNT',amtI); amtFld.style.display=F.fixed?'':'none';
  var varTip=div('',{background:C.acBg,border:'1px solid '+C.acBo,borderRadius:'8px',padding:'10px 12px',fontSize:'13px',color:C.ac,marginBottom:'12px'}); varTip.textContent='💡 Blank — fill per week on the row.'; varTip.style.display=F.fixed?'none':'';
  form.appendChild(fld('AMOUNT TYPE',makeSeg2([['fixed','Fixed'],['variable','Variable']],function(){return F.fixed?'fixed':'variable';},function(v){F.fixed=v==='fixed';},function(){amtFld.style.display=F.fixed?'':'none';varTip.style.display=F.fixed?'none':'';})));
  form.appendChild(amtFld); form.appendChild(varTip);

  var brow=div('',{display:'flex',gap:'8px',marginTop:'4px'});
  var saveB=document.createElement('button'); saveB.className='btn-p'; saveB.textContent=EDIT_REC?'Save':'Add';
  saveB.addEventListener('click',function(){
    if(!F.name)return;
    var rec={name:F.name,amt:parseFloat(F.amt)||0,day:F.day,fixed:F.fixed,max:F.maxT?parseInt(F.maxT):0,freq:F.freq,cat:F.cat,mday:F.mday||1,sd:F.sd||'',link:F.link||'',active:true,used:0};
    if(EDIT_REC){Object.assign(EDIT_REC,rec);EDIT_REC=null;}
    else REC=REC.concat([Object.assign({id:'r'+Date.now()},rec)]);
    MODAL=null;save();
  });
  brow.appendChild(saveB);
  if(EDIT_REC){var canB=document.createElement('button');canB.className='btn-g';canB.style.borderColor=C.b2;canB.style.color=C.txm;canB.textContent='Cancel';canB.addEventListener('click',function(){EDIT_REC=null;render();});brow.appendChild(canB);}
  form.appendChild(brow); wrap.appendChild(form);
  return overlay(wrap);
}

// ── DEBT MODAL ────────────────────────────────────────────────────────────────
function renderDebtModal() {
  var ex=EDIT_DBT;
  var F={name:ex?ex.name:'',total:ex?String(ex.total||''):'',paid:ex?String(ex.paid||''):'',inst:ex?String(ex.installment||''):'',note:ex?ex.note||'':''};
  var close=function(){MODAL=null;EDIT_DBT=null;render();};
  var wrap=div(''); wrap.appendChild(mhdr(EDIT_DBT?'Edit Debt':'New Debt',close));
  var nI=inp('AFTERPAY...',F.name); nI.addEventListener('input',function(){F.name=nI.value.toUpperCase();});
  wrap.appendChild(fld('NAME',nI));
  var row=div('two-col');
  var tI=inp('',F.total,'number');tI.addEventListener('input',function(){F.total=tI.value;});
  var pI=inp('',F.paid,'number');pI.addEventListener('input',function(){F.paid=pI.value;});
  row.appendChild(fld('TOTAL',tI)); row.appendChild(fld('PAID SO FAR',pI)); wrap.appendChild(row);
  var iI=inp('',F.inst,'number');iI.addEventListener('input',function(){F.inst=iI.value;});
  wrap.appendChild(fld('INSTALLMENT',iI));
  var noI=inp('',F.note);noI.addEventListener('input',function(){F.note=noI.value;});
  wrap.appendChild(fld('NOTE',noI));
  var sb=document.createElement('button');sb.className='btn-p';sb.style.cssText='width:100%;justify-content:center;margin-top:4px;';sb.textContent=EDIT_DBT?'Save':'Add';
  sb.addEventListener('click',function(){
    if(!F.name||!F.total)return;
    var d={name:F.name,total:parseFloat(F.total)||0,paid:parseFloat(F.paid)||0,installment:parseFloat(F.inst)||0,note:F.note};
    if(EDIT_DBT){Object.assign(EDIT_DBT,d);EDIT_DBT=null;}
    else DEBTS=DEBTS.concat([Object.assign({id:'d'+Date.now()},d)]);
    MODAL=null;save();
  });
  wrap.appendChild(sb);
  return overlay(wrap);
}

// ── INVESTMENT MODAL ─────────────────────────────────────────────────────────
function renderInvModal() {
  var ex=EDIT_INV;
  var F={name:ex?ex.name:'',contrib:ex?String(ex.contributed||''):'',cur:ex?String(ex.currentValue||''):'',sd:ex?ex.startDate||'':'',note:ex?ex.note||'':''};
  var close=function(){MODAL=null;EDIT_INV=null;render();};
  var wrap=div(''); wrap.appendChild(mhdr(EDIT_INV?'Edit Investment':'New Investment',close));
  var nI=inp('CDB...',F.name);nI.addEventListener('input',function(){F.name=nI.value;});
  wrap.appendChild(fld('NAME',nI));
  var row=div('two-col');
  var cI=inp('',F.contrib,'number');cI.addEventListener('input',function(){F.contrib=cI.value;});
  var vI=inp('',F.cur,'number');vI.addEventListener('input',function(){F.cur=vI.value;});
  row.appendChild(fld('INVESTED ($)',cI)); row.appendChild(fld('CURRENT ($)',vI)); wrap.appendChild(row);
  var sI=inp('',F.sd,'date');sI.addEventListener('change',function(){F.sd=sI.value;});
  wrap.appendChild(fld('START DATE',sI));
  var noI=inp('',F.note);noI.addEventListener('input',function(){F.note=noI.value;});
  wrap.appendChild(fld('NOTE',noI));
  var sb=document.createElement('button');sb.className='btn-p';sb.style.cssText='width:100%;justify-content:center;margin-top:4px;';sb.textContent=EDIT_INV?'Save':'Add';
  sb.addEventListener('click',function(){
    if(!F.name||!F.contrib)return;
    var x={name:F.name,contributed:parseFloat(F.contrib)||0,currentValue:parseFloat(F.cur)||parseFloat(F.contrib)||0,startDate:F.sd,note:F.note};
    if(EDIT_INV){Object.assign(EDIT_INV,x);EDIT_INV=null;}
    else INV=INV.concat([Object.assign({id:'i'+Date.now()},x)]);
    MODAL=null;save();
  });
  wrap.appendChild(sb);
  return overlay(wrap);
}

// ── EDIT ITEM MODAL ───────────────────────────────────────────────────────────
function renderEditModal() {
  var item=EDIT_ITEM;
  var F={name:item.name,amt:String(item.amt||''),day:item.day,date:item.date};
  var close=function(){MODAL=null;EDIT_ITEM=null;render();};
  var wrap=div(''); wrap.appendChild(mhdr('Edit Entry',close));
  var nI=inp('',F.name);nI.addEventListener('input',function(){F.name=nI.value;});
  wrap.appendChild(fld('NAME',nI));
  var aI=inp('',F.amt,'number');aI.addEventListener('input',function(){F.amt=aI.value;});
  wrap.appendChild(fld('AMOUNT',aI));
  var row=div('two-col');
  var dS=sel(DAYS.map(function(d){return[d,d];}),F.day);dS.addEventListener('change',function(){F.day=dS.value;});
  var dtI=inp('17/04',F.date);dtI.addEventListener('input',function(){F.date=dtI.value;});
  row.appendChild(fld('DAY',dS));row.appendChild(fld('DATE (DD/MM)',dtI));wrap.appendChild(row);
  var brow=div('',{display:'flex',gap:'8px',marginTop:'4px'});
  var sb=document.createElement('button');sb.className='btn-p';sb.textContent='Save';
  sb.addEventListener('click',function(){
    if(!/^\d{1,2}\/\d{1,2}$/.test(F.date.trim())){alert('Date must be DD/MM');return;}
    item.name=F.name.toUpperCase();item.amt=parseFloat(F.amt)||0;item.day=F.day;item.date=F.date.trim();
    MODAL=null;EDIT_ITEM=null;save();
  });
  var cb2=document.createElement('button');cb2.className='btn-g';cb2.style.borderColor=C.b2;cb2.style.color=C.txm;cb2.textContent='Cancel';cb2.addEventListener('click',close);
  brow.appendChild(sb);brow.appendChild(cb2);wrap.appendChild(brow);
  return overlay(wrap,true);
}

// ── WEEK ACTIONS ─────────────────────────────────────────────────────────────
function addNextWeek() {
  var sorted = WEEKS.slice().sort(function(a,b){return b.yr!==a.yr?b.yr-a.yr:b.wn-a.wn;});
  var last = sorted[0];
  var nw = last ? last.wn+1 : CW;
  var ny = last ? last.yr : CY;
  if (nw > 52) { nw=1; ny++; }
  var m = weekMeta(nw, ny);
  var items = [];
  REC.filter(function(r){ return r.active; }).forEach(function(r) {
    var d = recDateFor(r, nw, ny, m.mon);
    if (d) {
      items.push({id:Date.now()+Math.random(),day:r.day,date:d,name:r.name+(r.cat==='subscription'?' 🔔':''),amt:r.fixed?r.amt:0,paid:false,rid:r.id});
    }
  });
  items = srt(items);
  WEEKS.unshift({id:Date.now(),wn:nw,yr:ny,label:m.label,sm:m.startMonth,mon:m.mon.toISOString().slice(0,10),collapsed:false,items:items});
  VIEW_YEAR = ny;
  save();
}

function recDateFor(r, wn, yr, mon) {
  var f = r.freq || 'weekly';
  var sun = new Date(mon); sun.setDate(mon.getDate()+6);
  if (f==='weekly') return dayDate(r.day, mon);
  if (f==='monthly') {
    var day=r.mday||1;
    for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){if(d.getDate()===day)return fmt(new Date(d));}
    return null;
  }
  if (f==='fortnightly') {
    if(!r.sd)return null;
    var start=new Date(r.sd);
    for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){var diff=Math.round((d-start)/86400000);if(diff>=0&&diff%14===0)return fmt(new Date(d));}
    return null;
  }
  if (f==='yearly') {
    if(!r.sd)return null;
    var start=new Date(r.sd);
    for(var d=new Date(mon);d<=sun;d.setDate(d.getDate()+1)){if(d.getDate()===start.getDate()&&d.getMonth()===start.getMonth())return fmt(new Date(d));}
    return null;
  }
  return null;
}

function srt(arr) { return arr.slice().sort(function(a,b){return sortKey(a.date)-sortKey(b.date);}); }

// ── BOOT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  loadData();
  renderPin();

  // Auto-lock
  var lt;
  document.addEventListener('pointerdown', function() {
    clearTimeout(lt);
    lt = setTimeout(function() { UNLOCKED=false; renderPin(); }, 600000);
  });
});
