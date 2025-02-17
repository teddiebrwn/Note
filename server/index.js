import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routers/userRoutes.js";
import oauthRoutes from "./routers/oauthRoutes.js";
import session from "express-session";
import passport from "./controllers/oauthController.js";

// configuration
dotenv.config();

const app = express();

//Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Đảm bảo session được gọi trước oauthRoutes
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Gọi routes sau khi cấu hình passport
app.use("/api/users", userRoutes);
app.use("/", oauthRoutes);

//Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connect Server 🟢"))
  .catch((err) => console.log("Failed to connect server", err.message));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
