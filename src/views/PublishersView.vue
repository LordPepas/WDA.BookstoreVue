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
        :items="publishersData"
        :header-props="headerProps"
        :sort-desc="params.orderDesc"
        :sort-by="params.orderBy"
        :page="params.pageNumber"
        :server-items-length="totalItems"
        :items-per-page="itemsPerPage"
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
              showFullTextItem["name"] === item
                ? item.name
                : truncateText(item.name, 16)
            }}
          </div>
        </template>

        <template v-slot:[`item.city`]="{ item }">
          <div @click="toggleFullText(item, 'city', 16)">
            {{
              showFullTextItem["city"] === item
                ? item.city
                : truncateText(item.city, 16)
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
                >mdi-storefront-edit-outline</v-icon
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

      <!-- FORM Create/Update -->
      <v-row justify="center">
        <v-dialog v-model="dialogVisible" max-width="600px" persistent>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{
                selectedPublisherId ? "Editar editora" : "Adicionar editora"
              }}</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" @submit.prevent="submitAction">
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  :counter="25"
                  label="Nome da editora"
                  append-icon="mdi-bookshelf"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="city"
                  :rules="cityRules"
                  :counter="25"
                  label="Cidade da editora"
                  append-icon="mdi-city-variant-outline"
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
import AppPageHeader from "@/components/AppPageHeader.vue";
import Publisher from "@/services/Publishers";
// import { max } from "date-fns";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      publishersData: [],
      params: {
        searchValue: "",
        pageNumber: 1,
        orderBy: "id",
        orderDesc: false,
        itemsPerPage: null,
      },
      name: "",
      city: "",
      submitButtonLabel: "",
      dialogVisible: false,
      selectedPublisherId: null,
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
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Nome",
          value: "name",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Cidade",
          value: "city",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Ações",
          value: "actions",
          sortable: false,
          class: "text-md-body-1 font-weight-bold",
        },
      ],
      nameRules: [
        (v) => !!v || "O nome é obrigatório",
        (v) =>
          (v && v.length >= 3) || "O nome deve ter pelo menos 3 caracteres",
        (v) =>
          (v && v.length <= 25) || "O nome deve ter no máximo 25 caracteres",
      ],
      cityRules: [
        (v) => !!v || "A cidade é obrigatória",
        (v) =>
          (v && v.length >= 3) || "A cidade deve ter pelo menos 3 caracteres",
        (v) =>
          (v && v.length <= 25) || "A cidade deve ter no máximo 25 caracteres",
      ],
      totalItems: null,
      totalPages: null,
      sortBy: "",
      itemsPerPage: 10,
      noDataText: "Carregando dados... Aguarde!",
      pageTitle: "Editoras",
      search: "",
      showFullTextItem: {
        name: null,
        city: null,
      },
    };
  },
  components: {
    AppPageHeader,
  },
  mounted() {
    this.listPublishers();
  },
  watch: {
    search: {
      handler(newSearch) {
        this.params.pageNumber = 1;
        this.params.searchValue = newSearch;
        this.listPublishers();
      },
      deep: false,
    },
  },
  methods: {
    toggleFullText(item, field, maxLength) {
      if (item[field].length > maxLength) {
        if (this.showFullTextItem[field] === item) {
          this.$set(this.showFullTextItem, field, null);
        } else {
          this.$set(this.showFullTextItem, field, item);
        }
      }
    },

    truncateText(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    },

    /* ===== CRUD ===== */

    /* READ */
    async listPublishers() {
      try {
        const response = await Publisher.read(this.params);

        this.publishersData = response.data.data;

        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Nenhuma editora encontrado",
          showConfirmButton: false,
          toast: true,
          position: "top-end",
          timer: 2000,
          timerProgressBar: true,
        });
        this.noDataText = "Nenhuma editora encontrado";
        this.publishersData = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }
    },

    generateItemsPerPageOptions() {
      if (this.totalItems > 10) {
        return [5, 10, this.totalItems];
      } else {
        return [5, 10];
      }
    },

    handleOptionsUpdate(options) {
      this.params.orderBy = options.sortBy[0];
      this.params.orderDesc = options.sortDesc[0];
      this.params.itemsPerPage = options.itemsPerPage;
      this.params.pageNumber = options.page;

      this.itemsPerPage = this.params.itemsPerPage;
      this.listPublishers();
    },

    /* CREATE/UPDATE */
    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.selectedPublisherId = null;
      this.name = "";
      this.city = "";
      this.resetValidation();
      this.dialogVisible = false;
    },

    openModalCreate() {
      if (
        this.$refs.form &&
        typeof this.$refs.form.resetValidation() === "function"
      ) {
        this.$refs.form.resetValidation();
      }
      this.isSubmitDisabled = true;
      this.dialogVisible = true;
      this.submitButtonLabel = "Salvar";
    },

    openModalUpdate(publisher) {
      this.selectedPublisherId = publisher.id;
      this.name = publisher.name;
      this.city = publisher.city;
      this.dialogVisible = true;
      this.isSubmitDisabled = true;
      this.submitButtonLabel = "Atualizar";
    },

    async submitAction() {
      if (this.$refs.form && typeof this.$refs.form.validate === "function") {
        const isFormValid = await this.$refs.form.validate();
        if (!isFormValid) {
          this.isSubmitDisabled = false;
          return;
        }
        const publisherData = {
          name: this.name,
          city: this.city,
        };
        if (!this.selectedPublisherId) {
          try {
            const response = await Publisher.create(publisherData);
            this.publishersData.push({
              id: response.data.id,
              ...publisherData,
            });
            this.closeModal();
            this.listPublishers();
            Swal.fire({
              icon: "success",
              title: "Editora adicionada com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar Editora",
              text: error.response.data.errors,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
              timer: 3000,
              timerProgressBar: true,
            });
          }
        } else {
          const updatePublisher = {
            id: this.selectedPublisherId,
            ...publisherData,
          };
          try {
            await Publisher.update(updatePublisher);
            this.publishersData = this.publishersData.map((publisher) => {
              if (publisher.id === updatePublisher.id) {
                return updatePublisher;
              } else {
                return publisher;
              }
            });
            this.closeModal();
            this.listPublishers();
            Swal.fire({
              icon: "success",
              title: "Editora atualizada com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar Editora",
              text: error.response.data.errors,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
              timer: 3000,
              timerProgressBar: true,
            });
          }
        }
      }
    },

    /* DELETE */
    async openModalDelete(publisher) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Deseja excluir a editora?",
        text: "Essa ação não pode ser Desfeita!",
        showCancelButton: true,
        confirmButtonText: "Excluir!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5FA7D7",
        cancelButtonColor: "#E57373",
      });

      if (result.isConfirmed) {
        try {
          await Publisher.delete(publisher);

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
          this.listPublishers();
          Swal.fire({
            icon: "success",
            title: "Editora Excluída com Sucesso!",
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao Excluir Editora",
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
