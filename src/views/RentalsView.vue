<template>
  <v-container class="mt-2">
    <AppPageHeader
      :pageTitle="pageTitle"
      :search.sync="search"
      @open-create-modal="openModalCreate"
    />
    <v-data-table
      :headers="headers"
      :items="rentalsData"
      :header-props="headerProps"
      :sort-desc="params.orderDesc"
      :sort-by="params.orderBy"
      :server-items-length="totalItems"
      :items-per-page="itemsPerPage"
      :page="params.pageNumber"
      @update:options="handleOptionsUpdate"
      :footer-props="{
        itemsPerPageOptions: generateItemsPerPageOptions(),
        itemsPerPageText: 'Linhas por página',
      }"
      mobile-breakpoint="1020"
      class="align-center px-4 py-4"
      :no-data-text="noDataText"
    >
      <template v-slot:[`item.book.name`]="{ item }">
        <v-tooltip bottom nudge-left>
          <template v-slot:activator="{ on }">
            <div @click="toggleFullText(item, 'book.name', 16)" v-on="on">
              {{
                modalFormData["book.name"] === item
                  ? item.book.name
                  : truncateText(item.book.name, 16)
              }}
            </div>
          </template>
          <span>{{
            modalFormData["book.name"] === item
              ? "Mostrar Menos"
              : "Mostrar Mais"
          }}</span>
        </v-tooltip>
      </template>

      <!-- <template v-slot:[`item.book.name`]="{ item }">
        <div @click="toggleFullText(item, 'book.name', 16)">
          {{
            modalFormData["book.name"] === item
              ? item.book.name
              : truncateText(item.book.name, 16)
          }}
        </div>
      </template> -->
      <template v-slot:[`item.user.name`]="{ item }">
        <div @click="toggleFullText(item, 'user.name', 16)">
          {{
            modalFormData["user.name"] === item
              ? item.user.name
              : truncateText(item.user.name, 16)
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
        {{ item.returnDate ? formatDate(item.returnDate) : null }}
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              variant="plain"
              v-if="
                item.status === 'Pendente' && item.previsionDate < todayDate()
              "
              color="warning"
              @click="openModalReturn(item)"
              v-on="on"
            >
              mdi-book-clock-outline
            </v-icon>
          </template>
          <span>Devolver em atraso</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              variant="plain"
              v-if="
                item.status === 'Pendente' && item.previsionDate > todayDate()
              "
              color="success"
              @click="openModalReturn(item)"
              v-on="on"
            >
              mdi-book-arrow-up-outline
            </v-icon>
          </template>
          <span>Devolver</span>
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
          <span>Excluir</span>
        </v-tooltip>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-chip outlined dark :color="getStatusColor(item)" class="status-chip">
          {{ item.status }}
        </v-chip>
      </template>
    </v-data-table>

    <!-- Form Create -->
    <v-row justify="center">
      <v-dialog v-model="Createdialog" max-width="600px" persistent>
        <v-card>
          <v-card-title>
            <span class="text-h5">Adicionar aluguel</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submitCreate">
              <v-autocomplete
                v-model="modalFormData.bookId"
                :rules="bookRules"
                :items="booksData"
                item-text="name"
                item-value="id"
                label="Selecione o Livro"
                append-icon="mdi-book-open-page-variant"
                required
                no-data-text="Nenhuma livro encontrado"
              ></v-autocomplete>
              <v-autocomplete
                v-model="modalFormData.userId"
                :items="usersData"
                :rules="userRules"
                item-text="name"
                item-value="id"
                label="Selecione o Usuário"
                append-icon="mdi-account"
                required
                no-data-text="Nenhuma usuario encontrado"
              ></v-autocomplete>

              <v-menu
                ref="menuRental"
                v-model="menuRental"
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
                    @blur="formatDate(modalFormData.rentalDate)"
                    v-bind="attrs"
                    v-on="on"
                    readonly
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="modalFormData.rentalDate"
                  no-title
                  @input="menuRental = false"
                  :min="todayDate()"
                  :max="todayDate()"
                ></v-date-picker>
              </v-menu>
              <v-menu
                ref="menuPrevision"
                v-model="menuPrevision"
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
                    hint="DD/MM/YYYY format"
                    :rules="previsionDateRules"
                    persistent-hint
                    append-icon="mdi-calendar"
                    @blur="formatDate(modalFormData.previsionDate)"
                    v-bind="attrs"
                    v-on="on"
                    readonly
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="modalFormData.previsionDate"
                  no-title
                  @input="menuPrevision = false"
                  :min="todayDate()"
                  :max="previsionDateMax()"
                ></v-date-picker>
              </v-menu>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="" @click="closeModal" color="error" text
                  >Cancelar</v-btn
                >
                <v-btn
                  class="mr-2"
                  type="submit"
                  :disabled="!isSubmitDisabled && !$refs.form.validate()"
                  color="primary"
                  text
                >
                  Salvar
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import AppPageHeader from "@/components/AppPageHeader.vue";
import Books from "@/services/Books";
import Rentals from "@/services/Rentals";
import Swal from "sweetalert2";
import Users from "@/services/Users";

export default {
  components: {
    AppPageHeader,
  },
  data() {
    return {
      // General info
      pageTitle: "Aluguéis",
      search: "",
      // Table data
      rentalsData: [],
      usersData: [],
      booksData: [],
      totalItems: null,
      totalPages: null,
      itemsPerPage: 10,
      sortBy: "",
      noDataText: "Carregando dados... Aguarde!",
      params: {
        searchValue: "",
        pageNumber: 1,
        orderBy: "id",
        orderDesc: false,
        itemsPerPage: null,
      },
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
      bookRules: [(v) => !!v || "O livro é obrigatório"],
      userRules: [(v) => !!v || "O usuário é obrigatório"],
      dateFormattedRules: [(v) => !!v || "A data de aluguel é obrigatório"],
      previsionDateRules: [(v) => !!v || "A data de previsão é obrigatório"],
      modalFormData: {
        bookId: null,
        userId: null,
        user: {
          name: null,
        },
        book: {
          name: null,
        },
        rentalDate: "",
        previsionDate: "",
      },
      menuRental: "",
      menuPrevision: "",
    };
  },
  computed: {
    formattedRentalDate() {
      return this.formatDate(this.modalFormData.rentalDate, true);
    },
    formattedPrevisionDate() {
      return this.formatDate(this.modalFormData.previsionDate, true);
    },
  },
  watch: {
    search: {
      handler(newSearch) {
        if (newSearch) {
          const dateRegex = /^(\d{1,2})\/?(\d{1,2})?\/?(\d{0,4})?$/;

          if (dateRegex.test(newSearch)) {
            this.params.pageNumber = 1;
            this.params.searchValue = this.parseDate(newSearch);
          } else if (newSearch.match(/^\d{1,2}\/$/)) {
            this.params.pageNumber = 1;
            this.params.searchValue = this.parseDate(newSearch);
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
  },
  mounted() {
    this.listRentals();
  },
  methods: {
    toggleFullText(item, field, maxLength) {
      const fieldValue = field.split(".").reduce((obj, key) => obj[key], item);

      if (fieldValue && fieldValue.length > maxLength) {
        if (this.modalFormData[field] === item) {
          this.$set(this.modalFormData, field, null);
        } else {
          this.$set(this.modalFormData, field, item);
        }
      }
    },

    truncateText(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    },

    previsionDateMax() {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
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

    formatDate(date, useMenuFormat = false) {
      if (!date) return null;

      const formattedDate = new Date(
        useMenuFormat ? date + "T00:00:00Z" : date
      );

      if (useMenuFormat) {
        formattedDate.setHours(formattedDate.getHours() + 3);
      }

      return formattedDate.toLocaleDateString("pt-BR");
    },

    parseDate(date) {
      const dateParts = date.split("/");
      let formattedDate = "";

      if (dateParts.length >= 1) {
        const day = dateParts[0];
        formattedDate = `${day}`;
      }

      if (dateParts.length >= 2) {
        const month = dateParts[1];
        if (month.length === 2) {
          formattedDate = `${month}-${formattedDate}`;
        }
      }

      if (dateParts.length >= 3) {
        const year = dateParts[2];
        if (year.length === 4) {
          formattedDate = `${year}-${formattedDate}`;
        }
      }

      return formattedDate;
    },

    /* ===== CRUD ===== */

    /* READING LOGIC */
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
      }
      try {
        const booksResponse = await Books.readAvailable();
        this.booksData = booksResponse.data.data;
      } catch (error) {
        this.booksData = [];
      }
      try {
        const usersResponse = await Users.readSummary();
        this.usersData = usersResponse.data.data;
      } catch (error) {
        this.usersData = [];
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

    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.modalFormData.bookId = null;
      this.modalFormData.userId = null;
      this.resetValidation();
      this.Createdialog = false;
      this.dialogReturn = false;
    },

    /* CREATION LOGIC */
    openModalCreate() {
      if (
        this.$refs.form &&
        typeof this.$refs.form.resetValidation === "function"
      ) {
        this.$refs.form.resetValidation();
      }
      this.modalFormData.rentalDate = this.todayDate();
      this.modalFormData.previsionDate = this.previsionDateMax();
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
          const newRental = {
            bookId: this.modalFormData.bookId,
            userId: this.modalFormData.userId,
            rentalDate: this.modalFormData.rentalDate,
            previsionDate: this.modalFormData.previsionDate,
          };
          await Rentals.create(newRental);
          this.listRentals();
          this.closeModal();
          Swal.fire({
            icon: "success",
            title: "Aluguel adicionado com Sucesso!",
            showConfirmButton: false,
            timer: 3000,
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
            timer: 5000,
            timerProgressBar: true,
          });
        }
      }
    },

    /* MODAL STRUCTURE */
    async openConfirmationModal(title, message) {
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
    },

    /* RETURN LOGIC */
    async openModalReturn(rental) {
      this.selectedReantalId = rental.id;

      const confirmed = await this.openConfirmationModal(
        `Deseja devolver o livro: ${rental.book.name} ?`,
        "Confirma a devolução do aluguel?"
      );

      if (confirmed) {
        try {
          await Rentals.update(this.selectedReantalId);
          this.listRentals();
          this.closeModal();
          await Swal.fire({
            icon: "success",
            title: "Livro Devolvido com Sucesso!",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire({
            icon: "info",
            title: "Livro não Devolvido",
            text: error.response.data.errors,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
            timer: 5000,
            timerProgressBar: true,
          });
        }
      }
    },

    /* DELETE LOGIC */
    async openModalDelete(rental) {
      this.selectedReantalId = rental.id;

      const confirmed = await this.openConfirmationModal(
        `Deseja excluir o Aluguel do Livro: </br> ${rental.book.name} ?`,
        "Essa ação não pode ser Desfeita!"
      );

      if (confirmed) {
        try {
          await Rentals.delete(this.selectedReantalId);

          if (this.totalItems > this.params.itemsPerPage) {
            this.totalItems--;

            if (
              this.params.pageNumber >
              Math.ceil(this.totalItems / this.params.itemsPerPage)
            ) {
              this.params.pageNumber = Math.ceil(
                this.totalItems / this.params.itemsPerPage
              );

              if (this.params.pageNumber < 1) {
                this.params.pageNumber = 1;
              }
            }
          }
          this.listRentals();
          Swal.fire({
            icon: "success",
            text: "Aluguel Excluído com Sucesso!",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire({
            title: "Erro ao Excluir Aluguel",
            text: error.response.errors,
            icon: "error",
            showConfirmButton: false,
            timer: 5000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        }
      }
    },
  },
};
</script>
