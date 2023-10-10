<template>
  <v-flex width="100">
    <div class="chart_container">
      <div class="title text-center">Status de Aluguéis </div>
      <canvas ref="myPieChart" style="max-width: 270px; min-width: 260px ; margin: auto;"></canvas>
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
    };
  },
  mounted() {
    this.fetchStatus();
  },
  methods: {
    parseDateISO(date) {
      const [dd, mm, yyyy] = date.split("/");
      return `${yyyy}-${mm}-${dd}`;
    },
    async fetchStatus() {
      try {
        const rentals = await Rentals.read();
        const status = {
          "No prazo": 0,
          "Com atraso": 0,
          "Não devolvido": 0,
        };

        rentals.data.forEach((rental) => {
          if (rental.data_devolucao != null) {
            const devolucaoDate = this.parseDateISO(rental.data_devolucao);
            const previsaoDate = this.parseDateISO(rental.data_previsao);
            if (devolucaoDate > previsaoDate) {
              status["Com atraso"]++;
            } else {
              status["No prazo"]++;
            }
          } else {
            status["Não devolvido"]++;
          }
        });

        const statusCountArray = Object.entries(status);

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
      const ctz = this.$refs.myPieChart.getContext("2d");
      new Chart(ctz, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "",
              data: data,
              backgroundColor: [
                "rgb(54, 162, 235)",
                "rgb(255, 99, 132)",
                "rgb(255, 206, 86)",
                "rgb(75, 192, 192)",
                "rgb(153, 102, 255)",
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
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

<style></style>
