const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router();
const Listing = require("../models/listings.js");
const {validateListing,isAdministrator,isLoggedIn}=require("../middleware.js");
const Order =require("../models/orders.js");
const Customer = require("../models/customers.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const sendMessage = require("../twilioConfig.js");
const upload = multer({storage});
// const {isAdministrator}=require("../middleware.js");



//All Listings route
router.get(
  "/allProducts",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
    // res.send("All Listings Route");
  })
);





//Create Listing route
router.get("/create", isAdministrator,(req, res) => {
  res.render("listings/new.ejs");
});

router.post(
  "/create",
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(async (req, res) => {
    let {path,filename} = req.file;
    const newListing = new Listing(req.body.listing);
    newListing.image =  path;
    await newListing.save();
    req.flash("success","Product added successfully!");
    res.redirect("/listings/allProducts");
  })
);

//Show Listing Route
router.get(
  "/:id/show",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Requested product is not available.");
      res.redirect("/listings/allProducts");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//Edit Listing Route
router.put(
  "/:id/update",
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(async (req, res) => {
    let newData = req.body.listing;
    console.log(req.body);
    if(req.file)
    {let url = req.file.path;
    newData.image=url;}
    let { id } = req.params;
    await Listing.findByIdAndUpdate(
      id,
      { ...newData },
      { runValidators: true }
    );
    req.flash("success","Product updated successfully!");
    res.redirect(`/listings/${id}/show`);
  })
);

router.get(
  "/:id/edit",
  isAdministrator,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Checkout
router.post(
  "/:customerId/:id/checkout",
  wrapAsync(async (req, res) => {
    let { order } = req.body;
    console.log("before = ",order);
    let { customerId,id } = req.params;
    let newOrder = new Order({ ...order, productId: id });
    console.log("after = ",newOrder);
    let currOrder = await newOrder.save();
    let currCustomer = await Customer.findById(customerId);
    let product=await Listing.findById(id);
    currCustomer.orders.push(currOrder._id);
    await currCustomer.save();
    let msg={
      productName:product.name,
      customerName:currCustomer.username,
      phoneNum:currCustomer.phoneNumber,
      paymentMode:order.payment_mode,
      address:order.address,
      quantity:order.quantity,
      totalPrice:order.total

    }
    sendMessage(msg);
    res.render("listings/orderPlaced.ejs");
  })
);

//Buy Product/Listing
router.get(
  "/:id/buy",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/buy.ejs", { listing });
  })
);

//Place order
router.post(
  "/:id/placeOrder",
  wrapAsync(async (req, res) => {
    let { order } = req.body;
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/placeOrder.ejs", { order, listing });
  })
);

//Delete Listing
router.delete(
  "/:id/delete",
  isAdministrator,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findOneAndDelete({ _id: id });
    req.flash("success","Product deleted successfully!");
    res.redirect("/listings/allProducts");
  })
);

//Landing Page
router.get("", (req, res) => {
  res.render("landing/home.ejs");
});

module.exports = router;
