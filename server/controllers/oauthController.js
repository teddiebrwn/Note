import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true, // ✅ Chắc chắn rằng `req` được truyền vào
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            username:
              profile.emails[0].value.split("@")[0] || `user_${Date.now()}`,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 GitHub Profile Data:", profile); // ✅ Log profile để kiểm tra dữ liệu

        let email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`; // ✅ Xử lý email nếu bị thiếu

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          console.log("🚀 Creating new GitHub user...");
          user = new User({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email, // ✅ Sử dụng email mặc định nếu GitHub không cung cấp
            avatar: profile.photos?.[0]?.value || "",
            username: profile.username || `user_${Date.now()}`,
          });

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ GitHub Login Error:", error);
        return done(error, null);
      }
    }
  )
);

// ✅ Callback để chuyển hướng về frontend thay vì trả JSON
export const googleAuthCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(
      "http://localhost:5173/login?error=Authentication Failed"
    );
  }

  const user = req.user;
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  console.log("✅ Google login successful, redirecting...");
  res.redirect(`http://localhost:5173/dashboard?token=${token}`);
};

export const githubAuthCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(
      "http://localhost:5173/login?error=Authentication Failed"
    );
  }

  const user = req.user;
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  console.log("✅ GitHub login successful, redirecting...");
  res.redirect(`http://localhost:5173/dashboard?token=${token}`);
};

// ✅ Cấu hình Passport session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
