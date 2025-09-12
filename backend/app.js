import express from 'express';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import commentRouter from './routes/comment.route.js';
import { webhookRouter } from "./routes/webhook.route.js";
// import { clerkMiddleware } from "@clerk/express";

const app = express();
// app.use(clerkMiddleware());
app.use('/api/webhooks', webhookRouter);
app.use(express.json());

// app.get("/auth-state", (req, res) => {
//     const { userId } = req.auth;
//     if (!userId) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }
//     res.status(200).json({ userId });
// });

// app.get("/protect", (req, res) => {
//     const { userId } = req.auth;
//     if (!userId) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }
//     res.status(200).json({ userId });
// });

app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);


app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message || "Something went wrong",
        status: err.status || 500,
        stack: err.stack || "No stack trace"
    });
});


export { app };
