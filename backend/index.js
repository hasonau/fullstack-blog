import 'dotenv/config'; // if using ES modules
import { app } from './app.js';
import { connectDB } from './lib/connectDB.js';



const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    server.on("error", (err) => {
        console.error("The server after db connection had a problem : ", err);
    });
}).catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
});