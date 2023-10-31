<template>
  <v-container class="mt-2">
    <AppPageHeader
      :pageTitle="pageTitle"
      :search.sync="search"
      @open-create-modal="openModalCreate"
    />
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
            modalFormData["name"] === item
              ? item.name
              : truncateText(item.name, 16)
          }}
        </div>
      </template>

      <template v-slot:[`item.city`]="{ item }">
        <div @click="toggleFullText(item, 'city', 16)">
          {{
            modalFormData["city"] === item
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

    <!-- Form Create/Update -->
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
                v-model="modalFormData.name"
                :rules="nameRules"
                :counter="25"
                label="Nome"
                append-icon="mdi-bookshelf"
                required
              ></v-text-field>
              <v-text-field
                v-model="modalFormData.city"
                :rules="cityRules"
                :counter="25"
                label="Cidade"
                append-icon="mdi-city-variant-outline"
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
import Publishers from "@/services/Publishers";
import Swal from "sweetalert2";

export default {
  components: {
    AppPageHeader,
  },
  data() {
    return {
      // General info
      pageTitle: "Editoras",
      search: "",
      // Table data
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
          text: "Cidade",
          value: "city",
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
      modalFormData: {
        name: null,
        city: null,
      },
      selectedPublisherId: null,
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
        this.listPublishers();
      },
      deep: false,
    },
  },
  mounted() {
    this.listPublishers();
  },
  methods: {
    toggleFullText(item, field, maxLength) {
      if (item[field].length > maxLength) {
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
    async listPublishers() {
      try {
        const response = await Publishers.read(this.params);

        this.publishersData = response.data.data;

        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        this.noDataText = "Nenhuma editora encontrado";
        this.publishersData = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }
    },

    generateItemsPerPageOptions() {
      if (this.totalItems > 10) {
        return [5, 10, 25, this.totalItems];
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
      this.listPublishers();
    },

    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.modalFormData.name = "";
      this.modalFormData.city = "";
      this.selectedPublisherId = null;
      this.dialogVisible = false;
      this.resetValidation();
    },

    /* CREATION LOGIC */
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

    /* UPDATE LOGIC */
    openModalUpdate(publisher) {
      this.selectedPublisherId = publisher.id;
      this.modalFormData.name = publisher.name;
      this.modalFormData.city = publisher.city;
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
        const newPublisher = {
          name: this.modalFormData.name.trim(),
          city: this.modalFormData.city.trim(),
        };
        if (!this.selectedPublisherId) {
          try {
            await Publishers.create(newPublisher);
            this.closeModal();
            this.listPublishers();
            Swal.fire({
              icon: "success",
              title: "Editora adicionada com Sucesso!",
              showConfirmButton: false,
              timer: 3000,
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
              timer: 5000,
              timerProgressBar: true,
            });
          }
        } else {
          const updatePublisher = {
            id: this.selectedPublisherId,
            ...newPublisher,
          };
          try {
            await Publishers.update(updatePublisher);
            this.closeModal();
            this.listPublishers();
            Swal.fire({
              icon: "success",
              title: "Editora atualizada com Sucesso.",
              showConfirmButton: false,
              timer: 3000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar Editora.",
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
    async openModalDelete(publisher) {
      const result = await Swal.fire({
        icon: "warning",
        title: `Deseja excluir a editora </br>${publisher.name} ?`,
        text: "Essa ação não pode ser Desfeita!",
        showCancelButton: true,
        confirmButtonText: "Excluir!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5FA7D7",
        cancelButtonColor: "#E57373",
      });

      if (result.isConfirmed) {
        try {
          await Publishers.delete(publisher.id);

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
            timer: 3000,
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
