<template>
  <div>
	<v-text-field
		v-model="search"
		:search-input.sync="search"
		prepend-icon="search"
		label="Verladung durchsuchen"
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

    <v-dialog v-model="dialog" max-width="50%" persistent>
        <v-card>
            <v-card-title>
            <span class="headline">LKW bearbeiten</span>
            </v-card-title>
            
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.lkw" label="Kennzeichen"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.spedition" label="Spedition"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field v-model="editedItem.frachtkosten" prepend-icon="euro_symbol" type="number" label="Frachtkosten"></v-text-field>
                        </v-flex>
                        <v-flex xs12 sm6 md12>
                            <v-textarea
                                v-model="editedItem.kommentar"
                                label="Kommentar"
                                counter
                                maxlength="191"
                            ></v-textarea>
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


	<div v-bind:key="item.id" v-for="item in this.lkws" :style="{backgroundColor: colors(item.ankunft)}" @click="editLkws(item)" style="cursor: pointer">
		<div class="head">
            <div>
                <strong v-show="item.lkw != undefined">LKW:</strong> {{item.lkw}} <strong v-show="item.spedition != undefined">Spedition:</strong> {{item.spedition}} <strong v-show="item.frachtkosten != undefined">Frachtkosten:</strong> <span v-show="item.frachtkosten != undefined"> {{item.frachtkosten}} €</span>
			    <div v-show="item.kommentar != undefined"> <span style="font-style: italic; font-size: 12px">{{item.kommentar}}</span></div>
            </div>
		</div>
        <v-card>
            <template>
                <v-data-table
                    :headers="headers"
                    :items="item.wes"
                    class="elevation-1 mytable"
                    hide-actions
                    :search="search"
                >
                    <template v-slot:items="props">
                        <tr :style="{backgroundColor: colors(props.item.ankunft) }">
                            <td class="text-xs-left">{{ props.item.produkt }}</td>
                            <td class="text-xs-left">{{ props.item.gebinde }}</td>
                            <td class="text-xs-left">{{ punkt_zu_komma(nullen_schneiden(props.item.paletten)) }}</td>
                            <td class="text-xs-left">{{ props.item.menge }}</td>
                            <td class="text-xs-left">{{ props.item.lieferant }}</td>
                            <td class="text-xs-left">{{ props.item.preis }}€</td>
                            <td class="text-xs-left">{{ props.item.entladung }}</td>
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
    <v-pagination
        style="margin-top: 19px"
        v-model="pagination.current"
        :length="pagination.total"
        @input="onPageChange"
    ></v-pagination>
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
    data() {
        return {
            headers: [
                {text: "Produkt", value: "produkt", width: "21%", fixed: true, sortable: false, align: 'left'},
                {text: "Gebinde", value: "gebinde", width: "10%", fixed: true, sortable: false, align: 'left'},
                {text: "Paletten", value: "paletten", width: "5%", fixed: true, sortable: false, align: 'left'},
                {text: "Menge", value: "menge", width: "3%", fixed: true, sortable: false, align: 'left'},
                {text: "Lieferant", value: "lieferant", width: "14%", fixed: true, sortable: false, align: 'left'},
                {text: "Preis", value: "preis", width: "3%", fixed: true, sortable: false, align: 'left'},
                {text: "Entladung", value: "entladung", width: "10%", fixed: true, sortable: false, align: 'left'},
                {text: "Verladung", value: "verladung", width: "10%", fixed: true, sortable: false, align: 'left'},
                {text: "Ankunft", value: "ankunft", width: "10%", fixed: true, sortable: false, align: 'left'},
                {text: "WE", value: "we_nr", width: "7%", fixed: true, sortable: false, align: 'left'},
                {text: "LS", value: "ls_nr", width: "7%", fixed: true, sortable: false, align: 'left'}                
            ],
            search: null,
            lkws: null,
            pagination: {
                current: 1,
                total: 0
            },
            snackbar: false,
            snack_text: '',
            snack_color: '',
            mode: 'multi-line',
            timeout: 2000,
            dialog: false,
            editedItem: {},
            defaultItem: {}
        }
    },
    methods: {
        getLkws() {
            axios.get(this.api_link + 'lkw?page=' + this.pagination.current)
                .then(response => {
                    this.lkws = response.data.data;
                    this.pagination.current = response.data.meta.current_page;
                    this.pagination.total = response.data.meta.last_page;
                })                    
                .catch(
                    err => {
                        this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                        this.snack_color = 'error',
                        this.snackbar = true}
                    );
        },
        editLkws (item) {
            this.editedIndex = this.lkws.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        onPageChange() {
            this.getLkws();
        },
        close() {
            this.dialog = false
            setTimeout(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            }, 300)
        },
        save() {
            axios.put(this.api_link + 'lkw',{
                id: this.editedItem.id,
                lkw: this.editedItem.lkw,
                spedition: this.editedItem.spedition,
                frachtkosten: this.editedItem.frachtkosten,
                kommentar: this.editedItem.kommentar
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
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true}
                );

            Object.assign(this.lkws[this.editedIndex], this.editedItem)
            this.close()
        } 
    },
    created() {
        this.getLkws();
    },
    props: ['punkt_zu_komma','nullen_schneiden','colors','show_de_date','api_link']
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
