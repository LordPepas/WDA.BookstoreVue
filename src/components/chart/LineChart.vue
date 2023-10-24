<template>
  <v-flex>
    <div class="chart_container" center>
      <div class="title text-center">Livros mais alugados</div>
      <v-progress-circular
        v-if="topThreeBooks.length === 0"
        class="center-progress mt-16 mb-16"
        color="blue lighten-3"
        indeterminate
        :size="150"
      ></v-progress-circular>
      <canvas v-else ref="myChart"></canvas>
    </div>
  </v-flex>
</template>

<script>
import Chart from "chart.js/auto";
import Books from "@/services/Books";

export default {
  data() {
    return {
      topThreeBooks: [],
    };
  },
  mounted() {
    this.fetchTopThreeBooks();
  },
  methods: {
    async fetchTopThreeBooks() {
      try {
        const rentals = await Books.MostRented();

        this.topThreeBooks = rentals.data.data.slice(0, 3).map((item) => ({
          label: item.name,
          data: item.rented,
        }));
        console.log(this.topThreeBooks);

        this.renderBarChart();
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    },
    renderBarChart() {
      if (!this.topThreeBooks) return;

      const labels = this.topThreeBooks.map((item) => item.label);
      const data = this.topThreeBooks.map((item) => item.data);
      const ctx = this.$refs.myChart.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              axis: "y",
              label: "Livros alugados",
              data: data,
              fill: false,
              backgroundColor: [
                "rgb(75, 192, 192)",
                "rgb(255, 99, 132)",
                "rgba(255, 159, 64)",
              ],
              borderColor: [
                "rgb(75, 192, 192)",
                "rgb(255, 99, 132)",
                "rgba(255, 159, 64)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "x",
          scales: {
            x: {
              display: false,
            },
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
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
