// config.js
const config = {

  API_URL: import.meta.env.PROD 
    ? "/api"  
    : "http://localhost:5000/api"
};

export default config;