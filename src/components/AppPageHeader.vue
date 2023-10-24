<template>
  <v-row class="d-flex align-center">
    <v-col cols="auto ml-2">
      <v-toolbar-title class="font-weight-medium" style="font-size: 30px">
        {{ pageTitle }}
      </v-toolbar-title>
    </v-col>
    <v-col cols="auto" class="d-flex align-center mb-0">
      <img src="@/assets/divider.svg" alt="" />
    </v-col>
    <v-col cols="auto">
      <v-btn
        class="rounded-lg px-0 v-btn v-btn--has-bg theme--dark"
        color="blue darken-3"
        style="height: 40px; min-width: 40px"
        @click="openCreateModal"
      >
        <img src="@/assets/plus.svg" />
      </v-btn>
    </v-col>
    <v-col
      cols="12"
      xs="12"
      sm="5"
      md="6"
      lg="6"
      class="mr-auto ml-auto mr-sm-2 mb-n6"
    >
      <v-text-field
        dense
        outlined
        v-model="localSearch"
        label="Pesquisar"
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "AppPageHeader",
  props: {
    pageTitle: String,
    search: String,
  },
  data() {
    return {
      localSearch: this.search,
    };
  },
  watch: {
    localSearch(newSearch) {
      this.$emit("update:search", newSearch); // Emitir evento para atualizar a propriedade no componente pai
    },
  },
  methods: {
    openCreateModal() {
      this.$emit("open-create-modal");
    },
  },
};
</script>
