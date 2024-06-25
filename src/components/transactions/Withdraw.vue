<template>
  <div v-if="isLoggedIn" class="container">
    <h1 class="text-center my-2 text-muted">
      Please select an account in the dropdown
    </h1>
    <div class="form-container">
      <div v-if="selectedAccount">
        <h1 class="text-center text-muted">
          Current account balance: €{{ selectedAccount.balance }}
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
          <option
              v-for="account in accounts"
              :key="account.iban"
              :value="account.iban"
          >
            Iban: {{ account.iban }} Owner: {{ account.username }} AccountType: {{ account.accountType }}
          </option>
        </select>
      </div>
      <form v-on:submit.prevent="withdraw" ref="depoform">
        <div v-if="selectedAccount" class="form-hider">
          <div class="input-group mb-3">
            <span class="input-group-text">Amount to withdraw: €</span>
            <input
                @keypress="isNumber($event)"
                type="text"
                required
                v-model="balInput"
                class="text-center form-control"
            />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Pincode</span>
            <div class="input-wrapper">
              <div class="input-group">
                <input
                    class="form-control"
                    :disabled="disable"
                    v-model.number="pin_0"
                    v-on:keyup.right="pin_focus('pin_1')"
                    v-on:keypress="is_valid_pin_value($event, 'pin_0')"
                    ref="pin_0"
                    type="text"
                    placeholder="0"
                />
                <input
                    class="form-control"
                    :disabled="disable"
                    v-model.number="pin_1"
                    v-on:keyup.left="pin_focus('pin_0')"
                    v-on:keyup.right="pin_focus('pin_2')"
                    v-on:keypress="is_valid_pin_value($event, 'pin_1')"
                    ref="pin_1"
                    type="text"
                    placeholder="0"
                />
                <input
                    class="form-control"
                    :disabled="disable"
                    v-model.number="pin_2"
                    v-on:keyup.left="pin_focus('pin_1')"
                    v-on:keyup.right="pin_focus('pin_3')"
                    v-on:keypress="is_valid_pin_value($event, 'pin_2')"
                    ref="pin_2"
                    type="text"
                    placeholder="0"
                />
                <input
                    class="form-control"
                    :disabled="disable"
                    v-model.number="pin_3"
                    v-on:keyup.left="pin_focus('pin_2')"
                    v-on:keypress="is_valid_pin_value($event, 'pin_3')"
                    ref="pin_3"
                    type="text"
                    placeholder="0"
                />
              </div>
            </div>
          </div>
          <div class="input-group mb-3">
            <button
                type="button"
                class="w-100 btn btn-primary"
                @click="withdraw()"
            >
              Withdraw
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
  name: "Withdraw",
  computed: {
    ...mapGetters(["isAdmin"]),
    ...mapGetters(["isLoggedIn"]),
    ...mapGetters(["getuserID"]),
  },
  data() {
    return {
      pin_0: null,
      pin_1: null,
      pin_2: null,
      pin_3: null,
      pinfull: null,
      pintoCheck: null,
      selected: null,
      disable: false,
      accounts: [],
      userID: "",
      balance: null,
      balInput: "",
      errorMsg: "",
      selectedAccount: null,
      myIban: "",
      token: "",
    };
  },
  watch: {
    pin_0: function (nv) {
      if (nv.toString().length !== 0) {
        this.$refs.pin_1.focus();
        this.$refs.pin_1.select();
      }
    },
    pin_1: function (nv) {
      if (nv.toString().length !== 0) {
        this.$refs.pin_2.focus();
        this.$refs.pin_2.select();
      }
    },
    pin_2: function (nv) {
      if (nv.toString().length !== 0) {
        this.$refs.pin_3.focus();
        this.$refs.pin_3.select();
      }
    },
  },
  mounted() {
    this.token = localStorage.getItem("token");
    this.userID = localStorage.getItem("userID");
    this.fetchAccounts();
  },
  methods: {
    fetchAccounts() {
      axios
          .request({
            url: "accounts/getByUserID/" + this.userID,
            method: "get",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json; charset=UTF-8",
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then((response) => {
            this.accounts = response.data;
          })
          .catch((error) => {
            console.error("Error fetching accounts:", error);
          });
    },
    isNumber(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    pin_focus(ref) {
      this.$refs[ref].focus();
      this.$refs[ref].select();
    },
    is_valid_pin_value(e, pin_N) {
      const char = String.fromCharCode(e.keyCode);
      const is_value_selected =
          this[pin_N] !== null &&
          this.$refs[pin_N].selectionStart === 0 &&
          this.$refs[pin_N].selectionEnd === this[pin_N].toString().length;
      if (
          (this[pin_N] === null ||
              this[pin_N].toString().length === 0 ||
              is_value_selected) &&
          parseInt(char, 10) >= 0 &&
          parseInt(char, 10) <= 9
      ) {
        return true;
      }
      e.preventDefault();
    },
    withdraw() {
      if (
          this.balInput !== "" &&
          this.pin_0 != null &&
          this.pin_1 != null &&
          this.pin_2 != null &&
          this.pin_3 != null
      ) {
        const stringCode =
            this.pin_0.toString() +
            this.pin_1.toString() +
            this.pin_2.toString() +
            this.pin_3.toString();
        const balFloat = parseFloat(this.balInput);
        if (balFloat <= 0) {
          this.errorMsg = "Cannot create transaction; Amount must be greater than 0";
        } else {
          if (stringCode == this.pintoCheck) {
            this.pinfull = parseInt(stringCode);
            this.withdrawAxios();
          } else {
            this.errorMsg = "Cannot create transaction; Pincode is incorrect";
          }
        }
      } else {
        this.errorMsg = "Please fill in all the fields";
      }
    },
    withdrawAxios() {
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
        transactionType: "withdraw",
        timestamp: date,
        amount: parseFloat(this.balInput),
        userPerforming: this.userID,
        to: "NL01INHO0000000001",
        from: this.myIban,
        pincode: this.pinfull,
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
            console.log(data);
            console.log(error);
            this.errorMsg = error.response.data.reason;
          });
    },
    onChange(event) {
      axios
          .request({
            url: "accounts/getByIban/" + event.target.value,
            method: "get",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json; charset=UTF-8",
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then((response) => {
            this.pin_0 = null;
            this.pin_1 = null;
            this.pin_2 = null;
            this.pin_3 = null;
            this.balInput = null;
            this.errorMsg = "";
            this.selectedAccount = response.data;
            this.pintoCheck = response.data.pinCode;
            this.myIban = response.data.iban;
            this.balance = response.data.balance;
          })
          .catch((error) => {
            console.log(error);
          });
    },
  },
};
</script>
