import Post from '../models/post.model.js';

const getPosts = async (req, res) => {
    const posts = await Post.find();
    res.status(200).json(posts);
}
const getPost = async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug });
    res.status(200).json(post);
}
const createPost = async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json("Post deleted successfully");
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


export { getPosts, getPost, createPost, deletePost };