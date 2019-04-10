<template>
  <v-card>
    <v-card-title class="headline font-weight-regular blue-grey white--text">Profile</v-card-title>
    <v-card-text>
      <v-subheader class="pa-0">Where do you live?</v-subheader>
      <v-autocomplete
        v-model="model"
        :items="items"
        :search-input.sync="search"
        :loading="isLoading"
        item-text="name"
        hide-no-data
      >
        <template v-slot:item="{ item }">
          <v-list-tile-content>
            <v-list-tile-title v-text="item.name"></v-list-tile-title>
          </v-list-tile-content>
        </template>
      </v-autocomplete>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    data () {
      return {
        isLoading: false,
        model: null,
        search: null,
        items: []
      }
    },
    watch: {
      search (val) {
        // Items have already been loaded
        if (this.items.length > 0) return

        if (this.search.length < 2) return

        this.isLoading = true

        // Lazily load input items
        fetch('http://localhost/verladeliste-api/public/api/artikel')
          .then(res => res.json())
          .then(res => {
            this.items = res
          })
          .catch(err => {
            console.log(err)
          })
          .finally(() => (this.isLoading = false))
      }
    }
  }
</script>