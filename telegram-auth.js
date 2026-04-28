// telegram-auth.js

const express = require('express');
const session = require('express-session');
const TelegramStrategy = require('passport-telegram-official').Strategy;
const passport = require('passport');

const app = express();

// Set up express-session
app.use(session({
    secret: 'your-session-secret', // Change this to a secure secret
    resave: false,
    saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Telegram authentication strategy
passport.use(new TelegramStrategy({
    botId: 'YOUR_TELEGRAM_BOT_ID',
    // Use your Telegram bot's ID here
    domain: 'YOUR_DOMAIN', // Your domain (like example.com)
    // Specify your domain URL here
    callbackURL: '/auth/telegram/callback',
    passReqToCallback: true
}, (req, profile, done) => {
    // Here you can handle user authentication, store user data in your database, etc.
    return done(null, profile);
}));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes
app.get('/auth/telegram', passport.authenticate('telegram')); 

app.get('/auth/telegram/callback', 
    passport.authenticate('telegram', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/');
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
