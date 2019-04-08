<template>
  <v-app >
    <Toolbar app></Toolbar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Toolbar from './layout/Toolbar.vue';

export default {
  components: {Toolbar}
}
</script>

