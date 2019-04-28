<template>
  <div>
    <v-toolbar flat>
        <v-text-field 
            v-model="Wareneingang_data.search"
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

        <v-form ref="form" v-model="Wareneingang_data.valid" lazy-validation>
            <v-dialog v-model="Wareneingang_data.dialog" max-width="60%" persistent>
                <template v-slot:activator="{ on }">
                    <v-btn color="primary" dark class="mb-2" v-on="on" @click="search_api(),set_title()">Neuen Wareneingang anlegen</v-btn>
                </template>
                <v-card>
                <v-card-title>
                    <span class="headline">{{ Wareneingang_data.formTitle }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="Wareneingang_data.editedItem.produkt"
                                required 
                                :rules="Wareneingang_data.rules"
                                :label="'Produkt'"
                                :items="Wareneingang_data.items_artikel"
                                item-text="name"
                                hide-no-data
                                return-object
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
                                v-model="Wareneingang_data.editedItem.gebinde"
                                required 
                                :rules="Wareneingang_data.rules"
                                :label="'Gebinde'"
                                :items="Wareneingang_data.items_gebinde"
                                item-text="name"
                                hide-no-data
                                return-object
                            >
                                <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="Wareneingang_data.editedItem.menge" label="Menge" type="number" min="0" step="0.01"></v-text-field>
                        </v-flex>

                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="Wareneingang_data.editedItem.lieferant"
                                required 
                                :rules="Wareneingang_data.rules"
                                :label="'Lieferant'"
                                :items="Wareneingang_data.items_lieferant"
                                item-text="name"
                                item-value="id"
                                hide-no-data
                                return-object
                            >
                                <template v-slot:item="{ item }">
                                    <v-list-tile-content>
                                        <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                    </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="Wareneingang_data.editedItem.paletten" label="Paletten" type="number" min="0" step="0.01"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="Wareneingang_data.editedItem.preis" label="Preis" type="number" prepend-icon="euro_symbol"></v-text-field>
                        </v-flex>

                        <!-- Verladedatum -->
                        <v-flex xs12 sm6 md4>
                            <v-menu
                                v-model="Wareneingang_data.menu1"
                                :close-on-content-click="false"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="Wareneingang_data.editedItem.verladung"
                                    label="Verladedatum"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="Wareneingang_data.rules"
                                ></v-text-field>
                                </template>
                                <v-date-picker 
                                    no-title scrollable 
                                    v-model="Wareneingang_data.editedItem.verladung" 
                                    @input="Wareneingang_data.menu1 = false"
                                    :first-day-of-week="1"
                                    locale="de"
                                ></v-date-picker>
                            </v-menu>
                        </v-flex>

                        <!-- Entladedatum -->
                        <v-flex xs12 sm6 md4>    
                            <v-menu
                                v-model="Wareneingang_data.menu2"
                                :close-on-content-click="false"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="Wareneingang_data.editedItem.ankunft"
                                    label="Entladedatum"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    :rules="Wareneingang_data.rules"
                                ></v-text-field>
                                </template>
                                <v-date-picker 
                                    no-title scrollable 
                                    v-model="Wareneingang_data.editedItem.ankunft" 
                                    @input="Wareneingang_data.menu2 = false"
                                    :first-day-of-week="1"
                                    locale="de"
                                ></v-date-picker>
                            </v-menu>
                        </v-flex>

                        <v-flex xs12 sm6 md4>
                            <v-autocomplete
                                v-model="Wareneingang_data.editedItem.entladung"
                                required 
                                :rules="Wareneingang_data.rules"
                                :label="'Entladung'"
                                :items="Wareneingang_data.items_entladung"
                                item-text="name"
                                hide-no-data
                                return-object
                            >
                                <template v-slot:item="{ item }">
                                <v-list-tile-content>
                                    <v-list-tile-title v-text="item.name"></v-list-tile-title>
                                </v-list-tile-content>
                                </template>
                            </v-autocomplete>
                        </v-flex>

                        <v-flex xs12 sm6 md6>
                            <v-text-field v-model="Wareneingang_data.editedItem.we_nr" label="WE-Nummer"></v-text-field>
                        </v-flex>
                            <v-flex xs12 sm6 md6>
                        <v-text-field v-model="Wareneingang_data.editedItem.ls_nr" label="LS-Nummer"></v-text-field>
                        </v-flex>

                    </v-layout>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click="close">abbrechen</v-btn>
                    <v-btn color="blue darken-1" flat @click="save">speichern</v-btn>
                </v-card-actions>
                <template>
                    <v-progress-linear height="2" style="margin-bottom:0" :indeterminate="Wareneingang_data.isLoading"></v-progress-linear>
                </template>
                </v-card>
            </v-dialog>
        </v-form>

    </v-toolbar>
    
    <v-data-table
   
        :headers="Wareneingang_data.headers"
        :items="Wareneingang_data.Wareneingang"
        class="elevation-1"
        :search="searchTrigger"
        hide-actions
        v-bind:pagination.sync="Wareneingang_data.pagination"
    >
    <template v-slot:items="props">
        <tr :key="props.index" class="pointer_td" :style="{backgroundColor: colors(props.item.ankunft) }">
            <td @click="editItem(props.item)">{{ props.item.produkt.name }}</td>
            <td @click="editItem(props.item)">{{ props.item.gebinde.name }}</td>
            <td @click="editItem(props.item)">{{ punkt_zu_komma(nullen_schneiden(props.item.paletten)) }}</td>
            <td @click="editItem(props.item)">{{ props.item.menge }}</td>
            <td @click="editItem(props.item)">{{ props.item.lieferant.name }}</td>
            <td @click="editItem(props.item)" style="text-align:right">{{ punkt_zu_komma(props.item.preis) }}€</td>
            <td @click="editItem(props.item)">{{ props.item.entladung.name }}</td>
            <td @click="editItem(props.item)">{{ show_de_date(props.item.verladung) }}</td>
            <td @click="editItem(props.item)">{{ show_de_date(props.item.ankunft) }}</td>
            <td @click="editItem(props.item)">{{ props.item.we_nr }}</td>
            <td @click="editItem(props.item)" style="padding-top:5px">{{ props.item.ls_nr }}</td>
            <td class="justify-center layout px-0 icons_center">
            <v-icon
                small
                class="mr-2"
                @click="editItem(props.item)"
            >
                edit
            </v-icon>
            <v-icon
                small
                style="margin:0 8px 0 0"
                @click="copyItem(props.item)"
            >
                content_copy
            </v-icon>
            <v-icon
                small
                @click="deleteItem(props.item)"
            >
                delete
            </v-icon>
            </td>
        </tr>
    </template>
    </v-data-table>
    <v-snackbar
      v-model="Wareneingang_data.snackbar"
      :color="Wareneingang_data.snack_color"
      :multi-line="Wareneingang_data.mode === 'multi-line'"
      :timeout="Wareneingang_data.timeout"
      :vertical="Wareneingang_data.mode === 'vertical'"
    >
      {{ Wareneingang_data.snack_text }}
      <v-btn
        dark
        flat
        @click="Wareneingang_data.snackbar = false"
      >
        Schließen
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import axios from 'axios';
import {globalStore} from '../main.js'

export default {
watch: {
    dialog (val) {
        val || this.close()
    }
},

created () {
    this.getWes()
},

methods: {
    console(){
        console.log('keclickt')
    },
    set_title() {
        this.Wareneingang_data.formTitle = 'Neuen WE anlegen'
    },

    search_api () {
        // Items have already been loaded
        // if (this.Wareneingang_data.items_artikel.length > 0 && this.Wareneingang_data.items_lieferant.length > 0 && this.Wareneingang_data.items_gebinde.length > 0 && this.Wareneingang_data.items_entladung.length > 0) {return}

        axios.get(this.api_link+'artikel')
        .then(res => this.Wareneingang_data.items_artikel = res.data)
        .catch(err => console.log(err)); /* eslint-disable-line no-console */

        axios.get(this.api_link+'lieferant')
        .then(res => this.Wareneingang_data.items_lieferant = res.data)
        .catch(err => console.log(err)); /* eslint-disable-line no-console */

        axios.get(this.api_link+'gebinde')
        .then(res => this.Wareneingang_data.items_gebinde = res.data)
        .catch(err => console.log(err)); /* eslint-disable-line no-console */

        axios.get(this.api_link+'entladung')
        .then(res => this.Wareneingang_data.items_entladung = res.data)
        .catch(err => console.log(err)) /* eslint-disable-line no-console */
    },    

    check_var_undifined (vari) {
        if (vari) {
            vari = vari.replace(',','.')
        }
        return vari
    },
    editItem (item) {
        this.Wareneingang_data.formTitle = 'Wareneingang bearbeiten'
        this.search_api()
        this.Wareneingang_data.editedIndex = this.Wareneingang_data.Wareneingang.indexOf(item)
        this.Wareneingang_data.editedItem = Object.assign({}, item)
        this.Wareneingang_data.dialog = true
    },

    copyItem (item) {
        this.Wareneingang_data.formTitle = 'Kopie erstellen'
        this.search_api()
        this.Wareneingang_data.editedIndex = this.Wareneingang_data.Wareneingang.indexOf(item)
        this.Wareneingang_data.editedItem = Object.assign({}, item)
        this.Wareneingang_data.dialog = true
    },

    deleteItem (item) {
        const index = this.Wareneingang_data.Wareneingang.indexOf(item)
        confirm('Wareneingang löschen?') && this.Wareneingang_data.Wareneingang.splice(index, 1)
        axios.delete(this.api_link+'we/'+item.id)
        .then()
        .catch(
            err => (
                this.Wareneingang_data.snack_text = 'Da hat etwas nicht funktioniert :( delete' + err,
                this.Wareneingang_data.snack_color = 'error',
                this.Wareneingang_data.snackbar = true)
            ); /* eslint-disable-line no-console */
    },

    close () {
        this.Wareneingang_data.dialog = false
        setTimeout(() => {
        this.Wareneingang_data.editedItem = Object.assign({}, this.Wareneingang_data.defaultItem)
        this.Wareneingang_data.editedIndex = -1
        }, 300)
    },

    save () {
        this.get_kws()
        if (this.$refs.form.validate()) {
                                    
            if (this.Wareneingang_data.editedIndex > -1 && this.Wareneingang_data.formTitle != 'Kopie erstellen') {

                // Bearbeiten

                axios.put(this.api_link + 'we',{
                    id: this.Wareneingang_data.editedItem.id,
                    produkt: this.Wareneingang_data.editedItem.produkt.id,
                    gebinde: this.Wareneingang_data.editedItem.gebinde.id,
                    menge: this.Wareneingang_data.editedItem.menge,
                    lieferant: this.Wareneingang_data.editedItem.lieferant.id,
                    paletten: this.check_var_undifined(this.Wareneingang_data.editedItem.paletten),
                    preis: this.check_var_undifined(this.Wareneingang_data.editedItem.preis),
                    verladung: this.Wareneingang_data.editedItem.verladung,
                    ankunft: this.Wareneingang_data.editedItem.ankunft,
                    entladung: this.Wareneingang_data.editedItem.entladung.id,
                    we_nr: this.Wareneingang_data.editedItem.we_nr,
                    ls_nr: this.Wareneingang_data.editedItem.ls_nr
                })
                .then(
                    resp => {
                        if (resp.status === 200){
                            this.Wareneingang_data.snack_text = 'Wareneingang erfolgreich geändert',
                            this.Wareneingang_data.snack_color = 'success',
                            this.Wareneingang_data.snackbar = true,
                            this.getWes()
                        }
                        }
                    )
                .catch(
                    err => {
                        this.Wareneingang_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                        this.Wareneingang_data.snack_color = 'error',
                        this.Wareneingang_data.snackbar = true}
                    );

                Object.assign(this.Wareneingang_data.Wareneingang[this.Wareneingang_data.editedIndex], this.Wareneingang_data.editedItem)
            } else {

            // Neuer Wareneingang

            axios.post(this.api_link + 'we',{
                    id: this.Wareneingang_data.editedItem.id,
                    produkt: this.Wareneingang_data.editedItem.produkt.id,
                    gebinde: this.Wareneingang_data.editedItem.gebinde.id,
                    menge: this.Wareneingang_data.editedItem.menge,
                    lieferant: this.Wareneingang_data.editedItem.lieferant.id,
                    paletten: this.check_var_undifined(this.Wareneingang_data.editedItem.paletten),
                    preis: this.check_var_undifined(this.Wareneingang_data.editedItem.preis),
                    verladung: this.Wareneingang_data.editedItem.verladung,
                    ankunft: this.Wareneingang_data.editedItem.ankunft,
                    entladung: this.Wareneingang_data.editedItem.entladung.id,
                    we_nr: this.Wareneingang_data.editedItem.we_nr,
                    ls_nr: this.Wareneingang_data.editedItem.ls_nr
            })
            .then(
                resp => {
                    if (resp.status === 201){
                        this.Wareneingang_data.snack_text = 'Wareneingang erfolgreich hinzugefügt',
                        this.Wareneingang_data.snack_color = 'success',
                        this.Wareneingang_data.snackbar = true,
                        this.getWes()
                    } 
                    }
                )
            .catch(
                err => (
                    this.Wareneingang_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.Wareneingang_data.snack_color = 'error',
                    this.Wareneingang_data.snackbar = true)
                );
            }
            this.close()
        }
    }
},

computed: {
    searchTrigger () {
        if (this.Wareneingang_data.search != null && this.Wareneingang_data.search.length >= 3) {
            return this.Wareneingang_data.search
        }
        return
    }
},

props: ['punkt_zu_komma','nullen_schneiden','colors','show_de_date','api_link','Wareneingang_data','getWes','get_kws']
}
</script>

<style scoped>

.pointer_td {
    cursor: pointer;
}

</style>