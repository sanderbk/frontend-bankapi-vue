<template>
  <div v-if="isLoggedIn" class="container">
    <h1 class="text-center my-2 text-muted">Please select an account in the dropdown</h1>
    <div class="form-container">
      <div>
        <h1
          v-if="selectedAccount && selectedAccount.balance !== null"
          class="text-center text-muted"
        >
          Current account balance: €{{ selectedAccount.balance }}
        </h1>
        <h1
          v-if="selectedAccount && selectedAccount.balance === null"
          class="text-center text-muted"
        >
          Account balance is not available.
        </h1>
      </div>
      <div class="input-group mx-0 text-center mb-3">
        <select
          @change="onChange($event)"
          class="w-100 text-center mx-0"
          :disabled="disable"
          v-model="selected"
        >
          <option :value="null" disabled>Select Account</option>
          <option v-for="account in accounts" :key="account.iban" :value="account.iban">
            Iban: {{ account.iban }} Owner: {{ account.username }} AccountType:
            {{ account.accountType }}
          </option>
        </select>
      </div>
      <div
        v-if="selectedAccount && selectedAccount.balance !== null"
        class="input-group mb-3"
      >
        <span class="input-group-text">Search for user</span>
        <input :disabled="disable" type="text" v-model="username" class="form-control" />
        <button
          type="button"
          :disabled="disable"
          @click="searchUser()"
          class="btn btn-success"
        >
          Search User
        </button>
      </div>
      <div
        v-if="selectedAccount && selectedAccount.balance !== null"
        class="input-group mb-3"
      >
        <span class="input-group-text w-100 text-center">Iban to make a deposit to</span>
        <select
          @change="onChange2($event)"
          class="w-100 text-center mx-0"
          :disabled="!disable"
          v-model="selectedToAccount"
        >
          <option :value="null" disabled>Select Account</option>
          <option
            v-for="account in accountsFetched"
            :key="account.iban"
            :value="account.iban"
          >
            Iban: {{ account.iban }} Owner: {{ account.username }} AccountType:
            {{ account.accountType }}
          </option>
        </select>
      </div>
      <form v-on:submit.prevent="login" ref="depoform">
        <div
          v-if="selectedAccount && selectedAccount.balance !== null"
          class="form-hider"
        >
          <div class="input-group mb-3">
            <span class="input-group-text">Amount to transfer: €</span>
            <input
              @keypress="isNumber($event)"
              type="text"
              required="required"
              :disabled="!disable"
              v-model="balInput"
              class="text-center form-control"
            />
          </div>
          <div class="input-group mb-3">
            <button type="button" class="w-100 btn btn-primary" @click="makeTrans()">
              Transfer
            </button>
          </div>
          <p v-if="errorMsg" class="text-danger">{{ errorMsg }}</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "../../axios-auth";
import { mapGetters } from "vuex";

export default {
  name: "MakeTrans",
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapGetters(["isLoggedIn"]),
    ...mapGetters(["getuserID"]),
  },
  data() {
    return {
      selected: null,
      selectedToAccount: null,
      disable: false,
      accounts: [],
      accountsFetched: [],
      userID: "",
      balInput: "",
      errorMsg: "",
      username: "",
      selectedAccount: null,
      token: "",
    };
  },
  mounted() {
    this.token = localStorage.getItem("token");
    this.userID = localStorage.getItem("userID");
    axios
      .request({
        url: "accounts/userid/" + this.userID,
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${this.token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        this.accounts = response.data;
      })
      .catch((error) => {
        console.log(error);
        this.errored = true;
      })
      .finally(() => (this.loading = false));
  },
  methods: {
    searchUser() {
      console.log(this.username);
      axios
        .get("users/username/" + this.username)
        .then((res) => {
          this.placeHolder = res.data.firstname + " " + res.data.lastname;
          this.ownerId = res.data.id;
          this.fetchedUser = JSON.stringify(res.data);
          this.errMsg = "";
          this.findIbanByUsername(res.data.username);
          this.disable = true;
        })
        .catch((error) => {
          this.errMsg = "User not found";
          console.log(error);
        });
    },
    findIbanByUsername(username) {
      if (!username) {
        console.error("Username is undefined or null");
        return;
      }
      axios
        .request({
          url: `accounts/username/${username}`,
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          console.log(response.data);
          this.accountsFetched = response.data;
        })
        .catch((error) => {
          console.error("Error fetching IBAN by username:", error);
          this.errorMsg = "Failed to fetch accounts by username.";
        });
    },
    makeTrans() {
      const balFloat = parseFloat(this.balInput);
      if (!isNaN(balFloat)) {
        this.makeTransAxios();
      } else {
        this.errorMsg =
          "Cannot create transaction; Please enter a valid amount greater than 0.";
      }
    },
    makeTransAxios() {
      const today = new Date();
      const date =
        today.getFullYear() +
        "-" +
        ("0" + (today.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + today.getDate()).slice(-2) +
        "T" +
        ("0" + today.getHours()).slice(-2) +
        ":" +
        ("0" + today.getMinutes()).slice(-2) +
        ":" +
        ("0" + today.getSeconds()).slice(-2);

      const data = JSON.stringify({
        transactionType: "regular",
        timestamp: date,
        amount: this.balInput,
        userPerforming: this.userID,
        from: this.selected,
        to: this.selectedToAccount,
        pincode: null,
      });

      let config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      };

      axios
        .post("transactions", data, config)
        .then((response) => {
          console.log(response);
          this.$router.replace("/transactions");
        })
        .catch((error) => {
          this.errorMsg = error.response.data.reason;
          console.log(error);
        });
    },
    onChange(event) {
      axios
        .request({
          url: "accounts/iban/" + event.target.value,
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          this.balInput = null;
          this.errorMsg = "";
          this.selectedAccount = response.data;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => (this.loading = false));
    },
    onChange2(event) {
      axios
        .request({
          url: "accounts/iban/" + event.target.value,
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=UTF-8",
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then((response) => {
          this.errorMsg = "";
          this.selectedToAccount = response.data.iban;
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => (this.loading = false));
    },
    isNumber: function (evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
  },
};
</script>
