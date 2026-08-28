import { model, Schema } from "mongoose";

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    refreshToken: {
        type: String,
        required: false
    }
}, { timestamps: true })

const users = model("user", User)

export default users;