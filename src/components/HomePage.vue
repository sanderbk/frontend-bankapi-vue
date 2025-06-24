<template>
  <div class="container">
    <div v-if="isLoggedIn" class="hello">
      <!-- Admin Menu -->
      <div v-if="isAdmin" class="admin-menu">
        <h1 class="text-center">Welcome! {{ getUserName }}</h1>
        <h2 class="text-center text-info">Employee menu</h2>
        <div class="row">
          <!-- Manage Accounts -->
          <div class="col-sm-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Manage accounts</h5>
                <p class="card-text">This is quick access to manage the accounts</p>
                <router-link to="/accounts" class="btn btn-primary"
                  >Accounts view</router-link
                >
              </div>
            </div>
          </div>
          <!-- Manage Users -->
          <div class="col-sm-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Manage users</h5>
                <p class="card-text">This is quick access to manage the users</p>
                <router-link to="/usersall" class="btn btn-primary"
                  >User view</router-link
                >
              </div>
            </div>
          </div>
          <div class="col-sm-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Manage users without account</h5>
                <p class="card-text">This is quick access to manage the users</p>
                <router-link to="/usersall?filter=noAccounts" class="btn btn-primary"
                  >User view</router-link
                >
              </div>
            </div>
          </div>
          <!-- All Transactions -->
          <div class="col-sm-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">All transactions</h5>
                <p class="card-text">This is quick access to view all transactions</p>
                <router-link to="/transactions/employee" class="btn btn-primary"
                  >Transactions view</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Customer Menu -->
      <div v-if="hasAccount" class="admin-menu">
        <h2 class="text-center text-muted">Customer menu</h2>
        <div class="row">
          <!-- Deposit -->
          <div class="col-sm-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Deposit</h5>
                <p class="card-text">This is quick access to make a deposit</p>
                <router-link to="/deposit" class="btn btn-success text-white"
                  >Deposit</router-link
                >
              </div>
            </div>
          </div>
          <!-- Withdraw -->
          <div class="col-sm-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Withdraw</h5>
                <p class="card-text">This is quick access to make a withdrawal</p>
                <router-link to="/withdraw" class="btn btn-info text-white"
                  >Withdraw</router-link
                >
              </div>
            </div>
          </div>
          <!-- Make a Transaction -->
          <div class="col-sm-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Make a transaction</h5>
                <p class="card-text">This is quick access to make a transaction</p>
                <router-link to="/transaction" class="btn btn-warning text-white"
                  >Make transaction</router-link
                >
              </div>
            </div>
          </div>
          <!-- View Transactions -->
          <div class="col-sm-4">
            <div class="card mt-4">
              <!-- Add margin top -->
              <div class="card-body">
                <h5 class="card-title">View Transactions</h5>
                <p class="card-text">This is quick access to view your transactions</p>
                <router-link to="/transactions" class="btn btn-primary"
                  >View Transactions</router-link
                >
              </div>
            </div>
          </div>
          <div v-if="!isAdmin" class="col-sm-4">
            <div class="card mt-4">
              <!-- Add margin top -->
              <div class="card-body">
                <h5 class="card-title">View My Accounts</h5>
                <p class="card-text">This is quick access to view your accounts</p>
                <router-link to="/Accounts" class="btn btn-danger"
                  >View accounts</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-admin-menu">
        <h1>
          You don't have an account yet wait for an Employee to set it up for you...
        </h1>
      </div>
    </div>
    <!-- Not Logged In -->
    <div v-if="!isLoggedIn" class="text-center">
      <p>You are not logged in. Please login!</p>
      <router-link
        to="/login"
        class="btn w-100 text-center submit vue-butt btn-success btn-lg"
      >
        <span>Go to login</span>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "../axios-auth";

export default {
  name: "HelloWorld",
  data() {
    return {
      hasAccount: false,
    };
  },
  computed: {
    ...mapGetters(["isLoggedIn", "getUserName", "getUserRole", "isAdmin", "getuserID"]),
  },
  created() {
    if (this.isLoggedIn && this.getuserID) {
      axios
        .get(`users/${this.getuserID}/accounts`)
        .then((response) => {
          this.hasAccount = response.data.length > 0;
        })
        .catch((error) => {
          console.error("Failed to check for accounts:", error);
          this.hasAccount = false;
        });
    }
  },
};
</script>

<style scoped>
/* Add margin top to the card */
.admin-menu .card {
  margin-top: 20px;
}
</style>
