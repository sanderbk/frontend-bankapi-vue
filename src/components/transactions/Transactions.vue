<template>
  <section class="table-transactions mx-4 p-4">
    <div class="container">
      <div class="button-container p-2 my-2">
        <button @click="$router.push('/home')" class="py-2 mx-2 btn btn-danger">
          Go Back
        </button>
        <button @click="toggleFilterOptions" class="py-2 mx-2 btn btn-primary">
          Filter Options
        </button>
      </div>

      <div v-if="showFilterOptions" class="filter-container p-2 my-2">
        <label class="mx-2">From Account:</label>
        <input v-model="fromAccountFilter" type="text" class="form-control mx-2" placeholder="Enter From Account IBAN"
               @input="fetchFilteredTransactions">

        <label class="mx-2">To Account:</label>
        <input v-model="toAccountFilter" type="text" class="form-control mx-2" placeholder="Enter To Account IBAN"
               @input="fetchFilteredTransactions">

        <label class="mx-2">Amount:</label>
        <input v-model.number="amountFilter" type="number" class="form-control mx-2" placeholder="Enter Amount"
               @input="fetchFilteredTransactions">

        <label class="mx-2">Filter Type:</label>
        <select v-model="amountFilterType" class="form-control mx-2" @change="fetchFilteredTransactions">
          <option value="equal">Equal to</option>
          <option value="greater">Greater than</option>
          <option value="less">Less than</option>
        </select>

        <label class="mx-2">Start Time:</label>
        <input v-model="startTimeFilter" type="datetime-local" class="form-control mx-2"
               @change="fetchFilteredTransactions">

        <label class="mx-2">End Time:</label>
        <input v-model="endTimeFilter" type="datetime-local" class="form-control mx-2"
               @change="fetchFilteredTransactions">
      </div>

      <table class="table align-middle mb-0 bg-white shadow-sm">
        <thead class="bg-light">
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Type</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="transaction in transactions" :key="transaction.id">
          <td>{{ extractIBAN(transaction.from) }}</td>
          <td>{{ transaction.to }}</td>
          <td>€{{ transaction.amount.toFixed(2) }}</td>
          <td>{{ formatDate(transaction.timestamp) }}</td>
          <td>{{ transaction.transactionType }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import axios from "../../axios-auth";

export default {
  name: "UserTransactions",
  data() {
    return {
      transactions: [],
      fromAccountFilter: "",
      toAccountFilter: "",
      amountFilter: null,
      amountFilterType: "equal",
      startTimeFilter: null,
      endTimeFilter: null,
      showFilterOptions: false,
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
    fetchFilteredTransactions() {
      const token = localStorage.getItem("token");
      axios
          .get(`transactions/user/filter`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: {
              fromAccount: this.fromAccountFilter,
              toAccount: this.toAccountFilter,
              amount: this.amountFilter,
              amountFilterType: this.amountFilterType,
              startTime: this.startTimeFilter,
              endTime: this.endTimeFilter,
            },
          })
          .then((response) => {
            this.transactions = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          })
          .catch((error) => {
            console.error("Error fetching transactions:", error);
          });
    },
    toggleFilterOptions() {
      this.showFilterOptions = !this.showFilterOptions;
    },
  },
  mounted() {
    this.fetchFilteredTransactions();
  },
};
</script>

<style scoped>
</style>
