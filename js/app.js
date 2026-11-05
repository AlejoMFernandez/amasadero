// Amasadero · demo — intro, hero, reloj, comparador, carta por sucursal, armá tu caja, finde, galería, sucursales.
import { initKit } from '../kit/kit.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esDesk = () => matchMedia('(min-width: 1024px)').matches;
const fmt = (n) => n == null ? 'A confirmar' : '$ ' + Number(n).toLocaleString('es-AR');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------------- INTRO ---------------- */
function precargar(src) { return new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = src; }); }
async function intro() {
  const el = $('#intro');
  const fin = () => { root.classList.remove('con-intro'); root.classList.add('hero-ok'); el?.classList.add('chau'); };
  if (!root.classList.contains('con-intro') || !el) { requestAnimationFrame(fin); return; }
  const celu = innerWidth < 768;
  const heroSrc = celu ? 'img/hero-m-900.webp' : 'img/hero-d-1440.webp';
  const espera = Promise.race([Promise.all([document.fonts?.ready, precargar(heroSrc)]), new Promise((r) => setTimeout(r, 2400))]);
  el.classList.add('anda');
  // el logo se termina de armar a los ~1,15 s: recién ahí se abre la masa
  await Promise.all([espera, new Promise((r) => setTimeout(r, celu ? 1250 : 1550))]);
  el.classList.add('abre');                       // .abre mantiene la intro visible mientras se abren las franjas
  setTimeout(() => { root.classList.remove('con-intro'); root.classList.add('hero-ok'); }, 260);
  setTimeout(fin, 1000);                          // franjas: 0,62 s + escalonado 7 × 40 ms
}
intro();

/* ---------------- NAV ---------------- */
const nav = $('#nav');
const onScroll = () => { nav.classList.toggle('solida', scrollY > 40); root.classList.toggle('en-hero', scrollY < innerHeight * .6); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const btnMenu = $('.nav__menu'), menu = $('#menu');
function cerrarMenu() { menu.hidden = true; btnMenu.setAttribute('aria-expanded', 'false'); root.classList.remove('menu-abierto'); onScroll(); }
btnMenu.addEventListener('click', () => {
  const abrir = menu.hidden;
  if (!abrir) return cerrarMenu();
  menu.hidden = false; btnMenu.setAttribute('aria-expanded', 'true'); root.classList.add('menu-abierto');
});
$$('#menu a').forEach((a) => a.addEventListener('click', cerrarMenu));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) cerrarMenu(); });

/* ---------------- REVEAL ---------------- */
const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } }), { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
const observar = (r = document) => $$('.rv:not(.visto), .galeria:not(.visto), .comp:not(.visto)', r).forEach((el) => io.observe(el));
observar();

/* ---------------- HORA DEL LOCAL ---------------- */
function ahoraBA() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const dias = { Sun: 'dom', Mon: 'lun', Tue: 'mar', Wed: 'mie', Thu: 'jue', Fri: 'vie', Sat: 'sab' };
  return { dia: dias[p.weekday], min: (+p.hour % 24) * 60 + +p.minute };
}
const HOR = { palermo: { lun: null, def: [510, 1200] }, belgrano: { lun: null, dom: [510, 1080], def: [510, 1200] } };
function estadoSuc(id) {
  const { dia, min } = ahoraBA(); const h = HOR[id];
  const r = dia in h ? h[dia] : h.def;
  const cel = innerWidth < 768;
  if (r && min >= r[0] && min < r[1]) {
    const hc = `${Math.floor(r[1] / 60)}:${String(r[1] % 60).padStart(2, '0')} hs`;
    return { abierto: true, txt: cel ? `Abierto · hasta ${hc}` : `Abierto ahora · cierra ${hc}` };
  }
  if (r && min < r[0]) return { abierto: false, txt: cel ? 'Abre hoy 8:30 hs' : 'Cerrado · abre hoy 8:30 hs' };
  return { abierto: false, txt: dia === 'dom' || dia === 'lun' ? (cel ? 'Abre el martes' : 'Cerrado · abre el martes 8:30 hs') : (cel ? 'Abre mañana 8:30 hs' : 'Cerrado · abre mañana 8:30 hs') };
}
function pintarEstados() {
  $$('[data-estado]').forEach((el) => { const e = estadoSuc(el.dataset.estado); el.textContent = e.txt; el.classList.toggle('abierto', e.abierto); el.classList.toggle('cerrado', !e.abierto); });
}
pintarEstados(); setInterval(pintarEstados, 60000);

