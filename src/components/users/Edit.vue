<template :v-if="isLoggedIn">
  <section class="ftco-section">
    <div class="container h-100">
      <div class="row vh-100 justify-content-center">
        <div class="col-md-7 col-lg-5">
          <div class="wrap text-center">
            <div class="text-muted login-wrap p-2 p-md-2">
              <div class="d-flex">
                <div class="w-100">
                  <h3 class="mb-4">Edit a user limit</h3>
                </div>
              </div>
              <form @submit="checkForm" v-on:submit.prevent="updateUser">
                <div class="form-group mt-3">
                  <label class="form-control-placeholder" for="username">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    required="required"
                    v-model="username"
                    disabled
                  />
                </div>
                <div class="form-group">
                  <label class="form-control-placeholder" for="firstname" disabled
                    >Firstname</label
                  >
                  <input
                    disabled
                    type="text"
                    class="form-control"
                    v-model="firstname"
                    required="required"
                  />
                </div>
                <div class="form-group">
                  <label class="form-control-placeholder" for="lastname" disabled
                    >Lastname</label
                  >
                  <input
                    disabled
                    type="text"
                    class="form-control"
                    v-model="lastname"
                    required="required"
                  />
                </div>
                <div class="form-group">
                  <label class="form-control-placeholder" for="daylimit">Daylimit</label>
                  <input
                    @keypress="isNumber($event)"
                    type="text"
                    class="form-control"
                    v-model="dayLimit"
                    required="required"
                  />
                </div>
                <div class="form-group">
                  <label class="form-control-placeholder" for="translimit"
                    >Transaction limit</label
                  >
                  <input
                    @keypress="isNumber($event)"
                    type="text"
                    class="form-control"
                    v-model="transLimit"
                    required="required"
                  />
                </div>

                <div class="text-center mt-4 form-group">
                  <button
                    style=""
                    type="submit"
                    class="btn w-100 text-center submit vue-butt btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="!loading">Update user 🔄</span>
                    <span v-else><i class="fa fa-spinner fa-spin"></i> Updating...</span>
                  </button>
                  <span> </span>
                  <span :v-if="errorms" class="w-100 text-danger">{{ errorms }}</span>
                  <span :v-if="successms" class="w-100 text-success">{{
                    successms
                  }}</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "../../axios-auth";
import { mapGetters } from "vuex";

export default {
  name: "Register",
  data() {
    return {
      username: this.$route.query.username || "",
      password: null,
      firstname: null,
      lastname: null,
      dob: null,
      address: null,
      email: null,
      phone: null,
      registeredOn: null,
      active: true,
      dayLimit: 0.0,
      transLimit: 0.0,
      errorms: "",
      successms: "",
      loading: false, // Add loading state
    };
  },
  mounted() {
    this.searchUser();
  },
  computed: {
    ...mapGetters(["isLoggedIn"]),
    ...mapGetters(["isAdmin"]),
  },
  methods: {
    searchUser() {
      console.log(this.username);
      axios
        .get("users/getByUserName/" + this.username)
        .then((res) => {
          this.firstname = res.data.firstname;
          this.lastname = res.data.lastname;
          this.dob = res.data.dob;
          this.address = res.data.address;
          this.email = res.data.email;
          this.phone = res.data.phone;
          this.dayLimit = res.data.dayLimit;
          this.transLimit = res.data.transLimit;

          this.fetchedUser = JSON.stringify(res.data);
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
    isNumber: function (evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;

      // Allow digits (0-9), decimal point (.), and hyphen (-)
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46 &&
        charCode !== 45
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    updateUser() {
      this.loading = true; // Set loading to true
      let config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      const dayParsed = parseFloat(this.dayLimit);
      const transParsed = parseFloat(this.transLimit);

      console.log(dayParsed);
      console.log(transParsed);

      if (dayParsed == null || transParsed == null) {
        this.errorms = "no good values provided.";
        return;
      }

      let putData = JSON.stringify({
        dayLimit: dayParsed,
        transLimit: transParsed,
      });

      console.log("data: " + putData);

      axios
        .put(`/users/${this.username}`, putData, config)
        .then((response) => {
          this.loading = false;
          this.$router.replace("/home");
          console.log(response);
        })
        .catch((error) => {
          this.errorms = error.response.data.reason;
          this.loading = false;
          console.log(error);
        });
    },
  },
};
</script>

<style scoped>
.vue-butt {
  display: inline-block;
}
.vh-100 {
  height: 100vh;
}

body {
  background-color: #eeeeee;
}

.ftco-section {
  height: 100%;
  background: radial-gradient(circle, rgb(238, 238, 238) 0%, rgb(233, 233, 233));
}
</style>
