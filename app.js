const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const ejs = require("ejs");
const path = require("path");
const methodOverride = require("method-override");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));


//Show Listing Route
app.get("/listings/:id/show",async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/showListing.ejs",{listing});
});

//Edit Listing Route
app.put("/listings/:id/updateData", async (req, res) => {
  let newData = req.body.listing;
  let { id } = req.params;
  await Listing.findByIdAndUpdate(
    id, 
    { ...newData }, 
    { runValidators: true 
  });
  res.send("Updated!");
});

app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  res.render("listings/editListing.ejs", { listing });
});

//All Listings route
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find();
  res.render("listings/allListings.ejs", { allListings });
  // res.send("All Listings Route");
});

app.get("/", (req, res) => {
  res.send("Working!");
});

app.listen(3000, (req, res) => {
  console.log("Listening at port 3000");
});
