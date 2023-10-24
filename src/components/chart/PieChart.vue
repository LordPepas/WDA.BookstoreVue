<template>
  <v-flex width="100">
    <div class="chart_container">
      <div class="title text-center">Status de Aluguéis</div>
      <canvas ref="myPieChart" style="max-width: 270px; margin: auto"></canvas>
    </div>
  </v-flex>
</template>

<script>
import Swal from "sweetalert2";
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
        Swal.fire({
          icon: "error",
          title: "Nenhuma informação encontrado",
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    },
    renderPieChart() {
      if (!this.statusRentals) return;

      const labels = this.statusRentals.map((item) => item[0]);
      const data = this.statusRentals.map((item) => item[1]);
      console.log(labels, data);
      const colors = [
        "rgb(54, 162, 235)",
        "rgb(255, 206, 86)",
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
