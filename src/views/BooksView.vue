<template>
  <v-container class="mt-2">
    <AppPageHeader
      :pageTitle="pageTitle"
      :search.sync="search"
      @open-create-modal="openModalCreate"
    />
    <v-data-table
      :headers="headers"
      :items="booksData"
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
      <template v-slot:[`item.name`]="{ item }">
        <div @click="toggleFullText(item, 'name', 16)">
          {{
            modalFormData["name"] === item
              ? item.name
              : truncateText(item.name, 16)
          }}
        </div>
      </template>
      <template v-slot:[`item.author`]="{ item }">
        <div @click="toggleFullText(item, 'author', 16)">
          {{
            modalFormData["author"] === item
              ? item.author
              : truncateText(item.author, 16)
          }}
        </div>
      </template>
      <template v-slot:[`item.publisher.name`]="{ item }">
        <div @click="toggleFullText(item, 'publisher.name', 16)">
          {{
            modalFormData["publisher.name"] === item
              ? item.publisher.name
              : truncateText(item.publisher.name, 16)
          }}
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              variant="plain"
              color="info"
              @click="openModalUpdate(item)"
              v-on="on"
              >mdi-notebook-edit-outline</v-icon
            >
          </template>
          <span>Editar</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              variant="plain"
              color="error"
              @click="openModalDelete(item)"
              v-on="on"
              >mdi-trash-can-outline</v-icon
            >
          </template>
          <span>Excluir</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <!-- Form Create/Update -->
    <v-row justify="center">
      <v-dialog v-model="dialogVisible" max-width="600px" persistent>
        <v-card>
          <v-card-title>
            <span class="text-h5">
              {{ selectedBookId ? "Editar livro" : "Adicionar livro" }}
            </span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submitAction">
              <v-text-field
                v-model="modalFormData.name"
                :rules="nameRules"
                :counter="45"
                label="Título"
                append-icon="mdi-book-open-page-variant"
                required
              ></v-text-field>
              <v-text-field
                v-model="modalFormData.author"
                :rules="authorRules"
                :counter="45"
                label="Autor"
                append-icon="mdi-account"
                required
              ></v-text-field>
              <v-autocomplete
                v-model="modalFormData.publisherId"
                :rules="publishersRules"
                :items="publishersData"
                item-text="name"
                item-value="id"
                label="Editora do Livro"
                append-icon="mdi-bookshelf"
                required
                no-data-text="Nenhuma editora encontrado"
              ></v-autocomplete>
              <v-text-field
                v-model="modalFormData.release"
                :rules="releaseRules"
                label="Ano de lançamento"
                :counter="4"
                type="number"
                append-icon="mdi-calendar"
                required
              ></v-text-field>
              <v-text-field
                v-model="modalFormData.quantity"
                :rules="quantityRules"
                label="Quantidade de livros"
                :counter="100"
                type="number"
                append-icon="mdi-book-multiple-outline"
                required
              ></v-text-field>
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
                  {{ submitButtonLabel }}
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
import Publishers from "@/services/Publishers";
import Swal from "sweetalert2";

