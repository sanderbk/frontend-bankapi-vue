<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary">
    <div class="container-fluid">
      <router-link to="/home" class="navbar-brand abs" href="#"
        >Inholland Bank</router-link
      >
      <button
        class="navbar-toggler ms-auto"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="navbar-collapse collapse" id="collapseNavbar">
        <ul v-if="isLoggedIn" class="navbar-nav">
          <router-link to="/deposit" class="nav-link nav-item"> Deposit </router-link>
          <router-link to="/withdraw" class="nav-link nav-item"> Withdraw </router-link>
          <router-link to="/transaction" class="nav-link nav-item">
            Transaction
          </router-link>
        </ul>
        <ul class="navbar-nav ms-auto">
          <li v-if="isAdmin" class="nav-item dropdown">
            <a
              class="nav-link text-white mr-2 dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style="margin-right: 2.5rem"
            >
              Employee menu
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              <li>
                <router-link to="/accounts" class="dropdown-item">Accounts</router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/transaction"
                  >Transactions</router-link
                >
              </li>
              <li>
                <router-link to="/users" class="dropdown-item"
                  >Users without account</router-link
                >
              </li>
              <li>
                <router-link to="/usersall" class="dropdown-item">All users</router-link>
              </li>
            </ul>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link">Login</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <a v-on:click="logout" class="nav-link">Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

/template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "Navigation",
  computed: {
    ...mapGetters(["isLoggedIn"]),
    ...mapGetters(["getUserRole"]),
    ...mapGetters(["isAdmin"]),
  },
  methods: {
    logout() {
      localStorage.clear();
      this.$router.go("/login");
    },
  },
};
</script>
