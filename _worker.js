const SUPA_URL = 'https://ayjlnbxcojqglcufqzob.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5amxuYnhjb2pxZ2xjdWZxem9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjE3MzcsImV4cCI6MjA5NTgzNzczN30.K3IF9CDiINmZ-rN3x40Z7eAivJFtMHRJHHlOnw7MUCY';

const BOTS = ['googlebot','bingbot','twitterbot','facebookexternalhit','whatsapp','telegrambot','linkedinbot','slackbot'];

function isBot(ua) {
  return BOTS.some(b => (ua||'').toLowerCase().includes(b));
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function getAnuncio(id) {
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/anuncios?id=eq.${id}&estado=eq.aprobado&select=id,titulo,descripcion,precio,categoria,ciudad,condicion,foto_url`,
      { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
    );
    const data = await r.json();
    return data?.[0] || null;
  } catch(e) { return null; }
}

function botHTML(a) {
  const url = `https://www.plazapy.com/detalle.html?id=${a.id}`;
  const img = a.foto_url || 'https://www.plazapy.com/og-default.png';
  const titulo = esc(a.titulo);
  const desc = esc((a.descripcion||'').substring(0,200));
  const precio = 'Gs. ' + Number(a.precio).toLocaleString('es-PY');
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>${titulo} — PlazaPY</title>
<meta name="description" content="${desc}"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${url}"/>
<meta property="og:title" content="${titulo} — PlazaPY"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:type" content="product"/>
<meta property="og:site_name" content="PlazaPY"/>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"${titulo}","description":"${desc}","image":"${img}","url":"${url}","offers":{"@type":"Offer","priceCurrency":"PYG","price":${a.precio},"availability":"https://schema.org/InStock"}}</script>
</head>
<body>
<h1>${titulo}</h1>
<p><strong>Precio:</strong> ${precio}</p>
<p><strong>Categoría:</strong> ${esc(a.categoria)}</p>
<p><strong>Ciudad:</strong> ${esc(a.ciudad||'Paraguay')}</p>
<p><strong>Condición:</strong> ${esc(a.condicion||'—')}</p>
<p>${desc}</p>
<p><a href="${url}">Ver anuncio completo en PlazaPY</a></p>
<p><a href="https://www.plazapy.com/">PlazaPY — El mercado digital paraguayo</a></p>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ua = request.headers.get('user-agent') || '';
    const id = url.searchParams.get('id');

    // Solo para bots en /detalle.html
    if (url.pathname === '/detalle.html' && id && isBot(ua)) {
      const anuncio = await getAnuncio(id);
      if (anuncio) {
        return new Response(botHTML(anuncio), {
          status: 200,
          headers: {
            'content-type': 'text/html;charset=UTF-8',
            'cache-control': 'public,max-age=3600'
          }
        });
      }
    }

    // Todo lo demás → assets estáticos normales
    return env.ASSETS.fetch(request);
  }
};
