const router = require("express").Router();
const Teacher = require("../models/teacher");
const teacherAuth = require("../middleware/teacher");


router.get("/teachers/me", teacherAuth, (req, res) => {
    res.status(200).send({ teacher: req.teacher, token: req.token });
}, (error, req, res, next) => {
    if(error) res.status(400).send({ error });
});

router.get("/teachers/me/students", teacherAuth, async (req, res) => {
    await req.teacher.populate({
        path: "students.belongsTo",
        // populate: {
        //     path: "belong",
        //     model: "Teacher"
        // }
    })
    res.status(200).send(req.teacher.students);
});


router.post("/teachers", async (req, res) => {
    try {
        const teacher = new Teacher(req.body);
        const token = await teacher.generateAuthToken();
        await teacher.save();
        res.status(201).send({ teacher, token });
    } catch (error) {
        if( error.keyPattern && error.keyPattern.email && error.keyPattern.email >= 1 
                || error.keyValue && error.keyValue.email)
        {
            error.message = "Email Already exist";
        }
        res.status(500).send({ error: error.message });
    }
});

router.post("/teachers/login", async (req, res) => {
    try {
        const teacher = await Teacher.findByCredentials(req.body.email, req.body.password);
        const token = await teacher.generateAuthToken();
        res.status(200).send({ teacher: teacher, token });
    } catch (error) {
        res.status(404).send({ error });
    }
});

router.delete("/teachers/me", teacherAuth, async (req, res) => {
    try {
        await req.teacher.delete();
        res.status(200).send({ message: "Teacher data has been successfully deleted" });
    } catch (error) {
        res.status(500).send(error);
    }
}, (error, req, res, next) => {
    if(error) {
        res.status(401).send(error);
    }
});



module.exports = router;