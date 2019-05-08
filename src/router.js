import Vue from 'vue'
import Router from 'vue-router'
import Verladeliste from './views/Verladeliste.vue'
import Wareneingang from './views/Wareneingang.vue'
import Verteilung from './views/Verteilung.vue'
import Artikel from './views/Menu/Artikel.vue'
import Entladung from './views/Menu/Entladung.vue'
import Gebinde from './views/Menu/Gebinde.vue'
import Lieferant from './views/Menu/Lieferant.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Verladeliste',
      component: Verladeliste
    },
    {
      path: '/Wareneingang',
      name: 'Wareneingang',
      component: Wareneingang
    },
    {
      path: '/Verteilung',
      name: 'Verteilung',
      component: Verteilung
    },
    {
      path: '/Artikel',
      name: 'Artikel',
      component: Artikel
    },
    {
      path: '/Entladung',
      name: 'Entladung',
      component: Entladung
    },
    {
      path: '/Gebinde',
      name: 'Gebinde',
      component: Gebinde
    },
    {
      path: '/Lieferant',
      name: 'Lieferant',
      component: Lieferant
    }, 
  ]
})
