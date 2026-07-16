<template>
  <div class="productos-page">
    <div class="layout">
      <!-- Sidebar Filtros -->
      <aside class="sidebar">
        <div class="filtro-box">
          <h3 class="filtro-titulo">Categoría</h3>
          <label v-for="cat in categories" :key="cat.value" class="filtro-item">
            <input type="radio" v-model="selectedCategory" :value="cat.value" @change="applyFilters" />
            {{ cat.icon }} {{ cat.name }}
          </label>
        </div>

        <div class="filtro-box">
          <h3 class="filtro-titulo">Precio (Gs.)</h3>
          <div class="precio-row">
            <input v-model.number="minPrice" type="number" placeholder="Mín" @change="applyFilters" />
            <span>—</span>
            <input v-model.number="maxPrice" type="number" placeholder="Máx" @change="applyFilters" />
          </div>
          <button class="btn-filtrar" @click="applyFilters">Aplicar filtros</button>
          <button class="btn-limpiar" @click="clearFilters">Limpiar todo</button>
        </div>

        <div class="filtro-box">
          <h3 class="filtro-titulo">Mostrar</h3>
          <label class="filtro-item">
            <input v-model="onlyOffers" type="checkbox" @change="applyFilters" />
            🔥 Solo ofertas
          </label>
          <label class="filtro-item">
            <input v-model="onlyFeatured" type="checkbox" @change="applyFilters" />
            ⭐ Solo destacados
          </label>
        </div>
      </aside>

      <!-- Content -->
      <div class="content">
        <div class="content-header">
          <div class="results-count">
            <strong>{{ filteredProducts.length }}</strong> producto{{ filteredProducts.length !== 1 ? 's' : '' }} encontrado{{ filteredProducts.length !== 1 ? 's' : '' }}
          </div>
          <select v-model="sortBy" class="sort-select" @change="applyFilters">
            <option value="nuevos">Más recientes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="destacados">Destacados primero</option>
          </select>
        </div>

        <div v-if="filteredProducts.length" class="products-grid">
          <ProductCard v-for="p in paginatedProducts" :key="p.id" :product="p" />
        </div>
        <div v-else class="empty-state">
          <p>🔍 No encontramos productos</p>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button v-if="currentPage > 1" class="pag-btn" @click="currentPage--">← Anterior</button>
          <button v-for="page in visiblePages" :key="page" 
                  :class="['pag-btn', { activo: page === currentPage }]"
                  @click="currentPage = page">
            {{ page }}
          </button>
          <button v-if="currentPage < totalPages" class="pag-btn" @click="currentPage++">Siguiente →</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabaseService } from '@/utils/supabaseClient'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'Productos',
  components: { ProductCard },
  data() {
    return {
      allProducts: [],
      categories: [
        { icon: '📱', name: 'Electrónica', value: 'electronica' },
        { icon: '👗', name: 'Ropa y moda', value: 'ropa' },
        { icon: '🏠', name: 'Hogar', value: 'hogar' },
        { icon: '⚽', name: 'Deportes', value: 'deportes' },
        { icon: '💄', name: 'Belleza', value: 'belleza' },
        { icon: '🍔', name: 'Alimentos', value: 'alimentos' },
        { icon: '🧸', name: 'Juguetes', value: 'juguetes' },
        { icon: '🐾', name: 'Mascotas', value: 'mascotas' },
        { icon: '🚗', name: 'Autos', value: 'autos' },
        { icon: '🔧', name: 'Servicios', value: 'servicios' }
      ],
      selectedCategory: '',
      minPrice: null,
      maxPrice: null,
      onlyOffers: false,
      onlyFeatured: false,
      sortBy: 'nuevos',
      currentPage: 1,
      itemsPerPage: 20
    }
  },
  computed: {
    filteredProducts() {
      let filtered = this.allProducts.filter(p => {
        if (this.selectedCategory && p.categoria !== this.selectedCategory) return false
        const price = p.precio_oferta || p.precio
        if (this.minPrice && price < this.minPrice) return false
        if (this.maxPrice && price > this.maxPrice) return false
        if (this.onlyOffers && !p.precio_oferta) return false
        if (this.onlyFeatured && !p.destacado) return false
        return true
      })

      // Sorting
      if (this.sortBy === 'precio_asc') {
        filtered.sort((a, b) => (a.precio_oferta || a.precio) - (b.precio_oferta || b.precio))
      } else if (this.sortBy === 'precio_desc') {
        filtered.sort((a, b) => (b.precio_oferta || b.precio) - (a.precio_oferta || a.precio))
      } else if (this.sortBy === 'destacados') {
        filtered.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))
      } else {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      return filtered
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      return this.filteredProducts.slice(start, start + this.itemsPerPage)
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) {
        if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1) {
          pages.push(i)
        } else if (Math.abs(i - this.currentPage) === 2) {
          pages.push('...')
        }
      }
      return pages
    }
  },
  mounted() {
    this.loadProducts()
  },
  methods: {
    async loadProducts() {
      try {
        this.allProducts = await supabaseService.getProducts()
      } catch (error) {
        console.error('Error loading products:', error)
      }
    },
    applyFilters() {
      this.currentPage = 1
    },
    clearFilters() {
      this.selectedCategory = ''
      this.minPrice = null
      this.maxPrice = null
      this.onlyOffers = false
      this.onlyFeatured = false
      this.sortBy = 'nuevos'
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.productos-page {
  min-height: 100vh;
  background: var(--fondo);
  padding: 1.5rem 0;
}

.layout {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filtro-box {
  background: white;
  border-radius: 10px;
  border: 1.5px solid var(--borde);
  padding: 1.1rem;
}

.filtro-titulo {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gris);
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--borde);
}

.filtro-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.32rem 0;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--negro);
  transition: color 0.2s ease;
}

