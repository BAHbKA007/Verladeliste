<template>
  <div>
    <v-toolbar flat>
        <v-text-field
            v-model="search"
            prepend-icon="search"
            label="Entladung suchen"
            single-line
            hide-details
            clearable
        ></v-text-field>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px" persistent>
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">Neue Entladung anlegen</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
            
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md12>
                  <v-text-field v-model="editedItem.name" label="Bezeichnung"></v-text-field>
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
        :items="Entladung"
        class="elevation-1"
        :rows-per-page-items="pagination"
        rows-per-page-text='Entladungen pro Seite'
        :search="search"
        loading="true"
    >
      <template v-slot:items="props">

        <td>{{ props.item.name }}</td>
        <td class="justify-center icons_center layout px-0">
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
            { text: 'Entladung', value: 'name', sortable: false, align: 'left'},
            { text: 'Aktionen', value: 'name', sortable: false, align: 'center' }
        ],
        Entladung: [],
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
			return this.editedIndex === -1 ? 'Neuen Entladung anlegen' : 'Entladung bearbeiten'
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
          this.Wareneingang_data.loading = true;
            axios.get(this.api_link + 'entladung')
            .then(res => {
              this.Entladung = res.data,
              this.Wareneingang_data.loading = false
            })
            .catch(err => this.Wareneingang_data.loading = false); /* eslint-disable-line no-console */
        },

        editItem (item) {
            this.editedIndex = this.Entladung.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item) {
            const index = this.Entladung.indexOf(item)
            confirm('Entladung löschen?') && this.Entladung.splice(index, 1)
            axios.delete(this.api_link+'entladung/'+item.id)
            .then()
            .catch(err => console.log(err)); /* eslint-disable-line no-console */
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
                // Bearbeiten
                axios.put(this.api_link + 'entladung',{
                    id: this.editedItem.id,
                    name: this.editedItem.name
                })
                .then(
                    resp => {
                        if (resp.status === 200){
                            this.snack_text = 'Entladung erfolgreich geändert',
                            this.snack_color = 'success',
                            this.snackbar = true
                        } 
                        }
                    )
                .catch(
                    err => {
                        this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                        this.snack_color = 'error',
                        this.snackbar = true}
                    );

                Object.assign(this.Entladung[this.editedIndex], this.editedItem)
            } else {
            axios.post(this.api_link + 'entladung',{
                name: this.editedItem.name
            })
            .then(
                resp => {
                    if (resp.status === 201){
                        this.snack_text = 'Entladung erfolgreich hinzugefügt',
                        this.snack_color = 'success',
                        this.snackbar = true,
                        this.initialize()
                    } 
                    }
                )
            .catch(
                err => (
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true)
                );
            }
            this.close()
        }
    },    
    props: ['api_link','Wareneingang_data']
}
</script>

<style scoped>

</style>
