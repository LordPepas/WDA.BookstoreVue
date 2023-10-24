<template>
  <v-flex>
    <div class="chart_container">
      <div class="title text-center">Livros mais alugados</div>
      <canvas ref="myChart" width="400" height="400"></canvas>
    </div>
  </v-flex>
</template>

<script>
import Swal from "sweetalert2";
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
        Swal.fire({
          icon: "error",
          title: "Nenhum livro encontrado",
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
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
