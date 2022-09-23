const jwt = require("jsonwebtoken");
const Teacher = require("../models/teacher");

const teacherAuth = async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "HiShapatar");
    const teacher = await Teacher.findOne({ _id: decoded._id, token });
    if(!teacher){
        return res.status(401).send({error: "Authentication Error"});
    }
    req.teacher = teacher;
    req.teacherToken = token;
    next();
}



module.exports = teacherAuth;