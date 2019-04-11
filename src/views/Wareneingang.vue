<template>
  <div>
    <v-toolbar flat>
        <v-text-field
            v-model="search"
            :search-input.sync="search"
            prepend-icon="search"
            label="Wareneingang suchen"
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
            <v-dialog v-model="dialog" max-width="50%" persistent >
                <template v-slot:activator="{ on }">
                <v-btn color="primary" dark class="mb-2" v-on="on">Neuen Wareneingang anlegen</v-btn>
                </template>
                <v-card>
                <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                    
                <v-card-text>
                    <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="editedItem.produkt"
                                required 
                                :rules="rules"
                                :label="'Produkt'"
                                :items="items_artikel"
                                :search-input.sync="search_api_artikel"
                                item-text="name"
                                hide-no-data
                            >
                                <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="editedItem.gebinde"
                                required 
                                :rules="rules"
                                :label="'Gebinde'"
                                :items="items_gebinde"
                                :search-input.sync="search_api_gebinde"
                                item-text="name"
                                hide-no-data
                            >
                                <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.menge" label="Menge" type="number" min="0" step="0.01"></v-text-field>
                        </v-flex>

                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="editedItem.lieferant"
                                required 
                                :rules="rules"
                                :label="'Lieferant'"
                                :items="items_lieferant"
                                :search-input.sync="search_api_lieferant"
                                item-text="name"
                                hide-no-data
                            >
                                <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.paletten" label="Paletten" type="number" min="0" step="0.01"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.preis" label="Preis" type="number" prepend-icon="euro_symbol"></v-text-field>
                        </v-flex>

                        <!-- Verladedatum -->
                        <v-flex xs12 sm6 md4>
                            <v-menu
                                v-model="menu1"
                                :close-on-content-click="false"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="editedItem.verladung"
                                    label="Verladedatum"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="rules"
                                ></v-text-field>
                                </template>
                                <v-date-picker 
                                    no-title scrollable 
                                    v-model="editedItem.verladung" 
                                    @input="menu1 = false"
                                    :first-day-of-week="1"
                                    locale="de"
                                ></v-date-picker>
                            </v-menu>
                        </v-flex>

                        <!-- Entladedatum -->
                        <v-flex xs12 sm6 md4>    
                            <v-menu
                                v-model="menu2"
                                :close-on-content-click="false"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="editedItem.ankunft"
                                    label="Entladedatum"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="rules"
                                ></v-text-field>
                                </template>
                                <v-date-picker 
                                    no-title scrollable 
                                    v-model="editedItem.ankunft" 
                                    @input="menu2 = false"
                                    :first-day-of-week="1"
                                    locale="de"
                                ></v-date-picker>
                            </v-menu>
                        </v-flex>

                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="editedItem.entladung"
                                required 
                                :rules="rules"
                                :label="'Entladung'"
                                :items="items_entladung"
                                :search-input.sync="search_api_entladung"
                                item-text="name"
                                hide-no-data
                            >
                                <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>

                        <v-flex xs12 sm6 md6>
                            <v-text-field v-model="editedItem.we_nr" label="WE-Nummer"></v-text-field>
                        </v-flex>
                            <v-flex xs12 sm6 md6>
                        <v-text-field v-model="editedItem.ls_nr" label="LS-Nummer"></v-text-field>
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
        </v-form>

    </v-toolbar>
    <v-data-table
   
        :headers="headers"
        :items="Wareneingang"
        class="elevation-1"
        :rows-per-page-items="pagination"
        rows-per-page-text='Wareneingangä pro Seite'
        :search="search"
        :loading="loading"
    >
    <template v-slot:items="props">
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.produkt }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.gebinde }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ punkt_zu_komma(nullen_schneiden(props.item.paletten)) }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.menge }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.lieferant }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ punkt_zu_komma(props.item.preis) }}€</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.entladung }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ show_de_date(props.item.verladung) }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ show_de_date(props.item.ankunft) }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.we_nr }}</td>
        <td class="pointer_td" @click="editItem(props.item)">{{ props.item.ls_nr }}</td>
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
        search_api_artikel: null,
        search_api_gebinde: null,
        search_api_entladung: null,
        search_api_lieferant: null,
        items_lieferant: [],
        items_artikel: [],
        items_gebinde: [],
        items_entladung: [],
        search: null,
        valid: false,
        on: false,
        date: new Date().toISOString().substr(0, 10),
        menu1: false,
        menu2: false,
        loading: false,
        pagination: [200,500,1000,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}],
        dialog: false,
        headers: [
            { text: 'Produkt', value: 'produkt', sortable: true, align: 'left'},
            { text: 'Gebinde', value: 'gebinde', sortable: true, align: 'left'},
            { text: 'Paletten', value: 'paletten', sortable: true, align: 'left'},
            { text: 'Menge', value: 'menge', sortable: true, align: 'left'},
            { text: 'Liefernat', value: 'lieferant', sortable: true, align: 'left'},
            { text: 'Preis', value: 'preis', sortable: true, align: 'left'},
            { text: 'Entladung', value: 'entladung', sortable: true, align: 'left'},
            { text: 'Verladedatum', value: 'ankunft', sortable: true, align: 'left'},
            { text: 'Ankunftsdatum', value: 'verladung', sortable: true, align: 'left'},
            { text: 'WE', value: 'we_nr', sortable: true, align: 'left'},
            { text: 'LS', value: 'ls_nr', sortable: true, align: 'left' },
            { text: 'Aktionen', value: 'name', sortable: false, align: 'center' }
        ],
        Wareneingang: [],
        editedIndex: -1,
        editedItem: {
            verladung: ''
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
            return this.editedIndex === -1 ? 'Neuen Wareneingang anlegen' : 'Wareneingang bearbeiten'
        }
    },

    watch: {
        search_api_artikel (val) {
            // Items have already been loaded
            if (this.items_artikel.length > 0) return
            this.isLoading = true
            // Lazily load input items
            fetch(this.api_link + 'artikel')
            .then(res => res.json())
            .then(res => {
                this.items_artikel = res
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => (this.isLoading = false))
        },

        search_api_lieferant (val) {
            // Items have already been loaded
            if (this.items_lieferant.length > 0) return
            this.isLoading = true
            // Lazily load input items
            fetch(this.api_link + 'lieferant')
            .then(res => res.json())
            .then(res => {
                this.items_lieferant = res
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => (this.isLoading = false))
        },

        search_api_gebinde (val) {
            // Items have already been loaded
            if (this.items_gebinde.length > 0) return
            this.isLoading = true
            // Lazily load input items
            fetch(this.api_link+'gebinde')
            .then(res => res.json())
            .then(res => {
                this.items_gebinde = res
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => (this.isLoading = false))
        },     

        search_api_entladung (val) {
            // Items have already been loaded
            if (this.items_entladung.length > 0) return
            this.isLoading = true
            // Lazily load input items
            fetch(this.api_link+'entladung')
            .then(res => res.json())
            .then(res => {
                this.items_entladung = res
            })
            .catch(err => {
                console.log(err)
            })
            .finally(() => (this.isLoading = false))
        },     

        dialog (val) {
            val || this.close()
        }
    },

    created () {
      this.initialize()
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
        check_var_undifined (vari) {
            if (vari) {
                vari = vari.replace(',','.')
            }
            return vari
        },
        show_de_date (date) {
            if (date) {
                var splited = date.split('-');
                date = splited[2] + '.' + splited[1] + '.' + splited[0]
            }
            return date
        },
        initialize () {
            axios.get(this.api_link+'we')
            .then(res => this.Wareneingang = res.data,)
            .catch(err => console.log(err));
            this.loading = false

        },

        editItem (item) {
            this.editedIndex = this.Wareneingang.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item) {
            const index = this.Wareneingang.indexOf(item)
            confirm('Wareneingang löschen?') && this.Wareneingang.splice(index, 1)
            axios.delete(this.api_link+'we/'+item.id)
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
            if (this.$refs.form.validate()) {
                if (this.editedIndex > -1) {

                    // Bearbeiten

                    axios.put(this.api_link + 'we',{
                        id: this.editedItem.id,
                        produkt: this.editedItem.produkt,
                        gebinde: this.editedItem.gebinde,
                        menge: this.editedItem.menge,
                        lieferant: this.editedItem.lieferant,
                        paletten: this.check_var_undifined(this.editedItem.paletten),
                        preis: this.check_var_undifined(this.editedItem.preis),
                        verladung: this.editedItem.verladung,
                        ankunft: this.editedItem.ankunft,
                        entladung: this.editedItem.entladung,
                        we_nr: this.editedItem.we_nr,
                        ls_nr: this.editedItem.ls_nr
                    })
                    .then(
                        resp => {
                            if (resp.status === 200){
                                this.snack_text = 'Wareneingang erfolgreich geändert',
                                this.snack_color = 'success',
                                this.snackbar = true
                            } 
                            }
                        )
                    .catch(
                        err => {
                            this.snack_text = 'Da hat etwas nicht funktioniert :(',
                            this.snack_color = 'error',
                            this.snackbar = true}
                        );

                    Object.assign(this.Wareneingang[this.editedIndex], this.editedItem)
                } else {

                // Neuer Wareneingang

                axios.post(this.api_link + 'we',{
                        id: this.editedItem.id,
                        produkt: this.editedItem.produkt,
                        gebinde: this.editedItem.gebinde,
                        menge: this.editedItem.menge,
                        lieferant: this.editedItem.lieferant,
                        paletten: this.check_var_undifined(this.editedItem.paletten),
                        preis: this.check_var_undifined(this.editedItem.preis),
                        verladung: this.editedItem.verladung,
                        ankunft: this.editedItem.ankunft,
                        entladung: this.editedItem.entladung,
                        we_nr: this.editedItem.we_nr,
                        ls_nr: this.editedItem.ls_nr
                })
                .then(
                    resp => {
                        if (resp.status === 201){
                            this.snack_text = 'Wareneingang erfolgreich hinzugefügt',
                            this.snack_color = 'success',
                            this.snackbar = true,
                            this.initialize()
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
    },
    props: {
      api_link: String
    }
}
</script>

<style scoped>
table.v-table tbody td, table.v-table tbody th {
    height: 30px;
}

.pointer_td {
    cursor: pointer;
}

</style>