/* ---------------- WOW C · RELOJ ---------------- */
const MOM = {
  manana: { chip: 'Abierto · mañana', frase: 'Medialunas recién horneadas, croissants y café de especialidad con granos de Brasil.', cta: 'Ver la pastelería', cat: 'pasteleria' },
  mediodia: { chip: 'Abierto · mediodía', frase: 'Promo almuerzo en Palermo: sándwich + gaseosa por $ 11.000, o ensalada + limonada.', cta: 'Ver las promos', cat: 'promos' },
  tarde: { chip: 'Abierto · merienda', frase: 'Torta de chocolate, key lime pie, cheesecake de frutos rojos y un flat white.', cta: 'Ver la pastelería', cat: 'pasteleria' },
  cerrado: { chip: 'Cerrado ahora', frase: 'Ya cerramos por hoy. Encargá tu caja para mañana y pasala a buscar.', cta: 'Armá tu caja', cat: null },
};
function momentoReal() {
  const q = new URLSearchParams(location.search).get('momento');
  if (q && MOM[q]) return q;
  const { dia, min } = ahoraBA();
  if (dia === 'lun' || min < 510 || min >= 1200) return 'cerrado';
  return min < 720 ? 'manana' : min < 960 ? 'mediodia' : 'tarde';
}
const momAhora = momentoReal();
function verMomento(id) {
  const m = MOM[id];
  $$('.mom').forEach((b) => { b.setAttribute('aria-selected', String(b.dataset.mom === id)); b.classList.toggle('es-ahora', b.dataset.mom === momAhora); });
  const chip = $('#ahora-chip'); chip.textContent = id === momAhora ? (id === 'cerrado' ? 'Cerrado ahora' : 'Abierto ahora') : m.chip.replace('Abierto · ', 'Más tarde · ');
  chip.classList.toggle('cerrado', id === 'cerrado');
  const fr = $('#ahora-frase'); fr.style.opacity = 0;
  setTimeout(() => { fr.textContent = m.frase; fr.style.opacity = 1; }, 160);
  const cta = $('#ahora-cta'); cta.textContent = m.cta; cta.dataset.cat = m.cat || ''; cta.href = m.cat ? '#carta' : '#caja';
}
$$('.mom').forEach((b) => b.addEventListener('click', () => verMomento(b.dataset.mom)));
verMomento(momAhora);
$('#ahora-cta').addEventListener('click', (e) => {
  const cat = e.currentTarget.dataset.cat; if (!cat) return;
  if (cat === 'promos') elegirSucursal('palermo');
  setTimeout(() => abrirSeccion(`${pre()}-${cat}`), 50);
});

