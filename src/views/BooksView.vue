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
        mobile-breakpoint="820"
        class="align-center px-4 py-4"
        :no-data-text="noDataText"
      >
        <template v-slot:[`item.name`]="{ item }">
          <div @click="toggleFullText(item, 'name')">
            {{
              showFullTextItem["name"] === item
                ? item.name
                : truncateText(item.name, 16)
            }}
          </div>
        </template>
        <template v-slot:[`item.author`]="{ item }">
          <div @click="toggleFullText(item, 'author')">
            {{
              showFullTextItem["author"] === item
                ? item.author
                : truncateText(item.author, 16)
            }}
          </div>
        </template>
        <template v-slot:[`item.publisher.name`]="{ item }">
          <div @click="toggleFullText(item, 'publisher.name')">
            {{
              showFullTextItem["publisher.name"] === item
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

      <!-- FORM CREATE/UPDATE -->
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
                  v-model="name"
                  :rules="nameRules"
                  :counter="45"
                  label="Título do livro"
                  append-icon="mdi-book-open-page-variant"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="author"
                  :rules="authorRules"
                  :counter="45"
                  label="Autor"
                  append-icon="mdi-account"
                  required
                ></v-text-field>
                <v-autocomplete
                  v-model="publishers"
                  :rules="publishersRules"
                  :items="publishersData"
                  item-text="name"
                  label="Editora do Livro"
                  append-icon="mdi-bookshelf"
                  required
                  no-data-text="Nenhuma editora encontrado"
                ></v-autocomplete>
                <v-text-field
                  v-model="release"
                  :rules="releaseRules"
                  label="Data de lançamento"
                  :counter="4"
                  type="number"
                  append-icon="mdi-calendar"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="quantity"
                  :rules="quantityRules"
                  label="Quantidade de livros"
                  :counter="100"
                  type="number"
                  append-icon="mdi-book-multiple-outline"
                  required
                ></v-text-field>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    class="mr-2"
                    type="submit"
                    :disabled="!isSubmitDisabled && !$refs.form.validate()"
                    color="primary"
                    text
                  >
                    {{ submitButtonLabel }}
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
import AppPageHeader from "@/components/AppPageHeader";
import Books from "@/services/Books";
import Publisher from "@/services/Publishers";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      booksData: [],
      publishersData: [],
      params: {
        searchValue: "",
        pageNumber: 1,
        orderBy: "id",
        orderDesc: false,
        itemsPerPage: null,
      },
      name: "",
      publishers: "",
      author: "",
      quantity: "",
      release: "",
      submitButtonLabel: "",
      dialogVisible: false,
      selectedBookId: null,
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
          padding: "2px",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Nome",
          align: "center",
          value: "name",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Autor",
          align: "center",
          value: "author",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Editora",
          value: "publisher.name",
          align: "center",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Lançamento",
          value: "release",
          align: "center",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Quantidade",
          value: "quantity",
          align: "center",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Alugados",
          value: "rented",
          align: "center",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Ações",
          value: "actions",
          sortable: false,
          align: "center",
          class: "text-md-body-1 font-weight-bold ",
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
      ],
      quantityRules: [
        (v) => !!v || "A quantidade é obrigatório",
        (v) => v >= 0 || "A quantidade nao deve ser menor que um",
        (v) => v <= 100 || "A quantidade deve ser menor que cem",
      ],
      totalItems: 0,
      totalPages: 0,
      sortBy: "",
      itemsPerPage: 5,
      noDataText: "Carregando dados... Aguarde!",
      pageTitle: "Livros",
      search: "",
      showFullTextItem: {
        name: null,
        author: null,
        publisher: {
          name: null,
        },
      },
    };
  },
  components: {
    AppPageHeader,
  },
  mounted() {
    this.listBooks();
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
  methods: {
    toggleFullText(item, field) {
      if (this.showFullTextItem[field] === item) {
        this.$set(this.showFullTextItem, field, null);
      } else {
        this.$set(this.showFullTextItem, field, item);
      }
    },

    truncateText(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    },

    /* ===== CRUD ===== */

    /* READ */
    async listBooks() {
      try {
        const booksResponse = await Books.read(this.params);

        this.booksData = booksResponse.data.data;

        this.totalItems = booksResponse.data.totalItems;
        this.totalPages = booksResponse.data.totalPages;
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Nenhum livro encontrado",
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
        this.noDataText = "Nenhum livro encontrado";
        this.booksData = [];
        this.totalItems = null;
        this.totalPages = null;
      }
      try {
        const publisherResponse = await Publisher.readSummary();
        this.publishersData = publisherResponse.data.data;
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Nenhuma editora encontrada",
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

      this.itemsPerPage = this.params.itemsPerPage;
      this.listBooks();
    },

    /* CREATE/UPDATE */
    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      (this.selectedBookId = null), (this.name = "");
      this.author = "";
      this.publishers = "";
      this.release = "";
      this.quantity = "";
      this.dialogVisible = false;
      this.resetValidation();
    },

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

    openModalUpdate(book) {
      this.dialogVisible = true;
      this.isSubmitDisabled = true;
      this.selectedBookId = book.id;
      this.name = book.name;
      this.author = book.author;
      const selectedPublisher = this.publishersData.find(
        (publisher) => publisher.name === book.publisher.name
      );
      this.publishers = selectedPublisher.name;
      this.release = book.release;
      this.quantity = book.quantity;
      this.submitButtonLabel = "Atualizar";
    },

    async submitAction() {
      if (this.$refs.form && typeof this.$refs.form.validate === "function") {
        const isFormValid = await this.$refs.form.validate();
        if (!isFormValid) {
          this.isSubmitDisabled = false;
          return;
        }
        const selectedPublisher = await this.publishersData.find(
          (publisher) => publisher.name === this.publishers
        );
        const bookData = {
          name: this.name,
          author: this.author,
          publisherId: selectedPublisher.id,
          release: this.release,
          quantity: this.quantity,
        };

        try {
          if (!this.selectedBookId) {
            try {
              const response = await Books.create(bookData);
              this.booksData.push({ id: response.data.id, ...bookData });
              this.listBooks();
              this.closeModal();
              Swal.fire({
                icon: "success",
                title: "Livro adicionado com Sucesso!",
                showConfirmButton: false,
                timer: 2000,
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
                timer: 3000,
                timerProgressBar: true,
              });
            }
          } else {
            const update = {
              id: this.selectedBookId,
              ...bookData,
            };
            try {
              await Books.update(update);
              this.booksData = this.booksData.map((book) => {
                if (book.id === update.id) {
                  return { ...book, ...update };
                } else {
                  return book;
                }
              });
              this.listBooks();
              Swal.fire({
                icon: "success",
                title: "Livro atualizado com Sucesso!",
                showConfirmButton: false,
                timer: 2000,
                toast: true,
                position: "top-end",
                timerProgressBar: true,
              });
            } catch (error) {
              Swal.fire({
                icon: "error",
                title: error.response.data.message,
                text: error.response.data.errors,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
                timer: 3000,
                timerProgressBar: true,
              });
            }
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao realizar ação",
            text: error.response.data.message,
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
    async openModalDelete(book) {
      const result = await Swal.fire({
        icon: "warning",
        title: `Deseja excluir o livro ${book.name} ?`,
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

          this.listBooks();
          Swal.fire({
            icon: "success",
            title: "Livro excluído com sucesso!",
            showConfirmButton: false,
            timer: 2000,
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
            toast: true,
            position: "top-end",
            timer: 3000,
            timerProgressBar: true,
          });
        }
      }
    },
  },
};
</script>
