const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const stdSchema = new mongoose.Schema({
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
    belongsTo: [{
        belong: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
});

stdSchema.virtual("teacher", {
    ref: "Teacher",
    localField: "belongsTo",
    foreignField: "_id"
});

stdSchema.methods.generateAuthToken = async function(){
    const std = this;
    const token = jwt.sign({ _id: std._id.toString() }, "HiShapatar");
    std.tokens = std.tokens.concat({ token });
    await std.save();
    return token;
}

stdSchema.statics.findByCredentials = async (email, password) => {
    const std = await Student.findOne({ email });
    if(!std) throw new Error("Email is invalid");
    const isMatch = await bcrypt.compare(password, std.password);
    if(!isMatch) throw new Error("Credentials does not match");
    return std;
}


stdSchema.methods.toJSON = function(){
    const std = this;
    const stdObject = std.toObject();
    delete stdObject.password;
    delete stdObject.tokens;
    return stdObject;
}


stdSchema.pre("save", async function(next){
    const std = this;
    if(std.isModified("password")){
        std.password = await bcrypt.hash(std.password, 8);
    }

    // await std.save();
    next();
});


const Student = mongoose.model("Student", stdSchema);

module.exports = Student;