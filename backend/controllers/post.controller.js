import { use } from 'react';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import ImageKit from "imagekit";
const getPosts = async (req, res) => {
    const posts = await Post.find();
    res.status(200).json(posts);
}
const getPost = async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug });
    res.status(200).json(post);
}
export const createPost = async (req, res) => {
    try {
        const { userId: clerkUserId } = req.auth;

        if (!clerkUserId) {
            return res.status(401).json("Not authenticated!");
        }

        const user = await User.findOne({ clerkUserID: clerkUserId });

        if (!user) {
            return res.status(404).json("User not found!");
        }

        let baseSlug = req.body.title.replace(/ /g, "-").toLowerCase();
        let slug = baseSlug;
        let existingPost = await Post.findOne({ slug });
        let suffix = 2;

        while (existingPost) {
            slug = `${baseSlug}-${suffix}`;
            existingPost = await Post.findOne({ slug });
            suffix++;
        }

        const newPost = new Post({ user: user._id, slug, ...req.body });
        const post = await newPost.save();
        res.status(200).json(post);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: error.message });
    }
};

const imagekit = new ImageKit({
    urlEndpoint: process.env.IK_URL_ENDPOINT,
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY
})
export const uploadAuth = async (req, res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
};


const deletePost = async (req, res) => {
    const { userId: clerkUserId } = req.auth;
    if (!clerkUserId) {
        return res.status(401).json("Not authenticated!");
    }

    const user = await User.findOne({ clerkUserID: clerkUserId }); // Change clerkUserId to clerkUserID
    console.log("User attempting to delete post:", user);
    if (!user) {
        return res.status(404).json("User not found!");
    }

    const post = await Post.findOneAndDelete({ _id: req.params.id, user: user._id });
    if (!post) {
        return res.status(404).json("Post not found or owned by you!");
    }

    res.status(200).json("Post deleted successfully");
};



export { getPosts, getPost, deletePost };