const router = require("express").Router();
const Student = require("../models/student");
const stdAuth = require("../middleware/student");


router.get("/students/me", stdAuth, (req, res) => {
    res.status(200).send({ student: req.student, token: req.token });
}, (error, req, res, next) => {
    if(error) res.status(400).send({ error });
});


router.post("/students", async (req, res) => {
    try {
        const student = new Student(req.body);
        const token = await student.generateAuthToken();
        await student.save();
        res.status(201).send({ student, token });
    } catch (error) {
        if( error.keyPattern && error.keyPattern.email && error.keyPattern.email >= 1 
            || error.keyValue && error.keyValue.email
        ){
            error.message = "Email Already exist";
        }
        res.status(500).send({ error: error.message });
    }
});

router.delete("/students/me", stdAuth, async (req, res) => {
    try {
        await req.student.delete();
        res.status(200).send({ message: "Student deata has been deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
}, (error, req, res, next) => {
    if(error) {
        res.status(401).send(error);
    }
});


router.post("/students/login", async (req, res) => {
    try {
        const std = await Student.findByCredentials(req.body.email, req.body.password);
        // if(!std) throw new Error("Invalid Credentials")
        const token = await std.generateAuthToken();
        res.status(200).send({ student: std, token });
    } catch (error) {
        res.status(404).send({ error: "Invalid Credentials" });
    }
});

router.get("/students/logout", stdAuth, async (req, res) => {
    try {
        req.student.tokens = req.student.tokens.filter(token => req.stdToken != token.token);
        await req.student.save();
        res.send({ message: "Successfully Logout" });
    } catch (error) {
        res.status(401).send({ error: "Unauthorized" });
    }
});

router.get("/students/logoutAll", stdAuth, async (req, res) => {
    try {
        req.student.tokens = [];
        await req.student.save();
        res.send({ message: "Successfully Logout from All Devices" });
    } catch (error) {
        res.status(401).send({ error: "Unauthorized" });
    }
});

router.post("/students/addTeacher", stdAuth, async (req, res) => {
    try {
        const belong = req.body.id;
        const isAlreadyEnrolled = req.student.belongsTo.every(b => b.belong === belong);
        if(!isAlreadyEnrolled){
            return res.status(400).send({ message: "Already Enrolled with this teacher" });
        }
        req.student.belongsTo = req.student.belongsTo.concat({ belong });
        await req.student.save();
        res.send({ message: "Successfully Enrolled with this teacher" });
    } catch (error) {
        res.status(401).send({ error: "Unauthorized" });
    }
});

router.post("/students/removeTeacher", stdAuth, async (req, res) => {
    try {
        const belong = req.body.id;
        req.student.belongsTo = req.student.belongsTo.filter(teacherId => teacherId.belong != belong);
        await req.student.save();
        res.send({ message: "Unenrolled" });
    } catch (error) {
        res.status(401).send({ error: "Unauthorized" });
    }
});

module.exports = router;