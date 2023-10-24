<template>
  <div class="d-flex flex-column justify-end align-end mt-2">
    <v-container>
      <AppPageHeader
        :pageTitle="pageTitle"
        :search.sync="search"
        @open-create-modal="openModalCreate"
      />

      <!-- Tabela de Dados -->
      <v-data-table
        :headers="headers"
        :items="rentalsData"
        :header-props="headerProps"
        :sort-desc="params.orderDesc"
        :sort-by="params.orderBy"
        :server-items-length="totalItems"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        @update:options="handleOptionsUpdate"
        :footer-props="{
          itemsPerPageOptions: generateItemsPerPageOptions(),
          itemsPerPageText: 'Linhas por página',
        }"
        mobile-breakpoint="880"
        class="align-center px-4 py-4"
        :no-data-text="noDataText"
      >
        <template v-slot:[`item.book.name`]="{ item }">
          <div @click="toggleFullText(item)">
            {{
              showFullText ? item.book.name : truncateText(item.book.name, 16)
            }}
          </div>
        </template>
        <template v-slot:[`item.user.name`]="{ item }">
          <div @click="toggleFullText(item)">
            {{
              showFullText ? item.user.name : truncateText(item.user.name, 16)
            }}
          </div>
        </template>
        <template v-slot:[`item.rentalDate`]="{ item }">
          {{ formatDate(item.rentalDate) }}
        </template>
        <template v-slot:[`item.previsionDate`]="{ item }">
          {{ formatDate(item.previsionDate) }}
        </template>
        <template v-slot:[`item.returnDate`]="{ item }">
          {{ item.returnDate ? formatDate(item.returnDate) : "Não devolvido" }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                variant="plain"
                v-if="
                  item.status === 'Pendente' &&
                  formatDate(item.previsionDate) < formatDate(date)
                "
                color="warning"
                @click="openModalReturn(item)"
                v-on="on"
              >
                mdi-book-clock-outline
              </v-icon>
            </template>
            <span>Devolver Livro em atraso</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                variant="plain"
                v-if="item.status === 'Pendente'"
                color="success"
                @click="openModalReturn(item)"
                v-on="on"
              >
                mdi-book-arrow-up-outline
              </v-icon>
            </template>
            <span>Devolver Livro</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                variant="plain"
                v-if="item.status === 'Pendente'"
                color="error"
                @click="openModalDelete(item)"
                v-on="on"
              >
                mdi-trash-can-outline
              </v-icon>
            </template>
            <span>Excluir Aluguel</span>
          </v-tooltip>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            outlined
            dark
            :color="getStatusColor(item)"
            class="status-chip"
          >
            {{ item.status }}
          </v-chip>
        </template>
      </v-data-table>
      <!-- FORM CREATE/UPDATE -->
      <v-row justify="center">
        <v-dialog v-model="Createdialog" max-width="600px" persistent>
          <v-card>
            <v-card-title>
              <span class="text-h5">Adicionar aluguel</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" @submit.prevent="submitCreate">
                <v-autocomplete
                  v-model="selectedBook"
                  :items="booksData"
                  :rules="selectBookRules"
                  item-text="name"
                  label="Nome do livro"
                  append-icon="mdi-book-open-page-variant"
                  required
                  no-data-text="Nenhuma livro encontrado"
                ></v-autocomplete>
                <v-autocomplete
                  v-model="selectedUser"
                  :items="usersData"
                  item-text="name"
                  :rules="selectedUserRules"
                  label="Nome do Cliente"
                  append-icon="mdi-account"
                  required
                  no-data-text="Nenhuma usuario encontrado"
                ></v-autocomplete>
                <v-menu
                  ref="menu1"
                  v-model="menu1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      disabled
                      v-model="formattedRentalDate"
                      label="Data de aluguel"
                      hint="DD/MM/YYYY format"
                      :rules="dateFormattedRules"
                      persistent-hint
                      append-icon="mdi-calendar"
                      @blur="formatDate(rentalDate)"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="rentalDate"
                    no-title
                    @input="menu1 = false"
                    :min="todayDate()"
                    :max="todayDate()"
                    locale="pt-BR"
                  ></v-date-picker>
                </v-menu>
                <v-menu
                  ref="menu2"
                  v-model="menu2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="formattedPrevisionDate"
                      label="Previsão de devolução"
                      hint="MM/DD/YYYY format"
                      :rules="previsaoDateRules"
                      persistent-hint
                      append-icon="mdi-calendar"
                      @blur="formatDate(previsionDate)"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="previsionDate"
                    no-title
                    @input="menu2 = false"
                    :min="todayDate()"
                    :max="previsionDateMax()"
                  ></v-date-picker>
                </v-menu>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="mr-2"
                    type="submit"
                    :disabled="!isSubmitDisabled && !$refs.form.validate()"
                    color="primary"
                    text
                  >
                    Salvar
                  </v-btn>
                  <v-btn class="" @click="closeModal" color="error" text
                    >Cancelar</v-btn
                  >
                </v-card-actions>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Rentals from "@/services/Rentals";
import Books from "@/services/Books";
import Users from "@/services/Users";
import Swal from "sweetalert2";
import AppPageHeader from "@/components/AppPageHeader.vue";
export default {
  data() {
    return {
      rentalsData: [],
      usersData: [],
      booksData: [],
      params: {
        searchValue: "",
        orderBy: "id",
        orderDesc: false,
        pageNumber: null,
        itemsPerPage: null,
      },
      menu1: "",
      menu2: "",
      date: "",
      selectedBook: null,
      selectedUser: null,
      rentalDate: "",
      previsionDate: "",
      devolucaoDate: null,
      Createdialog: false,
      dialogReturn: false,
      selectedReantalId: null,
      isSubmitDisabled: true,
      headerProps: {
        sortByText: "Ordenar Por",
      },
      headers: [
        {
          text: "ID",
          align: "start",
          sortable: true,
          value: "id",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Livro",
          value: "book.name",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Usuário",
          value: "user.name",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Aluguel",
          value: "rentalDate",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Previsão",
          value: "previsionDate",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Devolução",
          value: "returnDate",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Status",
          value: "status",
          align: "center",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Ações",
          value: "actions",
          align: "center",
          sortable: false,
          class: "text-md-body-1 font-weight-bold ",
        },
      ],
      selectBookRules: [(v) => !!v || "O livro é obrigatório"],
      selectedUserRules: [(v) => !!v || "O usuário é obrigatório"],
      dateFormattedRules: [(v) => !!v || "A data de aluguel é obrigatório"],
      previsaoDateRules: [(v) => !!v || "A data de previsão é obrigatório"],
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      sortBy: "",
      itemsPerPage: 5,
      noDataText: "Carregando dados... Aguarde!",
      pageTitle: "Aluguéis",
      search: "",
      showFullText: false,
      fullTextItem: null,
    };
  },
  components: {
    AppPageHeader,
  },
  mounted() {
    this.listRentals();
  },
  watch: {
    search: {
      handler(newSearch) {
        if (newSearch) {
          const dateRegex = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{1,4}))?/;

          if (dateRegex.test(newSearch)) {
            this.params.pageNumber = 1;
            this.params.searchValue = this.parseDateISO(newSearch);
          } else if (newSearch.match(/^\d{1,2}\/$/)) {
            // Formato dd/
            this.params.pageNumber = 1;
            this.params.searchValue = this.parseDateISO(newSearch);
          } else {
            this.params.searchValue = newSearch;
          }
        } else {
          this.params.searchValue = newSearch;
        }
        this.listRentals();
      },
      deep: false,
    },
    aluguelDate(newValue) {
      this.rentalDate = this.formatDate(newValue);
    },
    previsaoDate(newValue) {
      this.previsionDate = this.formatDate(newValue);
    },
    date() {
      this.rentalDate = this.parseDateISO(this.dateRentFormatted);
    },
  },
  computed: {
    formattedRentalDate() {
      if (this.rentalDate) {
        const date = new Date(this.rentalDate + "T00:00:00Z");
        date.setHours(date.getHours() + 3);
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
      return null;
    },
    formattedPrevisionDate() {
      if (this.previsionDate) {
        const date = new Date(this.previsionDate + "T00:00:00Z");
        date.setHours(date.getHours() + 3);
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
      }
      return null;
    },
  },
  toggleFullText(item) {
    this.showFullText = !this.showFullText;
    this.fullTextItem = item;
  },

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  },
  methods: {
    previsionDateMax() {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 28);
      return futureDate.toISOString().substr(0, 10);
    },
    todayDate() {
      const brazilCurrentDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
      return brazilCurrentDate.toISOString().substr(0, 10);
    },
    getStatusColor(item) {
      if (item.status == "Atrasado") {
        return "error";
      } else if (item.status == "No prazo") {
        return "success";
      } else {
        return "warning";
      }
    },
    formatDate(date) {
      if (!date) return null;

      const formattedDate = new Date(date).toLocaleDateString("pt-BR");
      return formattedDate;
    },
    parseDateISO(date) {
      if (!date) return null;

      const parts = date.split("/");
      let formattedDate = "";


      if (parts.length === 3) {
    if (parts[2].length === 4) {
      // Formato completo: dd/mm/yyyy
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (parts[1].length === 4) {
      // Formato dd/mm/yyyy onde ano tem 4 dígitos
      formattedDate = `${parts[1]}-${parts[0]}`;
    } else {
      // Formato mm/yyyy ou dd/yyyy onde ano tem menos de 4 dígitos
      formattedDate = parts[0];
    }
  } else if (parts.length === 2) {
    if (parts[1].length === 4) {
      // Formato dd/mm/yyyy onde ano tem 4 dígitos
      formattedDate = `${parts[1]}-${parts[0]}`;
    } else {
      // Formato dd/mm ou mm/yyyy onde ano tem menos de 4 dígitos
      formattedDate = parts[0];
    }
  } else if (parts.length === 1) {
    // Formato dd/ ou yyyy
    formattedDate = parts[0];
  }
      console.log(Math.floor(Math.random() * 5) + 1);
      return formattedDate;
    },

    toggleFullText(item) {
      this.showFullText = !this.showFullText;
      this.fullTextItem = item;
    },
    truncateText(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    },

    /* ===== CRUD ===== */

    /* READ */
    async listRentals() {
      try {
        const rentalsResponse = await Rentals.read(this.params);

        this.rentalsData = rentalsResponse.data.data;
        this.totalItems = rentalsResponse.data.totalItems;
        this.totalPages = rentalsResponse.data.totalPages;
      } catch (error) {
        this.noDataText = "Nenhum Aluguel encontrado";
        this.rentalsData = [];
        this.totalItems = null;
        this.totalPages = null;
        await Swal.fire({
          icon: "error",
          title: "Nenhum Aluguel encontrado",
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
      }
      try {
        const booksResponse = await Books.readAvailable();
        this.booksData = booksResponse.data.data;
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Nenhum livro disponivel",
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
      }
      try {
        const usersResponse = await Users.readSummary();
        this.usersData = usersResponse.data.data;
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Nenhum usuário encontrado",
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
      }
    },

    generateItemsPerPageOptions() {
      if (this.totalPages > 25) {
        return [5, 10, 25, this.totalPages];
      } else {
        return [5, 10, 25];
      }
    },

    handleOptionsUpdate(options) {
      this.params.orderBy = options.sortBy[0];
      this.params.orderDesc = options.sortDesc[0];
      this.params.itemsPerPage = options.itemsPerPage;
      this.params.pageNumber = options.page;

      this.currentpage = options.page;
      this.itemsPerPage = this.params.itemsPerPage;
      this.listRentals();
    },

    /* CREATE */
    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.selectedBook = null;
      (this.selectedUser = null), this.resetValidation();
      this.Createdialog = false;
      this.dialogReturn = false;
      console.log(this.rentalsData, this.previsionDate);
    },

    openModalCreate() {
      if (
        this.$refs.form &&
        typeof this.$refs.form.resetValidation === "function"
      ) {
        this.$refs.form.resetValidation();
      }
      this.rentalDate = this.todayDate();
      this.previsionDate = this.previsionDateMax();
      this.isSubmitDisabled = true;
      this.Createdialog = true;
    },

    async submitCreate() {
      if (this.$refs.form && typeof this.$refs.form.validate === "function") {
        const isFormValid = await this.$refs.form.validate();
        if (!isFormValid) {
          this.isSubmitDisabled = false;
          return;
        }
        try {
          const selectedBook = this.booksData.find(
            (book) => book.name === this.selectedBook
          );
          const selectedUser = this.usersData.find(
            (user) => user.name === this.selectedUser
          );
          const newRental = {
            bookId: selectedBook.id,
            userId: selectedUser.id,
            rentalDate: this.rentalDate,
            previsionDate: this.previsionDate,
          };
          console.log(newRental);
          const response = await Rentals.create(newRental);
          this.rentalsData.push({
            id: response.data.id,
            ...newRental,
          });
          this.listRentals();
          this.closeModal();
          Swal.fire({
            icon: "success",
            title: "Aluguel adicionado com Sucesso!",
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao adicionar Aluguel",
            text: error.response.data.error,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            timer: 3000,
            timerProgressBar: true,
          });
        }
      }
    },

    async openConfirmationModal(title, message) {
      try {
        const result = await Swal.fire({
          icon: "warning",
          title: title,
          text: message,
          showCancelButton: true,
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#5FA7D7",
          cancelButtonColor: "#E57373",
        });

        return result.isConfirmed;
      } catch (error) {
        console.error("Erro ao abrir o modal de confirmação:", error);
        return false;
      }
    },

    async openModalDelete(rental) {
      this.updateRental = { ...rental };
      const confirmed = await this.openConfirmationModal(
        `Deseja excluir o Aluguel do Livro: </br> ${rental.book.name} ? `,
        "Confirma a exclusão do aluguel?"
      );

      if (confirmed) {
        try {
          const response = await Rentals.delete(this.updateRental);

          if (response.status === 200) {
            this.listRentals();
            Swal.fire({
              icon: "success",
              text: "Aluguel Excluído com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              title: "Aluguel não deletado",
              text: response.data.error,
              showConfirmButton: false,
              icon: "info",
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Ocorreu um erro ao excluir o aluguel.",
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        }
      }
    },
    async openModalReturn(rental) {
      this.updateRental = { ...rental };
      this.selectedReantalId = this.updateRental.id;
      this.devolucaoDate = this.updateRental.data_devolucao;

      const confirmed = await this.openConfirmationModal(
        "Você deseja devolver este livro?",
        `Devolver o livro: ${this.updateRental.name}`
      );

      if (confirmed) {
        try {
          const returnRental = {
            id: this.selectedReantalId,
            returnDate: this.todayDate(),
          };

          await Rentals.update(returnRental);
          this.listRentals();
          this.closeModal();
          await Swal.fire({
            icon: "success",
            title: "Livro Devolvido com Sucesso!",
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
          });
        } catch (error) {
          await Swal.fire({
            icon: "info",
            title: "Livro não Devolvido",
            text: error.response.errors,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      }
    },
  },
};
</script>
