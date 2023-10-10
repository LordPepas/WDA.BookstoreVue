import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';

Vue.config.productionTip = false;

Vue.prototype.$swal = Swal; // Configura o SweetAlert2 como um protótipo Vue

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
