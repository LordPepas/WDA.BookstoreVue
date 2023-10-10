<template>
  <div class="d-flex flex-column justify-end align-end mt-2">
    <v-container>
      <v-row class="d-flex align-center" xs="vertical-center">
        <v-col cols="auto" class="ml-2">
          <v-toolbar-title class="font-weight-medium" style="font-size: 30px"
            >Aluguéis</v-toolbar-title
          >
        </v-col>

        <v-col cols="auto" class="d-flex align-center mb-0">
          <img src="@/assets/divider.svg" alt="" />
        </v-col>
        <v-col cols="">
          <v-btn
            class="rounded-lg px-0 v-btn v-btn--has-bg theme--dark"
            color="blue darken-3"
            style="height: 40px; min-width: 40px"
            @click="openModalCreate"
          >
            <img src="@/assets/plus.svg" alt="" />
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          xs="12"
          sm="5"
          md="6"
          lg="6"
          class="mr-auto ml-auto mr-sm-2 mb-n6"
        >
          <v-text-field
            dense
            outlined
            v-model="search"
            label="Pesquisar"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-data-table
        style="overflow-x: hidden"
        :headers="headers"
        :items="filteredRentals"
        :sort-by="['id']"
        :sort-desc="[false, true]"
        multi-sort
        :items-per-page="itemsPerPage"
        :header-props="headerProps"
        :footer-props="{
          itemsPerPageOptions: [5, 10, 25, -1],
          itemsPerPageText: 'Linhas por página',
        }"
        mobile-breakpoint="880"
        class="align-center px-4 py-4"
        loading="items"
        loading-text="Carregando dados... Aguarde!"
        no-data-text="Nenhum Aluguel encontrado"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                variant="plain"
                v-if="
                  item.status === 'Não devolvido' &&
                  parseDateISO(item.data_previsao) <
                    parseDateISO(item.data_aluguel)
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
                v-if="
                  item.data_devolucao === 'Não devolvido' &&
                  parseDateISO(item.data_previsao) >=
                    parseDateISO(item.data_aluguel)
                "
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
                v-if="item.status === 'Não devolvido'"
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
      <!-- FORM CREATE -->
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
                  :items="listBooks"
                  :rules="selectBookRules"
                  item-text="nome"
                  label="Nome do livro"
                  append-icon="mdi-book-open-page-variant"
                  required
                  no-data-text="Nenhuma editora encontrado"
                ></v-autocomplete>
                <v-autocomplete
                  v-model="selectedUser"
                  :items="listUsers"
                  item-text="nome"
                  :rules="selectedUserRules"
                  label="Nome do Cliente"
                  append-icon="mdi-account"
                  required
                  no-data-text="Nenhuma editora encontrado"
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
                      v-model="dateRentFormatted"
                      label="Data de aluguel"
                      hint="DD/MM/YYYY format"
                      :rules="dateFormattedRules"
                      persistent-hint
                      append-icon="mdi-calendar"
                      @blur="dateRentFormatted = formatDate(dateRentFormatted)"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="aluguelDate"
                    no-title
                    @input="menu1 = false"
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
                      v-model="dateForecastFormatted"
                      label="Previsão de devolução"
                      hint="MM/DD/YYYY format"
                      :rules="previsaoDateRules"
                      persistent-hint
                      append-icon="mdi-calendar"
                      @blur="formattedPrevisaoDate = formatDate(previsaoDate)"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="previsaoDate"
                    no-title
                    @input="menu2 = false"
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

