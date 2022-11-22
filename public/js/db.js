const mongoose = require("mongoose");
var url = "mongodb://localhost:27017/";

mongoose.connect(url, function(err, db) {
    if (err) throw err;
    console.log("DB connected!");

});