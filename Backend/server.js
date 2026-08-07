const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require("dotenv").config() // ✅ Sabse pehle yeh

const app = require("./src/app")
const connectToDB = require("./src/config/database")
const PORT = process.env.PORT || 3000;

connectToDB()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
