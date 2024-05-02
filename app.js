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
const Listing = require("./models/listings.js");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const JWT_SECRET = "mytopultrasuperkabhinahitootnevaalasupersecretkey";
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

app.get("/forgotPassword", (req, res) => {
  // res.send("Working!");
  res.render("users/forgotPassword");
});

app.post(
  "/forgotPassword",
  wrapAsync(async (req, res) => {
    let { email } = req.body;
    let user = await Customer.find({ email: email }).select("+hash");
    if (user) {
      // res.send(user);
      const secret = JWT_SECRET + user[0].hash.slice(-20);
      const payload = {
        email: user[0].email,
        id: user[0]._id,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "10m" });
      const link = `http://localhost:3000/reset-password/${user[0]._id}/${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "anshumanlaskar1@gmail.com",
          pass: process.env.APP_PASS
        },
      });

      const mailOptions = {
        from: {
          name: "XYZ",
          address: "anshumanlaskar1@gmail.com",
        },
        to: "anshumanlaskar2@gmail.com", //test
        subject: "Password Reset!!!",
        text: `Go to the following link(**VALID FOR 10 MINUTES ONLY**): ${link}`,
      };

      const sendMail = async (transporter, mailOptions) => {
        try {
          await transporter.sendMail(mailOptions);
        } catch (error) {
          console.log(error);
        }
      };

      sendMail(transporter, mailOptions);
      console.log("Email sent!");
      res.send(
        "<h1>An Email has been sent to your registered email account for password reset!</h1>"
      );
    } else {
      res.send("Not Found!");
    }
  })
);

app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  // res.send(req.params);

  let user = await Customer.findById(id).select("+hash");
  let email = user.email;
  let cust = {email:email,id:id,token:token};

  if (user) {
    // res.send(user);
    const secret = JWT_SECRET + user.hash.slice(-20);
    try 
    {
      const payload = jwt.verify( token,secret);
      res.render("users/resetPassword.ejs",{cust})
    } 
    catch (error) 
    {
      throw new ExpressError(500, error.message);
    }
  } else {
    res.send("Invalid User!");
  }
});


app.post("/reset-password/:id/:token",async(req,res)=>{
  const { id, token } = req.params;
  // res.send(req.params);

  let user = await Customer.findById(id).select("+hash");
  let email = user.email;
  let cust = {email:email,id:id,token:token};

  if (user) {
    // res.send(user);
    const secret = JWT_SECRET + user.hash.slice(-20);
    try 
    {
      const payload = jwt.verify( token,secret);
      // res.render("users/resetPassword.ejs",{cust})
      // res.send(cust);
      const {pass1,pass2} = req.body;
      if(pass1){
        user.setPassword(pass1,async()=>{
          await user.save();
          req.flash("success","Password updated successfully!");
          res.redirect("/customers/login");
        })
      }
      else{
        res.send("No password Given!");
      }
    } 
    catch (error) 
    {
      throw new ExpressError(500, error.message);
    }
  } else {
    res.send("Invalid User!");
  }
})

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