export default {
  data() {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("pt-BR");
    const futureDate = new Date(
      currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const formattedPrevisaoDate = futureDate.toLocaleDateString("pt-BR");
    return {
      date: currentDate.toISOString().substr(0, 10),
      date2: futureDate.toISOString().substr(0, 10),
      dateRentFormatted: formattedDate,
      dateForecastFormatted: formattedPrevisaoDate,
      listRentals: [],
      listUsers: [],
      listBooks: [],
      search: "",
      menu1: "",
      menu2: "",
      selectedBook: null,
      selectedUser: null,
      previsaoDate: futureDate.toISOString().substr(0, 10),
      aluguelDate: currentDate.toISOString().substr(0, 10),
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
          value: "book",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Usuário",
          value: "user",
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
          sortable: false,
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
      currentPage: 5,
      itemsPerPage: 5,
    };
  },
  created() {
    this.listRent();
  },
  computed: {
    filteredRentals() {
      const searchValue = this.search.toLowerCase();
      return this.listRentals.filter((rental) => {
        for (const prop in rental) {
          const propValue = rental[prop].toString().toLowerCase();
          if (propValue.includes(searchValue)) {
            return true;
          }
        }
        return false;
      });
    },
    totalPages() {
      return Math.ceil(this.paginatedRentals.length / this.itemsPerPage);
    },
    paginatedRentals() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredRentals.slice(startIndex, endIndex);
    },
  },
  watch: {
    aluguelDate(newValue) {
      this.dateRentFormatted = this.formatDate(newValue);
    },
    previsaoDate(newValue) {
      this.dateForecastFormatted = this.formatDate(newValue);
    },
    date() {
      this.aluguelDate = this.parseDateISO(this.dateRentFormatted);
    },
    date2() {
      this.previsaoDate = this.parseDateISO(this.dateForecastFormatted);
    },
  },

  methods: {
    getStatusColor(item) {
      if (item.status == "Com atraso") {
        return "error";
      } else if (item.status == "No prazo") {
        return "success";
      } else {
        return "primary";
      }
    },
    formatDate(date) {
      if (!date) return null;

      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;

      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    },
    parseDateISO(date) {
      const [dd, mm, yyyy] = date.split("/");
      return `${yyyy}-${mm}-${dd}`;
    },
    /* ===== CRUD ===== */

    /* READ */
    async listRent() {
      try {
        const [booksResponse, rentalsResponse, usersResponse] =
          await Promise.all([Books.read(), Rentals.read(), Users.read()]);

        this.listBooks = booksResponse.data.data.map((livro) => ({
          id: livro.id,
          nome: livro.nome,
        }));

        this.listUsers = usersResponse.data.data.map((usuario) => ({
          id: usuario.id,
          nome: usuario.nome,
        }));

        this.listRentals = rentalsResponse.data.data.map((rental) => ({
/*           const devolucaoDate = rental.data_devolucao;
          const previsaoDate = rental.data_previsao;
          let statusInfo; */
/*           if (devolucaoDate !== null) {
            if (devolucaoDate > previsaoDate) {
              statusInfo = "Com atraso";
            } else {
              statusInfo = "No prazo";
            }
          } else {
            statusInfo = "Não devolvido";
          } */
            id: rental.id,
            book: rental.book.name,
            user: rental.user.name,
            rentalDate: this.formatDate(rental.rentalDate),
            previsionDate: this.formatDate(rental.previsionDate),
            returnDate: rental.returnDate,
/*               ? this.formatDate(rental.returnDate)
              : "Não devolvido", */
            status: rental.status,

        }));
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      }
    },

    /* CREATE */
    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.previsaoDate = this.date2;
      (this.selectedBook = ""),
        (this.selectedUser = ""),
        this.resetValidation();

      this.Createdialog = false;
      this.dialogReturn = false;
    },

    openModalCreate() {
      if (
        this.$refs.form &&
        typeof this.$refs.form.resetValidation === "function"
      ) {
        this.$refs.form.resetValidation();
      }
      this.isSubmitDisabled = true;
      this.Createdialog = true;
      this.aluguelDate = new Date().toISOString().substr(0, 10);
    },

    async submitCreate() {
      if (this.$refs.form && typeof this.$refs.form.validate === "function") {
        const isFormValid = await this.$refs.form.validate();
        if (!isFormValid) {
          this.isSubmitDisabled = false;
          return;
        }
        try {
          const selectedBook = this.listBooks.find(
            (book) => book.nome === this.selectedBook
          );
          const selectedUser = this.listUsers.find(
            (user) => user.nome === this.selectedUser
          );
          const newRental = {
            livro_id: selectedBook,
            usuario_id: selectedUser,
            data_aluguel: this.aluguelDate,
            data_previsao: this.previsaoDate,
          };
          const response = await Rentals.create(newRental);
          this.listRentals.push({
            id: response.data.id,
            ...newRental,
          });
          this.listRent();
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

    /* DELETE */
    openModalDelete(aluguel) {
      this.updateRental = { ...aluguel };
      Swal.fire({
        icon: "warning",
        title: `Deseja excluir o Aluguel do </br> ${aluguel.livro_id} ? `,
        showCancelButton: true,
        confirmButtonText: "Excluir!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5FA7D7",
        cancelButtonColor: "#E57373",
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitDelete(this.updateRental);
        }
      });
    },
    async submitDelete(rental) {
      try {
        const selectedBook = this.listBooks.find(
          (book) => book.nome === rental.livro_id
        );
        const selectedUser = this.listUsers.find(
          (user) => user.nome === rental.usuario_id
        );

        const deleteRental = {
          id: rental.id,
          livro_id: selectedBook,
          usuario_id: selectedUser,
          data_aluguel: this.parseDateISO(rental.data_aluguel),
          data_previsao: this.parseDateISO(rental.data_previsao),
          data_devolucao:
            rental.data_devolucao !== "Não devolvido"
              ? rental.data_devolucao
              : null,
        };

        const response = await Rentals.delete(deleteRental);

        if (response.status === 200) {
          this.listRent();
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
    },

    async openModalReturn(rental) {
      this.updateRental = { ...rental };
      this.selectedReantalId = this.updateRental.id;
      this.selectedBook = this.listBooks.find(
        (book) => book.nome === rental.livro_id
      );
      this.selectedUser = this.listUsers.find(
        (user) => user.nome === rental.usuario_id
      );
      this.aluguelDate = this.updateRental.data_aluguel;
      this.previsaoDate = this.updateRental.data_previsao;
      this.devolucaoDate = this.updateRental.data_devolucao;
      const result = await Swal.fire({
        icon: "warning",
        title: "Você deseja devolver este livro?",
        text: `Devolver o livro: ${this.selectedBook.nome}`,
        showCancelButton: true,
        confirmButtonText: "Devolver!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5FA7D7",
        cancelButtonColor: "#E57373",
      });
      if (result.isConfirmed) {
        try {
          const returnRental = {
            id: this.selectedReantalId,
            livro_id: this.selectedBook,
            usuario_id: this.selectedUser,
            data_aluguel: this.parseDate(this.aluguelDate),
            data_previsao: this.parseDate(this.previsaoDate),
            data_devolucao: this.date,
          };

          await Rentals.update(returnRental);
          this.listRentals = this.listRentals.map((rental) => {
            if (rental.id === returnRental.id) {
              return { ...rental, ...returnRental };
            } else {
              return rental;
            }
          });
          this.listRent();
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
            text: error.response.error,
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
