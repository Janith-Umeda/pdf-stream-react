require("dotenv").configDotenv({path:"../.env"});
const express = require("express");
const Router = require("./core/Router");
const AnalyticsController = require("./controllers/AnalyticsController");
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}))

Router.use(app);

//Define Routes Here
Router.post('/api/analytics',[AnalyticsController,'index']);

Router.get("*",(req,res)=>{
    res.redirect("https://www.scanned.page");
});

app.set("port",(process.env.PORT || 8082));
app.listen(app.get("port"),()=>{console.log(`Server booted on ${app.get("port")}`)})

module.exports = app;