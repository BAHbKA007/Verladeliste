<template>
  <div>
    <v-toolbar flat>
        <v-text-field
            v-model="search"
            prepend-icon="search"
            label="Lieferant suchen"
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

      <v-form ref="form" v-model="valid" lazy-validation>
        <v-dialog v-model="dialog" max-width="500px" persistent>
            <template v-slot:activator="{ on }">
                <v-btn color="primary" dark class="mb-2" v-on="on" @click="api_land">Neuen Lieferanten anlegen</v-btn>
            </template>
            <v-card>
            <v-card-title>
                <span class="headline">{{ formTitle }}</span>
            </v-card-title>
                
            <v-card-text>
                <v-container grid-list-md>
                <v-layout wrap>
                    <v-flex xs12 sm6 md12>
                        <v-text-field v-model="editedItem.nummer" label="Nummer" type="number" min="0" step="1" :rules="rules"></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm6 md12>
                        <v-text-field v-model="editedItem.name" label="Lieferant" :rules="rules"></v-text-field>
                    </v-flex>

                    <v-flex xs12 sm6 md12>
                        <v-autocomplete
                            v-model="editedItem.land"
                            required 
                            :rules="rules"
                            :label="'Land'"
                            :items="items_land"
                            item-text="land_name"
                            item-value="land_id"
                            hide-no-data
                            return-object
                        >
                            <template v-slot:selection="{ item, selected }">
                                <country-flag v-bind:country="item.land_name" size='normal'/>
                                <span style="margin-left:12px;text-transform: uppercase" v-text="item.land_name"></span>
                            </template>
                            <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.land_name"></v-list-tile-title>
                                </v-list-tile-content>
                                <v-list-tile-action>
                                    <country-flag v-bind:country="item.land_name" size='normal'/>
                                </v-list-tile-action> 
                            </template>
                        </v-autocomplete>

                    </v-flex>
                    <v-flex xs12 sm6 md12>
                        <v-text-field v-model="editedItem.rabatt" label="Rabatt" type="number" min="0" step="0.01" maxlength="5"></v-text-field>
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
    </v-form >
    </v-toolbar>
    <v-data-table
   
        :headers="headers"
        :items="Lieferant"
        class="elevation-1"
        :rows-per-page-items="pagination"
        rows-per-page-text='Lieferanten pro Seite'
        :search="search"
        loading="true"
    >
      <template v-slot:items="props">

        <td>{{ props.item.nummer }}</td>
        <td>{{ props.item.name }}</td>
        <td><span>{{ props.item.land.land_name }}</span></td>
        <td>{{ punkt_zu_komma(nullen_schneiden(props.item.rabatt))}}%</td>
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
import CountryFlag from 'vue-country-flag'

export default {

    components: {
        CountryFlag
    },

    data: () => ({
        valid: false,
        isLoading: false,
        items_land: [],
        search: '',
        pagination: [50,100,250,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}],
        dialog: false,
        headers: [
            { text: 'Nr.', value: 'nummer', sortable: false, align: 'left'},
            { text: 'Lieferant', value: 'name', sortable: true, align: 'left'},
            { text: 'Land', value: 'land.land_name', sortable: true, align: 'left'},
            { text: 'Rabatt', value: 'rabatt', sortable: true, align: 'left'},
            { text: 'Aktionen', value: 'name', sortable: false, align: 'center' }
        ],
        Lieferant: [],
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
        timeout: 6000,
        rules: [
           v => !!v || 'Feld darf nicht leer sein'
        ]
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? 'Neuen Lieferanten anlegen' : 'Lieferant bearbeiten'
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

        api_land () {
            axios.get(this.api_link+'land')
            .then(
                resp => {
                    this.items_land = resp.data
                })
            .catch(
                err => {
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true}
                );

        },

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

        initialize () {
            axios.get(this.api_link+'lieferant')
            .then(res => this.Lieferant = res.data)
            .catch(err => {
                this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                this.snack_color = 'error',
                this.snackbar = true                
            });
        },

        editItem (item) {
            this.api_land ()
            this.editedIndex = this.Lieferant.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item) {
            const index = this.Lieferant.indexOf(item)
            confirm('Lieferant löschen?') && this.Lieferant.splice(index, 1)
            axios.delete(this.api_link+'lieferant/'+item.id)
            .then()
            .catch(err => {
                this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                this.snack_color = 'error',
                this.snackbar = true
            }); 
        },

        close () {
            this.dialog = false
            setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            }, 300)
        },

        save () {
            if (this.$refs.form.validate()) {
                if (this.editedIndex > -1) {
                    // Bearbeiten
                    axios.put(this.api_link+'lieferant',{
                        id: this.editedItem.id,
                        name: this.editedItem.name,
                        nummer: this.editedItem.nummer,
                        land: this.editedItem.land.land_id,
                        rabatt: this.editedItem.rabatt
                    })
                    .then(
                        resp => {
                            if (resp.status === 200){
                                this.snack_text = 'Lieferant erfolgreich geändert',
                                this.snack_color = 'success',
                                this.snackbar = true
                            } 
                        })
                    .catch(
                        err => {
                            this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                            this.snack_color = 'error',
                            this.snackbar = true}
                        );

                    Object.assign(this.Lieferant[this.editedIndex], this.editedItem)
                } else {
                    axios.post(this.api_link+'lieferant',{
                        id: this.editedItem.id,
                        name: this.editedItem.name,
                        nummer: this.editedItem.nummer,
                        land: this.editedItem.land.land_id,
                        rabatt: this.editedItem.rabatt
                    })
                .then(
                    resp => {
                        if (resp.status === 201){
                            this.snack_text = 'Lieferant erfolgreich hinzugefügt',
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
        }
    },
    props: {
      api_link: String
    }
}
</script>

<style scoped>

.my-input {
  text-transform: uppercase
}
</style>
