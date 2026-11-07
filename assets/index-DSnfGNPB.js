(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`https://data.etabus.gov.hk/v1/transport/kmb`,t=`https://rt.data.gov.hk/v2/transport/citybus`,n=[],r=[],i=new Map,a=new Map;async function o(e){let t=await fetch(e,{signal:AbortSignal.timeout(25e3)});if(!t.ok)throw Error(String(t.status));return await t.json()}async function s(e,t,n){let r=Array(e.length),i=0,a=Array.from({length:Math.min(t,e.length)},async()=>{for(;i<e.length;){let t=i++;r[t]=await n(e[t])}});return await Promise.all(a),r}async function c(){let[i,a]=await Promise.all([o(`${e}/route/`),o(`${t}/route/CTB`)]);return n=i.data??[],r=a.data??[],{kmb:new Set(n.map(e=>e.route)).size,ctb:new Set(r.map(e=>e.route)).size}}function l(e){let t=e.trim().toUpperCase();if(!t)return[];let i=[],a=new Map;for(let e of n){let t=a.get(e.route);t?t.push(e):a.set(e.route,[e])}for(let[e,n]of a){let r=u(e,t);if(r===99)continue;let a=d(n.map(e=>e.dest_tc)).slice(0,3);i.push({score:r,hit:{feed:`kmb`,route:e,hint:a.map(e=>`往${e}`).join(`、`)}})}for(let e of r){let n=u(e.route,t);n!==99&&i.push({score:n,hit:{feed:`ctb`,route:e.route,hint:`往${e.dest_tc}`}})}return i.sort((e,t)=>e.score-t.score||e.hit.route.length-t.hit.route.length||e.hit.route.localeCompare(t.hit.route)||e.hit.feed.localeCompare(t.hit.feed)),i.slice(0,40).map(e=>e.hit)}function u(e,t){let n=e.toUpperCase();return n===t?0:n.startsWith(t)?1:n.includes(t)?2:99}function d(e){return[...new Set(e.filter(Boolean))]}function ee(e){let t=n.filter(t=>t.route===e).map(t=>({feed:`kmb`,operator:`KMBLWB`,route:e,direction:t.bound,serviceType:String(t.service_type),origTc:t.orig_tc,destTc:t.dest_tc,label:``}));return t.sort((e,t)=>p(e.direction)-p(t.direction)||Number(e.serviceType)-Number(t.serviceType)),m(t)}async function f(e){let t=r.find(t=>t.route===e),n=await Promise.all([`O`,`I`].map(async n=>({direction:n,stops:await g({feed:`ctb`,operator:`CTB`,route:e,direction:n,serviceType:`1`,origTc:t?.orig_tc??``,destTc:t?.dest_tc??``,label:``})}))),i=[];for(let{direction:r,stops:a}of n){if(a.length<2)continue;let n=a[a.length-1].nameTc,o=a[0].nameTc;i.push({feed:`ctb`,operator:`CTB`,route:e,direction:r,serviceType:`1`,origTc:o||t?.orig_tc||``,destTc:n||(r===`O`?t?.dest_tc??``:t?.orig_tc??``),label:``})}return m(i)}function p(e){return e===`O`?0:1}function m(e){let t=new Map;for(let n of e){let e=`${n.direction}|${n.destTc}`;t.set(e,(t.get(e)??0)+1)}let n=e.map(e=>{let n=(t.get(`${e.direction}|${e.destTc}`)??0)>1?`由${e.origTc} 往${e.destTc}`:`往${e.destTc}`;return{...e,label:n}}),r=new Map;for(let e of n)r.set(e.label,(r.get(e.label)??0)+1);let i=new Map;return n.map(e=>{if((r.get(e.label)??0)<2)return e;let t=(i.get(e.label)??0)+1;return i.set(e.label,t),t===1?e:{...e,label:`${e.label}（另一走線）`}})}async function h(t){if(t.feed===`ctb`)return`CTB`;try{let n=await o(`${e}/route-eta/${encodeURIComponent(t.route)}/${encodeURIComponent(t.serviceType)}`),r=new Set((n.data??[]).filter(e=>e.dir===t.direction&&String(e.service_type)===t.serviceType).map(e=>e.co).filter(Boolean));if(r.size===1&&r.has(`LWB`))return`LWB`;if(r.size===1&&r.has(`KMB`))return`KMB`;if(r.has(`LWB`)&&!r.has(`KMB`))return`LWB`;if(r.has(`KMB`)&&!r.has(`LWB`))return`KMB`}catch{}return`KMBLWB`}async function g(n){let r=`${n.feed}|${n.route}|${n.direction}|${n.serviceType}`,i=a.get(r);if(i)return i;let c=n.direction===`O`?`outbound`:`inbound`,l=((await o(n.feed===`kmb`?`${e}/route-stop/${encodeURIComponent(n.route)}/${c}/${encodeURIComponent(n.serviceType)}`:`${t}/route-stop/CTB/${encodeURIComponent(n.route)}/${c}`)).data??[]).map(e=>({stopId:e.stop,seq:Number(e.seq)}));l.sort((e,t)=>e.seq-t.seq);let u=await s(l,8,async e=>_(n.feed,e.stopId)),d=l.map((e,t)=>({...e,nameTc:u[t]||e.stopId}));return a.set(r,d),d}async function _(n,r){let a=`${n}|${r}`,s=i.get(a);if(s)return s;let c=n===`kmb`?`${e}/stop/${r}`:`${t}/stop/${r}`;try{let e=(await o(c)).data?.name_tc?.trim()||r;return i.set(a,e),e}catch{return r}}function v(e,t){if(t.length===0)return e;let n=t[t.length-1].nameTc,r=t[0].nameTc;return!n||n===e.destTc?{...e,origTc:r||e.origTc}:m([{...e,destTc:n,origTc:r||e.origTc,label:``}])[0]}async function y(n,r){let i=n.feed===`kmb`?`${e}/eta/${r}/${encodeURIComponent(n.route)}/${encodeURIComponent(n.serviceType)}`:`${t}/eta/CTB/${r}/${encodeURIComponent(n.route)}`;try{let e=await o(i),t=(e.data??[]).filter(e=>!(e.dir!==n.direction||n.feed===`kmb`&&String(e.service_type)!==n.serviceType)),r=t.find(e=>e.data_timestamp)?.data_timestamp||e.generated_timestamp||``;return{items:t.filter(e=>typeof e.eta==`string`&&e.eta.length>0).map(e=>({eta:e.eta,remarkTc:e.rmk_tc??``,dataTimestamp:e.data_timestamp||r})).sort((e,t)=>Date.parse(e.eta)-Date.parse(t.eta)).slice(0,3),dataTimestamp:r,error:``}}catch{return{items:[],dataTimestamp:``,error:`無法取得這個站的到站時間`}}}function b(e){return e.replace(/[&<>"']/g,e=>{switch(e){case`&`:return`&amp;`;case`<`:return`&lt;`;case`>`:return`&gt;`;case`"`:return`&quot;`;default:return`&#39;`}})}function x(e){let t=new Date(e);return Number.isNaN(t.getTime())?e:new Intl.DateTimeFormat(`zh-HK`,{timeZone:`Asia/Hong_Kong`,hour:`2-digit`,minute:`2-digit`,hourCycle:`h23`}).format(t)}function te(e,t){let n=Date.parse(e)-t;if(Number.isNaN(n))return``;if(n<0)return`已過`;let r=Math.round(n/6e4);return r<=0?`1 分鐘內`:`${r} 分鐘`}function S(e){return e===`LWB`?`龍運`:e===`CTB`?`城巴`:e===`KMB`?`九巴`:`九巴／龍運`}function C(e,t){return e?3:!Number.isFinite(t)||t<0?5:t}function w(e,t,n){let r=null;for(let i of e){let e=Date.parse(i.eta);if(!Number.isNaN(e))for(let a of t){let t=Date.parse(a.eta);if(Number.isNaN(t))continue;let o=(t-e)/6e4;o+1e-6<n||(!r||t<Date.parse(r.boardEta)||t===Date.parse(r.boardEta)&&o>r.gapMin)&&(r={alightEta:i.eta,boardEta:a.eta,gapMin:o})}}return r}function ne(e,t){let n=Math.round(e);return n<t?Math.ceil(e-1e-9):n}function T(e,t){let n=Math.min(e.length,t.length),r=[];for(let i=0;i<n;i++){let n=Date.parse(e[i].eta),a=Date.parse(t[i].eta);!Number.isNaN(n)&&!Number.isNaN(a)&&a>n&&r.push({board:e[i].eta,alight:t[i].eta})}return r}var E=`bus-journey-v1`,D=document.querySelector(`#app`),O={screen:`search`,query:``,stopQuery:``,counts:null,notice:``,busy:``,choices:[],choice:null,stops:[],board:null,legs:[],etas:[],refreshing:!1},k=0,A=!1,j=0;function M(){sessionStorage.setItem(E,JSON.stringify(O.legs))}function re(){try{let e=sessionStorage.getItem(E);if(!e)return;let t=JSON.parse(e);if(!Array.isArray(t))return;O.legs=t.map(e=>({...e,walkMinutes:Number.isFinite(e.walkMinutes)?e.walkMinutes:5})),O.legs.length>0&&(O.screen=`journey`)}catch{}}function N(e=!1){let t=window.scrollY,n=document.activeElement,r=n instanceof HTMLElement?n.id:``,i=n instanceof HTMLInputElement?[n.selectionStart??0,n.selectionEnd??0]:null;if(D.innerHTML=P(F()),e&&window.scrollTo(0,t),!r)return;let a=document.getElementById(r);a instanceof HTMLInputElement&&(a.focus(),i&&a.setSelectionRange(i[0],i[1]))}function P(e){return`<div class="shell">
    <header class="top">
      ${O.screen===`search`&&O.legs.length===0?``:`<button type="button" class="back" data-act="back">返回</button>`}
      <div class="grow">
        <h1>轉車時間</h1>
        <p>${O.legs.length?`已選 ${O.legs.length} 段`:`自選路線，看看轉車趕不趕得及`}</p>
      </div>
    </header>
    ${e}
  </div>`}function F(){if(!O.counts&&!O.notice)return`<main class="main"><p class="status">正在載入路線…</p></main>`;switch(O.screen){case`search`:return I();case`direction`:return L();case`board`:return R(`board`);case`alight`:return R(`alight`);case`journey`:return B();case`result`:return V()}}function I(){let e=O.counts?l(O.query):[],t=e.map(e=>`<li><button type="button" class="choice" data-act="pick-route" data-feed="${e.feed}" data-route="${b(e.route)}">
        <span class="op">${e.feed===`ctb`?`城巴`:`九巴／龍運`}</span>
        <span class="num">${b(e.route)}</span>
        <span class="hint">${b(e.hint)}</span>
      </button></li>`).join(``);return`<main class="main">
    <p class="lead">輸入路線號碼，再選擇方向和上落車站。</p>
    ${O.counts?`<p class="note">九巴／龍運 ${O.counts.kmb} 條路線，城巴 ${O.counts.ctb} 條路線。</p>`:``}
    <label class="field">路線號碼
      <input id="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="例如 1、N121、A11" value="${b(O.query)}" ${O.counts?``:`disabled`} />
    </label>
    ${O.notice?`<p class="status error">${b(O.notice)}</p>`:``}
    ${O.query&&e.length===0?`<p class="status">找不到這條路線。</p>`:``}
    <ul class="list" id="results">${t}</ul>
  </main>`}function L(){let e=O.choices[0]?.route??``,t=O.choices[0]?S(O.choices[0].operator):``,n=O.choices.map((e,t)=>`<li><button type="button" class="choice" data-act="pick-dir" data-index="${t}">
        <span class="name">${b(e.label)}</span>
        <span class="hint">${b(S(e.operator))} ${b(e.route)}</span>
      </button></li>`).join(``);return`<main class="main">
    <p class="lead">${b(t)} ${b(e)}，選擇方向。方向以終點站表示。</p>
    ${O.busy?`<p class="status">${b(O.busy)}</p>`:``}
    ${O.notice?`<p class="status error">${b(O.notice)}</p>`:``}
    ${!O.busy&&O.choices.length===0?`<p class="status">這條路線暫時沒有方向資料。</p>`:``}
    <ul class="list">${n}</ul>
  </main>`}function R(e){let t=O.choice,n=z(e),r=n.map(e=>`<li><button type="button" class="choice row-stop" data-act="pick-stop" data-stop="${b(e.stopId)}">
        <span class="seq">${e.seq}</span>
        <span class="name">${b(e.nameTc)}</span>
      </button></li>`).join(``),i=e===`board`?`選擇上車站`:`選擇落車站`,a=e===`board`?`落車站必須在上車站之後，所以這裡不列出尾站。`:`由「${O.board?.nameTc??``}」開出之後的車站。`;return`<main class="main">
    <p class="lead">${t?`${b(S(t.operator))} ${b(t.route)} ${b(t.label)}`:``}</p>
    <h2 class="dir">${i}</h2>
    <p class="note">${b(a)}</p>
    ${O.busy?`<p class="status">${b(O.busy)}</p>`:``}
    ${O.notice?`<p class="status error">${b(O.notice)}</p>`:``}
    ${!O.busy&&O.stops.length<2?`<p class="status">這條路線沒有足夠車站。</p>`:``}
    ${O.stops.length>=2?`<label class="field">篩選車站<input id="stop-q" type="search" autocomplete="off" value="${b(O.stopQuery)}" placeholder="輸入站名" /></label>`:``}
    ${O.stops.length>=2&&n.length===0?`<p class="status">沒有符合的車站。</p>`:``}
    <ul class="list">${r}</ul>
  </main>`}function z(e){if(O.stops.length===0)return[];let t=O.stops[O.stops.length-1].seq,n=O.stopQuery.trim();return O.stops.filter(r=>e===`board`&&r.seq>=t||e===`alight`&&O.board&&r.seq<=O.board.seq?!1:!n||r.nameTc.includes(n))}function B(){let e=O.legs.map((e,t)=>`<article class="leg">
      <div class="leg-head">
        <span class="meta">第 ${t+1} 段</span>
        <span class="meta">${b(S(e.choice.operator))}</span>
      </div>
      <div class="route-no">${b(e.choice.route)}</div>
      <p class="dir">${b(e.choice.label)}</p>
      <p class="stops">${b(e.board.nameTc)} → ${b(e.alight.nameTc)}</p>
      <div class="actions">
        <button type="button" data-act="up" data-index="${t}" ${t===0?`disabled`:``}>上移</button>
        <button type="button" data-act="down" data-index="${t}" ${t===O.legs.length-1?`disabled`:``}>下移</button>
        <button type="button" class="danger" data-act="remove" data-index="${t}">刪除</button>
      </div>
    </article>`).join(``);return`<main class="main">${O.legs.length===0?`<p class="status">還沒有車程。</p>`:``}${e}</main>
    <div class="footer">
      <button type="button" class="secondary" data-act="add">加一段車程</button>
      <button type="button" class="primary" data-act="finish" ${O.legs.length===0?`disabled`:``}>查看轉車時間</button>
    </div>`}function V(){let e=O.refreshing?`<p class="status">更新中…</p>`:``,t=O.legs.map((e,t)=>`${t===0?``:G(O.legs[t-1],e,O.etas[t-1],O.etas[t],t)}${H(e,O.etas[t],t)}`);return`<main class="main" id="result">
    ${e}
    ${O.notice?`<p class="status error">${b(O.notice)}</p>`:``}
    <p class="result-note">每 30 秒更新</p>
    ${t.join(``)}
    <p class="result-note">資料來自運輸署公開到站時間</p>
  </main>
  <div class="footer">
    <button type="button" class="secondary" data-act="refresh">重新整理</button>
    <button type="button" class="primary" data-act="back">返回修改</button>
  </div>`}function H(e,t,n){let r=t?W(`上車`,e.board.nameTc,t.board):`<p class="status">正在查看到站時間…</p>`,i=t?W(`落車`,e.alight.nameTc,t.alight):``,a=t?T(t.board.items,t.alight.items):[],o=t&&t.board.items.length>0&&t.alight.items.length>0?`<p class="estimate">${a.length?a.map(e=>`估計 ${b(x(e.board))} 上車，${b(x(e.alight))} 落車`).join(`<br />`):`這兩組到站時間未能按次序配對`}<br />未必是同一輛巴士</p>`:``;return`<article class="ride" data-leg="${n}">
    <div class="ride-top"><span>第 ${n+1} 段</span><span>${b(S(e.choice.operator))}</span></div>
    <p class="ride-no">${b(e.choice.route)}</p>
    <p class="ride-dest">${b(e.choice.label)}</p>
    <div class="fromto">
      <div class="ft">${r}</div>
      <div class="ft ft-end">${i}</div>
    </div>
    ${o}
  </article>`}function U(e,t){let n=te(e,t),r=/^(\d+) 分鐘$/.exec(n);return r?{num:r[1],unit:`分鐘`}:{num:n,unit:``}}function W(e,t,n){let r=Date.now(),i=n.items.map(e=>{let t=U(e.eta,r),n=t.unit?`<span>${b(t.unit)}</span>`:``,i=e.remarkTc?`<p class="remark">${b(e.remarkTc)}</p>`:``;return`<div class="eta">
        <p class="mins"><b>${b(t.num)}</b>${n}</p>
        <p class="clock">${b(x(e.eta))}</p>
        <p class="raw">${b(e.eta)}</p>
        ${i}
      </div>`}).join(``),a=n.error?`<p class="empty" data-empty="1">${b(n.error)}</p>`:n.items.length===0?`<p class="empty" data-empty="1">暫無班次</p>`:`<div class="eta-list">${i}</div>`,o=n.dataTimestamp?`<p class="stamp">資料時間 ${b(n.dataTimestamp)}</p>`:``;return`<div class="ft-body">
    <p class="ft-k">${e}</p>
    <p class="ft-name">${b(t)}</p>
    ${a}
    ${o}
  </div>`}function G(e,t,n,r,i){let a=i-1,o=e.alight.stopId===t.board.stopId,s=C(o,t.walkMinutes),c=q(n,r,n?.alight.items??[],r?.board.items??[],s),l=o?`<p class="xfer-buffer">同一車站 3 分鐘</p>`:`<label class="walk">步行
         <input class="walk" id="walk-${a}" data-walk="${a}" type="number" min="0" step="1" inputmode="numeric" value="${b(String(t.walkMinutes))}" />
         <span>分鐘</span>
       </label>`,u=c.gap?`<p class="xfer-gap" data-gap="${a}">${b(c.gap)}</p>`:`<p class="xfer-gap" data-gap="${a}"></p>`;return`<section class="xfer ${c.kind===`ok`?`xfer-ok`:``}" data-transfer="${a}" data-same="${o?`1`:`0`}">
    <p class="xfer-status ${c.kind}" data-verdict="${a}" data-kind="${c.kind}">${b(c.status)}</p>
    ${l}
    ${u}
  </section>`}function K(e){let t=O.legs[e+1],n=O.legs[e];if(!t||!n)return;let r=D.querySelector(`[data-verdict="${e}"]`);if(!(r instanceof HTMLElement))return;let i=C(n.alight.stopId===t.board.stopId,t.walkMinutes),a=q(O.etas[e],O.etas[e+1],O.etas[e]?.alight.items??[],O.etas[e+1]?.board.items??[],i);r.className=`xfer-status ${a.kind}`,r.dataset.kind=a.kind,r.textContent=a.status;let o=D.querySelector(`[data-gap="${e}"]`);o&&(o.textContent=a.gap);let s=D.querySelector(`[data-transfer="${e}"]`);s&&s.classList.toggle(`xfer-ok`,a.kind===`ok`)}function q(e,t,n,r,i){if(!e||!t)return{kind:`empty`,status:`正在查看到站時間…`,gap:``};if(e.alight.error||t.board.error||n.length===0||r.length===0)return{kind:`empty`,status:`未能判斷能否轉車`,gap:``};let a=w(n,r,i);return a?{kind:`ok`,status:`可以轉車`,gap:`相差 ${ne(a.gapMin,i)} 分鐘`}:{kind:`no`,status:`未能接上`,gap:``}}D.addEventListener(`click`,e=>{let t=e.target?.closest(`[data-act]`);if(!t)return;let n=t.dataset.act??``;if(!(O.busy&&n!==`back`)){if(n===`back`)return J();if(n===`retry`)return void $();if(n===`pick-route`)return void ie(t.dataset.feed===`ctb`?`ctb`:`kmb`,t.dataset.route??``);if(n===`pick-dir`)return void ae(Number(t.dataset.index));if(n===`pick-stop`)return oe(t.dataset.stop??``);if(n===`add`)return Y();if(n===`finish`)return void ce();if(n===`remove`)return se(Number(t.dataset.index));if(n===`up`)return X(Number(t.dataset.index),-1);if(n===`down`)return X(Number(t.dataset.index),1);if(n===`refresh`)return void Z()}}),D.addEventListener(`input`,e=>{let t=e.target;if(t instanceof HTMLInputElement){if(t.id===`q`)O.query=t.value,N();else if(t.id===`stop-q`)O.stopQuery=t.value,N();else if(t.dataset.walk!==void 0){let e=Number(t.dataset.walk),n=Number(t.value);O.legs[e+1].walkMinutes=Number.isFinite(n)&&n>=0?n:5,M(),K(e)}}});function J(){j+=1,O.notice=``,O.busy=``,Q(),O.screen===`result`?(O.screen=`journey`,N()):O.screen===`alight`?(O.screen=`board`,O.stopQuery=``,N()):O.screen===`board`?(O.screen=`direction`,O.stopQuery=``,N()):O.screen===`direction`?(O.screen=`search`,N()):(O.screen===`journey`||O.screen===`search`&&O.legs.length>0)&&O.screen===`search`?(O.screen=`journey`,N()):(O.screen=O.legs.length?`journey`:`search`,N())}function Y(){O.screen=`search`,O.query=``,O.notice=``,N()}async function ie(e,t){if(!t)return;let n=++j;O.notice=``,O.choices=[],O.busy=`正在讀取方向…`,O.screen=`direction`,N();try{let r=e===`kmb`?ee(t):await f(t);if(n!==j)return;if(O.choices=r,O.busy=``,N(),e===`kmb`&&r.length>0){let e=await h(r[0]);if(n!==j||O.screen!==`direction`)return;O.choices=O.choices.map(t=>({...t,operator:e})),N()}}catch{if(n!==j)return;O.busy=``,O.notice=`無法讀取方向，請再試一次`,N()}}async function ae(e){let t=O.choices[e];if(!t)return;let n=++j;O.notice=``,O.busy=`正在讀取車站…`,O.choice=t,O.stops=[],O.board=null,O.stopQuery=``,O.screen=`board`,N();try{let[e,r]=await Promise.all([g(t),h(t)]);if(n!==j)return;let i=v({...t,operator:r},e);t.label.includes(`由`)&&!i.label.includes(`由`)&&(i={...i,label:`由${i.origTc} ${i.label}`}),O.choice=i,O.stops=e,O.busy=``,N()}catch{if(n!==j)return;O.busy=``,O.notice=`無法讀取車站，請再試一次`,N()}}function oe(e){let t=O.stops.find(t=>t.stopId===e),n=O.choice;t&&n&&(O.screen===`board`?(O.board=t,O.stopQuery=``,O.screen=`alight`,N()):!O.board||t.seq<=O.board.seq||(O.legs.push({choice:n,board:O.board,alight:t,walkMinutes:5}),O.board=null,O.choice=null,O.stops=[],O.stopQuery=``,O.screen=`journey`,M(),N()))}function se(e){O.legs.splice(e,1),M(),N()}function X(e,t){let n=e+t;if(n<0||n>=O.legs.length)return;let[r]=O.legs.splice(e,1);O.legs.splice(n,0,r),M(),N()}async function ce(){O.legs.length!==0&&(O.screen=`result`,O.etas=[],O.notice=``,N(),le(),await Z())}async function Z(){if(A||O.screen!==`result`)return;A=!0;let e=O.etas.length>0;O.refreshing=e,e||(O.busy=`正在查看到站時間…`),N(e);let t=++j;try{let e=await Promise.all(O.legs.map(async e=>({board:await y(e.choice,e.board.stopId),alight:await y(e.choice,e.alight.stopId)})));if(t!==j||O.screen!==`result`)return;O.etas=e,O.notice=``}catch{t===j&&(O.notice=`無法更新到站時間`)}finally{A=!1,O.refreshing=!1,O.busy=``,O.screen===`result`&&N(e)}}function le(){Q(),k=window.setInterval(()=>{O.screen===`result`&&Z()},3e4)}function Q(){window.clearInterval(k),k=0}async function $(){O.notice=``,O.busy=``,N();try{O.counts=await c(),O.notice=``}catch{O.notice=`無法載入路線，請再試一次`,D.innerHTML=`<div class="shell"><header class="top"><div><h1>轉車時間</h1></div></header><main class="main"><p class="status error">無法載入路線，請再試一次</p><button type="button" class="primary" data-act="retry">重試</button></main></div>`;return}N()}re(),$();