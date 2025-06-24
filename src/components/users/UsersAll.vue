<template>
  <section v-if="isAdmin" class="table-accounts mx-4 p-4">
    <div class="container">
      <div class="button-container p-2 my-2">
        <button @click="this.$router.push('/home')" class="py-2 mx-2 btn btn-danger">
          Go Back
        </button>
      </div>
      <h1 class="text-center text-muted">Here are all users</h1>
      <div class="form-check my-3">
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="accountFilter"
            id="allAccounts"
            value=""
            v-model="hasAccountsFilter"
            @change="fetchUsers"
          />
          <label class="form-check-label" for="allAccounts">All</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="accountFilter"
            id="hasAccounts"
            value="true"
            v-model="hasAccountsFilter"
            @change="fetchUsers"
          />
          <label class="form-check-label" for="hasAccounts">Has Accounts</label>
        </div>
        <div class="form-check form-check-inline">
          <input
            class="form-check-input"
            type="radio"
            name="accountFilter"
            id="hasNoAccounts"
            value="false"
            v-model="hasAccountsFilter"
            @change="fetchUsers"
          />
          <label class="form-check-label" for="hasNoAccounts">Has No Accounts</label>
        </div>
      </div>
      <table class="table align-middle mb-0 bg-white shadow-sm">
        <thead class="bg-light">
          <tr>
            <th>Role</th>
            <th>Status</th>
            <th>Username</th>
            <th>Fullname</th>
            <th>Email</th>
            <th>Phone</th>
            <th>DayLimit</th>
            <th>TransactionLimit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody v-if="users">
          <tr v-for="user in users" :key="user.id" :user="user">
            <td>
              <div class="d-flex align-items-center">
                <div class="ms-3">
                  <td>
                    <span
                      v-if="user.userTypes.includes('ROLE_CUSTOMER')"
                      class="badge bg-success text-white"
                    >
                      Customer
                    </span>
                    <span
                      v-else-if="user.userTypes.includes('ROLE_EMPLOYEE')"
                      class="badge bg-warning text-dark"
                    >
                      Employee
                    </span>
                    <span v-else class="badge bg-secondary text-white"> Unknown </span>
                  </td>
                </div>
              </div>
            </td>
            <td>{{ user.userStatus }}</td>
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
            <td>
              <button
                @click="
                  this.$router.push({
                    path: '/addaccount',
                    query: { username: user.username },
                  })
                "
                class="py-2 mx-2 btn btn-primary"
              >
                ➕ Add new Account
              </button>
              <button
                @click="
                  this.$router.push({
                    path: '/edituser',
                    query: { username: user.username },
                  })
                "
                class="py-2 mx-2 btn btn-secondary"
              >
                ✏️ Edit User
              </button>
              <!-- <button
                @click="
                  this.$router.push({
                    path: '/edituser',
                    query: { username: user.username },
                  })
                "
                class="py-2 mx-2 btn btn-warning"
              >
                ✏️ approve user
              </button> -->
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
    </div>
  </section>
</template>

<script>
import axios from "../../axios-auth";
import { mapGetters } from "vuex";

export default {
  name: "Users",
  computed: {
    ...mapGetters(["isAdmin"]),
  },
  data() {
    return {
      users: [],
      currentPage: 1,
      size: 5,
      totalElements: 0,
      hasAccountsFilter: "", // Controls radio button: "" (All), "true" (Has Accounts), "false" (Has No Accounts)
      errored: false,
      loading: false,
    };
  },
  methods: {
    fetchUsers() {
      this.loading = true;
      let token = localStorage.getItem("token");

      let params = {
        page: this.currentPage - 1, // Backend is 0-indexed
        size: this.size,
        excludeUsername: "InhollandBank", // <-- Add this line
      };

      if (this.hasAccountsFilter !== "") {
        params.hasAccounts = this.hasAccountsFilter === "true";
      }

      axios
        .get("/users", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params,
        })
        .then((res) => {
          this.users = res.data.content;
          this.totalElements = res.data.totalElements;
        })
        .catch((error) => {
          console.error(error);
          this.errored = true;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
      this.fetchUsers();
    },
  },
  mounted() {
    // Check for filter query parameter
    const filter = this.$route.query.filter;
    if (filter === "noAccounts") {
      this.hasAccountsFilter = "false"; // Pre-select "Has No Accounts"
    }
    this.fetchUsers();
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

@media (min-width: 1400px) {
  .container,
  .container-lg,
  .container-md,
  .container-sm,
  .container-xl,
  .container-xxl {
    max-width: 95vw;
  }
}
</style>
