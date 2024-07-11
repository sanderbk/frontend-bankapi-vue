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
        class="tabs-container"
        v-if="selectedAccount && selectedAccount.balance !== null"
      >
        <tabs nav-item-class="nav-item">
          <tab :is-disabled="isTabDisabled.first" name="Make transaction By User">
            <div class="user-transaction">
              <div
                v-if="selectedAccount && selectedAccount.balance !== null"
                class="input-group mb-3"
              >
                <div class="input-group mb-3 w-70">
                  <span class="input-group-text">Search on firstname and lastname</span>
                  <input
                    @input="searchAccount('second', true)"
                    type="text"
                    :disabled="disable"
                    v-model="firstnameInput"
                    class="form-control"
                    placeholder="Firstname..."
                  />
                  <input
                    @input="searchAccount('second', true)"
                    :disabled="disable"
                    type="text"
                    v-model="lastnameInput"
                    class="form-control"
                    placeholder="Lastname..."
                  />
                  <button
                    type="button"
                    class="btn btn-success"
                    :disabled="disable"
                    @click="searchAccount('second', true)"
                  >
                    Search for user
                  </button>
                </div>
              </div>

              <div v-if="accountsFetched.length != 0" class="">
                <table class="table align-middle mb-0 bg-white shadow-sm">
                  <thead class="bg-light">
                    <tr>
                      <th>IBan</th>
                      <th>Balance</th>
                      <th>AbsLimit</th>
                      <th>Owner</th>
                      <th>Owner Name</th>
                      <th v-if="!selectedToAccount">Action</th>
                      <th>AccountType [DEMO]</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="account in accountsFetched"
                      :key="account.id"
                      :account="account"
                    >
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="ms-3">
                            <p class="text-muted mb-0">{{ account.iban }}</p>
                          </div>
                        </div>
                      </td>
                      <td>€{{ account.balance }}</td>
                      <td>€{{ account.absLimit }}</td>
                      <td>
                        <span
                          class="badge text-primary badge-success rounded-pill d-inline"
                        >
                          {{ account.username }}
                        </span>
                      </td>
                      <td>{{ account.firstname }} {{ account.lastname }}</td>
                      <td v-if="!selectedToAccount">
                        <a
                          @click="selectIban(account, $event, 'second')"
                          class="btn btn-secondary"
                          >Select Account</a
                        >
                      </td>
                      <td>{{ account.accountType }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else>{{ accountsNotFetchedMsg }}</p>
            </div>
          </tab>
          <tab :is-disabled="isTabDisabled.second" name="Make transaction with Iban"
            ><div class="iban-transaction">
              <div
                v-if="selectedAccount && selectedAccount.balance !== null"
                class="input-group my-3"
              >
                <span class="input-group-text">Iban to make a deposit to:</span>
                <input
                  :disabled="disable"
                  type="text"
                  v-model="ibanSearch"
                  class="form-control"
                />
                <button
                  type="button"
                  :disabled="disable"
                  @click="searchAccount('first', false)"
                  class="btn btn-success"
                >
                  Search Iban
                </button>
              </div>
            </div>
          </tab>
        </tabs>
      </div>

      <form v-on:submit.prevent="login" ref="depoform">
        <div
          v-if="selectedAccount && selectedAccount.balance !== null"
          class="form-hider"
        >
          <div class="input-group my-3">
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
          <p v-if="errorMsg" class="text-danger">
            {{ errorMsg }}<br />
            <span class="text-black">
              Please click <a href="/transaction" class="cursor-pointer">here</a> to
              reload the page.</span
            >
          </p>
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
      AccountType: {
        SAVINGS: "SAVINGS",
        CURRENT: "CURRENT",
      },

      selected: null,
      selectedToAccount: null,
      disable: false,
      accounts: [],
      accountsFetched: [],
      accountsNotFetchedMsg: "",
      userID: "",
      balInput: "",
      errorMsg: "",
      username: "",
      selectedAccount: null,
      token: "",
      isTabDisabled: {
        first: false,
        second: false,
        third: false,
        fourth: false,
        fifth: false,
      },
    };
  },
  mounted() {
    this.token = localStorage.getItem("token");
    this.userID = localStorage.getItem("userID");
    axios
      .request({
        url: "accounts/getByUserId/" + this.userID,
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
    searchAccount(tabKey, complexSearch) {
      let params = {};

      if (!complexSearch) {
        params = {
          iban: this.ibanSearch,
        };
      } else {
        params = {
          firstname: this.firstnameInput,
          lastname: this.lastnameInput,
        };
      }

      console.log("complex search" + params);

      console.log(this.ibanSearch);

      axios
        .get("accounts/search", {
          params: params,
          ...this.config, // Assuming this.config contains other Axios configurations
        })
        .then((res) => {
          if (!complexSearch) {
            if (res.data.content[0].iban.length == 18) {
              this.selectedToAccount = res.data.content[0].iban;
              this.disableTab(tabKey);

              this.disable = true;
              this.errorMsg = "";
            }
          }
          if (complexSearch) {
            console.log(
              "trying to echo data complex;" + JSON.stringify(res.data.content)
            );

            this.accountsFetched = res.data.content.filter(
              (account) => account.accountType === "current"
            );
          }
        })
        .catch((error) => {
          this.errorMsg = "No account found with provided iban";

          console.log(error);
        });
    },
    selectIban(account, event, tabKey) {
      this.disableTab(tabKey);

      const parentTr = event.target.closest("tr");

      // Find all elements with the 'is-inactive' class and replace it with 'is-disabled'
      const inactiveElements = document.querySelectorAll(".is-inactive");

      inactiveElements.forEach((element) => {
        element.classList.remove("is-inactive");
        element.classList.add("is-disabled");
      });

      if (parentTr) {
        parentTr.classList.add("selected-tr");
      }
      this.selectedToAccount = account.iban;

      this.disable = true;
    },
    disableTab(tabKey) {
      if (Object.prototype.hasOwnProperty.call(this.isTabDisabled, tabKey)) {
        this.isTabDisabled[tabKey] = true;
      }
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
          url: "accounts/" + event.target.value,
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
          url: "accounts/" + event.target.value,
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

<style scoped></style>
