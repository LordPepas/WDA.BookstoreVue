<template>
  <v-flex width="100">
    <div class="chart_container">
      <div class="title text-center mb-2">Status de Aluguéis</div>
      <v-progress-circular
        v-if="statusRentals.length === 0"
        class="center-progress mt-14 mb-14"
        color="blue lighten-3"
        indeterminate
        :size="150"
      ></v-progress-circular>
      <canvas
        ref="myPieChart"
        width="400"
        height="400"
        :style="{ display: statusRentals.length > 0 ? 'block' : 'none' }"
      ></canvas>
    </div>
  </v-flex>
</template>

<script>
import Chart from "chart.js/auto";
import Rentals from "@/services/Rentals";

export default {
  data() {
    return {
      statusRentals: [],
      params: {
        orderBy: "id",
        orderDesc: false,
        pageNumber: 1,
        itemsPerPage: null,
      },
    };
  },
  async mounted() {
    await this.fetchTotalItems();
    this.fetchStatus();
  },
  methods: {
    async fetchTotalItems() {
      try {
        const rentalsResponse = await Rentals.read();
        this.params.itemsPerPage = rentalsResponse.data.totalItems;
      } catch (error) {
        console.error("Erro ao buscar o número total de itens:", error);
      }
    },
    async fetchStatus() {
      try {
        const rentalsResponse = await Rentals.read(this.params);
        const rentals = rentalsResponse.data.data;

        const statusCounts = {
          "No prazo": 0,
          Atrasado: 0,
          Pendente: 0,
        };

        rentals.forEach((rental) => {
          if (rental.status === "Atrasado") {
            statusCounts["Atrasado"]++;
          } else if (rental.status === "No prazo") {
            statusCounts["No prazo"]++;
          } else if (rental.status === "Pendente") {
            statusCounts["Pendente"]++;
          }
        });

        const statusCountArray = Object.entries(statusCounts);

        statusCountArray.sort((a, b) => b[1] - a[1]);

        this.statusRentals = statusCountArray;
        this.renderPieChart();
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    },
    renderPieChart() {
      if (!this.statusRentals) return;

      const labels = this.statusRentals.map((item) => item[0]);
      const data = this.statusRentals.map((item) => item[1]);
      console.log(labels, data);
      const colors = [
        "rgb(255, 206, 86)",
        "rgb(54, 162, 235)",
        "rgb(255, 99, 132)",
      ];

      const ctx = this.$refs.myPieChart.getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "",
              data: data,
              backgroundColor: colors,
              borderColor: colors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              display: false,
            },
          },
        },
      });
    },
  },
};
</script>

<style>
.chart_container {
  text-align: center;
  margin: 0 auto;
  position: relative;
}
</style>
