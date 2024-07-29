import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken:{
        type: String,
        default: null
    },
    resetPasswordExpires: {
         type: Date 
    }
})

export const UserModel = new mongoose.model('Users', UserSchema)