const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
        lowercase: true,
        minLength: 3
    },
    email: {
        type: String,
        unique: true,
        require: true,
        trim: true,
        lowercase: true,
        minLength: 3
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    enrolledStudents: [{
        std_enroll : {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
});


teacherSchema.virtual("students", {
    ref: "Student",
    localField: "_id",
    foreignField: "belongsTo.belong"
});

teacherSchema.methods.generateAuthToken = async function(){
    const teacher = this;
    const token = jwt.sign({ _id: teacher._id.toString() }, "HiShapatar");
    teacher.tokens = teacher.tokens.concat({ token });
    await teacher.save();
    return token;
}

teacherSchema.statics.findByCredentials = async (email, password) => {
    const teacher = await Teacher.findOne({ email });
    if(!teacher) throw new Error("Email is invalid");
    const isMatch = await bcrypt.compare(password, teacher.password);
    if(!isMatch) throw new Error("Credentials does not match");
    return teacher;
}


teacherSchema.methods.toJSON = function(){
    const teacher = this;
    const teacherObject = teacher.toObject();
    delete teacherObject.password;
    delete teacherObject.tokens;
    delete teacherObject.enrolledStudents;
    return teacherObject;
}


teacherSchema.pre("save", async function(next){
    const teacher = this;
    if(teacher.isModified("password")){
        teacher.password = await bcrypt.hash(teacher.password, 8);
    }

    // await std.save();
    next();
});


const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;