<template>
    <div>
        <v-toolbar flat>
            <v-text-field
                v-model="Lkws_data.lkw_suche"
                prepend-icon="search"
                label="LKW suchen"
                single-line
                hide-details
                clearable
                @keyup.enter="lkw_suchen()"
            ></v-text-field>
            <v-btn @click="lkw_suchen()">suchen</v-btn>
        <v-divider
            class="mx-2"
            inset
            vertical
        ></v-divider>
        <div> </div>
            <v-dialog v-model="Lkws_data.dialog" max-width="50%" persistent>
                <v-card>
                    <v-card-title>
                    <span class="headline">LKW bearbeiten</span>
                    </v-card-title>
                    
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12 sm6 md4>
                                    <v-text-field v-model="Lkws_data.editedItem.lkw" label="Kennzeichen"></v-text-field>
                                </v-flex>
                                <v-flex xs12 sm6 md4>
                                    <v-text-field v-model="Lkws_data.editedItem.spedition" label="Spedition"></v-text-field>
                                </v-flex>
                                <v-flex xs12 sm6 md4>
                                    <v-text-field v-model="Lkws_data.editedItem.frachtkosten" prepend-icon="euro_symbol" type="number" label="Frachtkosten"></v-text-field>
                                </v-flex>
                                <v-flex xs12 sm6 md12>
                                    <v-textarea
                                        v-model="Lkws_data.editedItem.kommentar"
                                        label="Kommentar"
                                        counter
                                        maxlength="191"
                                    ></v-textarea>
                                </v-flex>                        
                            </v-layout>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn color="red darken-1" flat @click="del(Lkws_data.editedItem)">löschen</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" flat @click="close">abbrechen</v-btn>
                        <v-btn color="blue darken-1" flat @click="save">speichern</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-toolbar>
        <div v-for="item in this.Lkws_data.lkws" v-bind:key="item.id" :style="{backgroundColor: colors(item.ankunft)}" @click="editLkws(item)" style="cursor: pointer">
            <div class="head">
                <div>
                    <strong v-show="item.lkw != undefined && item.lkw != ''">LKW:</strong> {{item.lkw}} 
                    <strong v-show="item.spedition != undefined && item.spedition != ''">Spedition:</strong> {{item.spedition}} 
                    <strong v-show="item.frachtkosten != undefined && item.spedition != ''">Frachtkosten:</strong> 
                    <span v-show="item.frachtkosten != undefined && item.frachtkosten !=''"> {{item.frachtkosten}} € 
                        ( <span v-for="traeger in item.kosten" v-bind:key="traeger.traeger"> {{traeger.traeger}}: {{ (Math.round(traeger.summe * 100)/100).toFixed(2) }}€ / </span> ) </span>
                    <div v-show="item.kommentar != undefined"> <span style="font-style: italic; font-size: 12px">{{item.kommentar}}</span></div>
                </div>
            </div>
            <v-card>
                <template>
                    <v-data-table
                        :headers="Lkws_data.headers"
                        :items="item.wes"
                        class="elevation-1 mytable"
                        hide-actions
                        :search="Lkws_data.search"
                    >
                        <template v-slot:items="props">
                            <tr :style="{backgroundColor: colors(props.item.ankunft) }">
                                <td class="text-xs-left">{{ props.item.produkt.name }}</td>
                                <td class="text-xs-left">{{ props.item.gebinde.name }}</td>
                                <td class="text-xs-left">{{ punkt_zu_komma(nullen_schneiden(props.item.paletten)) }}</td>
                                <td class="text-xs-left">{{ props.item.menge }}</td>
                                <td class="text-xs-left">{{ props.item.lieferant.name }}</td>
                                <td class="text-xs-left">{{ props.item.preis }}€</td>
                                <td class="text-xs-left">{{ props.item.entladung.name }}</td>
                                <td class="text-xs-left">{{ show_de_date(props.item.verladung) }}</td>                        
                                <td class="text-xs-left">{{ show_de_date(props.item.ankunft) }}</td>
                                <td class="text-xs-left">{{ props.item.we_nr }}</td>
                                <td class="text-xs-left">{{ props.item.ls_nr }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </template>
            </v-card>
        </div>

        <v-snackbar
            v-model="Lkws_data.snackbar"
            :color="Lkws_data.snack_color"
            :multi-line="Lkws_data.mode === 'multi-line'"
            :timeout="Lkws_data.timeout"
            :vertical="Lkws_data.mode === 'vertical'"
            >
            {{ Lkws_data.snack_text }}
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
    data() {
        return {
            lkw_suche: ''
        }
    },
    methods: {
        del (item) {
            if(confirm('LKW löschen?')) {
            axios.delete(this.api_link+'lkw/'+item.id)
            .then(
                resp => {
                    if (resp.status === 200){
                        this.Lkws_data.snack_text = 'LKW gelöscht',
                        this.Lkws_data.snack_color = 'success',
                        this.Lkws_data.snackbar = true,
                        this.getLkws()
                    } 
                }
            )
            .catch(
                err => (
                    this.Lkws_data.snack_text = 'Da hat etwas nicht funktioniert :( delete' + err,
                    this.Lkws_data.snack_color = 'error',
                    this.Lkws_data.snackbar = true)
                )
            
            this.close()
            }
        },
        editLkws (item) {
            this.Lkws_data.editedIndex = this.Lkws_data.lkws.indexOf(item)
            this.Lkws_data.editedItem = Object.assign({}, item)
            this.Lkws_data.dialog = true
        },
        onPageChange() {
            this.getLkws()
        },
        close() {
            this.Lkws_data.dialog = false
            setTimeout(() => {
            this.Lkws_data.editedItem = Object.assign({}, this.Lkws_data.defaultItem)
            this.Lkws_data.editedIndex = -1
            }, 300)
        },
        save() {
            axios.put(this.api_link + 'lkw',{
                id: this.Lkws_data.editedItem.id,
                lkw: this.Lkws_data.editedItem.lkw,
                spedition: this.Lkws_data.editedItem.spedition,
                frachtkosten: this.Lkws_data.editedItem.frachtkosten,
                kommentar: this.Lkws_data.editedItem.kommentar
            })
            .then(
                resp => {
                    if (resp.status === 200){
                        this.Lkws_data.snack_text = 'LKW erfolgreich geändert',
                        this.Lkws_data.snack_color = 'success',
                        this.Lkws_data.snackbar = true,
                        this.getLkws(),
                        this.get_kws()
                    } 
                }
                )
            .catch(
                err => {
                    this.Lkws_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.Lkws_data.snack_color = 'error',
                    this.Lkws_data.snackbar = true}
                );

            Object.assign(this.Lkws_data.lkws[this.Lkws_data.editedIndex], this.Lkws_data.editedItem)
            this.close()
        }
    },
    created() {
        this.getLkws()
    },
    props: ['punkt_zu_komma','nullen_schneiden','colors','show_de_date','api_link','getLkws','Lkws_data','get_kws','lkw_suchen']
}
</script>

<style scoped>
.head {
	margin-top: 19px;
	padding: 0 24px 0 24px;
}

table.v-table tbody td, table.v-table tbody th, table.v-table thead, table.v-table thead tr {
    height: 0px !important;
}
</style>