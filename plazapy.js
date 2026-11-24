/* PlazaPY · utilidades compartidas: menú, pie de página y helpers */
(function(){
  const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gs=n=>'Gs. '+Number(n||0).toLocaleString('es-PY');

  const CATEGORIAS=[
    ['electronica','Electrónica','📱'],['ropa','Ropa y moda','👗'],['hogar','Hogar','🏠'],['deportes','Deportes','⚽'],
    ['belleza','Belleza','💄'],['alimentos','Alimentos','🍔'],['juguetes','Juguetes','🧸'],['mascotas','Mascotas','🐾'],
    ['servicios','Servicios','🔧'],['libros','Libros','📚'],['otros','Otros','📦']
  ];
  const ICONOS=Object.fromEntries(CATEGORIAS.map(c=>[c[0],c[2]]));
  ICONOS.autos='🚗';ICONOS.motos='🏍️';ICONOS.inmuebles='🏠';

  const I={
    inicio:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>',
    productos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    anuncios:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6"/></svg>',
    tiendas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s0 0 0 0"/></svg>',
    cuenta:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    lupa:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };
  const LINKS=[
    ['index.html','Inicio','inicio'],
    ['productos.html','Productos','productos'],
    ['anuncios.html','Inmuebles y vehículos','anuncios'],
    ['tiendas.html','Tiendas','tiendas']
  ];

  function nav(){
    const el=document.getElementById('pz-nav');
    if(!el)return;
    const activo=el.dataset.activo||'';
    el.className='pz-nav';
    el.innerHTML=`<div class="pz-nav-in">
      <a class="pz-logo" href="index.html">Plaza<span>PY</span></a>
      <nav class="pz-links" aria-label="Principal">${LINKS.map(l=>`<a href="${l[0]}" class="${l[2]===activo?'activo':''}">${l[1]}</a>`).join('')}</nav>
      <form class="pz-search" role="search" onsubmit="return PZ.buscar(event)">
        ${I.lupa}<input type="search" id="searchInput" placeholder="${esc(el.dataset.placeholder||'Buscar productos')}" aria-label="Buscar"/>
      </form>
      <div class="pz-right">
        <a href="cuenta.html" class="btn btn-outline btn-sm">Mi cuenta</a>
        <a href="vender.html" class="btn btn-primary btn-sm">Abrir tienda</a>
      </div>
    </div>`;
    // barra inferior (celular)
    if(el.dataset.tabbar!=='0'&&!document.getElementById('pz-tabbar')){
      const tb=document.createElement('nav');
      tb.id='pz-tabbar';tb.className='pz-tabbar';tb.setAttribute('aria-label','Navegación');
      const T=[['index.html','Inicio','inicio'],['productos.html','Productos','productos'],['anuncios.html','Inmuebles','anuncios'],['tiendas.html','Tiendas','tiendas'],['cuenta.html','Cuenta','cuenta']];
      tb.innerHTML=T.map(t=>`<a href="${t[0]}" class="${t[2]===activo?'activo':''}">${I[t[2]]}<span>${t[1]}</span></a>`).join('');
      document.body.appendChild(tb);
    }
  }

  function footer(){
    const el=document.getElementById('pz-footer');
    if(!el)return;
    el.className='pz-footer';
    el.innerHTML=`<div class="pz-footer-in">
      <div class="pz-footer-top">
        <div>
          <a class="pz-logo" href="index.html">Plaza<span>PY</span></a>
          <p class="pz-footer-desc">El marketplace paraguayo. Comprá en tiendas locales con delivery a domicilio en Asunción y Gran Asunción, y encontrá inmuebles y vehículos.</p>
        </div>
        <div><h4>Comprar</h4><ul>
          <li><a href="productos.html">Productos</a></li>
          <li><a href="tiendas.html">Tiendas</a></li>
          <li><a href="productos.html?oferta=1">Ofertas</a></li>
          <li><a href="anuncios.html">Inmuebles y vehículos</a></li>
        </ul></div>
        <div><h4>Vender</h4><ul>
          <li><a href="vender.html">Abrir mi tienda</a></li>
          <li><a href="publicar.html">Publicar un anuncio</a></li>
          <li><a href="cuenta.html">Mi cuenta</a></li>
        </ul></div>
        <div><h4>Ayuda</h4><ul>
          <li><a href="https://wa.me/595995676743?text=Hola%20PlazaPY!" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="mailto:hola@plazapy.com">hola@plazapy.com</a></li>
          <li><a href="terminos.html">Términos</a></li>
          <li><a href="privacidad.html">Privacidad</a></li>
        </ul></div>
      </div>
      <div class="pz-footer-bottom"><span>🇵🇾 Hecho en Paraguay · © ${new Date().getFullYear()} PlazaPY</span><span>Todos los derechos reservados</span></div>
    </div>`;
  }

  function buscar(e){
    if(e)e.preventDefault();
    const q=(document.getElementById('searchInput').value||'').trim();
    if(typeof window.PZ_ONSEARCH==='function'){window.PZ_ONSEARCH(q);return false;}
    const nav=document.getElementById('pz-nav');
    const destino=(nav&&nav.dataset.buscar)||'productos.html';
    window.location.href=destino+(q?'?q='+encodeURIComponent(q):'');
    return false;
  }

  function toast(msg){
    const t=document.createElement('div');t.className='pz-toast';t.textContent=msg;
    document.body.appendChild(t);setTimeout(()=>t.remove(),2600);
  }


  /* ── Anuncios (inmuebles y vehículos) ── */
  function operacion(a){
    return /alquiler/i.test(a.subcategoria||'')?'Alquiler':'Venta';
  }
  const NOMBRE_TIPO={inmuebles:'Inmueble',autos:'Auto',motos:'Moto'};
  function cardAnuncio(a){
    const esInm=a.categoria==='inmuebles';
    const op=esInm?operacion(a):'';
    const img=a.foto_url?`<img src="${esc(a.foto_url)}" alt="${esc(a.titulo)}" loading="lazy"/>`:`<span class="ico">${ICONOS[a.categoria]||'📦'}</span>`;
    const etiqueta=esInm?`<span class="acard-op ${op==='Alquiler'?'alq':''}">${op==='Alquiler'?'Alquiler':'En venta'}</span>`:`<span class="acard-op">${esc(NOMBRE_TIPO[a.categoria]||'Anuncio')}</span>`;
    const loc=[a.barrio,a.ciudad].filter(Boolean).join(', ')||'Paraguay';
    return `<a class="acard" href="detalle.html?id=${encodeURIComponent(a.id)}">
      <div class="acard-img">${img}${etiqueta}${a.destacado?'<span class="acard-dest">★ Destacado</span>':''}</div>
      <div class="acard-body">
        <div class="acard-precio">${gs(a.precio)}${op==='Alquiler'?' <small>/ mes</small>':''}</div>
        <div class="acard-titulo">${esc(a.titulo)}</div>
        <div class="acard-loc">📍 ${esc(loc)}</div>
      </div>
    </a>`;
  }

  window.PZ={esc,gs,ICONOS,CATEGORIAS,buscar,toast,nav,footer,operacion,cardAnuncio};
  const iniciar=()=>{nav();footer();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