/* ---------------- WOW B · COMPARADOR ---------------- */
(function comparador() {
  const c = $('#comp'); if (!c) return;
  const rango = $('.comp__range', c);
  let tomado = false;
  const poner = (x) => { const r = c.getBoundingClientRect(); const p = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100)); c.style.setProperty('--x', p + '%'); rango.value = Math.round(p); };
  c.addEventListener('pointerdown', (e) => { tomado = true; c.classList.add('activo'); poner(e.clientX); if (e.pointerType !== 'touch') c.setPointerCapture(e.pointerId); });
  c.addEventListener('pointermove', (e) => { if (tomado || e.pointerType === 'mouse') poner(e.clientX); });
  const soltar = () => { tomado = false; c.classList.remove('activo'); };
  c.addEventListener('pointerup', soltar); c.addEventListener('pointercancel', soltar); c.addEventListener('pointerleave', () => { if (!tomado) c.classList.remove('activo'); });
  // en el celu: arrastre horizontal con el dedo sin trabar el scroll vertical
  let t0 = null;
  c.addEventListener('touchstart', (e) => { t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY, h: null }; }, { passive: true });
  c.addEventListener('touchmove', (e) => {
    if (!t0) return; const t = e.touches[0];
    if (t0.h == null) t0.h = Math.abs(t.clientX - t0.x) > Math.abs(t.clientY - t0.y);
    if (t0.h) { e.preventDefault(); poner(t.clientX); }
  }, { passive: false });
  rango.addEventListener('input', () => c.style.setProperty('--x', rango.value + '%'));
  c.addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { const v = +rango.value + (e.key === 'ArrowLeft' ? -5 : 5); rango.value = Math.max(2, Math.min(98, v)); c.style.setProperty('--x', rango.value + '%'); } });
  c.tabIndex = 0; c.setAttribute('role', 'slider'); c.setAttribute('aria-label', 'Comparar el proceso con el resultado'); c.setAttribute('aria-valuemin', '0'); c.setAttribute('aria-valuemax', '100');
})();

/* ---------------- VISOR DE FOTOS (celu) ---------------- */
const visor = $('#visor');
function abrirVisor(src, n, d) { $('#visor-img').src = src; $('#visor-img').alt = n; $('#visor-txt').innerHTML = `<b>${esc(n)}</b>${esc(d || '')}`; visor.hidden = false; }
visor.addEventListener('click', (e) => { if (e.target === visor || e.target.closest('.visor__x')) visor.hidden = true; });
addEventListener('keydown', (e) => { if (e.key === 'Escape') visor.hidden = true; });

