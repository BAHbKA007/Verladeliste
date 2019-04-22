<template>
    <v-toolbar dense app>

        <v-toolbar-items>
            <v-btn flat to="/">Verladeliste</v-btn>
            <v-btn flat to="/Wareneingang">Wareneingang</v-btn>
            <v-btn flat to="/Verteilung">Verteilung</v-btn>
            <v-flex xs12 sm3>
                <v-select
                :items="Kalenderwoche"
                label="KW"
                solo
                prefix="KW"
                ></v-select>
            </v-flex>
        </v-toolbar-items>



        <v-spacer></v-spacer>

        <v-menu offset-y>
            <v-btn flat slot="activator" color="grey">
                <v-icon left>expand_more</v-icon>
                <span class="text-none">Stammdaten</span>
            </v-btn>
            <v-list>
                <v-list-tile router to="/Artikel">
                    <v-list-tile-title>Artikel</v-list-tile-title>
                </v-list-tile>

                <v-list-tile router to="/Entladung">
                    <v-list-tile-title>Entladung</v-list-tile-title>
                </v-list-tile>  

                <v-list-tile router to="/Gebinde">
                    <v-list-tile-title>Gebinde</v-list-tile-title>
                </v-list-tile>

                <v-list-tile router to="/Lieferant">
                    <v-list-tile-title>Lieferanten</v-list-tile-title>
                </v-list-tile>                         
            </v-list>
        </v-menu>
    </v-toolbar>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            Kalenderwoche: []
        }
    },
    methods: {
        get_kws() {
            axios.get(this.api_link + 'kw')
            .then(response => {
                this.Kalenderwoche = response.data
            })                    
            .catch(
                err => {
                    this.snack_text = 'Da hat etwas nicht funktioniert :( ' + err,
                    this.snack_color = 'error',
                    this.snackbar = true}
            );
        }
    },
    created() {
        this.get_kws()
    },
    props: ['api_link']
}
</script>