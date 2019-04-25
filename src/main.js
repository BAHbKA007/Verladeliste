import 'babel-polyfill'
import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// Translation provided by Vuetify (typescript)
import de from 'vuetify/src/locale/de.ts'
import router from './router'
import CountryFlag from 'vue-country-flag'
import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto/index.css'

Vue.prototype.$globals = globalStore

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return weekNo;
}

export var globalStore = new Vue({
  data: {
    kw: getWeekNumber(new Date()),
    show_kw_toolbar: true,
    loading: false
  }
})
Vue.prototype.$globals = globalStore

export const EventBus = new Vue();


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