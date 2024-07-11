<template>
  <section class="table-accounts mx-4 p-4">
    <div class="container">
      <button
        v-if="!isAdmin"
        @click="this.$router.push('/home')"
        class="py-2 mx-2 btn btn-danger"
      >
        Go Back
      </button>
      <h4 v-if="!isAdmin">Accounts</h4>
      <div v-if="isAdmin" class="form-control">
        <div class="input-group mb-3 w-70">
          <span class="input-group-text">Search on firstname and lastname</span>
          <input
            type="text"
            v-model="firstnameInput"
            class="form-control"
            placeholder="Firstname..."
          />
          <input
            type="text"
            v-model="lastnameInput"
            class="form-control"
            placeholder="Lastname..."
          />
          <button type="button" class="btn btn-success" @click="searchAccounts">
            Search for user
          </button>
        </div>
      </div>
      <table class="table align-middle mb-0 bg-white shadow-sm">
        <thead class="bg-light">
          <tr>
            <th>IBan</th>
            <th>AccountType</th>
            <th>ActiveStatus</th>
            <th>Balance</th>
            <th>AbsLimit</th>
            <th>Owner</th>
            <th>Fname</th>
            <th>Lname</th>
            <th v-if="isAdmin">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id" :account="account">
            <td>
              <div class="d-flex align-items-center">
                <div class="ms-3">
                  <p class="text-muted mb-0">{{ account.iban }}</p>
                </div>
              </div>
            </td>
            <td>
              <p class="fw-normal mb-1">{{ account.accountType }}</p>
            </td>
            <td>
              <span class="badge text-primary badge-success rounded-pill d-inline">{{
                account.active
              }}</span>
            </td>
            <td>€{{ account.balance }}</td>
            <td>€{{ account.absLimit }}</td>
            <td>
              {{ account.username }}
            </td>
            <td>
              {{ account.firstname }}
            </td>
            <td>
              {{ account.lastname }}
            </td>
            <td v-if="isAdmin">
              <a class="btn btn-light" @click="editAccount(account.iban)">Edit ✏️</a>
            </td>
          </tr>
        </tbody>
      </table>
      <vue-awesome-paginate
        v-if="isAdmin"
        class="w-100"
        v-model="currentPage"
        :total-items="totalElements"
        :items-per-page="size"
        :max-pages-shown="5"
        @click="handlePageChange"
      />
      <div v-if="isAdmin" class="form-control">
        <div class="button-container p-2 my-2 d-flex">
          <button @click="this.$router.push('/home')" class="py-2 mx-2 btn btn-danger">
            Go Back
          </button>
          <button
            @click="this.$router.push('/addaccount')"
            class="py-2 mx-2 btn btn-primary"
          >
            Add new Account
          </button>
        </div>
      </div>
    </div>
  </section>
  <!-- user settings -->
  <section v-if="!isAdmin" class="table-accounts mx-4 p-4">
    <div class="container">
      <div class="button-container p-2 my-2"></div>
      <h1 v-if="user" class="text-center text-muted">
        Here is your userinfo: {{ user.username }}
      </h1>
      <table class="table align-middle mb-0 bg-white shadow-sm">
        <thead class="bg-light">
          <tr>
            <th>Username</th>
            <th>Fullname</th>
            <th>Email</th>
            <th>Phone</th>
            <th>DayLimit</th>
            <th>TransLimit</th>
          </tr>
        </thead>
        <tbody v-if="user">
          <tr>
            <td>
              <p class="fw-normal mb-1">{{ user.username }}</p>
            </td>
            <td>
              <span class="badge text-primary badge-success rounded-pill d-inline">{{
                user.firstname + " " + user.lastname
              }}</span>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.dayLimit }}</td>
            <td>{{ user.transLimit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import axios from "../../axios-auth";
import { mapGetters } from "vuex";

export default {
  name: "Index",
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapGetters(["getUserName"]),
  },
  setup() {},
  data() {
    return {
      currentPage: 1,
      size: 5,
      accounts: [],
      user: null,
      totalPages: 0,
      totalElements: 0,
      setUsername: "",
      setType: "",
    };
  },
  methods: {
    editAccount(iban) {
      this.$router.push({ name: "EditAccount", params: { iban } });
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
      console.log(newPage);
      this.searchAccounts();
    },
    searchUser() {
      console.log(this.getUserName);

      axios
        .get("users/getByUserName/" + this.getUserName)
        .then((res) => {
          this.user = res.data;

          this.fetchedUser = JSON.stringify(res.data);
          this.errMsg = "";
          console.log("fefeef: " + this.fetchedUser);
          // this.disable = false;
        })
        .catch((error) => {
          // Use arrow function here
          this.errMsg = "User not found";
          console.log("gaat niet goed");
          console.log(error);
        });
    },
    searchAccounts() {
      let token = localStorage.getItem("token");

      // Create the headers object
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (!this.isAdmin) {
        this.setUsername = this.getUserName;
      }

      // Create the params object
      let params = {
        firstname: this.firstnameInput,
        lastname: this.lastnameInput,
        username: this.setUsername,
        iban: "",
        size: this.size,
        page: this.currentPage - 1,
      };

      axios
        .get("accounts/search", {
          params: params,
          headers: headers,
        })
        .then((response) => {
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;

          console.log(response.data.totalElements);

          console.log(response.data.totalPages);

          console.log(response.data.pageable);

          this.accounts = response.data.content;
        })
        .catch((error) => {
          console.log(error);
          this.errored = true;
        })
        .finally(() => (this.loading = false));
    },
  },
  mounted() {
    this.searchAccounts();
    this.searchUser();
  },
};
</script>

<style>
.pagination-container {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 10px 0px;
}
.paginate-buttons {
  width: 40px;
  height: 40px;
  margin-inline: 5px;
  cursor: pointer;
  border: none;
  background-color: transparent;
  border-radius: 2px;
}
.back-button {
  width: 70px;
}
.next-button {
  width: 70px;
}
.back-button svg {
  transform: rotate(180deg);
}
.active-page {
  background-color: #2980b9;
  color: #fff;
}

.paginate-buttons:hover {
  background-color: #e5e5e5;
}
.active-page:hover {
  background-color: #3b8cc3;
  color: #fff;
}
.back-button:active,
.next-button:active {
  background-color: #dedede;
}
</style>
