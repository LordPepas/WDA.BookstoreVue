<template>
  <div class="d-flex flex-column justify-end align-end mt-2">
    <v-container>
      <v-row class="d-flex align-center">
        <v-col cols="auto ml-2">
          <v-toolbar-title class="font-weight-medium" style="font-size: 30px"
            >Usuários</v-toolbar-title
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
            <img src="@/assets/plus.svg" />
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
        :items="usersData"
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
        no-data-text="Nenhum Cliente encontrado"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                variant="plain"
                color="info"
                @click="openModalUpdate(item)"
                v-on="on"
              > mdi-account-edit-outline</v-icon>
            </template>
            <span>Editar Usuário</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                variant="plain"
                color="error"
                @click="openModalDelete(item)"
                v-on="on"
                >mdi-trash-can-outline</v-icon>
            </template>
            <span>Excluir Usuário</span>
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
                  v-model="name"
                  :rules="nameRules"
                  :counter="45"
                  label="Nome do usuário"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  :counter="120"
                  label="Email do usuário"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="city"
                  :rules="cityRules"
                  :counter="25"
                  label="Cidade do usuário"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="address"
                  :rules="addressRules"
                  :counter="25"
                  label="Endereço do usuário"
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
import Users from "@/services/Users.js";
import Swal from "sweetalert2";
export default {
  data() {
    return {
      usersData: [],
      params: {
        searchValue: "",
        orderBy: "id",
        orderDesc: false,
        pageNumber: null,
        itemsPerPage: null,
      },
      search: "",
      name: "",
      email: "",
      city: "",
      address: "",
      submitButtonLabel: "",
      dialogVisible: false,
      selectedUserId: null,
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
          text: "Nome",
          value: "name",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Email",
          value: "email",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Cidade",
          value: "city",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Endereço",
          value: "address",
          class: "text-md-body-1 font-weight-bold ",
        },
        {
          text: "Ações",
          value: "actions",
          sortable: false,
          class: "text-md-body-1 font-weight-bold ",
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
          (v && v.length <= 50) || "O endereço deve ter no máximo 50 caracteres",
      ],
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: null,
      totalPages:null,
      sortBy: "",
    };
  },
  mounted() {
    this.listUsers();
  },
  watch: {
    search: {
      handler(newSearch, oldSearch) {
        if (newSearch !== oldSearch) {
          this.params.pageNumber = 1;
          this.params.searchValue = newSearch;
          this.listUsers();
        }
      },
      deep: false,
    },
  },
  methods: {
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
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
      this.listUsers();
      console.log(this.params);
    },
    /* ===== CRUD ===== */

    /* READ */
    async listUsers() {
      try {
        const response = await Users.read(this.params);
        this.usersData = response.data.data;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error("Erro ao buscar editoras:", error);
      }
    },

    /* CREATE/UPDATE */

    resetValidation() {
      this.$refs.form.resetValidation();
    },

    closeModal() {
      this.name = "";
      this.email = "";
      this.city = "";
      this.address = "";
      this.selectedUserId = null;
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

    openModalUpdate(user) {
      this.selectedUserId = user.id;
      this.name = user.name;
      this.email = user.email;
      this.city = user.city;
      this.address = user.address;
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
        const userData = {
          name: this.name,
          email: this.email,
          city: this.city,
          address: this.address,
        };

        if (!this.selectedUserId) {
          try {
            const response = await Users.create(userData);
            this.usersData.push({ id: response.data.id, ...userData });
            this.closeModal();
            this.listUsers();
            Swal.fire({
              icon: "success",
              title: "Usuário adicionado com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
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
              timer: 3000,
              timerProgressBar: true,
            });
          }
        } else {
          const updateUser = {
            id: this.selectedUserId,
            ...userData,
          };
          try {
            await Users.update(updateUser);
            this.usersData = this.usersData.map((user) => {
              if (user.id === updateUser.id) {
                return updateUser;
              } else {
                return user;
              }
            });
            Swal.fire({
              icon: "success",
              title: "Usuário atualizado com Sucesso!",
              showConfirmButton: false,
              timer: 2000,
              toast: true,
              position: "top-end",
              timerProgressBar: true,
            });
            this.closeModal();
            this.listUsers();
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "Erro ao atualizar Usuário",
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
    async openModalDelete(user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Deseja excluir o usuário?",
        text: "Essa ação não pode ser Desfeita!",
        showCancelButton: true,
        confirmButtonText: "Excluir!",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#5FA7D7",
        cancelButtonColor: "#E57373",
      });

      if (result.isConfirmed) {
        try {
          await Users.delete(user);
          if (this.usersData.length === 1) {
            if (this.params.pageNumber > 1) {
              this.currentPage -= 1;
              location.reload();
            }
          }
          this.listUsers();
          Swal.fire({
            icon: "success",
            title: "Usuário Excluído com Sucesso!",
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            position: "top-end",
            timerProgressBar: true,
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao Excluir Usuário",
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
