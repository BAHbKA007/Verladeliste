<template>
    <div>
        <v-toolbar flat>
            <v-card-title>
                Verteilung
            </v-card-title>
                <v-divider
                    class="mx-2"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                    <div v-for="item in where_land_cache" v-bind:key="item" :v-switch="item"><country-flag style="margin: -15px 0 0 0;float:left" :country="laender[item-1].land_name" size='normal' />
                    <v-switch :disabled="switch_disable" v-model="where_land" :label="laender[item-1].land_name" :value="item" @change="initialize" ></v-switch></div>
                <v-spacer></v-spacer>
                <v-form ref="form" v-model="valid" lazy-validation>
                    <v-dialog v-model="dialog" max-width="60%" persistent>
                        <v-card>
                        <v-card-title>
                            <span class="headline">{{ umwandlung_editedItems.produkt_name }} bei {{ umwandlung_editedItems.entladung_name }} von {{ umwandlung_editedItems.lieferant_name}}</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12 sm6 md6>
                                <v-text-field v-model="editedItem.paletten" type="number" min="0" :max="split_cache" :rules="rules" label="Paletten alter WE"></v-text-field>
                                </v-flex>
                                <v-flex xs12 sm6 md6>
                                <v-text-field v-model="split_ber.menge_alt" disabled type="number" min="0" readonly label="Menge alter WE"></v-text-field>
                                </v-flex>

                                <v-flex xs12 sm6 md6>
                                <v-text-field v-model="split_ber.paletten" disabled type="number" min="0" readonly label="Paletten neuer Split-WE"></v-text-field>
                                </v-flex>
                                <v-flex xs12 sm6 md6>
                                <v-text-field v-model="split_ber.menge" disabled type="number" min="0" readonly label="Menge neuer Split-WE"></v-text-field>
                                </v-flex>
                            </v-layout>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue darken-1" flat @click="close">abbrechen</v-btn>
                            <v-btn color="blue darken-1" flat @click="save">splitten</v-btn>
                        </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-form>

                <v-text-field
                    v-model="search"
                    appprependend-icon="search"
                    label="Suche"
                    single-line
                    hide-details
                    clearable
            ></v-text-field>
        </v-toolbar>
        <v-data-table
        :headers="headers"
        :items="wes"
        :search="search"
        hide-actions
        :pagination.sync="pagination"
        class="elevation-1"
        v-bind:class="{ active: switch_disable }"
        >
        <template v-slot:items="props">
                <tr :key="props.index" class="pointer_td" :style="{backgroundColor: colors(props.item.ankunft) }">
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ props.item.produkt.name }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ props.item.gebinde.name }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ punkt_zu_komma(nullen_schneiden(props.item.paletten)) }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ props.item.menge }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ props.item.lieferant.name }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ props.item.preis }}€</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ props.item.entladung.name }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ show_de_date(props.item.verladung) }}</td>
                    <td @click="remove_wes(props.item)" class="text-xs-left">{{ show_de_date(props.item.ankunft) }}</td>
                    <td class="justify-center layout px-0 icons_center">
                        <v-icon small @click="split(props.item)">call_split </v-icon>&nbsp;
                    </td>
                </tr>
        </template>
            <v-alert v-slot:no-results :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
            </v-alert>
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
        <div class="verteil" v-if="sum_paletten > 0" >
            <v-chip v-for="tag in verteil" :key="tag.id" :style="{backgroundColor: colors(tag.ankunft) }"  text-color="black" @click="close_chip(tag)">
                <v-avatar>
                    <v-icon>check_circle</v-icon>
                </v-avatar>
                <strong>{{punkt_zu_komma(nullen_schneiden(tag.paletten))}} Pal. {{tag.produkt.name}}</strong>&nbsp;
                <span>{{tag.lieferant.name}}</span>                
            </v-chip>
            <div><v-btn color="success" @click="create_lkw">{{sum_paletten}} paletten </v-btn></div>
        </div>
    </div>
</template>
<script>
import CountryFlag from 'vue-country-flag'
import axios from 'axios';

