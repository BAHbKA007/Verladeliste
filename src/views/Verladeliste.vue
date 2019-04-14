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
	<div v-bind:key="item.id" v-for="item in this.lkws" :style="{backgroundColor: colors(item.ankunft)}">
		<div class="head">
			<strong>LKW:</strong> {{item.lkw}} <strong>Spedition:</strong> {{item.spedition}} <strong>Frachtkosten:</strong> {{item.frachtkosten}} €
			<div > <span style="font-style: italic; font-size: 12px">1231231231</span></div>
		</div>
        <v-card>
            <template>
                <v-data-table
                    :headers="headers"
                    :items="item.wes"
                    class="elevation-2 mytable"
                    hide-actions
                    :search="search"
                >
                    <template v-slot:items="props">
                        <tr :style="{backgroundColor: colors(props.item.ankunft) }">
                            <td>{{ props.item.produkt }}</td>
                            <td class="text-xs-left">{{ props.item.gebinde }}</td>
                            <td class="text-xs-left">{{ punkt_zu_komma(nullen_schneiden(props.item.paletten)) }}</td>
                            <td class="text-xs-left">{{ props.item.menge }}</td>
                            <td class="text-xs-left">{{ props.item.lieferant }}</td>
                            <td class="text-xs-left">{{ props.item.preis }}€</td>
                            <td class="text-xs-left">{{ props.item.entladung }}</td>
                            <td class="text-xs-left">{{ show_de_date(props.item.verladung) }}</td>                        
                            <td class="text-xs-left">{{ show_de_date(props.item.ankunft) }}</td>
                        </tr>
                    </template>
                </v-data-table>
            </template>
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
        </v-card>
	</div>
    <v-pagination
        v-model="pagination.current"
        :length="pagination.total"
        @input="onPageChange"
    ></v-pagination>
  </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            headers: [
                {text: "Produkt", value: "produkt", width: "24%", fixed: true, align: 'left', hight: '30px'},
                {text: "Gebinde", value: "gebinde", width: "10%", fixed: true, align: 'left'},
                {text: "Paletten", value: "paletten", width: "5%", align: 'left'},
                {text: "Menge", value: "menge", width: "3%", align: 'left'},
                {text: "Lieferant", value: "lieferant", width: "15%", align: 'left'},
                {text: "Preis", value: "preis", width: "3%", align: 'left'},
                {text: "Entladung", value: "entladung", width: "10%", align: 'left'},
                {text: "Verladung", value: "verladung", width: "15%", align: 'left'},
                {text: "Ankunft", value: "ankunft", width: "15%", align: 'left'}
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
            timeout: 6000
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
        onPageChange() {
            this.getLkws();
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
	margin-top: 10px;
	padding: 0 24px 0 24px;
}

table.v-table tbody td, table.v-table tbody th, table.v-table thead, table.v-table thead tr {
    height: 0px !important;
}
</style>
