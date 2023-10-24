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
          <div @click="toggleFullText(item, 'name')">
            {{
              showFullTextItem["name"] === item
                ? item.name
                : truncateText(item.name, 16)
            }}
          </div>
        </template>

        <template v-slot:[`item.city`]="{ item }">
          <div @click="toggleFullText(item, 'city')">
            {{
              showFullTextItem["city"] === item
                ? item.city
                : truncateText(item.city, 16)
            }}
          </div>
        </template>

        <template v-slot:[`item.address`]="{ item }">
          <div @click="toggleFullText(item, 'address')">
            {{
              showFullTextItem["address"] === item
                ? item.address
                : truncateText(item.address, 16)
            }}
          </div>
        </template>

        <template v-slot:[`item.email`]="{ item }">
          <div @click="toggleFullText(item, 'email')">
            {{
              showFullTextItem["email"] === item
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
            <span>Editar Usuário</span>
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
            <span>Excluir Usuário</span>
          </v-tooltip>
        </template>
      </v-data-table>

      <!-- FORM Create/Update -->
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
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  :counter="120"
                  label="Email do usuário"
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
        pageNumber: 1,
        itemsPerPage: null,
      },
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
          text: "Email",
          value: "email",
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
          (v && v.length <= 50) ||
          "O endereço deve ter no máximo 50 caracteres",
      ],
      itemsPerPage: 5,
      totalItems: null,
      totalPages: null,
      sortBy: "",
      noDataText: "Carregando dados... Aguarde!",
      pageTitle: "Usuários",
      search: "",
      showFullTextItem: {
        name: null,
        city: null,
        address: null,
        email: null,
      },
    };
  },
  components: {
    AppPageHeader,
  },
  mounted() {
    this.listUsers();
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

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    /* ===== CRUD ===== */

    /* READ */
    async listUsers() {
      console.log(
        "listPublishers foi chamada com searchValue:",
        this.params.searchValue
      );
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
        Swal.fire({
          icon: "error",
          title: "Nenhum usuário encontrado",
          showConfirmButton: false,
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
      this.listUsers();
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
            timer: 2000,
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