export default {

    components: {
        CountryFlag
    },

    data () {
        return {
            umwandlung_editedItems: {
                lieferant_id: String,
                lieferant_name: String,
                produkt_name: String,
                entladung_name: String
            },
            valid: false,
            rules: [
                v => !!v || 'Feld darf nicht leer sein',
                v => (v <= parseInt(this.split_cache) && v > 0) || 'Die Anzahl muss zwischen 0 und ' + this.split_cache + ' liegen',
                v => (v != parseInt(this.split_cache) ) || 'Bitte den Wert anpassen'
            ],
            color: 'red',
            pagination: {
                sortBy: 'ankunft',
                descending: false,
                rowsPerPage: -1
            },
            search: null,
            headers: [
                { text: 'Produkt', value: 'produkt.name' },
                { text: 'Gebinde', value: 'gebinde.name' },
                { text: 'Paletten', value: 'paletten' },
                { text: 'Menge', value: 'menge' },
                { text: 'Lieferant', value: 'lieferant.name' },
                { text: 'Preis', value: 'preis' },
                { text: 'Entladung', value: 'entladung.name' },
                { text: 'Verladung', value: 'verladung' },
                { text: 'Ankunft', value: 'ankunft' },
                { text: '', value: 'name', sortable: false, align: 'center' }
            ],                
            wes: [],
            dialog: false,
            palettenfaktor: 0,
            split_cache:0,
            editedIndex: -1,
            defaultItem: {},
            editedItem: {},
            newItem: {},
            computedItem: {},
            snackbar: false,
            snack_text: '',
            snack_color: '',
            mode: 'multi-line',
            timeout: 2000,
            verteil: [],
            where_land: [],
            where_land_cache: [],
            laender: [{"land_name":null}]
        }
    },

    props:  ['punkt_zu_komma','nullen_schneiden','colors','show_de_date','api_link'],

    created () {
        this.firstInit()
    },

    methods: {

        create_land_array(){

            var laender = []
            for (let i = 0; i < this.wes.length; i++) {
                laender.push(this.wes[i].lieferant.land_id)
            }

            return laender
        },
        close_chip (we) {
            const index = this.verteil.indexOf(we)
            this.verteil.splice(index, 1)
            this.wes.push(we)
        },
        split(item) {
            this.editedIndex = this.wes.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.umwandlung_editedItems.lieferant_name = this.editedItem.lieferant.name
            this.umwandlung_editedItems.lieferant_id =this.editedItem.lieferant.id
            this.umwandlung_editedItems.produkt_name = this.editedItem.produkt.name
            this.umwandlung_editedItems.entladung_name =this.editedItem.entladung.name
            this.newItem = Object.assign({}, item)
            this.palettenfaktor = this.editedItem.menge / this.editedItem.paletten
            this.split_cache = this.editedItem.paletten
            this.dialog = true
        },
        remove_wes(we) {
            const index = this.wes.indexOf(we)
            this.wes.splice(index, 1)
            this.verteil.push(we)
        },
        initialize() {

            axios.post(this.api_link + 'we/where',{
                land_array: this.where_land
            })
            .then(resp => {
                this.wes = resp.data
                })
            .catch(
                err => (
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true)
                );
        },

        firstInit() {

            axios.get(this.api_link + 'we/where/first')
            .then(resp => {
                this.wes = resp.data
                // Länder Ids rausholen und Distinct im array speichern 
                var element = [];
                for (let i = 0; i < this.wes.length; i++) {
                    
                    if (!element.includes(this.wes[i].lieferant.land_id.toString())) { element.push(this.wes[i].lieferant.land_id.toString()) } 
                }

                this.where_land = element
                this.where_land_cache = element

                })
            .catch(
                err => (
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true)
                );

            // Länder Array holen
            axios.get(this.api_link + 'land')
            .then(resp => {
                this.laender = resp.data
            })
            .catch(
                err => (
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true)
                );
        },

        editItem (item) {
            this.editedIndex = this.wes.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
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
            
                this.computedItem = this.split_ber

                axios.put(this.api_link + 'we',{
                    id: this.editedItem.id,
                    menge: this.computedItem.menge_alt,
                    paletten: this.editedItem.paletten,
                })
                .then(
                    resp => {
                        if (resp.status === 200){
                            axios.post(this.api_link + 'we',{
                                produkt: this.editedItem.produkt.id,
                                gebinde: this.editedItem.gebinde.id,
                                menge: this.computedItem.menge,
                                lieferant: this.editedItem.lieferant.id,
                                paletten: this.computedItem.paletten,
                                preis: this.editedItem.preis,
                                verladung: this.editedItem.verladung,
                                ankunft: this.editedItem.ankunft,
                                entladung: this.editedItem.entladung.id,
                                we_nr: this.editedItem.we_nr,
                                ls_nr: this.editedItem.ls_nr
                            })
                            .then(
                                resp => {
                                    if (resp.status === 201){
                                        this.snack_text = 'gesplittet',
                                        this.snack_color = 'success',
                                        this.snackbar = true,
                                        this.initialize()
                                    } 
                                    }
                                )
                            .catch(
                                err => (
                                    this.snack_text = 'Da hat etwas nicht funktioniert (neuer LKW) :(' + err,
                                    this.snack_color = 'error',
                                    this.snackbar = true)
                                );
                            Object.assign(this.wes[this.editedIndex], this.editedItem)
                        } 
                    }
                    )
                .catch(
                    err => {
                        this.snack_text = 'Da hat etwas nicht funktioniert (lkw bearbeiten) :(' + err,
                        this.snack_color = 'error',
                        this.snackbar = true}
                    );

                this.close()
            }         
        },
        create_lkw () {

            function data( myArray){
                var data = [];
                for (var i=0; i < myArray.length; i++) {
                    data.push(myArray[i].id);
                }
                return data
            }            
            axios({
                    url: this.api_link + 'lkw',
                    method: 'post',
                    data: data(this.verteil)
                })
                .then(
                    resp => {
                        if (resp.status === 201){
                            this.snack_text = 'Neuen LKW hinzugefügt',
                            this.snack_color = 'success',
                            this.snackbar = true,
                            this.initialize(),
                            this.verteil = []
                        } 
                    }
                )
                .catch(
                    err => {
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true}
                );
            
        }
    },
    computed: {
        switch_disable(){
            if (this.verteil.length > 0) {
                return true
            } else {
                return false
            }
        },
        split_ber() {
            var a = {}
            a.menge_alt = this.editedItem.paletten * this.palettenfaktor
            a.paletten = this.split_cache - this.editedItem.paletten
            a.menge = a.paletten * this.palettenfaktor
            return a
        },
        sum_paletten(){
            var palTotal = this.verteil.reduce(function(prev, cur) {
                return prev + parseFloat(cur.paletten);
            }, 0);
            return palTotal
        }
    }

}
</script>

<style scoped>

    .pointer_td {
        cursor: pointer;
    }

    .verteil {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: white;
        color: black;
        text-align: center;
        z-index: 100;
        -webkit-box-shadow: 0px -2px 6px 0px rgba(0,0,0,0.75);
        -moz-box-shadow: 0px -2px 6px 0px rgba(0,0,0,0.75);
        box-shadow: 0px -2px 6px 0px rgba(0,0,0,0.75);
    }

    .active {
        margin-bottom: 121px;
    }

</style>