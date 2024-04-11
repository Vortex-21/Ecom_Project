require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listings.js");
const customerRouter = require("./routes/customers.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Customer = require("./models/customers.js");
const wrapAsync = require("./utils/wrapAsync.js");
const { isLoggedIn } = require("./middleware.js");
const Order = require("./models/orders.js");
const Listing=require("./models/listings.js");
const multer = require("multer")


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionOptions = {
  secret: "mytopsecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 3600 * 1000,
    httpOnly: true,
  },
};


 



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Customer.authenticate()));

passport.serializeUser(Customer.serializeUser());
passport.deserializeUser(Customer.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.failureMsg = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Test user authentication/password saves
// app.get("/demoUser", async (req, res) => {
//   let testUser = new Customer({
//     email: "abc@gmail.com",
//     username: "Administrator",
//     isAdmin: true,
//     phoneNumber: "9362343270",
//   });
//   let result = await Customer.register(testUser, process.env.ADMINPASS);
//   res.send(result);
// });

app.use("/listings", listingRouter);
app.use("/customers", customerRouter);


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//Error Handler
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went Wrong!" } = err;
  res.status(status).render("listings/error.ejs", { message });
  // res.status(status).send(message);
});

app.listen(3000, (req, res) => {
  console.log("Listening at port 3000");
});
