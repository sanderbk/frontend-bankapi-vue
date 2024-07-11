import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import store from './store/store'

//Users
import Login from './components/users/Login.vue';
import Register from './components/users/Register.vue';
import Users from './components/users/Users.vue';
import UsersAll from './components/users/UsersAll.vue';
import Edit from './components/users/Edit.vue';

import HomePage from './components/HomePage.vue';
//Accounts
import Index from './components/accounts/Index.vue';
import AddAccount from './components/accounts/AddAccount.vue';
import EditAccount from './components/accounts/EditAccount.vue';

//Transactions
import Deposit from './components/transactions/Deposit.vue';
import Withdraw from './components/transactions/Withdraw.vue';
import MakeTrans from './components/transactions/MakeTrans.vue';
import Transactions from "@/components/transactions/Transactions.vue";
import AllTransactions from "@/components/transactions/AllTransactions.vue";

//Stylesheer
import '../src/assets/css/main.css'

const routes = [

    //user routes
    { path: '/', component: Login },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/users', component: Users },
    { path: '/usersall', component: UsersAll },
    { path: '/home', component: HomePage },
    { path: '/edituser', component: Edit },

    //account routes
    { path: '/accounts', component: Index },
    { path: '/addaccount', component: AddAccount },    
    {
        path: '/editaccount/:iban',
        name: 'EditAccount',
        component: EditAccount
    },


    //transaction routes
    { path: '/deposit', component: Deposit },
    { path: '/withdraw', component: Withdraw },
    { path: '/transaction', component: MakeTrans },
    { path: '/transactions', component: Transactions },
    { path: '/transactions/employee', component: AllTransactions },


];


const router = createRouter({
    "history": createWebHistory(),
    routes
})

import {Tabs, Tab} from 'vue3-tabs-component';
import VueAwesomePaginate from "vue-awesome-paginate";

// import the necessary css file

import "vue-awesome-paginate/dist/style.css";

const app = createApp(App).use(VueAwesomePaginate).component('tabs', Tabs).component('tab', Tab);

app.use(router);
app.use(store);
app.mount('#app');
