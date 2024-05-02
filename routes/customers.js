const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const Customer = require("../models/customers.js");
const Order=require("../models/orders.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");


//show orders
router.get("/:id/orders",isLoggedIn, async(req,res)=>{
  let {id}=req.params;

  let customer = await Customer.findById(id);
  let orderIds = customer.orders;
  // console.log(orderIds);
  let orders = await Order.find({
    _id:{
      $in:orderIds
    }
  }).populate("productId");
  // res.send(orders);
  // console.log(orders);
  res.render("users/orders.ejs",{orders});
})

//Update customer Details route
router.post("/:id/update", isLoggedIn, async (req, res) => {
  let { id } = req.params;
  let details = req.body;
  let { username } = req.body;
  let existing_username = await Customer.find({ username: username });
  // console.log(existing_username);
  if (existing_username && existing_username.length) {
    req.flash("error", "Username already taken.");
    res.redirect(`/customers/${id}/update`);
  } else {
    let user = await Customer.findByIdAndUpdate(id, {
      ...details,
    });
    // console.log(user);
    req.login(user,(err)=>{
      if(err){
        next(err);
      }
      req.flash("success","Details updated successfully! Please log in to your account.");
      res.redirect("/customers/login");
      
    });
  }
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
      let newCustomer = new Customer({
        username: username,
        email: email,
        phoneNumber: phn,
      });
      newCustomer.addresses.push(address);
      let registeredCustomer = await Customer.register(newCustomer, password);
      // console.log(registeredCustomer);
      req.login(registeredCustomer, (err) => {
        if (err) {
          next(err);
        }
        req.flash("success", "Welcome!");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/customers/signUp");
    }
  })
);

router.get("/signUp", (req, res) => {
  res.render("users/signUp.ejs");
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
    res.redirect(res.locals.toRedirect || '/listings');
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
