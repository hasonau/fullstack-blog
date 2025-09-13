import express from 'express';
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
import commentRouter from './routes/comment.route.js';
import { webhookRouter } from "./routes/webhook.route.js";
import { clerkMiddleware } from "@clerk/express";
import cors from 'cors';


const app = express();
app.use(cors(process.env.CLIENT_URL || 'http://localhost:5173'));
app.use('/api/webhooks', webhookRouter);
app.use(express.json());
app.use(clerkMiddleware());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

//#region Testing Clerk Auth

// without requireAuth(); need to check for req.auth

// app.get("/auth-state", (req, res) => {
//     const { userId } = req.auth;
//     if (!userId) {
//         return res.status(401).json({ message: "Unauthorized" });
//     }
//     res.status(200).json({ userId });
// });


// with requireAuth(); no need to check for req.auth ,it will always be there

// app.get("/auth-state", requireAuth(), (req, res) => {
//     const { userId } = req.auth;
//     res.status(200).json({ userId });
// });

//#endregion

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
