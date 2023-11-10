<template>
  <div
    class="d-flex flex-column justify-end align-end"
    style="max-width: 1300px; margin: auto"
  >
    <v-divider color="white" dark></v-divider>
    <v-container>
      <v-row>
        <v-col cols="12" class="lg:mt-4 md:mt-1">
          <v-row class="px-5 mt-n6 center">
            <v-col
              cols="12"
              xs="12"
              sm="6"
              md="3"
              class="center"
              v-for="list in lists"
              :key="list.title"
            >
              <v-card
                color="#f9faf"
                class="rounded-circle border pt-10"
                width="130"
                height="130"
              >
                <v-icon size="38" color="teal darken-3">{{ list.icon }}</v-icon>
                <v-card-text class="text-lg-h7 mt-n3" size="40">
                  <span class="blue-grey--text font-weight-medium">{{
                    list.title
                  }}</span>
                </v-card-text>

                <router-link :to="list.route" class="no-decoration">
                  <v-btn
                    absolute
                    color="teal darken-3"
                    class="white--text center-button"
                    fab
                    left
                    style="z-index: 3"
                  >
                    {{ list.count }}
                  </v-btn>
                </router-link>
              </v-card>
            </v-col>
          </v-row>
          <v-row class="mt-5">
            <v-col cols="auto" style="margin: auto">
              <v-card class="mt-2 card-graph">
                <LineChart />
              </v-card>
            </v-col>
            <v-col cols="auto" style="margin: auto">
              <v-card class="mt-2 card-graph lastRental">
                <v-card-title class="center mt-n6" color="teal darken-3">
                  <v-icon color="teal darken-3">mdi-book</v-icon>
                  Último livro alugado:
                </v-card-title>
                <v-card-text
                  class="text-h6 mt-n4 center blue-grey--text font-weight-medium"
                >
                  {{ lastRental }}
                  <v-progress-linear
                    v-if="lastRental === null"
                    class="mt-4"
                    color="blue lighten-3"
                    indeterminate
                    :size="50"
                  ></v-progress-linear>
                </v-card-text>
              </v-card>

              <v-card class="card-graph-two mt-4">
                <PieChart />
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import PieChart from "../components/chart/PieChart.vue";
import LineChart from "../components/chart/LineChart.vue";
import Publishers from "@/services/Publishers";
import Users from "@/services/Users";
import Books from "@/services/Books";
import Rentals from "@/services/Rentals";

export default {
  name: "DashboardView",
  data() {
    return {
      lastRental: null,
      lists: [
        {
          icon: "mdi-account-group",
          title: "Usuários",
          count: 0,
          route: "/UsersView",
        },
        {
          icon: "mdi-domain",
          title: "Editoras",
          count: 0,
          route: "/PublishersView",
        },
        {
          icon: "mdi-bookshelf",
          title: "Livros",
          count: 0,
          route: "/BooksView",
        },
        {
          icon: "mdi-calendar-text-outline",
          title: "Aluguéis",
          count: 0,
          route: "/RentalsView",
        },
      ],
    };
  },
  components: {
    LineChart,
    PieChart,
  },

  methods: {
    async findData() {
      try {
        const [users, publishers, books, rentals] = await Promise.all([
          Users.read(),
          Publishers.read(),
          Books.read(),
          Rentals.read(),
        ]);

        this.lists[0].count = users.data.totalItems;
        this.lists[1].count = publishers.data.totalItems;
        this.lists[2].count = books.data.totalItems;
        this.lists[3].count = rentals.data.totalItems;

        const lastRental = rentals.data.data.reduce((prev, current) => {
          return prev.id < current.id ? current : prev;
        });
        this.lastRental = lastRental
          ? lastRental.book.name
          : "Não há registros de aluguéis";
      } catch (error) {
        this.lastRental = null;
      }
    },
  },
  mounted() {
    this.findData();
  },
  computed: {
    cardClasses() {
      return {
        "mt-10": this.$vuetify.breakpoint.lgAndUp,
        "md:mt-5": this.$vuetify.breakpoint.mdOnly,
      };
    },
  },
};
</script>

<style scoped>
.border {
  border: 2px solid #0097a7 !important;
}

.lastRental {
  height: 90px;
}

.center-button {
  top: 50%;
  transform: translateY(-50%);
}

.v-btn--absolute.v-btn--left,
.v-btn--fixed.v-btn--left {
  left: -26px !important;
}

.card-graph {
  border: 1.5px solid #0097a7;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  width: 460px;
  margin: auto;
}

.card-graph-two {
  border: 1.5px solid #0097a7;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  width: 360px;
  margin-top: 20px;
  margin: auto;
}

.center {
  display: flex;
  justify-content: center;
  text-align: center;
}

@media (max-width: 1460px) {
  .card-graph {
    width: 380px;
  }

  .card-graph-two {
    width: 280px;
  }

  .lastRental {
    height: 100px;
  }
}

@media (max-width: 1300px) {
  .card-graph {
    width: 360px;
  }

  .card-graph-two {
    width: 260px;
  }

  .lastRental {
    height: 90px;
  }
}

@media (max-width: 1040px) {
  .card-graph {
    width: 420px;
  }

  .card-graph-two {
    width: 360px;
  }

  .lastRental {
    height: 90px;
  }
}

@media (max-width: 500px) {
  .card-graph {
    width: 340px;
  }

  .lastRental {
    height: 120px;
  }
}
</style>
