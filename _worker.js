const SUPA_URL = 'https://ayjlnbxcojqglcufqzob.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5amxuYnhjb2pxZ2xjdWZxem9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNjE3MzcsImV4cCI6MjA5NTgzNzczN30.K3IF9CDiINmZ-rN3x40Z7eAivJFtMHRJHHlOnw7MUCY';

const BOTS = ['googlebot','bingbot','twitterbot','facebookexternalhit','whatsapp','telegrambot','linkedinbot','slackbot'];

function isBot(ua) {
  return BOTS.some(b => (ua||'').toLowerCase().includes(b));
}

function esc(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function getProducto(id) {
  try {
    const r = await fetch(
      `${SUPA_URL}/rest/v1/productos?id=eq.${id}&estado=eq.aprobado&select=*,tiendas(nombre,ciudad,whatsapp)`,
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

function botHTML(p) {
  const url = `https://www.plazapy.com/producto.html?id=${p.id}`;
  const tienda = p.tiendas || {};
  const precioFinal = p.precio_oferta || p.precio;
  const img = p.foto_url || 'https://www.plazapy.com/og-default.png';
  const titulo = esc(p.nombre);
  const desc = esc((p.descripcion||'').substring(0, 300));
  const precioTxt = 'Gs. ' + Number(precioFinal).toLocaleString('es-PY');
  const ciudad = esc(tienda.ciudad || 'Paraguay');
  const categoria = esc(p.categoria || '');
  const subcategoria = esc(p.subcategoria || '');
  const tiendaNombre = esc(tienda.nombre || 'PlazaPY');

  // Schema.org — PRECIO EXPLICITO EN GUARANIES (PYG)
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": p.nombre,
    "description": p.descripcion || '',
    "image": img,
    "url": url,
    "brand": { "@type": "Brand", "name": tiendaNombre },
    "category": subcategoria || categoria,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PYG",
      "price": precioFinal,
      "priceValidUntil": new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      "availability": p.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": { "@type": "Organization", "name": tiendaNombre },
      "areaServed": { "@type": "Country", "name": "Paraguay" },
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
        "shippingRate": { "@type": "MonetaryAmount", "value": "15000", "currency": "PYG" },
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "PY" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 2, "unitCode": "DAY" }
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
<meta name="keywords" content="${titulo}, ${categoria}, ${subcategoria}, ${ciudad}, Paraguay, marketplace Paraguay, PlazaPY"/>
<meta name="robots" content="index,follow"/>
<link rel="canonical" href="${url}"/>
<meta property="og:title" content="${titulo} — PlazaPY"/>
<meta property="og:description" content="${desc}"/>
<meta property="og:image" content="${img}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:type" content="product"/>
<meta property="og:site_name" content="PlazaPY — El marketplace paraguayo"/>
<meta property="product:price:amount" content="${precioFinal}"/>
<meta property="product:price:currency" content="PYG"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${titulo} — PlazaPY"/>
<meta name="twitter:description" content="${desc}"/>
<meta name="twitter:image" content="${img}"/>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<h1>${titulo}</h1>
<p><strong>Precio:</strong> ${precioTxt}</p>
<p><strong>Categoría:</strong> ${categoria}${subcategoria ? ' › ' + subcategoria : ''}</p>
<p><strong>Ciudad:</strong> ${ciudad}, Paraguay</p>
<p><strong>Descripción:</strong> ${esc(p.descripcion||'')}</p>
<p><strong>Vendido por:</strong> ${tiendaNombre}</p>
<p><a href="${url}">Ver producto completo con fotos en PlazaPY</a></p>
<p><a href="https://www.plazapy.com/productos.html?cat=${p.categoria}">Ver más productos de ${categoria} en PlazaPY</a></p>
<p><a href="https://www.plazapy.com/">PlazaPY — El marketplace paraguayo</a></p>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ua = request.headers.get('user-agent') || '';
    const id = url.searchParams.get('id');

    // Apunta a /producto.html (no /detalle.html, que era la arquitectura vieja de clasificados)
    if (url.pathname === '/producto.html' && id && isBot(ua)) {
      const producto = await getProducto(id);
      if (producto) {
        return new Response(botHTML(producto), {
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
