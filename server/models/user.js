import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    avatar: { type: String, default: "" }, // URL ảnh đại diện (nếu có)
    bio: { type: String, default: "" }, // Thông tin giới thiệu ngắn
    role: { type: String, enum: ["user", "admin"], default: "user" }, // Mặc định là "user"
    isVerified: { type: Boolean, default: false },
    otpCode: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