export default {
  components: {
    AppPageHeader,
  },
  data() {
    return {
      // General info
      pageTitle: "Livros",
      search: "",
      // Table data
      booksData: [],
      publishersData: [],
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
      headerProps: {
        sortByText: "Ordenar Por",
      },
      headers: [
        {
          text: "ID",
          align: "start",
          sortable: true,
          value: "id",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Nome",
          value: "name",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Autor",
          value: "author",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Editora",
          value: "publisher.name",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Lançamento",
          value: "release",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Quantidade",
          value: "quantity",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Alugados",
          value: "rented",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Ações",
          align: "center",
          value: "actions",
          sortable: false,
          class: "text-md-body-1 font-weight-bold",
        },
      ],
      nameRules: [
        (v) => !!v || "O título é obrigatório",
        (v) =>
          (v && v.length >= 3) || "O endereço deve ter pelo menos 3 caracteres",
        (v) =>
          (v && v.length <= 45) || "O título deve ter no máximo 45 caracteres",
      ],
      authorRules: [
        (v) => !!v || "O autor é obrigatório",
        (v) =>
          (v && v.length >= 3) || "O endereço deve ter pelo menos 3 caracteres",
        (v) =>
          (v && v.length <= 50) || "O autor deve ter no máximo 50 caracteres",
      ],
      publishersRules: [(v) => !!v || "A editora é obrigatório"],
      releaseRules: [
        (v) => !!v || "O lançamento é obrigatório",
        (v) => /^\d{4}$/.test(v) || "Formato de data inválido (YYYY)",
        (v) => {
          const currentYear = new Date().getFullYear();
          const releaseYear = parseInt(v, 10);
          return (
            releaseYear <= currentYear ||
            "O ano de lançamento deve ser igual ou inferior ao ano atual"
          );
        },
      ],
      quantityRules: [
        (v) => !!v || "A quantidade é obrigatório",
        (v) => v >= 0 || "A quantidade nao deve ser menor que um",
        (v) => v <= 100 || "A quantidade deve ser menor que cem",
      ],
      modalFormData: {
        name: null,
        author: null,
        publisherId: null,
        publisher: {
          name: null,
        },
        release: null,
        quantity: null,
      },
      selectedBookId: null,
      isSubmitDisabled: true,
      submitButtonLabel: "",
      dialogVisible: false,
    };
  },
  watch: {
    search: {
      handler(newSearch) {
        this.params.pageNumber = 1;
        this.params.searchValue = newSearch;
        this.listBooks();
      },
      deep: false,
    },
  },
  mounted() {
    this.listBooks();
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

    /* ===== CRUD ===== */

    /* READING LOGIC */
    async listBooks() {
      try {
        const booksResponse = await Books.read(this.params);

        this.booksData = booksResponse.data.data;

        this.totalItems = booksResponse.data.totalItems;
        this.totalPages = booksResponse.data.totalPages;
      } catch (error) {
        this.noDataText = "Nenhum livro encontrado";
        this.booksData = [];
        this.totalItems = null;
        this.totalPages = null;
      }
      try {
        const publisherResponse = await Publishers.readSummary();
        this.publishersData = publisherResponse.data.data;
      } catch (error) {
        this.publishersData = [];
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
      this.itemsPerPage = this.params.itemsPerPage;
      this.listBooks();
    },

    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      (this.selectedBookId = null), (this.modalFormData.name = "");
      this.modalFormData.author = "";
      this.modalFormData.publisherId = "";
      this.modalFormData.release = "";
      this.modalFormData.quantity = "";
      this.dialogVisible = false;
      this.resetValidation();
    },

    /* CREATION LOGIC */
    openModalCreate() {
      if (
        this.$refs.form &&
        typeof this.$refs.form.resetValidation === "function"
      ) {
        this.$refs.form.resetValidation();
      }
      this.dialogVisible = true;
      this.isSubmitDisabled = true;
      this.submitButtonLabel = "Salvar";
    },

    /* UPDATE LOGIC */
    openModalUpdate(book) {
      this.dialogVisible = true;
      this.isSubmitDisabled = true;
      this.selectedBookId = book.id;
      this.modalFormData.name = book.name;
      this.modalFormData.author = book.author;
      this.modalFormData.publisherId = book.publisherId;
      this.modalFormData.release = book.release;
      this.modalFormData.quantity = book.quantity;
      this.submitButtonLabel = "Atualizar";
    },

    async submitAction() {
      if (this.$refs.form && typeof this.$refs.form.validate === "function") {
        const isFormValid = await this.$refs.form.validate();
        if (!isFormValid) {
          this.isSubmitDisabled = false;
          return;
        }
        const newBook = {
          name: this.modalFormData.name.trim(),
          author: this.modalFormData.author.trim(),
          publisherId: this.modalFormData.publisherId,
          release: this.modalFormData.release,
          quantity: this.modalFormData.quantity,
        };
        if (!this.selectedBookId) {
          try {
            await Books.create(newBook);
            this.listBooks();
            this.closeModal();
            Swal.fire({
              icon: "success",
              title: "Livro adicionado com Sucesso!",
              showConfirmButton: false,
              timer: 3000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar Livro",
              text: error.response.data.errors,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
              timer: 5000,
              timerProgressBar: true,
            });
          }
        } else {
          const updatePublisher = {
            id: this.selectedBookId,
            ...newBook,
          };
          try {
            await Books.update(updatePublisher);
            this.listBooks();
            this.closeModal();
            Swal.fire({
              icon: "success",
              title: "Livro atualizado com Sucesso.",
              showConfirmButton: false,
              timer: 3000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar Livro.",
              text: error.response.data.errors,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
              timer: 5000,
              timerProgressBar: true,
            });
          }
        }
      }
    },

    /* DELETE LOGIC */
    async openModalDelete(book) {
      const result = await Swal.fire({
        icon: "warning",
        title: `Deseja excluir o livro </br>${book.name} ?`,
        text: "Essa ação não pode ser desfeita!",
        showCancelButton: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5FA7D7",
        cancelButtonColor: "#E57373",
      });

      if (result.isConfirmed) {
        try {
          await Books.delete(book.id);

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
          this.listBooks();
          Swal.fire({
            icon: "success",
            title: "Livro excluído com sucesso!",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao excluir o livro",
            text: error.response.data.errors,
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
