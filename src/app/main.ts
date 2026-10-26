// Composition root: único lugar que conhece todos os módulos e os liga às rotas.
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { ImportacaoPagina } from '@/modules/importacao'
import App from './App.vue'
import './estilos.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: ImportacaoPagina, meta: { titulo: 'Carregar arquivos' } },
    {
      path: '/relatorio',
      // Carregado sob demanda: o ECharts só é baixado quando alguém abre o relatório.
      component: () => import('@/modules/relatorios').then((m) => m.RelatorioPagina),
      meta: { titulo: 'Relatório' },
    },
    { path: '/:caminho(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.titulo ?? ''} | Censo Interno IFC`
})

createApp(App).use(createPinia()).use(router).mount('#app')
