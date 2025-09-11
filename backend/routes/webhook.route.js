import express from "express";
import { clerkWebHook } from "../controllers/webhook.controller.js"
import bodyParser from "body-parser";


const webhookRouter = express.Router();
webhookRouter.post("/clerk", bodyParser.raw({ type: 'application/json' }), clerkWebHook);
export { webhookRouter };