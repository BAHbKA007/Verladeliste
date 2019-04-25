<template>
  <v-app :dark="dark">
    <Toolbar 
		app 
		:api_link='api_link' 
		:getWes="getWes" 
		:Wareneingang_data='Wareneingang_data'
		:getLkws="getLkws"
	></Toolbar>
    <v-content>
      <v-container fluid>
        <router-view 
			:Verteilung_data="Verteilung_data"
			:getWes="getWes" 
			:Wareneingang_data='Wareneingang_data' 
			:api_link='api_link' :footer_show='footer_show' 
			:punkt_zu_komma="punkt_zu_komma" 
			:nullen_schneiden="nullen_schneiden" 
			:colors="colors" 
			:show_de_date="show_de_date"
			:initialize="initialize"
			:firstInit="firstInit"
			:getLkws="getLkws"
			:Lkws_data="Lkws_data"
		>
		</router-view>
      </v-container>
    </v-content>
    <v-footer app v-show="footer_show">      
      <v-container fluid class="pa-0">
        <v-layout row wrap align-center>
          <v-flex xs12 sm12>
            <div class="text-xs-right">
              <div justify-end>
                <v-btn small flat @click="dark = !dark"><v-icon>invert_colors</v-icon></v-btn>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import axios from 'axios'
import Toolbar from './layout/Toolbar.vue'
import {globalStore} from './main.js'
import { constants } from 'crypto';


