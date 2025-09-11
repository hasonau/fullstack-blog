import { Schema } from "mongoose";
import mongoose from "mongoose";


const userSchema = new Schema(
    {
        clerkuserID: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        img: { type: String, default: "" },
        savedPosts: {
            type: [String],
            default: [],
        }
    }, {
    timestamps: true
}
);


const User = mongoose.model("User", userSchema);
export default User;