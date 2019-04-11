import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// Translation provided by Vuetify (typescript)
import de from 'vuetify/src/locale/de.ts'
import router from './router'
import CountryFlag from 'vue-country-flag'


Vue.component('vue-country-flag', CountryFlag)
Vue.use(Vuetify, {
  lang: {
    locales: {de},
    current: 'de'
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')