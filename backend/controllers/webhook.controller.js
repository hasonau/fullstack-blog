import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ message: "Webhook secret not configured" });
  }

  const payload = req.body;  // raw body (buffer/string)
  const headers = req.headers;

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = wh.verify(payload, headers);
  } catch (err) {
    return res.status(400).json({ message: "Webhook Error: " + err.message });
  }

  console.log("Received event:", evt.data);

  if (evt.type === 'user.created') {
    try {
      const clerkID = evt.data.id;
      const username = evt.data.username || `${evt.data.first_name || ''}${evt.data.last_name || ''}`.trim() || `user_${Date.now()}`;
      const email = evt.data.email_addresses?.[0]?.email_address || `no-email-${Date.now()}@example.com`;
      const img = evt.data.profile_image_url || "";

      const newUser = new User({
        clerkUserId: clerkID, // matches schema now
        username,
        email,
        img
      });

      await newUser.save();
      console.log("New user saved:", newUser._id);
    } catch (err) {
      console.error("Error saving new user:", err);
    }
  }

  if (evt.type === "user.deleted") {
    try {
      const deletedUser = await User.findOneAndDelete({ clerkUserId: evt.data.id });
      if (deletedUser) {
        await Post.deleteMany({ user: deletedUser._id });
        await Comment.deleteMany({ user: deletedUser._id });
      }
    } catch (err) {
      console.error("Error deleting user/posts/comments:", err);
    }
  }

  if (evt.type === "user.updated") {
    try {
      const updatedUser = await User.findOne({ clerkUserId: evt.data.id });
      if (updatedUser) {
        updatedUser.username = evt.data.username || updatedUser.username;
        updatedUser.email = evt.data.email_addresses[0]?.email_address || updatedUser.email;
        updatedUser.img = evt.data.profile_image_url || updatedUser.img;
        await updatedUser.save();
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  }

  return res.status(200).json({ message: "Webhook received" });
};
