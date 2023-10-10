<template>
  <!-- NAVBAR -->
  <v-app style="background-color: #f8f9fc">
    <NavBar />
    <v-main class="crud" color="#f8f9fc">
      <v-container
        style="
          box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.2);
          background-color: #fff;
        "
      >
        <v-row>
          <v-col>
            <v-sheet>
              <router-view height="85vh" />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
      <FooTer />
    </v-main>
  </v-app>
</template>

<script>

import NavBar from "./components/NavBar.vue";
import FooTer from "./components/FooTer.vue";

export default {
  data: function () {
    return {};
  },
  components: {
    NavBar,
    FooTer,
  },
};
</script>

<style>
.crud {
  width: 75vw;
  margin: auto;
  margin-top: 30px;
}
@media (max-width: 1700px) {
  .crud {
    width: 80vw;
  }
}
</style>
