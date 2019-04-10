<template>
  <v-app :dark="dark">
    <Toolbar app></Toolbar>
    <v-content>
      <v-container fluid>
        <router-view :api_link='api_link'></router-view>
      </v-container>
    </v-content>
    <v-footer app>            
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
      dark: false,
      api_link: 'http://localhost/verladeliste-api/public/api/'
    }
  }
}
</script>

