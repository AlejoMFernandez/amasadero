// Proveeduría mayorista: planilla de pedido semanal → panel del local + WhatsApp de la proveeduría.
import { initKit } from '../kit/kit.js?v=1';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WA = '5491125301430';
const KEY = 'am-may-v1';

// reveal
const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('visto'); io.unobserve(en.target); } }), { threshold: 0.15 });
$$('.rv').forEach((el) => io.observe(el));

let PRODS = [], CAT = 'may-pasteleria';
let sel = {};
try { sel = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { sel = {}; }
const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch (_) {} };
const unidad = (p, n) => (p.unidad === 'docenas' ? (n === 1 ? 'docena' : 'docenas') : (n === 1 ? 'unidad' : 'unidades'));
const corta = (p) => (p.unidad === 'docenas' ? 'doc.' : 'u.');
const estados = (p) => p.opciones?.find((o) => o.id === 'estado')?.valores || [];

let kit = null;
function pintar() {
  const lista = PRODS.filter((p) => p.categoria === CAT && p.disponible !== false);
  $('#n-pas').textContent = PRODS.filter((p) => p.categoria === 'may-pasteleria').length;
  $('#n-pan').textContent = PRODS.filter((p) => p.categoria === 'may-panaderia').length;
  $('#may-filas').innerHTML = lista.map((p, i) => {
    const s = sel[p.id] || {}; const n = s.n || 0; const est = estados(p); const e = s.e || est[0]?.id;
    return `<article class="mfila${n ? ' elegido' : ''}" data-id="${esc(p.id)}" style="--i:${i}">
      <div class="mfila__foto${p.miniatura || p.foto ? '' : ' mfila__foto--sin'}"><img src="${esc(p.miniatura || p.foto ? kit.asset(p.miniatura || p.foto) : '../img/isotipo.svg')}" alt="" width="84" height="84" loading="lazy"></div>
      <div class="mfila__info"><h3 class="mfila__n">${esc(p.nombre)}<span class="mfila__peso">${esc(p.peso || '')}</span></h3>${p.descripcion ? `<p class="mfila__d">${esc(p.descripcion)}</p>` : ''}</div>
      <div class="mfila__ctl">
        <fieldset class="estados${est.length === 1 ? ' estados--solo' : ''}"><legend class="kit-sr">Cómo lo querés</legend>
          ${est.map((v) => `<label><input type="radio" name="e-${esc(p.id)}" value="${esc(v.id)}" ${v.id === e ? 'checked' : ''}><span>${esc(v.nombre)}</span></label>`).join('')}
        </fieldset>
        <div class="paso" role="group" aria-label="Cantidad por semana de ${esc(p.nombre)}">
          <button type="button" data-d="-1" aria-label="Menos">−</button>
          <output>${n ? `${n} <small>${corta(p)}</small>` : `0 <small>${corta(p)}</small>`}</output>
          <button type="button" data-d="1" aria-label="Más">+</button>
        </div>
      </div>
    </article>`;
  }).join('');
  resumen();
}
function resumen() {
  const items = Object.entries(sel).filter(([, s]) => s.n > 0).map(([id, s]) => ({ p: PRODS.find((x) => x.id === id), ...s })).filter((x) => x.p);
  $('#res-lista').innerHTML = items.length ? items.map(({ p, n, e }) => `<li><span>${esc(p.nombre)} · ${esc(estados(p).find((v) => v.id === e)?.nombre || '').toLowerCase()}</span><span>${n} ${unidad(p, n)}</span></li>`).join('') : '<li class="res__vacio">Todavía no elegiste productos.</li>';
  const barra = $('#may-barra');
  barra.hidden = !items.length;
  $('#may-barra-txt').textContent = `Ver mi pedido (${items.length} ${items.length === 1 ? 'producto' : 'productos'})`;
}
$('#may-filas').addEventListener('click', (e) => {
  const b = e.target.closest('.paso button'); if (!b) return;
  const f = b.closest('.mfila'); const id = f.dataset.id; const p = PRODS.find((x) => x.id === id);
  const s = sel[id] || { n: 0, e: estados(p)[0]?.id };
  s.n = Math.max(0, Math.min(99, (s.n || 0) + +b.dataset.d));
  const ch = f.querySelector('.estados input:checked'); if (ch) s.e = ch.value;
  sel[id] = s; if (!s.n) delete sel[id]; guardar();
  f.classList.toggle('elegido', s.n > 0);
  f.querySelector('.paso output').innerHTML = `${s.n} <small>${corta(p)}</small>`;
  resumen();
});
$('#may-filas').addEventListener('change', (e) => {
  const r = e.target.closest('.estados input'); if (!r) return;
  const id = r.closest('.mfila').dataset.id;
  if (sel[id]) { sel[id].e = r.value; guardar(); resumen(); }
});
$$('.may-tab').forEach((t) => t.addEventListener('click', () => {
  CAT = t.dataset.mayCat; $$('.may-tab').forEach((x) => x.setAttribute('aria-selected', String(x === t))); pintar();
}));

