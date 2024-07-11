<template>
  <section v-if="isAdmin" class="table-accounts mx-4 p-4">
    <div class="container">
      <div class="button-container p-2 my-2">
        <button @click="this.$router.push('/accounts')" class="py-2 mx-2 btn btn-danger">
          Go Back
        </button>
      </div>
      <div class="form-container">
        <form v-on:submit.prevent="addAccount" ref="form">
          <div class="input-group mb-3"></div>
          <div class="input-group mb-3">
            <input
              disabled
              v-model="fullname"
              type="text"
              placeholder="naam"
              class="text-center form-control"
            />
          </div>
        </form>
      </div>
      <div class="form-container">
        <h2 class="mt-3 mt-lg-5">Edit a Account</h2>
        <h5 class="mb-4"></h5>
        <form id="mainForm">
          <div class="input-group mb-3">
            <span class="input-group-text">Absolute limit</span>
            <input
              @keypress="isNumberOrNegative($event)"
              :disabled="disable"
              v-model="absLimit"
              required="required"
              type="text"
              class="required form-control"
            />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Accounttype</span>
            <div class="">
              <select :disabled="disable" v-model="accountType">
                <option
                  v-for="option in options"
                  v-bind:key="{ value: option.value, text: option.text }"
                >
                  {{ option.text }}
                </option>
              </select>
            </div>
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Balance</span>
            <input
              @keypress="isNumber($event)"
              :disabled="disable"
              v-model="balance"
              required=""
              type="text"
              class="form-control"
            />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Activestatus</span>
            <input type="checkbox" v-model="activeStatus" />
          </div>
          <div class="input-group mb-3">
            <span class="input-group-text">Pincode</span>
            <div class="input-wrapper">
              <div>
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
          </div>
          <div class="input-group mt-4">
            <button type="button" class="btn btn-primary" @click="updateAccount()">
              Update Account
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="this.$router.push('/accounts')"
            >
              Cancel
            </button>
            <span :v-if="errMsg" class="w-100 text-danger">{{ errMsg }}</span>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "../../axios-auth";
import { mapGetters } from "vuex";

export default {
  name: "AddAccount",
  computed: {
    iban() {
      return this.$route.params.iban;
    },

    ...mapGetters(["isLoggedIn"]),
    ...mapGetters(["isAdmin"]),
  },
  watch: {
    pin: function () {
      this.$bus.$emit("PIN/change", this.pin);
    },
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
  data() {
    return {
      selected: "",
      pin_0: null,
      pin_1: null,
      pin_2: null,
      pin_3: null,
      pinfull: null,
      options: [
        { text: "current", value: "current" },
        { text: "savings", value: "savings" },
      ],
      ibanParam: "",
      placeHolder: "",
      fetchedUser: "",
      balance: "",
      ownerId: "",
      abs: "",
      errMsg: "",
      disable: true,
      fetchedAccount: null,
      activeStatus: null,
    };
  },
  mounted() {
    if (this.$route.params.iban) {
      this.searchAccount();
    }
  },
  //don't allow anything but numbers in the input method
  methods: {
    pin_focus: function (ref) {
      this.$refs[ref].focus();
      this.$refs[ref].select();
    },
    is_valid_pin_value: function (e, pin_N) {
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

    isInt: function (evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if ((charCode = 48 && charCode <= 57)) {
        return true;
      } else {
        evt.preventDefault();
      }
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
    isNumberOrNegative(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      // Allow: Backspace, Tab, End, Home, Left Arrow, Right Arrow, Delete
      if (
        charCode === 8 ||
        charCode === 9 ||
        charCode === 35 ||
        charCode === 36 ||
        charCode === 37 ||
        charCode === 39 ||
        charCode === 46
      ) {
        return true;
      }
      // Allow: 0-9, negative sign (-), decimal point (.)
      if ((charCode >= 48 && charCode <= 57) || charCode === 45 || charCode === 46) {
        return true;
      }
      // Otherwise, prevent the default action
      evt.preventDefault();
      return false;
    },
    searchAccount() {
      let token = localStorage.getItem("token");

      // Create the headers object
      let headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log(this.username);
      axios
        .get("accounts/search", {
          params: {
            iban: this.$route.params.iban,
          },
          headers,
        })
        .then((res) => {
          console.log("content: " + res.data);

          this.placeHolder = res.data.firstname + " " + res.data.lastname;
          this.ownerId = res.data.id;

          this.fetchedUser = JSON.stringify(res.data.content[0]);
          console.log(res.data.content[0]);
          this.fetchedAccount = res.data.content[0];

          console.log(this.fetchedAccount.absLimit);

          this.balance = this.fetchedAccount.balance;
          this.absLimit = this.fetchedAccount.absLimit;
          this.accountType = this.fetchedAccount.accountType;
          this.activeStatus = this.fetchedAccount.active;

          this.fullname =
            this.fetchedAccount.firstname + " " + this.fetchedAccount.lastname;

          console.log("pinh_0" + this.fetchedAccount.pinCode.toString()[0]);

          this.pin_0 = this.fetchedAccount.pinCode.toString()[0];
          this.pin_1 = this.fetchedAccount.pinCode.toString()[1];
          this.pin_2 = this.fetchedAccount.pinCode.toString()[2];
          this.pin_3 = this.fetchedAccount.pinCode.toString()[3];

          this.errMsg = "";
          console.log(this.fetchedUser);
          this.disable = false;
        })
        .catch((error) => {
          // Use arrow function here
          this.errMsg = "User not found";
          console.log("gaat niet goed");
          console.log(error);
        });
    },
    updateAccount() {
      if (
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

        const data2 = JSON.stringify({
          accountType: this.accountType.valueOf(),
          balance: parseFloat(this.balance),
          absLimit: parseFloat(this.absLimit),
          pinCode: parseInt(stringCode),
          active: this.active,
        });

        console.log(data2);

        let token = localStorage.getItem("token");
        let config = {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        axios
          .put("accounts/" + this.$route.params.iban, data2, config)
          .then((response) => {
            console.log(response);
            this.$router.replace("/accounts");
          })
          .catch((error) => {
            console.log(error);
            this.errMsg = "please fill in all the fields.";
          });
      }
    },
  },
};
</script>
