<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <section class="hero-section">
      <div class="hero-carousel">
        <transition-group name="fade" tag="div" class="slides">
          <div v-for="(slide, idx) in slides" 
               v-show="currentSlide === idx"
               :key="idx"
               class="slide"
               :style="{ backgroundImage: `url(${slide.image})` }">
            <div class="slide-overlay"></div>
            <div class="slide-content">
              <span class="slide-tag">{{ slide.tag }}</span>
              <h1 class="slide-title">{{ slide.title }}</h1>
              <p class="slide-desc">{{ slide.description }}</p>
              <router-link :to="slide.link" class="btn-slide">{{ slide.buttonText }} →</router-link>
            </div>
          </div>
        </transition-group>
        
        <button class="slide-arrow prev" @click="prevSlide">‹</button>
        <button class="slide-arrow next" @click="nextSlide">›</button>
        
        <div class="slide-nav">
          <button v-for="(_, idx) in slides" 
                  :key="idx"
                  :class="['slide-dot', { activo: currentSlide === idx }]"
                  @click="currentSlide = idx">
          </button>
        </div>
      </div>
    </section>

    <!-- Trust Bar -->
    <section class="trust-section">
      <div v-for="item in trustItems" :key="item" class="trust-item">
        {{ item }}
      </div>
    </section>

    <!-- Productos Destacados -->
    <section class="container section">
      <div class="section-header">
        <h2 class="section-title">🔥 Ofertas del día</h2>
        <router-link to="/productos?oferta=1" class="ver-mas">Ver todas →</router-link>
      </div>
      <div v-if="ofertas.length" class="products-grid">
        <ProductCard v-for="p in ofertas" :key="p.id" :product="p" />
      </div>
      <div v-else class="empty-state">
        <p>Cargando ofertas...</p>
      </div>
    </section>

    <!-- Tiendas Verificadas -->
    <section class="container section">
      <div class="section-header">
        <h2 class="section-title">🏪 Tiendas verificadas</h2>
        <router-link to="/tiendas" class="ver-mas">Ver todas →</router-link>
      </div>
      <div v-if="tiendas.length" class="stores-grid">
        <router-link v-for="t in tiendas" :key="t.id" :to="`/tienda/${t.id}`" class="store-card">
          <div class="store-banner" :style="t.banner_url ? `background-image: url(${t.banner_url})` : ''">
            <div class="store-logo">{{ t.logo_url ? '' : t.nombre[0] }}</div>
          </div>
          <div class="store-body">
            <span v-if="t.verificado" class="badge-verif">✓ Verificada</span>
            <h3 class="store-name">{{ t.nombre }}</h3>
            <p class="store-desc">{{ t.descripcion }}</p>
            <div class="store-meta">📍 {{ t.ciudad }}</div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Recién llegados -->
    <section class="container section">
      <div class="section-header">
        <h2 class="section-title">🆕 Recién llegados</h2>
        <router-link to="/productos?orden=nuevo" class="ver-mas">Ver todos →</router-link>
      </div>
      <div v-if="nuevos.length" class="products-grid">
        <ProductCard v-for="p in nuevos" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>

