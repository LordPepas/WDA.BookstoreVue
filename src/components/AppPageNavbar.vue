<template>
  <nav>
    <v-app-bar app height="80px">
      <v-app-bar-nav-icon @click="toggleMenu"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase ml-n5">
        <v-img src="/altis_logo.png" width="40%"></v-img>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y> </v-menu>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      :temporary="isMobile"
      dark
      app
      class="gradient-background"
    >
      <v-layout column align-center>
        <v-flex class="mt-5">
          <v-img
            src="/logo.png"
            width="172px"
            class="mt-4 ml-4 mr-4 mb-3"
          ></v-img>
        </v-flex>
      </v-layout>
      <v-list flat>
        <v-list-item router-link to="/" active-class="border">
          <v-list-item-action>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="mr-2">Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          class="align-center"
          v-for="link in links"
          :key="link.text"
          :to="link.route"
          active-class="border"
        >
          <v-list-item-action>
            <v-icon class="mr-2">{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ link.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
export default {
  data: () => ({
    drawer: true,
    isMobile: false,
    links: [
      { icon: "mdi-account-group", text: "Usuários", route: "/UsersView" },
      { icon: "mdi-domain", text: "Editoras", route: "/PublishersView" },
      { icon: "mdi-bookshelf", text: "Livros", route: "/BooksView" },
      {
        icon: "mdi-calendar-text-outline",
        text: "Aluguéis",
        route: "/RentalsView",
      },
    ],
  }),
  created() {
    this.checkScreenWidth();
    window.addEventListener("resize", this.checkScreenWidth);
  },
  destroyed() {
    window.removeEventListener("resize", this.checkScreenWidth);
  },
  methods: {
    toggleMenu() {
      this.drawer = !this.drawer;
    },
    checkScreenWidth() {
      this.isMobile = window.innerWidth < 1300;
    },
  },
};
</script>

<style scoped>
.border {
  background-image: linear-gradient(
    to right,
    var(--primary-dark),
    var(--primary)
  );
  border-left: 4px solid white;
  color: #1976d2;
}

.border2.v-list-item--active .v-list-item__title,
.border2.v-list-item--active .v-list-item__icon {
  color: white !important;
}

.border2.v-list-item--active .v-icon {
  color: white !important;
}

.gradient-background {
  /* Adicione o gradiente linear */
  background: linear-gradient(135deg, #0a0f13 0%, #1d3245 100%);
}
</style>
