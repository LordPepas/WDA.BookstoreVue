<template>
  <v-container class="mt-2">
    <AppPageHeader
      :pageTitle="pageTitle"
      :search.sync="search"
      @open-create-modal="openModalCreate"
    />
    <v-data-table
      :headers="headers"
      :items="usersData"
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

      <template v-slot:[`item.address`]="{ item }">
        <div @click="toggleFullText(item, 'address', 16)">
          {{
            modalFormData["address"] === item
              ? item.address
              : truncateText(item.address, 16)
          }}
        </div>
      </template>

      <template v-slot:[`item.email`]="{ item }">
        <div @click="toggleFullText(item, 'email', 16)">
          {{
            modalFormData["email"] === item
              ? item.email
              : truncateText(item.email, 20)
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
            >
              mdi-account-edit-outline</v-icon
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
              {{ selectedUserId ? "Editar usuário" : "Adicionar usuário" }}
            </span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submitAction">
              <v-text-field
                v-model="modalFormData.name"
                :rules="nameRules"
                :counter="45"
                label="Nome"
                append-icon="mdi-account"
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
              <v-text-field
                v-model="modalFormData.address"
                :rules="addressRules"
                :counter="25"
                label="Endereço"
                append-icon="mdi-map-marker-outline"
                required
              ></v-text-field>
              <v-text-field
                v-model="modalFormData.email"
                :rules="emailRules"
                :counter="120"
                label="Email"
                append-icon="mdi-email-outline"
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
import Users from "@/services/Users.js";
import Swal from "sweetalert2";

export default {
  components: {
    AppPageHeader,
  },
  data() {
    return {
      // General info
      pageTitle: "Usuários",
      search: "",
      // Table data
      usersData: [],
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
          text: "Endereço",
          value: "address",
          class: "text-md-body-1 font-weight-bold",
        },
        {
          text: "Email",
          value: "email",
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
          (v && v.length <= 45) || "O nome deve ter no máximo 45 caracteres",
      ],
      emailRules: [
        (v) => !!v || "O email é obrigatório",
        (v) =>
          (v && v.length <= 120) || "O email deve ter no máximo 120 caracteres",
        (v) => this.isValidEmail(v) || "Formato de email inválido",
      ],
      cityRules: [
        (v) => !!v || "A cidade é obrigatória",
        (v) =>
          (v && v.length >= 3) || "A cidade deve ter pelo menos 3 caracteres",
        (v) =>
          (v && v.length <= 25) || "A cidade deve ter no máximo 25 caracteres",
      ],
      addressRules: [
        (v) => !!v || "O endereço é obrigatório",
        (v) =>
          (v && v.length >= 3) || "O endereço deve ter pelo menos 3 caracteres",
        (v) =>
          (v && v.length <= 25) ||
          "O endereço deve ter no máximo 25 caracteres",
      ],
      modalFormData: {
        name: null,
        city: null,
        address: null,
        email: null,
      },
      selectedUserId: null,
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
        this.listUsers();
      },
      deep: false,
    },
  },
  mounted() {
    this.listUsers();
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

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    /* ===== CRUD ===== */

    /* READING LOGIC */
    async listUsers() {
      try {
        const response = await Users.read(this.params);
        this.usersData = response.data.data;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        this.noDataText = "Nenhum usuário encontrado";
        this.usersData = [];
        this.totalItems = 0;
        this.totalPages = 0;
      }
    },

    generateItemsPerPageOptions() {
      if (this.totalPages > 25) {
        return [5, 10, this.totalPages];
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
      this.listUsers();
    },

    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.modalFormData.name = "";
      this.modalFormData.email = "";
      this.modalFormData.city = "";
      this.modalFormData.address = "";
      this.modalFormData.selectedUserId = null;
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

    /* UPDATED LOGIC */
    openModalUpdate(user) {
      this.selectedUserId = user.id;
      this.modalFormData.name = user.name;
      this.modalFormData.email = user.email;
      this.modalFormData.city = user.city;
      this.modalFormData.address = user.address;
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
        const newUser = {
          name: this.modalFormData.name.trim(),
          email: this.modalFormData.email.trim(),
          city: this.modalFormData.city.trim(),
          address: this.modalFormData.address.trim(),
        };

        if (!this.selectedUserId) {
          try {
            await Users.create(newUser);
            this.closeModal();
            this.listUsers();
            Swal.fire({
              icon: "success",
              title: "Usuário adicionado com Sucesso!",
              showConfirmButton: false,
              timer: 3000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao adicionar Usuário",
              text: error.response.data.errors,
              showConfirmButton: false,
              toast: true,
              position: "top-end",
              timer: 5000,
              timerProgressBar: true,
            });
          }
        } else {
          const updateUser = {
            id: this.selectedUserId,
            ...newUser,
          };
          try {
            await Users.update(updateUser);
            this.closeModal();
            this.listUsers();
            Swal.fire({
              icon: "success",
              title: "Usuário atualizado com Sucesso!",
              showConfirmButton: false,
              timer: 3000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar Usuário",
              text: error.response.data.errors,
              showConfirmButton: false,
              timer: 5000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
          }
        }
      }
    },

    /* DELETE LOGIC */
    async openModalDelete(user) {
      const result = await Swal.fire({
        icon: "warning",
        title: `Deseja excluir o usuário </br>${user.name} ?`,
        text: "Essa ação não pode ser Desfeita!",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonText: "Excluir!",
        cancelButtonColor: "#E57373",
        confirmButtonColor: "#5FA7D7",
      });

      if (result.isConfirmed) {
        try {
          await Users.delete(user.id);

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
          this.listUsers();
          await Swal.fire({
            icon: "success",
            title: "Usuário Excluído com Sucesso!",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          await Swal.fire({
            icon: "error",
            title: "Erro ao Excluir Usuário",
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
