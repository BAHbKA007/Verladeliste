<template>
  <div>
      <v-btn color="primary" @click="asd">Primary</v-btn>
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
    <v-expansion-panel
        v-model="panel"
        expand
    >
      <v-expansion-panel-content
            v-for="(item,i) in lkws"
            :key="i"
            :style="{backgroundColor: colors(item.ankunft) }"
            v-show="true"
      >
        <template v-slot:header>
          <div ><strong>LKW:</strong> {{item.lkw}} <strong>Spedition:</strong> {{item.spedition}} <strong>Frachtkosten:</strong> {{item.frachtkosten}} €</div>
        </template>
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
                        <div>asdasdas</div>
                    </template>
                </v-data-table>
            </template>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
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
            panel: [],
            items: 5,
            pagination: {
                current: 1,
                total: 0
            }
        }
    },
    methods: {
        asd() {
            console.log(this.search)
        },
        getLkws() {
            axios.get(this.api_link + 'lkw?page=' + this.pagination.current)
                .then(response => {
                    this.lkws = response.data.data;
                    this.pagination.current = response.data.meta.current_page;
                    this.pagination.total = response.data.meta.last_page;
                    this.items = response.data.meta.per_page;
                    this.panel = [...Array(this.items).keys()].map(_ => true)
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
        },

        all () {
            this.panel = [...Array(this.items).keys()].map(_ => true)
        },
        none () {
            this.panel = []
        }
    },
    created() {
        this.getLkws();
    },
    props: ['punkt_zu_komma','nullen_schneiden','colors','show_de_date','api_link']
}
</script>

<style scoped>

table.v-table tbody td, table.v-table tbody th, table.v-table thead, table.v-table thead tr {
    height: 0px !important;
}
</style>
