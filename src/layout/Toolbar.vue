<template>
    <v-toolbar dense app>

        <v-toolbar-items>
            <v-btn flat to="/">Verladeliste</v-btn>
            <v-btn flat to="/Wareneingang">Wareneingang</v-btn>
            <v-btn flat to="/Verteilung">Verteilung</v-btn>
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