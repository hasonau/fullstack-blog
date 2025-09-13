import { use } from 'react';
import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import ImageKit from "imagekit";

export const getPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    const query = {};

    console.log(req.query);

    const cat = req.query.cat;
    const author = req.query.author;
    const searchQuery = req.query.search;
    const sortQuery = req.query.sort;
    const featured = req.query.featured;

    if (cat) {
        query.category = cat;
    }

    if (searchQuery) {
        query.title = { $regex: searchQuery, $options: "i" };
    }

    if (author) {
        const user = await User.findOne({ username: author }).select("_id");

        if (!user) {
            return res.status(404).json("No post found!");
        }

        query.user = user._id;
    }

    let sortObj = { createdAt: -1 };

    if (sortQuery) {
        switch (sortQuery) {
            case "newest":
                sortObj = { createdAt: -1 };
                break;
            case "oldest":
                sortObj = { createdAt: 1 };
                break;
            case "popular":
                sortObj = { visit: -1 };
                break;
            case "trending":
                sortObj = { visit: -1 };
                query.createdAt = {
                    $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                };
                break;
            default:
                break;
        }
    }

    if (featured) {
        query.isFeatured = true;
    }

    const posts = await Post.find(query)
        .populate("user", "username")
        .sort(sortObj)
        .limit(limit)
        .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments();
    const hasMore = page * limit < totalPosts;

    res.status(200).json({ posts, hasMore });
};

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



export { getPost, deletePost };