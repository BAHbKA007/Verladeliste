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
                    <div v-for="item in Verteilung_data.where_land_cache" v-bind:key="item" :v-switch="item"><country-flag style="margin: -15px 0 0 0;float:left" :country="Verteilung_data.laender[item-1].land_name" size='normal' />
                    <v-switch :disabled="switch_disable" v-model="Verteilung_data.where_land" :label="Verteilung_data.laender[item-1].land_name" :value="item" @change="initialize" ></v-switch></div>
                <v-spacer></v-spacer>
                <v-form ref="form" v-model="Verteilung_data.valid" lazy-validation>
                    <v-dialog v-model="Verteilung_data.dialog" max-width="60%" persistent>
                        <v-card>
                        <v-card-title>
                            <span class="headline">{{ Verteilung_data.umwandlung_editedItems.produkt_name }} bei {{ Verteilung_data.umwandlung_editedItems.entladung_name }} von {{ Verteilung_data.umwandlung_editedItems.lieferant_name}}</span>
                        </v-card-title>

                        <v-card-text>
                            <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12 sm6 md6>
                                <v-text-field v-model="Verteilung_data.editedItem.paletten" type="number" min="0" :max="Verteilung_data.split_cache" :rules="Verteilung_data.rules" @blur="input_validate" label="Paletten alter WE"></v-text-field>
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
                            <v-btn color="blue darken-1" :disabled="Verteilung_data.form_valiadation" flat @click="save">splitten</v-btn>
                        </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-form>

                <v-text-field
                    v-model="Verteilung_data.search"
                    appprependend-icon="search"
                    label="Suche"
                    single-line
                    hide-details
                    clearable
            ></v-text-field>
        </v-toolbar>
        <v-data-table
        :headers="Verteilung_data.headers"
        :items="Verteilung_data.wes"
        :search="Verteilung_data.search"
        hide-actions
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
                Your search for "{{ Verteilung_data.search }}" found no results.
            </v-alert>
        </v-data-table>
        <v-snackbar
            v-model="Verteilung_data.snackbar"
            :color="Verteilung_data.snack_color"
            :multi-line="Verteilung_data.mode === 'multi-line'"
            :timeout="Verteilung_data.timeout"
            :vertical="Verteilung_data.mode === 'vertical'"
            >
            {{ Verteilung_data.snack_text }}
            <v-btn
                dark
                flat
                @click="Verteilung_data.snackbar = false"
            >
                Schließen
            </v-btn>
        </v-snackbar>
        <div class="verteil" v-if="sum_paletten > 0" >
            <v-chip v-for="tag in Verteilung_data.verteil" :key="tag.id" :style="{backgroundColor: colors(tag.ankunft) }"  text-color="black" @click="close_chip(tag)">
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
import {globalStore} from '../main.js'
import { constants } from 'crypto';


