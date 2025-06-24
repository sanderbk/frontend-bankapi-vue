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

                <!-- User Status Dropdown - Only visible for employees/admins -->
                <div class="form-group" v-if="isAdmin || isEmployee">
                  <label class="form-control-placeholder" for="userStatus"
                    >Account Status</label
                  >
                  <select
                    id="userStatus"
                    class="form-control"
                    v-model="userStatus"
                    required="required"
                  >
                    <option value="" disabled>Select account status</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="closed">Closed/Rejected</option>
                  </select>
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
      userStatus: null,
      dayLimit: 0.0,
      transLimit: 0.0,
      errorms: "",
      successms: "",
      loading: false,
    };
  },
  mounted() {
    this.searchUser();
  },
  computed: {
    ...mapGetters(["isLoggedIn"]),
    ...mapGetters(["isAdmin"]),
    // Add this computed property if you have an isEmployee getter
    // If not, you can create one in your Vuex store or check user roles differently
    isEmployee() {
      // Replace this with your actual employee check logic
      // For example, you might check if user has EMPLOYEE role
      return this.$store.getters.userRoles?.includes("EMPLOYEE") || this.isAdmin;
    },
  },
  methods: {
    searchUser() {
      console.log(this.username);
      axios
        .get("users/" + this.username)
        .then((res) => {
          this.firstname = res.data.firstname;
          this.lastname = res.data.lastname;
          this.dob = res.data.dob;
          this.address = res.data.address;
          this.email = res.data.email;
          this.phone = res.data.phone;
          this.dayLimit = res.data.dayLimit;
          this.transLimit = res.data.transLimit;
          this.userStatus = res.data.userStatus;

          this.fetchedUser = JSON.stringify(res.data);
          this.errMsg = "";
          console.log(this.fetchedUser);
          console.log("User Status:", this.userStatus);
          this.disable = false;
        })
        .catch((error) => {
          this.errMsg = "User not found";
          console.log("gaat niet goed");
          console.log(error);
        });
    },

    getStatusText(status) {
      switch (status) {
        case "PENDING":
          return "Pending Approval";
        case "APPROVED":
          return "Approved";
        case "CLOSED":
          return "Closed/Rejected";
        default:
          return "Unknown";
      }
    },

    getStatusClass(status) {
      switch (status) {
        case "PENDING":
          return "text-warning";
        case "APPROVED":
          return "text-success";
        case "CLOSED":
          return "text-danger";
        default:
          return "text-muted";
      }
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
      this.loading = true;
      let config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      const dayParsed = parseFloat(this.dayLimit);
      const transParsed = parseFloat(this.transLimit);

      console.log("Day limit:", dayParsed);
      console.log("Trans limit:", transParsed);
      console.log("User Status:", this.userStatus);

      if (isNaN(dayParsed) || isNaN(transParsed)) {
        this.errorms = "Please provide valid numeric values for limits.";
        this.loading = false;
        return;
      }

      // Build the update data object
      let updateData = {
        dayLimit: dayParsed,
        transLimit: transParsed,
      };

      // Add userStatus to update data if user is admin/employee and status is selected
      if ((this.isAdmin || this.isEmployee) && this.userStatus) {
        updateData.userStatus = this.userStatus;
      }

      let putData = JSON.stringify(updateData);
      console.log("Update data:", putData);

      axios
        .put(`/users/${this.username}`, putData, config)
        .then((response) => {
          this.loading = false;
          this.successms = "User updated successfully!";
          setTimeout(() => {
            this.$router.replace("/home");
          }, 1500);
          console.log(response);
        })
        .catch((error) => {
          this.errorms = error.response?.data?.reason || "Failed to update user";
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

.text-warning {
  color: #ffc107 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.form-text {
  margin-top: 0.25rem;
  font-size: 0.875em;
}
</style>