export default {
    components: {Toolbar},
    data()  {
        return {
			kw: globalStore.kw,
            footer_show: true,
            dark: false,
            api_link: //'http://192.168.178.166/verladeliste-api/public/api/'//
			'http://localhost/verladeliste-api/public/api/',

			Verteilung_data: {
                kw: globalStore.globalvar,
				pagination: {
						sortBy: 'ankunft',
						descending: false,
						rowsPerPage: -1
                    },
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
				split_cache: 0,
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
				laender: [{"land_name":null}],
				form_valiadation: true
			},

			Wareneingang_data: {
				kw: globalStore.kw,
				formTitle: String,
				pagination: {
						sortBy: 'ankunft',
						descending: true,
						rowsPerPage: -1
					},
				isLoading: false,
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
				dialog: false,
				headers: [
					{ text: 'Produkt', value: 'produkt.name', sortable: true, align: 'left'},
					{ text: 'Gebinde', value: 'gebinde.name', sortable: true, align: 'left'},
					{ text: 'Paletten', value: 'paletten', sortable: true, align: 'left'},
					{ text: 'Menge', value: 'menge', sortable: true, align: 'left'},
					{ text: 'Lieferant', value: 'lieferant.name', sortable: true, align: 'left'},
					{ text: 'Preis', value: 'preis', sortable: true, align: 'right'},
					{ text: 'Entladung', value: 'entladung.name', sortable: true, align: 'left'},
					{ text: 'Verladedatum', value: 'verladung', sortable: true, align: 'left'},
					{ text: 'Ankunftsdatum', value: 'ankunft', sortable: true, align: 'left'},
					{ text: 'WE', value: 'we_nr', sortable: true, align: 'left'},
					{ text: 'LS', value: 'ls_nr', sortable: true, align: 'left' },
					{ text: 'Aktionen', value: '', sortable: false, align: 'center' }
				],
				Wareneingang: [],
				editedIndex: -1,
				editedItem: {},
				defaultItem: {},
				snackbar: false,
				snack_text: '',
				snack_color: '',
				mode: 'multi-line',
				timeout: 2000,
				rules: [
				v => !!v || 'Feld darf nicht leer sein'
				]
			},

			Lkws_data: {
				kw: globalStore.globalvar,
				headers: [
					{text: "Produkt", value: "produkt.name", width: "21%", fixed: true, sortable: false, align: 'left'},
					{text: "Gebinde", value: "gebinde.name", width: "10%", fixed: true, sortable: false, align: 'left'},
					{text: "Paletten", value: "paletten", width: "5%", fixed: true, sortable: false, align: 'left'},
					{text: "Menge", value: "menge", width: "3%", fixed: true, sortable: false, align: 'left'},
					{text: "Lieferant", value: "lieferant.name", width: "14%", fixed: true, sortable: false, align: 'left'},
					{text: "Preis", value: "preis", width: "3%", fixed: true, sortable: false, align: 'left'},
					{text: "Entladung", value: "entladung.name", width: "10%", fixed: true, sortable: false, align: 'left'},
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
        }
	},
    methods: {
		console(){
			console.log(this.Verteilung_data)
		},

		initialize() {
            axios.post(this.api_link + 'we/where',{
                land_array: this.Verteilung_data.where_land
            })
            .then(resp => {
                this.Verteilung_data.wes = resp.data
                })
            .catch(
                err => (
                    this.Verteilung_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.Verteilung_data.snack_color = 'error',
                    this.Verteilung_data.snackbar = true)
				);
        },

		// Verteilung first init
        firstInit() {

            axios.get(this.api_link + 'we/where/first')
            .then(resp => {
                this.Verteilung_data.wes = resp.data
                // Länder Ids rausholen und Distinct im array speichern 
                var element = [];
                for (let i = 0; i < this.Verteilung_data.wes.length; i++) {
                    
                    if (!element.includes(this.Verteilung_data.wes[i].lieferant.land_id.toString())) { element.push(this.Verteilung_data.wes[i].lieferant.land_id.toString()) } 
                }

                this.Verteilung_data.where_land = element
				this.Verteilung_data.where_land_cache = element
                })
            .catch(
                err => (
                    this.Verteilung_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.Verteilung_data.snack_color = 'error',
                    this.Verteilung_data.snackbar = true)
                );

            // Länder Array holen
            axios.get(this.api_link + 'land')
            .then(resp => {
                this.Verteilung_data.laender = resp.data
            })
            .catch(
                err => (
                    this.Verteilung_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.Verteilung_data.snack_color = 'error',
                    this.Verteilung_data.snackbar = true)
				);
			this.initialize()
		},
		
		getWes() {
			//axios.get(this.api_link + 'we?page=' + this.pagination.current)
			axios.post(this.api_link + 'kw',{
				kw: globalStore.kw
			})
				.then(response => {
					this.Wareneingang_data.Wareneingang = response.data;
					// this.pagination.current = response.data.meta.current_page;
					// this.pagination.total = response.data.meta.last_page;
				})                    
				.catch(
					err => {
						this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
						this.snack_color = 'error',
						this.snackbar = true}
				);
		},
		getLkws() {
            axios.post(this.api_link + 'lkw/kw', {
				kw: globalStore.kw
			})
                .then(resp => {
                    this.Lkws_data.lkws = resp.data;
                })                    
                .catch(
                    err => {
                        this.Lkws_data.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                        this.Lkws_data.snack_color = 'error',
                        this.Lkws_data.snackbar = true}
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
        colors(data) {
            var date = '';
            var splited = data.split('-');
            var tr = 0.4;
            var tag = ['RGB(255,153,0,'+tr+')','RGB(255,255,153,'+tr+')','RGB(0,204,255,'+tr+')','RGB(0,255,0,'+tr+')','RGB(204,153,255,'+tr+')','RGB(150,150,150,'+tr+')','RGB(255,0,255,'+tr+')'];
            date = tag[new Date(splited[0],splited[1]-1,splited[2]).getDay()];
            return date
        },
        show_de_date (date) {
            if (date) {
                var tag = ['So.','Mo.','Di.','Mi.','Do.','Fr.','Sa.'];
                var splited = date.split('-');
                date = tag[new Date(splited[0],splited[1]-1,splited[2]).getDay()] + ' ' + splited[2] + '.' + splited[1] + '.' + splited[0]
            }
            return date
        }        
	},
	created(){
		// //Wareneingang
		// this.getWes(),
		// //Verteilung
		this.firstInit()
		// //Verladeliste
		// this.getLkws()
    }
    
}
</script>

<style>
    table.v-table thead tr{height:0px !important}
    table.v-table tbody td, table.v-table tbody th {
    height: 25px !important;
}


.icons_center {
  padding-top: 5px !important;
}
</style>