<script>
import { supabaseService } from '@/utils/supabaseClient'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'Home',
  components: { ProductCard },
  data() {
    return {
      currentSlide: 0,
      slides: [
        {
          tag: '🚀 Nuevo en PlazaPY',
          title: 'El marketplace paraguayo llegó',
          description: 'Comprá en tiendas locales con delivery a tu puerta en Asunción y Gran Asunción.',
          link: '/productos',
          buttonText: 'Ver productos',
          image: 'linear-gradient(135deg, #EE4D2D, #FF7043)'
        },
        {
          tag: '🏪 Para comerciantes',
          title: 'Abrí tu tienda online gratis',
          description: 'Sin costos fijos. Llegá a miles de compradores en todo Paraguay.',
          link: '/vender',
          buttonText: 'Crear mi tienda',
          image: 'linear-gradient(135deg, #26A65B, #2ecc71)'
        },
        {
          tag: '🚚 Delivery express',
          title: 'Entrega a domicilio en Asunción',
          description: 'Desde Gs. 15.000 a domicilio',
          link: '/productos',
          buttonText: 'Comprar ahora',
          image: 'linear-gradient(135deg, #333, #EE4D2D)'
        }
      ],
      trustItems: [
        '✅ Tiendas verificadas',
        '🚚 Delivery Asunción Gs. 15.000',
        '🚚 Gran Asunción Gs. 25.000',
        '🏪 Retiro en tienda gratis',
        '💬 Soporte por WhatsApp',
        '🇵🇾 100% paraguayo'
      ],
      ofertas: [],
      tiendas: [],
      nuevos: []
    }
  },
  mounted() {
    this.loadData()
    this.startAutoSlide()
  },
  beforeUnmount() {
    this.stopAutoSlide()
  },
  methods: {
    async loadData() {
      try {
        const [productos, tiendas] = await Promise.all([
          supabaseService.getProducts(),
          supabaseService.getStores()
        ])
        
        this.ofertas = productos.filter(p => p.precio_oferta).slice(0, 8)
        this.tiendas = tiendas.slice(0, 8)
        this.nuevos = productos.slice(0, 12)
      } catch (error) {
        console.error('Error loading home data:', error)
      }
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length
      this.resetAutoSlide()
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length
      this.resetAutoSlide()
    },
    startAutoSlide() {
      this.autoSlideInterval = setInterval(() => {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length
      }, 4000)
    },
    stopAutoSlide() {
      if (this.autoSlideInterval) {
        clearInterval(this.autoSlideInterval)
      }
    },
    resetAutoSlide() {
      this.stopAutoSlide()
      this.startAutoSlide()
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding: 1rem 2rem 0;
  max-width: 1280px;
  margin: 0 auto;
}

.hero-carousel {
  position: relative;
  overflow: hidden;
  background: #222;
  height: 320px;
  border-radius: 10px;
}

.slides {
  display: flex;
  height: 100%;
}

.slide {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.55) 0%, transparent 60%);
}

.slide-content {
  position: relative;
  z-index: 1;
  padding: 2rem 3.5rem;
  color: white;
  max-width: 580px;
  animation: slideInUp 0.5s ease-out;
}

.slide-tag {
  background: var(--amarillo);
  color: #333;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.slide-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: clamp(1.4rem, 3vw, 2.3rem);
  line-height: 1.15;
  margin-bottom: 0.5rem;
}

.slide-desc {
  font-size: 0.9rem;
  opacity: 0.85;
  margin-bottom: 1.1rem;
  line-height: 1.5;
}

.btn-slide {
  background: var(--rojo);
  color: white;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  text-decoration: none;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-block;
  transition: background 0.2s ease;
}

.btn-slide:hover {
  background: var(--rojo-dark);
}

.slide-nav {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.4rem;
  z-index: 10;
}

.slide-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.slide-dot.activo {
  background: var(--amarillo);
  width: 22px;
  border-radius: 4px;
}

.slide-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  transition: background 0.2s ease;
}

.slide-arrow:hover {
  background: rgba(0, 0, 0, 0.55);
}

.slide-arrow.prev {
  left: 1rem;
}

.slide-arrow.next {
  right: 1rem;
}

.trust-section {
  background: var(--rojo-light);
  padding: 0.65rem 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.trust-item {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--rojo-dark);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 2rem 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--negro);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 22px;
  background: var(--rojo);
  border-radius: 2px;
}

.ver-mas {
  color: var(--rojo);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: text-decoration 0.2s ease;
}

.ver-mas:hover {
  text-decoration: underline;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1rem;
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.store-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--borde);
  transition: all 0.2s ease;
  text-decoration: none;
  display: block;
  color: var(--negro);
}

.store-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.store-banner {
  height: 80px;
  background: linear-gradient(135deg, var(--rojo), var(--naranja));
  position: relative;
  background-size: cover;
}

.store-logo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: white;
  border: 3px solid white;
  position: absolute;
  bottom: -26px;
  left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--rojo);
}

.store-body {
  padding: 2rem 1rem 1rem;
}

.badge-verif {
  background: var(--verde-light);
  color: var(--verde);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 0.3rem;
}

.store-name {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.store-desc {
  font-size: 0.75rem;
  color: var(--gris);
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.72rem;
  color: var(--gris);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: var(--gris);
}

@media (max-width: 768px) {
  .slide-content {
    padding: 1.25rem 1.5rem;
  }
  .slide-title {
    font-size: 1.1rem;
  }
  .slide-desc {
    display: none;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .stores-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .trust-section {
    gap: 1rem;
    padding: 0.6rem 1rem;
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }
  .trust-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@media (max-width: 400px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