.filtro-item:hover {
  color: var(--rojo);
}

.filtro-item input {
  accent-color: var(--rojo);
  cursor: pointer;
}

.precio-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.precio-row input {
  flex: 1;
  padding: 0.45rem 0.5rem;
  border: 1.5px solid var(--borde);
  border-radius: 6px;
  font-size: 0.78rem;
  outline: none;
  background: var(--fondo);
}

.precio-row span {
  flex-shrink: 0;
  font-size: 0.8rem;
  color: var(--gris);
}

.btn-filtrar {
  width: 100%;
  background: var(--rojo);
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 7px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  margin-top: 0.75rem;
  transition: background 0.2s ease;
}

.btn-filtrar:hover {
  background: var(--rojo-dark);
}

.btn-limpiar {
  width: 100%;
  background: transparent;
  color: var(--gris);
  border: 1.5px solid var(--borde);
  padding: 0.5rem;
  border-radius: 7px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 0.4rem;
  transition: all 0.2s ease;
}

.btn-limpiar:hover {
  border-color: var(--rojo);
  color: var(--rojo);
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.results-count {
  font-size: 0.85rem;
  color: var(--gris);
}

.results-count strong {
  color: var(--negro);
}

.sort-select {
  padding: 0.42rem 0.75rem;
  border: 1.5px solid var(--borde);
  border-radius: 7px;
  font-size: 0.83rem;
  background: white;
  cursor: pointer;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  color: var(--gris);
}

.pagination {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.75rem;
}

.pag-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  border: 1.5px solid var(--borde);
  background: white;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pag-btn:hover {
  border-color: var(--rojo);
  color: var(--rojo);
}

.pag-btn.activo {
  background: var(--rojo);
  color: white;
  border-color: var(--rojo);
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    padding: 0 0.75rem;
    gap: 0.75rem;
  }
  .sidebar {
    position: static;
    display: none;
  }
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
  }
}

@media (max-width: 400px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
