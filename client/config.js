// config.js
const config = {

  API_URL: import.meta.env.PROD 
    ? "https://quleepassignment.onrender.com/api"  
    : "http://localhost:5000/api"
};

export default config;