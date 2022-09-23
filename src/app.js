require("./db/mongoose");
const express = require("express");


// Routers
const teacher = require("./router/teacher");
const student = require("./router/student");

const app = express();

// Middleware
app.use(express.json());


// Routers Middleware Setup
app.use(teacher);
app.use(student);



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server is running on port " + port);
});