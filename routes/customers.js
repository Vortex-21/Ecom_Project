const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const Customer = require("../models/customers.js");
const Order = require("../models/orders.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const e = require("connect-flash");
const { generateOTP, sendEmailOTP, sendSMSOTP } = require("../utils/otp.js");
const {
  RegulatoryComplianceListInstance,
} = require("twilio/lib/rest/numbers/v2/regulatoryCompliance.js");

//show orders
router.get("/:id/orders", isLoggedIn, async (req, res) => {
  let { id } = req.params;

  let customer = await Customer.findById(id);
  let orderIds = customer.orders;
  // console.log(orderIds);
  let orders = await Order.find({
    _id: {
      $in: orderIds,
    },
  }).populate("productId");
  // res.send(orders);
  // console.log(orders);
  res.render("users/orders.ejs", { orders });
});

//Update customer Details route
router.post("/:id/update", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  // let details = req.body;
  let { username, phn, email, address } = req.body;
  let existing_username = await Customer.find({ username: username });

  let user = await Customer.findById(id);
  let currUsername = user.username;
  // let currPhn = user.phoneNumber;
  // let addresses = user.addresses;
  // console.log(existing_username);
  //update username
  if (
    existing_username &&
    existing_username.length &&
    username != currUsername
  ) {
    req.flash("error", "Username already taken.");
    res.redirect(`/customers/${id}/update`);
  } else {
    // let user = await Customer.findByIdAndUpdate(id, {
    //   ...details,
    // });
    let user = await Customer.findByIdAndUpdate(id, {
      username: username,
      email: email,
      phoneNumber: phn,
      address: address,
    });
    // console.log(user);
    req.login(user, (err) => {
      if (err) {
        next(err);
      }
      if (username != currUsername) {
        req.flash(
          "success",
          "Details updated successfully! Please log in to your account."
        );
        res.redirect("/customers/login");
      } else {
        req.flash("success", "Details updated successfully!");
        res.redirect("/listings");
      }
    });
  }

  //update phn and email
});

router.get(
  "/:id/update",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    res.render("users/update.ejs");
  })
);

//SignUp Route
router.post(
  "/signUp",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, phn, password, address } = req.body;
      let userExistsEmail = await Customer.find({ email: email });
      let userExistsName = await Customer.find({ username: username });
      if (userExistsEmail.length) {
        // console.log(userExistsEmail);
        req.flash("error", "User with this email already exists!");
        res.redirect("/customers/signUp");
      }
      else if(userExistsName.length){
        req.flash("error", "User with this username already exists!");
        res.redirect("/customers/signUp");
      }
      else {
        let otpEmail = generateOTP();
        let otpPhone = generateOTP();
        req.session.otpEmail = otpEmail;
        req.session.otpPhone = otpPhone;
        req.session.userData = { username, email, phn, password, address };

        //send OTP
        await sendEmailOTP(email,otpEmail);
        await sendSMSOTP(phn, otpPhone);

        res.render("users/verifyOTP.ejs");
      }
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/customers/signUp");
    }
  })
);

router.post(
  "/verifyOTP",
  wrapAsync(async (req, res) => {
    let { otpEmail,otpPhone } = req.body;
    if ((otpEmail === req.session.otpEmail) && (otpPhone === req.session.otpPhone)) {
      let { username, email, phn, password, address } = req.session.userData;
      let newCustomer = new Customer({
        username: username,
        email: email,
        phoneNumber: phn,
        address: address,
      });
      await Customer.register(newCustomer, password);
      req.flash("success", "Account created successfully!");
      res.redirect("/customers/login");
    } else {
      req.flash("error", "Invalid OTP Please try again!");
      res.redirect("/customers/signUp");
    }
  })
);

router.get("/signUp", (req, res) => {
  res.render("users/signUp.ejs");
});

router.get("/verifyOTP", (req, res) => {
  res.render("users/verifyOTP.ejs");
});

//LoginIn Route
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/customers/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Logged In!");
    // console.log(res.locals);
    res.redirect(res.locals.toRedirect || "/listings");
  }
);
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

//Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      req.flash("success", "You're Logged Out!");
      res.redirect("/listings");
    }
  });
});

module.exports = router;