/* ---------------- SUCURSAL ---------------- */
let SUC = 'palermo';
try { SUC = localStorage.getItem('am-suc') === 'belgrano' ? 'belgrano' : 'palermo'; } catch (_) {}
const pre = () => (SUC === 'belgrano' ? 'bel' : 'pal');
let kit = null;
function elegirSucursal(id, { scroll = false } = {}) {
  SUC = id; try { localStorage.setItem('am-suc', id); } catch (_) {}
  $$('.carta [data-suc]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.suc === id)));
  $$('[data-suc-panel]').forEach((p) => { p.hidden = p.dataset.sucPanel !== id; });
  $('#caja-suc').textContent = id === 'belgrano' ? 'Belgrano I' : 'Palermo';
  kit?.carrito?.setSucursal(id);
  pintarCaja(); pintarFinde();
  fotoInicial();
  if (scroll) $('#carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
$$('[data-suc]').forEach((b) => b.addEventListener('click', () => elegirSucursal(b.dataset.suc, { scroll: !!b.closest('.hero') })));

/* ---------------- CARTA ---------------- */
const ENCARGABLE = /-(pasteleria|finde|panaderia)$/;
const BAJADA = {
  cafe: 'Origen Brasil · servido a 90°. Leche de almendras $ 1.700 · extra shot $ 1.000.',
  promos: 'Desayuno, merienda y almuerzo.',
  finde: 'Sábados y domingos. Consultá los especiales del día.',
};
function templateItem(p, ctx) {
  const mini = p.miniatura || p.foto;
  const enc = ENCARGABLE.test(p.categoria);
  return `
    ${mini ? `<button type="button" class="it-foto" data-ver="${esc(p.id)}" aria-label="Ver foto de ${esc(p.nombre)}"><img src="${esc(ctx.asset(mini))}" alt="" width="58" height="58" loading="lazy"></button>` : ''}
    <div class="it-body">
      <h4 class="it-n">${esc(p.nombre)}</h4>
      ${p.descripcion ? `<p class="it-d">${esc(p.descripcion)}</p>` : ''}
      <span class="it-p">${esc(ctx.money(p.precio) ?? 'Consultar')}</span>
    </div>
    <div class="it-side">${enc && ctx.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>`;
}
let PRODS = [];
const sinSede = (t) => String(t || '').replace(/ · (Palermo|Belgrano I)$/, '');
function decorarCarta(el, productos) {
  if (productos?.length) PRODS = productos;
  const panels = $$('.kit-carta__panel', el);
  const tabs = $$('.kit-tab', el);
  tabs.forEach((t) => { t.textContent = sinSede(t.textContent); });
  panels.forEach((pn, i) => {
    const cid = pn.querySelector('.kit-item')?.dataset.cat || '';
    const tipo = cid.replace(/^(pal|bel)-/, '');
    const items = $$('.kit-item', pn);
    const nombre = tabs[i]?.textContent || '';
    const wrap = document.createElement('div'); wrap.className = 'sec-items';
    items.forEach((it) => { const p = PRODS.find((x) => x.id === it.dataset.id); if (p?.foto) it.classList.add('con-foto'); wrap.appendChild(it); });
    const enc = ENCARGABLE.test(cid);
    pn.innerHTML = `<header class="sec-cab"><h3>${esc(nombre)}</h3><p>${items.length} opciones${enc ? ' · <b>se puede encargar para retirar</b>' : ''}${BAJADA[tipo] ? `<br>${esc(BAJADA[tipo])}` : ''}</p></header>`;
    pn.appendChild(wrap);
    pn.classList.toggle('dos-col', items.length > 5);
    const nv = document.createElement('nav'); nv.className = 'sec-nav'; nv.setAttribute('aria-label', 'Secciones de la carta');
    nv.innerHTML = `${i > 0 ? `<button type="button" data-dir="-1"><span aria-hidden="true">←</span><small>Anterior</small>${esc(tabs[i - 1].textContent)}</button>` : ''}${i < tabs.length - 1 ? `<button type="button" data-dir="1"><small>Siguiente</small>${esc(tabs[i + 1].textContent)}<span aria-hidden="true">→</span></button>` : ''}`;
    pn.appendChild(nv);
  });
  kit?.carrito?.sync(el);
}
function abrirSeccion(catId) {
  const el = $(`#carta-${catId.slice(0, 3)}`); if (!el) return;
  const tab = $$('.kit-tab', el).find((t) => t.dataset.cat === catId);
  tab?.click();
  $('#carta').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const nb = e.target.closest('.sec-nav button');
  if (nb) {
    const el = nb.closest('[data-kit="carta"]'); const tabs = $$('.kit-tab', el); const i = tabs.findIndex((t) => t.classList.contains('is-on'));
    tabs[i + +nb.dataset.dir]?.click();
    const top = el.getBoundingClientRect().top + scrollY - (parseInt(getComputedStyle(root).getPropertyValue('--nav')) || 60) - 80;
    scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    return;
  }
  const v = e.target.closest('[data-ver]');
  if (v) { const p = PRODS.find((x) => x.id === v.dataset.ver); if (p) abrirVisor(kit.asset(p.foto || p.miniatura), p.nombre, p.descripcion); }
});
document.addEventListener('click', (e) => { if (e.target.closest('.kit-tab')) setTimeout(fotoInicial, 30); });

// foto del producto: popup al pasar el mouse (desktop) · en el celu, tocar la miniatura abre el visor
const pop = $('#foto-pop'), pImg = $('#foto-pop-img');
let popId = null, popT = 0;
function verPop(it) {
  const p = PRODS.find((x) => x.id === it.dataset.id); if (!p?.foto) return;
  clearTimeout(popT);
  // aparece en el lugar libre bajo el índice de secciones: nunca tapa otros productos
  const tabs = it.closest('.kit-carta')?.querySelector('.kit-tabs'); const r = tabs.getBoundingClientRect(); const H = 340;
  const x = r.left; let y = r.bottom + 22; y = Math.max(96, Math.min(innerHeight - H - 16, y));
  pop.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  if (popId !== p.id) {
    popId = p.id; pop.classList.add('cargando'); pImg.removeAttribute('src');
    $('#foto-pop-n').textContent = p.nombre;
    const src = kit.asset(p.foto);
    precargar(src).then(() => { if (popId !== p.id) return; pImg.src = src; pImg.alt = p.nombre; pop.classList.remove('cargando'); });
  }
  pop.classList.add('on');
}
function ocultarPop() { popT = setTimeout(() => pop.classList.remove('on'), 60); }
function fotoInicial() {}
$('#carta').addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse' || !esDesk()) return;
  const it = e.target.closest('.kit-item.con-foto'); if (it) verPop(it);
});
$('#carta').addEventListener('pointerout', (e) => {
  const it = e.target.closest('.kit-item.con-foto'); if (it && !it.contains(e.relatedTarget)) ocultarPop();
});
addEventListener('scroll', () => pop.classList.remove('on'), { passive: true });

