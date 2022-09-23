const jwt = require("jsonwebtoken");
const Student = require("../models/student");

const stdAuth = async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "HiShapatar");
    const std = await Student.findOne({ _id: decoded._id, token });
    if(!std){
        return res.status(401).send({error: "Authentication Error"});
    }
    req.student = std;
    req.stdToken = token;
    next();
}



module.exports = stdAuth;