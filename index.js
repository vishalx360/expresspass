if (process.env.NODE_ENV !== 'production') {
    // - Checks if environment is profuction or development.
    require('dotenv').config()
}

const express = require("express");
const morgan = require("morgan");
const bcrypt = require("bcrypt")
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')


// VARIABLES
const PORT = process.env.PORT || 8080

// INITIALIZATION
const app = express();
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
const users = []


// MIDDLEWARES
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))




// ROUTES //

// HOMEPAGE-ROUTES 
app.get("/", checkAuth, (req, res) => {
    res.render("index", { name: req.user.name })
})

// LOGIN-ROUTES //
app.get("/login", checkNotAuth, (req, res) => {
    res.render("login")
})
app.post("/login", checkNotAuth, passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// REGISTER-ROUTES //
app.get("/register", checkNotAuth, (req, res) => {
    res.render("register")
})
app.post("/register", checkNotAuth, async(req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect("/login")
    } catch {
        res.redirect("/register")
    }
    console.log(users)
})

// LOG-OUT-ROUTES
app.delete("/logout", (req, res) => {
    req.logOut()
    res.redirect("/login")
})

// AUTH-MIDDLEWARE-FUNCTIONS //

// - Checks if a Client is Authenticated.
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

// - Checks if a Client is Un-Authenticated.
function checkNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    return next()
}


// LISTEN EVENT
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`)
})