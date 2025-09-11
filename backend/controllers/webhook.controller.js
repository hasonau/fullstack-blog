import { Webhook } from "svix";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";

export const clerkWebHook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        return res.status(500).json({ message: "Webhook secret not configured" });
    }

    const payload = req.body;  // raw body (buffer/string, not parsed JSON)
    const headers = req.headers;

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;
    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        return res.status(400).json({ message: "Webhook Error: " + err.message });
    }

    // console.log("Received event:", evt.type, evt.data);

    if (evt.type === 'user.created') {
        const newUser = new User({
            clerkuserID: evt.data.id,
            username: evt.data.username || `${evt.data.first_name || ''}${evt.data.last_name || ''}`.trim(),
            email: evt.data.email_addresses[0]?.email_address,
            img: evt.data.profile_image_url,
        });

        await newUser.save();
    }

    if (evt.type === "user.deleted") {
        const deletedUser = await User.findOneAndDelete({
            clerkuserID: evt.data.id,
        });

        await Post.deleteMany({ user: deletedUser._id })
        await Comment.deleteMany({ user: deletedUser._id })
    }

    if (evt.type === "user.updated") {
        const updatedUser = await User.findOne({ clerkuserID: evt.data.id });
        if (updatedUser) {
            updatedUser.username = evt.data.username || updatedUser.username;
            updatedUser.email = evt.data.email_addresses[0]?.email_address || updatedUser.email;
            updatedUser.img = evt.data.profile_image_url || updatedUser.img;
            await updatedUser.save();
        }
    }

    return res.status(200).json({ message: "Webhook received" });
};

