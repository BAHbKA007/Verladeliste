<template>
  <div>
    <v-toolbar flat>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="Artikel suchen"
            single-line
            hide-details
        ></v-text-field>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">Neuen Artikel anlegen</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
            
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md12>
                  <v-text-field v-model="editedItem.name" label="Artikelbezeichnung"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">abbrechen</v-btn>
            <v-btn color="blue darken-1" flat @click="save">speichern</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="Artikel"
      class="elevation-1"
      :rows-per-page-items="pagination"
      rows-per-page-text='Artikel pro Seite'
      :search="search"
      loading="true"
    >
      <template v-slot:items="props">

        <td>{{ props.item.name }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">neu Laden</v-btn>
      </template>
    </v-data-table>
        <v-snackbar
      v-model="snackbar"
      :color="snack_color"
      :multi-line="mode === 'multi-line'"
      :timeout="timeout"
      :vertical="mode === 'vertical'"
    >
      {{ snack_text }}
      <v-btn
        dark
        flat
        @click="snackbar = false"
      >
        Schließen
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';


  export default {
    data: () => ({
        search: '',
        pagination: [50,100,250,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}],
        dialog: false,
        headers: [
            { text: 'Artikel', value: 'name', sortable: false, align: 'left'},
            { text: 'Aktionen', value: 'name', sortable: false, align: 'center' }
        ],
        Artikel: [],
        editedIndex: -1,
        editedItem: {
            name: ''
        },
        defaultItem: {
            name: ''
        },
        snackbar: false,
        snack_text: '',
        snack_color: '',
        mode: 'multi-line',
        timeout: 6000
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Neuen Artikel anlegen' : 'Artikel bearbeiten'
      }
    },

    watch: {
        dialog (val) {
            val || this.close()
        }
    },

    created () {
      this.initialize()
    },

    methods: {
        initialize () {
            axios.get('http://api.test/api/artikel')
            .then(res => this.Artikel = res.data)
            .catch(err => console.log(err));
        },

        editItem (item) {
            this.editedIndex = this.Artikel.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item) {
            const index = this.Artikel.indexOf(item)
            confirm('Artikel löschen?') && this.Artikel.splice(index, 1)
            axios.delete('http://api.test/api/artikel/'+item.id)
            .then()
            .catch(err => console.log(err));
        },

        close () {
            this.dialog = false
            setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            }, 300)
        },

        save () {
            if (this.editedIndex > -1) {
            Object.assign(this.Artikel[this.editedIndex], this.editedItem)
            console.log('erste');
            } else {
            axios.post('http://api.test/api/artikel',{
                name: this.editedItem.name
            })
            .then(
                resp => {
                    if (resp.status === 201){
                        this.snack_text = 'Artikel erfolgreich hinzugefügt',
                        this.snack_color = 'success',
                        this.snackbar = true,
                        this.Artikel.unshift(this.editedItem)
                    } 
                    }
                )
            .catch(
                err => (
                    this.snack_text = 'Da hat etwas nicht funktioniert :(',
                    this.snack_color = 'error',
                    this.snackbar = true)
                );
            }
            this.close()
        }
    }
}
</script>