/* ---------------- WOW A · ARMÁ TU CAJA ---------------- */
const PIEZAS = ['medialuna', 'croissant', 'pan-de-chocolate', 'roll-de-canela', 'medialuna-rellena', 'palmeritas'];
const FOTO_PIEZA = { medialuna: 'medialunas', croissant: 'croissant', 'pan-de-chocolate': 'pan-chocolate', 'roll-de-canela': 'roll', 'medialuna-rellena': 'medialunas', palmeritas: null };
let TAM = 12; let caja = []; // [{ clave }]
const prod = (clave) => PRODS.find((p) => p.id === `${pre()}-${clave}`);
const fotoDe = (clave) => (FOTO_PIEZA[clave] ? `img/t-${FOTO_PIEZA[clave]}.webp` : 'img/isotipo.svg');
function pintarCaja() {
  const box = $('#caja-piezas'); if (!PRODS.length) return;
  box.innerHTML = PIEZAS.map((k) => { const p = prod(k); if (!p) return '';
    return `<button type="button" class="pieza" data-pieza="${k}">
      <span class="pieza__foto"><img src="${fotoDe(k)}" alt="" width="240" height="240" loading="lazy" draggable="false"${FOTO_PIEZA[k] ? '' : ' style="object-fit:contain;padding:22%;opacity:.5"'}></span>
      <span class="pieza__n">${esc(p.nombre)}</span>
      <span class="pieza__p"><span>${esc(fmt(p.precio))}</span><span class="pieza__mas" aria-hidden="true">+</span></span>
    </button>`; }).join('');
  pintarHuecos();
}
function pintarHuecos(nueva = -1) {
  caja = caja.slice(0, TAM);
  const ol = $('#caja-huecos');
  ol.innerHTML = Array.from({ length: TAM }, (_, i) => { const c = caja[i]; const p = c && prod(c);
    return `<li class="hueco">${p ? `<button type="button" data-quitar="${i}" aria-label="Sacar ${esc(p.nombre)} de la caja" style="${i === nueva ? '' : 'animation:none'}"><img src="${fotoDe(c)}" alt="" width="240" height="240"${FOTO_PIEZA[c] ? '' : ' style="object-fit:contain;padding:22%"'}></button>` : ''}</li>`; }).join('');
  const total = caja.reduce((s, c) => s + (prod(c)?.precio || 0), 0);
  $('#caja-n').textContent = caja.length; $('#caja-max').textContent = TAM;
  $('#caja-total').textContent = fmt(total);
  const ok = $('#caja-ok'); ok.disabled = caja.length !== TAM;
  ok.textContent = caja.length === TAM ? 'Sumar a la bolsa' : `Faltan ${TAM - caja.length}`;
  $('#caja-ayuda').textContent = caja.length === TAM ? '¡Caja completa! Sumala a la bolsa y elegí cuándo retirarla.' : 'Tocá una pieza para sumarla (o arrastrala a la caja). Tocá un hueco para sacarla.';
  $$('.pieza').forEach((b) => b.classList.toggle('sin-lugar', caja.length >= TAM));
}
function sumarPieza(k, desde) {
  if (caja.length >= TAM) { const bx = $('#caja-box'); bx.classList.remove('toc'); void bx.offsetWidth; bx.classList.add('toc'); return; }
  caja.push(k);
  const i = caja.length - 1;
  if (desde && !reduce) volarA(desde, i, k); else pintarHuecos(i);
}
function volarA(desde, i, k) {
  pintarHuecos(-1);
  const hueco = $$('#caja-huecos .hueco')[i]; const btn = hueco?.querySelector('button');
  if (!hueco || !btn) return pintarHuecos(i);
  btn.style.opacity = '0';
  const a = desde, b = hueco.getBoundingClientRect();
  const v = document.createElement('span'); v.className = 'vuela'; v.innerHTML = `<img src="${fotoDe(k)}" alt="">`;
  Object.assign(v.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
  document.body.appendChild(v);
  requestAnimationFrame(() => { v.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})`; });
  setTimeout(() => { v.remove(); btn.style.opacity = ''; const bx = $('#caja-box'); bx.classList.remove('toc'); void bx.offsetWidth; bx.classList.add('toc'); }, 560);
}
$('#caja-huecos').addEventListener('click', (e) => { const q = e.target.closest('[data-quitar]'); if (!q) return; caja.splice(+q.dataset.quitar, 1); pintarHuecos(); });
$$('[data-tam]').forEach((b) => b.addEventListener('click', () => { TAM = +b.dataset.tam; $$('[data-tam]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); pintarHuecos(); }));
$('#caja-ok').addEventListener('click', () => {
  if (caja.length !== TAM || !kit?.carrito) return;
  const cuenta = {}; caja.forEach((k) => { cuenta[k] = (cuenta[k] || 0) + 1; });
  const nota = `Caja x ${TAM}`;
  Object.entries(cuenta).forEach(([k, n]) => kit.carrito.agregar(`${pre()}-${k}`, n, { nota, origen: $('#caja-ok') }));
  caja = []; pintarHuecos();
  setTimeout(() => kit.carrito.abrir(), 450);
});
// tocar o arrastrar una pieza
(function arrastre() {
  const zona = $('#caja-piezas'); let d = null;
  zona.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.pieza'); if (!b || e.button > 0) return;
    d = { b, k: b.dataset.pieza, x: e.clientX, y: e.clientY, mov: false, ghost: null, id: e.pointerId, tipo: e.pointerType };
  });
  addEventListener('pointermove', (e) => {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.mov) {
      // en el celu un movimiento horizontal es scroll de la fila; solo se arrastra hacia arriba
      if (d.tipo === 'touch' && !(dy < -14 && Math.abs(dy) > Math.abs(dx) * 1.2)) { if (Math.hypot(dx, dy) > 10) d = null; return; }
      if (Math.hypot(dx, dy) < 8) return;
      d.mov = true; d.ghost = document.createElement('span'); d.ghost.className = 'fantasma'; d.ghost.innerHTML = `<img src="${fotoDe(d.k)}" alt="">`; document.body.appendChild(d.ghost);
    }
    d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px';
    const r = $('#caja-box').getBoundingClientRect();
    $('#caja-box').classList.toggle('sobre', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
  }, { passive: true });
  const fin = (e) => {
    if (!d || e.pointerId !== d.id) return;
    const box = $('#caja-box');
    if (d.mov) {
      const r = box.getBoundingClientRect(); const dentro = e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      const g = d.ghost.getBoundingClientRect(); d.ghost.remove(); box.classList.remove('sobre');
      if (dentro) sumarPieza(d.k, g);
    } else if (e.type === 'pointerup') sumarPieza(d.k, d.b.querySelector('.pieza__foto').getBoundingClientRect());
    d = null;
  };
  addEventListener('pointerup', fin); addEventListener('pointercancel', (e) => { if (d?.ghost) d.ghost.remove(); $('#caja-box').classList.remove('sobre'); d = null; });
  zona.addEventListener('keydown', (e) => { const b = e.target.closest('.pieza'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sumarPieza(b.dataset.pieza, b.querySelector('.pieza__foto').getBoundingClientRect()); } });
  zona.addEventListener('click', (e) => { if (e.detail === 0) return; e.preventDefault(); });
})();

/* ---------------- ESPECIALES DEL FINDE ---------------- */
const FINDE_DIA = { 'croissant-relleno-de-chocolate-y-mascarpone': 'Sábados', 'croissant-especial': 'Sáb y dom', danesa: 'Sábados', focaccia: 'Sáb y dom' };
function pintarFinde() {
  const pista = $('#finde-pista'); if (!PRODS.length) return;
  const items = PRODS.filter((p) => p.categoria === `${pre()}-finde`);
  pista.innerHTML = items.map((p, i) => `<article class="fcard rv" style="--d:${i}">
      <div class="fcard__foto${p.foto ? '' : ' fcard__foto--sin'}"><img src="${p.foto ? esc(kit.asset(p.foto)) : 'img/isotipo.svg'}" alt="" width="720" height="864" loading="lazy" draggable="false"></div>
      <div class="fcard__txt"><span class="fcard__dia">${esc(FINDE_DIA[p.id.slice(4)] || 'Finde')}</span><h4>${esc(p.nombre)}</h4>
      <div class="fcard__pie"><b>${esc(fmt(p.precio))}</b><div data-kit-qty="${esc(p.id)}"></div></div></div></article>`).join('');
  kit?.carrito?.sync(pista); observar(pista);
  $$('.bcard__precio').forEach((b) => { const p = PRODS.find((x) => x.id === b.dataset.precio); if (p) b.textContent = fmt(p.precio); });
}
// fila con arrastre (dedo y mouse) desde cualquier punto
function filaArrastrable(fila) {
  const pista = fila.firstElementChild; let x0 = 0, tx = 0, base = 0, on = false, movio = false, id = null, vel = 0, tUlt = 0, xUlt = 0;
  const lim = () => Math.min(0, fila.clientWidth - pista.scrollWidth);
  const set = (v, anim) => { tx = v; pista.style.transition = anim ? 'transform .5s cubic-bezier(.2,.8,.2,1)' : 'none'; pista.style.transform = `translate3d(${tx}px,0,0)`; };
  fila.addEventListener('pointerdown', (e) => { if (e.button > 0) return; on = true; movio = false; id = e.pointerId; x0 = e.clientX; base = tx; vel = 0; tUlt = performance.now(); xUlt = e.clientX; });
  fila.addEventListener('pointermove', (e) => {
    if (!on || e.pointerId !== id) return; const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 6) { movio = true; fila.classList.add('arrastrando'); try { fila.setPointerCapture(id); } catch (_) {} }
    if (!movio) return;
    const now = performance.now(); vel = (e.clientX - xUlt) / Math.max(1, now - tUlt); tUlt = now; xUlt = e.clientX;
    let v = base + dx; const L = lim(); if (v > 0) v *= .35; if (v < L) v = L + (v - L) * .35; set(v, false);
  });
  const fin = () => { if (!on) return; on = false; fila.classList.remove('arrastrando'); set(Math.max(lim(), Math.min(0, tx + vel * 220)), true); };
  fila.addEventListener('pointerup', fin); fila.addEventListener('pointercancel', fin);
  fila.addEventListener('click', (e) => { if (movio) { e.preventDefault(); e.stopPropagation(); movio = false; } }, true);
  fila.addEventListener('dragstart', (e) => e.preventDefault());
  addEventListener('resize', () => set(Math.max(lim(), tx), false));
}
filaArrastrable($('#finde-fila'));

/* ---------------- GALERÍA: mazo en el celu ---------------- */
(function mazo() {
  const g = $('#galeria'); let cartas = $$('.gal', g);
  const orden = () => cartas.forEach((c, i) => { c.style.zIndex = String(cartas.length - i); c.style.transform = i === 0 ? 'rotate(0deg)' : `rotate(var(--r)) translateY(${Math.min(i, 3) * 8}px) scale(${1 - Math.min(i, 3) * 0.03})`; });
  orden();
  let d = null;
  g.addEventListener('pointerdown', (e) => { if (esDesk()) return; const c = e.target.closest('.gal'); if (c !== cartas[0]) return; d = { c, x: e.clientX, y: e.clientY, dx: 0, h: null, id: e.pointerId }; c.style.transition = 'none'; });
  g.addEventListener('pointermove', (e) => {
    if (!d || e.pointerId !== d.id) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (d.h == null && Math.hypot(dx, dy) > 8) { d.h = Math.abs(dx) > Math.abs(dy); if (d.h) try { g.setPointerCapture(d.id); } catch (_) {} }
    if (!d.h) return; d.dx = dx; d.c.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
  });
  const fin = () => {
    if (!d) return; const { c, dx } = d; d = null; c.style.transition = '';
    if (Math.abs(dx) > 80) { c.classList.add('tira'); c.style.transform = `translateX(${Math.sign(dx) * 130}%) rotate(${Math.sign(dx) * 18}deg)`; c.style.opacity = '0';
      setTimeout(() => { c.classList.remove('tira'); c.style.transition = 'none'; c.style.opacity = ''; cartas.push(cartas.shift()); orden(); void c.offsetWidth; c.style.transition = ''; }, 420);
    } else orden();
  };
  g.addEventListener('pointerup', fin); g.addEventListener('pointercancel', fin);
  // en el celu el touch-action del mazo es pan-y: el arrastre horizontal lo manejamos acá
  g.addEventListener('touchmove', (e) => { if (d?.h) e.preventDefault(); }, { passive: false });
  matchMedia('(min-width: 1024px)').addEventListener('change', () => { cartas.forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; }); if (!esDesk()) orden(); });
  if (esDesk()) cartas.forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; });
})();

/* ---------------- SUCURSALES (pestañas en el celu) ---------------- */
$$('[data-suc-mapa]').forEach((b) => b.addEventListener('click', () => {
  $$('[data-suc-mapa]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  $$('[data-suc-bloque]').forEach((s) => s.classList.toggle('on', s.dataset.sucBloque === b.dataset.sucMapa));
}));

/* ---------------- KIT ---------------- */
document.addEventListener('kit:carta', (e) => { decorarCarta(e.detail.el, e.detail.productos); if (!e.detail.el.hidden) fotoInicial(); pintarCaja(); pintarFinde(); });
function pintarBolsa(lineas) {
  const n = (lineas || []).reduce((s, l) => s + (l.cant || 0), 0); const b = $('.nav__n');
  b.hidden = !n; b.textContent = n;
}
document.addEventListener('kit:carrito', (e) => pintarBolsa(e.detail.lineas));
try {
  kit = await initKit({
    config: 'cliente.json',
    carta: { template: templateItem, itemClass: 'it' },
    cartas: { 'carta-pal': { template: templateItem, filtro: (p) => p.categoria.startsWith('pal-') }, 'carta-bel': { template: templateItem, filtro: (p) => p.categoria.startsWith('bel-') } },
    carrito: { label: 'Tu bolsa', icono: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>' },
    imagenes: { lqip: 'img/lqip.json' },
    badgeTexto: innerWidth < 1024 ? 'Panel del dueño' : 'Probá el panel del dueño',
  });
  await kit.carrito?.listo;
  PRODS = await kit.store.getProductos();
  elegirSucursal(SUC);
  pintarBolsa(kit.carrito?.lineas);
  kit.store.onChange(async () => { PRODS = await kit.store.getProductos(); pintarCaja(); pintarFinde(); });
} catch (err) { console.error('[amasadero] kit', err); }
