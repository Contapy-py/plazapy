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
      `${SUPA_URL}/rest/v1/anuncios?id=eq.${id}&estado=eq.aprobado&select=*`,
      { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
    );
    const data = await r.json();
    return data?.[0] || null;
  } catch(e) { return null; }
}

function condicionSchema(cond) {
  const map = {
    'nuevo': 'https://schema.org/NewCondition',
    'como-nuevo': 'https://schema.org/LikeNewCondition',
    'bueno': 'https://schema.org/UsedCondition',
    'usado': 'https://schema.org/UsedCondition',
  };
  return map[cond] || 'https://schema.org/UsedCondition';
}

function botHTML(a) {
  const url = `https://www.plazapy.com/detalle.html?id=${a.id}`;
  const img = a.foto_url || 'https://www.plazapy.com/og-default.png';
  const titulo = esc(a.titulo);
  const desc = esc((a.descripcion||'').substring(0, 300));
  const precio = 'Gs. ' + Number(a.precio).toLocaleString('es-PY');
  const ciudad = esc(a.ciudad || 'Paraguay');
  const condicion = esc(a.condicion || '');
  const categoria = esc(a.categoria || '');
  const subcategoria = esc(a.subcategoria || '');

  // Schema.org completo
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": a.titulo,
    "description": a.descripcion || '',
    "image": img,
    "url": url,
    "brand": { "@type": "Brand", "name": "PlazaPY" },
    "category": subcategoria || categoria,
    "itemCondition": condicionSchema(a.condicion),
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PYG",
      "price": a.precio,
      "priceValidUntil": new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      "availability": "https://schema.org/InStock",
      "itemCondition": condicionSchema(a.condicion),
      "seller": {
        "@type": "Person",
        "name": a.nombre_contacto || 'Vendedor PlazaPY'
      },
      "areaServed": {
        "@type": "City",
        "name": a.ciudad || "Asunción",
        "addressCountry": "PY"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "PY",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 0,
        "returnMethod": "https://schema.org/ReturnInStore",
        "returnFees": "https://schema.org/FreeReturn"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "PYG"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "PY"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 3,
            "unitCode": "DAY"
          }
        }
      }
    }
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${titulo} — PlazaPY</title>
<meta name="description" content="${desc}"/>
<meta name="keywords" content="${titulo}, ${categoria}, ${subcategoria}, ${ciudad}, Paraguay, clasificados Paraguay, PlazaPY"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${url}"/>
<meta property="og:title" content="${titulo} — PlazaPY"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:type" content="product"/>
<meta property="og:site_name" content="PlazaPY — El mercado digital paraguayo"/>
<meta property="product:price:amount" content="${a.precio}"/>
<meta property="product:price:currency" content="PYG"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${titulo} — PlazaPY"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="twitter:image" content="${img}"/>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<h1>${titulo}</h1>
<p><strong>Precio:</strong> ${precio}</p>
<p><strong>Categoría:</strong> ${categoria}${subcategoria ? ' › ' + subcategoria : ''}</p>
<p><strong>Condición:</strong> ${condicion}</p>
<p><strong>Ciudad:</strong> ${ciudad}, Paraguay</p>
<p><strong>Descripción:</strong> ${esc(a.descripcion||'')}</p>
${a.nombre_contacto ? `<p><strong>Vendedor:</strong> ${esc(a.nombre_contacto)}</p>` : ''}
<p><a href="${url}">Ver anuncio completo con fotos en PlazaPY</a></p>
<p><a href="https://www.plazapy.com/anuncios.html?cat=${a.categoria}">Ver más anuncios de ${categoria} en PlazaPY</a></p>
<p><a href="https://www.plazapy.com/">PlazaPY — El mercado digital paraguayo</a></p>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ua = request.headers.get('user-agent') || '';
    const id = url.searchParams.get('id');

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

    return env.ASSETS.fetch(request);
  }
};
