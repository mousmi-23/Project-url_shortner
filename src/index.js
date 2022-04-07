const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route/route.js");
const router = express.Router();
const { default : mongoose } = require("mongoose")
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));

mongoose.connect("mongodb+srv://Mousmi23:dUdaV8w8MnmYpHwY@cluster0.mkiuo.mongodb.net/group47Database?retryWrites=true&w=majority", {
    useNewUrlParser : true
})
.then( () => console.log("MongoDB is Connected!"))
.catch( err => console.log(err) )


app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log('Express app running on port' + (process.env.PORT || 3000))
})
