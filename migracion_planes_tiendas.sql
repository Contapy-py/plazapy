-- Migración: soporte de planes pagos (destacado / verificado) para tiendas
-- Ejecutar en el SQL editor de Supabase de tu proyecto PlazaPY

alter table tiendas
  add column if not exists destacada_hasta timestamptz,
  add column if not exists plan_solicitado text,          -- 'destacado' | 'verificado'
  add column if not exists plan_solicitado_en timestamptz;

-- No se toca nada más: 'destacada' y 'verificado' ya existían en tu tabla
-- y ya se usan en tiendas.html, index.html y tienda.html.