export default {

    components: {
        CountryFlag
    },

    data () {
        return {

        }
    },

    created () {
        this.initialize(),
        this.firstInit()
    },

    methods: {
        input_validate() {
            if (this.Verteilung_data.editedItem.paletten < Number(this.Verteilung_data.split_cache) && this.Verteilung_data.editedItem.paletten >= 0 && this.Verteilung_data.editedItem.paletten ) {
                this.Verteilung_data.form_valiadation = false
            }else{
                this.Verteilung_data.form_valiadation = true
            }
        },

        create_land_array(){

            var laender = []
            for (let i = 0; i < this.Verteilung_data.wes.length; i++) {
                laender.push(this.Verteilung_data.wes[i].lieferant.land_id)
            }

            return laender
        },
        close_chip (we) {
            const index = this.Verteilung_data.verteil.indexOf(we)
            this.Verteilung_data.verteil.splice(index, 1)
            this.Verteilung_data.wes.push(we)
        },
        split(item) {
            this.Verteilung_data.editedIndex = this.Verteilung_data.wes.indexOf(item)
            this.Verteilung_data.editedItem = Object.assign({}, item)
            this.Verteilung_data.umwandlung_editedItems.lieferant_name = this.Verteilung_data.editedItem.lieferant.name
            this.Verteilung_data.umwandlung_editedItems.lieferant_id =this.Verteilung_data.editedItem.lieferant.id
            this.Verteilung_data.umwandlung_editedItems.produkt_name = this.Verteilung_data.editedItem.produkt.name
            this.Verteilung_data.umwandlung_editedItems.entladung_name =this.Verteilung_data.editedItem.entladung.name
            this.Verteilung_data.newItem = Object.assign({}, item)
            this.Verteilung_data.palettenfaktor = this.Verteilung_data.editedItem.menge / this.Verteilung_data.editedItem.paletten
            this.Verteilung_data.split_cache = this.Verteilung_data.editedItem.paletten
            this.Verteilung_data.dialog = true
        },
        remove_wes(we) {
            const index = this.Verteilung_data.wes.indexOf(we)
            this.Verteilung_data.wes.splice(index, 1)
            this.Verteilung_data.verteil.push(we)
        },

        editItem (item) {
            this.Verteilung_data.editedIndex = this.Verteilung_data.wes.indexOf(item)
            this.Verteilung_data.editedItem = Object.assign({}, item)
            this.Verteilung_data.dialog = true
        },

        close () {
            this.Verteilung_data.dialog = false
            setTimeout(() => {
            this.Verteilung_data.editedItem = Object.assign({}, this.Verteilung_data.defaultItem)
            this.Verteilung_data.editedIndex = -1
            }, 300)
        },
        save () {
           
            this.Verteilung_data.computedItem = this.split_ber;

            axios.post(this.api_link + 'we/split',{
                id_edit: this.Verteilung_data.editedItem.id,
                menge_edit: this.Verteilung_data.computedItem.menge_alt,
                paletten_edit: this.Verteilung_data.editedItem.paletten,

                produkt: this.Verteilung_data.editedItem.produkt.id,
                gebinde: this.Verteilung_data.editedItem.gebinde.id,
                menge: this.Verteilung_data.computedItem.menge,
                lieferant: this.Verteilung_data.editedItem.lieferant.id,
                paletten: this.Verteilung_data.computedItem.paletten,
                preis: this.Verteilung_data.editedItem.preis,
                verladung: this.Verteilung_data.editedItem.verladung,
                ankunft: this.Verteilung_data.editedItem.ankunft,
                entladung: this.Verteilung_data.editedItem.entladung.id
            })
            .then(
                resp => {
                    if (resp.status === 200){
                        this.Verteilung_data.snack_text = 'gesplittet'
                        this.Verteilung_data.snack_color = 'success'
                        this.Verteilung_data.snackbar = true
                        this.initialize()
                    }
                })
            .catch(
                err => {
                    this.Verteilung_data.snack_text = 'Da hat etwas nicht funktioniert (lkw bearbeiten) :(' + err,
                    this.Verteilung_data.snack_color = 'error',
                    this.Verteilung_data.snackbar = true}
                );
            this.close()
        },
        create_lkw () {

            function data(myArray){
                var data = [];
                for (var i=0; i < myArray.length; i++) {
                    data.push(myArray[i].id);
                }
                return data
            }

            axios({
                    url: this.api_link + 'lkw',
                    method: 'post',
                    data: data(this.Verteilung_data.verteil)
                })
                .then(
                    resp => {
                        if (resp.status === 201){
                            console.log(resp)        
                            this.Verteilung_data.snack_text = 'Neuen LKW hinzugefügt',
                            this.Verteilung_data.snack_color = 'success',
                            this.Verteilung_data.snackbar = true,
                            this.initialize(),
                            this.Verteilung_data.verteil = []
                        } 
                    }
                )
                .catch(
                    err => {
                    this.Verteilung_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.Verteilung_data.snack_color = 'error',
                    this.Verteilung_data.snackbar = true}
                );
            
        }
    },
    computed: {
        switch_disable(){
            if (this.Verteilung_data.verteil.length > 0) {
                return true
            } else {
                return false
            }
        },
        split_ber() {
            var a = {}
            a.menge_alt = this.Verteilung_data.editedItem.paletten * this.Verteilung_data.palettenfaktor
            a.paletten = this.Verteilung_data.split_cache - this.Verteilung_data.editedItem.paletten
            a.menge = a.paletten * this.Verteilung_data.palettenfaktor
            return a
        },
        sum_paletten(){
            var palTotal = this.Verteilung_data.verteil.reduce(function(prev, cur) {
                return prev + parseFloat(cur.paletten);
            }, 0);
            return palTotal
        }
    },

    props:  ['punkt_zu_komma','nullen_schneiden','colors','show_de_date','api_link','Verteilung_data','initialize','firstInit']

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