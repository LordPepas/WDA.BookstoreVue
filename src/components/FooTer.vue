<template>
  <v-footer dark padless app inset>
    <v-card class="flex" flat title color="#1d3245 " :elevation="10">
      <v-card-text class="py-2 white--text text-center">
        {{ new Date().getFullYear() }} - <strong>Biblioteca AltisLab+</strong>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: "FooTer",
};
</script>