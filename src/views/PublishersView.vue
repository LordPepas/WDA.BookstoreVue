<template>
  <div class="d-flex flex-column justify-end align-end mt-2">
    <v-container>
      <v-row class="d-flex align-center">
        <v-col cols="auto">
          <v-toolbar-title class="font-weight-medium" style="font-size: 30px"
            >Editoras</v-toolbar-title
          >
        </v-col>
        <v-col cols="auto" class="d-flex align-center mb-0">
          <img src="@/assets/divider.svg" />
        </v-col>
        <v-col cols="auto">
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

      <!-- Tabela de Dados -->
      <v-data-table
        :headers="headers"
        :items="publishersData"
        :header-props="headerProps"
        :sort-desc="params.orderDesc"
        :sort-by="params.orderBy"
        :page="currentPage"
        :server-items-length="totalItems"
        :items-per-page="itemsPerPage"
        @update:options="handleOptionsUpdate"
        :footer-props="{
          itemsPerPageOptions: generateItemsPerPageOptions(),
          itemsPerPageText: 'Linhas por página',
        }"
        mobile-breakpoint="820"
        class="align-center px-4 py-4"
        loading="items"
        loading-text="Carregando dados... Aguarde!"
        no-data-text="Nenhuma Editora encontrado"
      >
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
            <span>Editar Editora</span>
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
            <span>Excluir Editora</span>
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
import Publisher from "@/services/Publishers";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      publishersData: [],
      params: {
        searchValue: "",
        orderBy: "id",
        orderDesc: false,
        pageNumber: null,
        itemsPerPage: null,
      },
      search: "",
      name: "",
      city: "",
      submitButtonLabel: "",
      dialogVisible: false,
      selectedPublisherId: null,
      isSubmitDisabled: true,
      headerProps: {
        sortByText: "Ordenar Por",
      },
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
      totalItems: null,
      totalPages: null,
      sortBy: "",
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  mounted() {
    this.listPublishers();
  },
  watch: {
    search: {
      handler(newSearch, oldSearch) {
        if (newSearch !== oldSearch) {
          this.params.pageNumber = 1;
          this.params.searchValue = newSearch;
          this.listPublishers();
        }
      },
      deep: false,
    },
  },
  methods: {
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
      this.listPublishers();
      console.log(this.params);
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
        console.error("Erro ao buscar editoras:", error);
      }
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
            Swal.fire({
              icon: "success",
              title: "Editora adicionada com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
            this.closeModal();
            this.listPublishers();
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
            Swal.fire({
              icon: "success",
              title: "Editora atualizada com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
            this.closeModal();
            this.listPublishers();
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
          if (this.publishersData.length === 1) {
            if (this.params.pageNumber > 1) {
              location.reload();
            }
          }
          this.listPublishers();
          await Swal.fire({
            icon: "success",
            title: "Editora Excluída com Sucesso!",
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          await Swal.fire({
            icon: "error",
            title: "Erro ao Excluir Editora",
            text: error.response.data.errors,
            showConfirmButton: false,
            timer: 3000,
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
