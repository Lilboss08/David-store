import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        // required:[true, "full name is required"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "email is required"],
        lowercase: true,
        trim: true,
    },


    password: {
        type: String,
        required: [true, "password is required"],
        minLength: [8, "password must be at least 8 characters"],
    },
    confirmPassword: {
        type: String,
        required: [true, "confirm password is required"],
        minLength: [8, "confirm password must be at least 8 characters"],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: "password did not match",
        },
    },
    // store the latest JWT (optional)
    token: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
    },
    verificationTokenExpires: {
        type: Date,
    },

    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    state: {
        type: String,
        default: ''
    },
    lga: {
        type: String,
        default: ''
    }
});

// hashing the password before saving to the database
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
});
userSchema.methods.protectedRoute =(role)=>{ 
    try{
    if (this.role === role) {
        return;
}
    } catch (err) {
        return err;
    }
};

userSchema.methods.comparePassword = async function(enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};


export const User = mongoose.model('User', userSchema)