<template>
  <section class="table-transactions mx-4 p-4">
    <div class="container">
      <div class="button-container p-2 my-2">
        <button @click="goBack" class="py-2 mx-2 btn btn-danger">
          Go Back
        </button>
      </div>

      <div class="search-user-form p-2 my-2">
        <label for="searchUserInput" class="form-label">Search User:</label>
        <div class="d-flex align-items-center">
          <input type="text" id="searchUserInput" v-model="searchUserQuery" class="form-control"
                 placeholder="Enter username">
          <button @click="searchUser" class="btn btn-primary ms-2">Search</button>
        </div>
      </div>
      <div v-if="errorMessage" class="text-danger">{{ errorMessage }}</div>
      <table v-if="transactions.length > 0" class="table align-middle mb-0 bg-white shadow-sm">
        <thead class="bg-light">
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Initiator</th>
          <th>Type</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>{{ extractIBAN(transaction.from) }}</td>
          <td>{{ transaction.to }}</td>
          <td>€{{ transaction.amount }}</td>
          <td>{{ formatDate(transaction.timestamp) }}</td>
          <td>{{ getUserTypes(transaction.userPerforming) }}</td>
          <td>{{ transaction.transactionType }}</td>
        </tr>
        </tbody>
      </table>
      <div v-else class="text-center p-4">
        No transactions found.
      </div>
    </div>
  </section>
</template>

<script>
import axios from "../../axios-auth";
import { mapGetters } from "vuex";

export default {
  name: "AllTransactions",
  computed: {
    ...mapGetters(["getUserName"]),
  },
  data() {
    return {
      transactions: [],
      userMap: {},
      searchUserQuery: "",
      selectedUser: null,
      errorMessage: "",
    };
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    extractIBAN(fromField) {
      const startIndex = fromField.indexOf("iban=") + 5;
      const endIndex = fromField.indexOf(",", startIndex);
      return fromField.substring(startIndex, endIndex);
    },
    async fetchTransactions() {
      try {
        let token = localStorage.getItem("token");
        const response = await axios.get("transactions/employee", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        this.transactions = response.data.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        await this.fetchUserDetails();
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    },
    async fetchUserDetails() {
      try {
        const token = localStorage.getItem("token");
        const userIds = [...new Set(this.transactions.map((t) => t.userPerforming))];

        const userRequests = userIds.map((id) =>
            axios.get(`users/${id}`, {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
        );

        const responses = await Promise.all(userRequests);
        const userMap = {};
        responses.forEach((response) => {
          const userId = response.data.id;
          const role = response.data.userTypes;
          userMap[userId] = role.includes("ROLE_EMPLOYEE") ? "Employee" : "Customer";
        });
        this.userMap = userMap;
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    },
    async searchUser() {
      if (this.searchUserQuery.trim() === "") {
        this.errorMessage = "Please enter a username to search.";
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`users/getByUsername/${this.searchUserQuery}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        this.selectedUser = response.data;
        await this.fetchTransactionsForUser(this.selectedUser.id);
        this.errorMessage = "";
      } catch (error) {
        console.error("Error searching user:", error);
        this.errorMessage = "User not found.";
        this.transactions = [];
      }
    },
    async fetchTransactionsForUser(userId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`transactions/employee?userId=${userId}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        this.transactions = response.data.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        this.fetchUserDetails();
      } catch (error) {
        console.error("Error fetching transactions for user:", error);
        if (error.response && error.response.data && error.response.data.reason) {
          this.errorMessage = error.response.data.reason;
        } else {
          this.errorMessage = "An error occurred while fetching transactions.";
        }
        this.transactions = [];
      }
    },
    goBack() {
      this.$router.push("/home");
    },
    getUserTypes(userId) {
      return this.userMap[userId];
    },
  },
  mounted() {
    this.fetchTransactions();
  },
};
</script>

<style scoped>
</style>