// enviar
$('#may-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.currentTarget; const err = $('#may-err'); err.textContent = '';
  const items = Object.entries(sel).filter(([, s]) => s.n > 0);
  const negocio = f.negocio.value.trim(), nombre = f.nombre.value.trim(), tel = f.tel.value.trim(), zona = f.zona.value.trim();
  const dias = $$('input[name="dia"]:checked', f).map((x) => x.value);
  if (!items.length) { err.textContent = 'Elegí al menos un producto del catálogo.'; return; }
  if (!negocio || !nombre) { err.textContent = 'Contanos el nombre de tu negocio y quién hace el pedido.'; (negocio ? f.nombre : f.negocio).focus(); return; }
  if (tel.replace(/\D/g, '').length < 8) { err.textContent = 'Dejanos un WhatsApp para mandarte la cotización.'; f.tel.focus(); return; }
  const btn = $('#may-ok'); btn.disabled = true;
  const nota = ['Pedido semanal (proveeduría)', zona && `Zona: ${zona}`, dias.length && `Entrega: ${dias.join(', ')}`].filter(Boolean).join(' · ');
  let codigo = '';
  try {
    const ped = await kit.store.createPedido({
      items: items.map(([id, s]) => ({ id, cant: s.n, opc: { estado: s.e } })),
      tipo: 'retiro', pago: 'whatsapp', nota,
      cliente: { nombre: `${negocio} · ${nombre}`, telefono: tel },
      sucursal: { id: 'proveeduria', nombre: 'Proveeduría', direccion: 'Mayorista' },
    });
    codigo = ped.codigo;
  } catch (er) { console.warn('[proveeduria] panel', er); }
  const lineas = items.map(([id, s]) => { const p = PRODS.find((x) => x.id === id); const est = estados(p).find((v) => v.id === s.e)?.nombre || ''; return `• ${p.nombre} (${p.peso}) · ${est.toLowerCase()} · ${s.n} ${unidad(p, s.n)} por semana`; });
  const msg = [`Hola Amasadero! Quiero cotizar un pedido semanal para la proveeduría${codigo ? ` (${codigo})` : ''}.`, '', `Negocio: ${negocio}`, `Contacto: ${nombre} · ${tel}`, zona ? `Zona: ${zona}` : null, dias.length ? `Días de entrega: ${dias.join(', ')}` : null, '', ...lineas].filter((x) => x !== null).join('\n');
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  f.hidden = true; $('#res-lista').hidden = true;
  $('#may-listo-txt').textContent = `${codigo ? `Tu código es ${codigo}. ` : ''}La proveeduría ya lo ve en su panel y te responde por WhatsApp con la cotización.`;
  $('#may-listo').hidden = false; $('#may-barra').hidden = true;
  sel = {}; guardar(); btn.disabled = false;
  $('#resumen').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#may-otro').addEventListener('click', () => { $('#may-form').hidden = false; $('#res-lista').hidden = false; $('#may-listo').hidden = true; $('#may-form').reset(); pintar(); });

try {
  kit = await initKit({ config: '../cliente.json', carrito: { fab: false }, adminUrl: '../admin/', imagenes: { lqip: '../img/lqip.json' } });
  const cargar = async () => { PRODS = (await kit.store.getProductos()).filter((p) => p.categoria?.startsWith('may-')); pintar(); };
  await cargar(); kit.store.onChange(cargar);
} catch (err) { console.error('[proveeduria] kit', err); $('#may-filas').innerHTML = '<p>No se pudo cargar el catálogo. Escribinos al WhatsApp 11 2530-1430.</p>'; }
