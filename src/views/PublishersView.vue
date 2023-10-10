<template>
  <div class="d-flex flex-column justify-end align-end mt-2">
    <v-container>
      <v-row class="d-flex align-center">
        <v-col cols="auto ml-2">
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

      <v-data-table
        :headers="headers"
        :items="filteredPublishers"
        :sort-by="['id']"
        :header-props="headerProps"
        :sort-desc="[false, true]"
        multi-sort
        :items-per-page="itemsPerPage"
        :footer-props="{
          itemsPerPageOptions: [5, 10, 25, 50],
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
              >
                mdi-storefront-edit-outline
              </v-icon>
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
              >
                mdi-trash-can-outline
              </v-icon>
            </template>
            <span>Excluir Editora</span>
          </v-tooltip>
        </template>

        <template v-slot:[`item.editora`]="{ item }">
          {{ item.editora.nome }}
        </template>
      </v-data-table>
      <v-row justify="center">
        <!-- FORM CREATE/UPDATE -->
        <v-dialog v-model="dialogVisible" max-width="600px" persistent>
          <v-card>
            <v-card-title>
              <span class="text-h5">
                {{
                  selectedPublisherId ? "Editar editora" : "Adicionar editora"
                }}
              </span>
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
      fetchPublisher: [],
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
        (v) => (v !== undefined && v.length > 0) || "O nome é obrigatório",
        (v) =>
          v === undefined ||
          v.length <= 25 ||
          "O nome deve ter no máximo 25 caracteres",
      ],
      cityRules: [
        (v) => (v !== undefined && v.length > 0) || "A cidade é obrigatória",
        (v) =>
          v === undefined ||
          v.length <= 25 ||
          "A cidade deve ter no máximo 25 caracteres",
      ],
      headers: [
        {
          text: "ID",
          align: "start",
          sortable: true,
          value: "id",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Nome",
          value: "name",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Cidade",
          value: "city",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Ações",
          value: "actions",
          sortable: false,
          class: "text-md-body-1 font-weight-bold ",
        },
      ],
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  created() {
    this.listPublishers();
  },
  computed: {
    filteredPublishers() {
      const searchValue = this.search.toLowerCase();
      return this.fetchPublisher.filter((publisher) => {
        for (const prop in publisher) {
          const propValue = publisher[prop].toString().toLowerCase();
          if (propValue.includes(searchValue)) {
            return true;
          }
        }
        return false;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredPublishers.length / this.itemsPerPage);
    },
    paginatedPublishers() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredPublishers.slice(startIndex, endIndex);
    },
  },
  methods: {
    /* ===== CRUD ===== */

    /* READ */
    async listPublishers() {
      try {
        const response = await Publisher.read();
        this.fetchPublisher = response.data.data;
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
            this.fetchPublisher.push({
              id: response.data.data.id,
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
              text: error.response.data.error,
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
            this.fetchPublisher = this.fetchPublisher.map((publisher) => {
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
              text: error.response.data.error,
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
          this.closeModal();
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
            text: error.response.data.message,
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
