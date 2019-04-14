<template>
  <v-app :dark="dark">
    <Toolbar app></Toolbar>
    <v-content>
      <v-container fluid>
        <router-view :api_link='api_link' :footer_show='footer_show' :punkt_zu_komma="punkt_zu_komma" :nullen_schneiden="nullen_schneiden" :colors="colors" :show_de_date="show_de_date"></router-view>
      </v-container>
    </v-content>
    <v-footer app v-show="footer_show">      
      <v-container fluid class="pa-0">
        <v-layout row wrap align-center>
          <v-flex xs12 sm12>
            <div class="text-xs-right">
              <div justify-end>
                <v-btn small flat @click="dark = !dark"><v-icon>invert_colors</v-icon></v-btn>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import Toolbar from './layout/Toolbar.vue';

export default {
    components: {Toolbar},
    data()  {
        return {
            footer_show: true,
            dark: false,
            api_link: 'http://192.168.178.166/verladeliste-api/public/api/'//'http://localhost/verladeliste-api/public/api/'
        }
    },
    methods: {
        nullen_schneiden(vari) {
            if (vari) {
                var vari_arr = vari.split('.');
                if (vari_arr[1] === '00') {
                    vari = vari_arr[0]
                }
            }
            return vari
        },
        punkt_zu_komma(vari){
            if (vari) {
                var v= vari.replace('.',',')
            }
            return v
        },
        colors(data) {
            var date = '';
            var splited = data.split('-');
            var tr = 0.4;
            var tag = ['RGB(255,153,0,'+tr+')','RGB(255,255,153,'+tr+')','RGB(0,204,255,'+tr+')','RGB(0,255,0,'+tr+')','RGB(204,153,255,'+tr+')','RGB(150,150,150,'+tr+')','RGB(255,0,255,'+tr+')'];
            date = tag[new Date(splited[0],splited[1]-1,splited[2]).getDay()];
            return date
        },
        show_de_date (date) {
            if (date) {
                var tag = ['So.','Mo.','Di.','Mi.','Do.','Fr.','Sa.'];
                var splited = date.split('-');
                date = tag[new Date(splited[0],splited[1]-1,splited[2]).getDay()] + ' ' + splited[2] + '.' + splited[1] + '.' + splited[0]
            }
            return date
        }        
    },
}
</script>

<style>
    table.v-table thead tr{height:0px !important}
    table.v-table tbody td, table.v-table tbody th {
    height: 25px !important;
}

</style>


