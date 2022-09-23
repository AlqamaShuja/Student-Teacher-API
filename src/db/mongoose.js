const mongoose = require("mongoose");
const dbURL = "mongodb://127.0.0.1:27017/std-teacher-multiple-con"
mongoose.connect(dbURL, () => {
    console.log("Database successfully Connected.!");
});