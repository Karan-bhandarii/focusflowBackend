const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const User = require("../models/User");

// ========================================
// GITHUB STRATEGY
// ========================================

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,

      clientSecret: process.env.GITHUB_CLIENT_SECRET,

      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:5001/api/auth/github/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("=================================");
        console.log("GITHUB AUTHENTICATION");
        console.log("GitHub ID:", profile.id);
        console.log("Username:", profile.username);
        console.log("=================================");

        // ========================================
        // GET EMAIL
        // ========================================

        let email = null;

        if (profile.emails && profile.emails.length > 0) {
          const primaryEmail =
            profile.emails.find((item) => item.primary) || profile.emails[0];

          email = primaryEmail.value;
        }

        if (!email) {
          return done(null, false, {
            message:
              "Unable to get email from GitHub. Please make your GitHub email public.",
          });
        }

        email = email.toLowerCase().trim();

        // ========================================
        // CHECK GITHUB ACCOUNT
        // ========================================

        let user = await User.findOne({
          githubId: profile.id,
        });

        if (user) {
          console.log("Existing GitHub user found");

          return done(null, user);
        }

        // ========================================
        // CHECK EMAIL
        // ========================================

        user = await User.findOne({
          email,
        });

        // ========================================
        // EXISTING NORMAL ACCOUNT
        // ========================================

        if (user) {
          console.log("Existing email account found");

          user.githubId = profile.id;

          await user.save();

          console.log("GitHub account linked successfully");

          return done(null, user);
        }

        // ========================================
        // CREATE NEW USER
        // ========================================

        user = await User.create({
          name: profile.displayName || profile.username || "FocusFlow User",

          email,

          githubId: profile.id,

          password: undefined,
        });

        console.log("New GitHub user created");

        return done(null, user);
      } catch (error) {
        console.error("GITHUB PASSPORT ERROR:", error);

        return done(error, null);
      }
    },
  ),
);

// ========================================
// SERIALIZE USER
// ========================================

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ========================================
// DESERIALIZE USER
// ========================================

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
