import axios from 'axios';

const instance = axios.create({
    baseURL: "https://backend-springboot-ykvy.onrender.com/BankAPI/"
});

export default instance;