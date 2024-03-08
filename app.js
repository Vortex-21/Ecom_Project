require('dotenv').config()
const express = require("express");
const app = express();
const Listing = require("./models/listings");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate")
const {storage}=require("./cloudConfig.js")
const multer=require("multer")
const upload=multer({storage})
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname,"public")))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//Create Listing route
app.get("/listings/create",(req,res)=>{
  res.render("listings/new.ejs")
});

app.post("/listings/create",async(req,res)=>{
  
  const newListing=new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
})
  


//Show Listing Route
app.get("/listings/:id/show",async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});
//

//Edit Listing Route
app.put("/listings/:id/update", async (req, res) => {
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
  res.render("listings/edit.ejs", { listing });
});
//Delete Listing
app.delete("/listings/:id/delete",async(req,res)=>{
  let {id}=req.params;
  await Listing.findOneAndDelete({_id:id});
  res.redirect("/listings");
})

//All Listings route
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find();
  res.render("listings/index.ejs", { allListings });
  // res.send("All Listings Route");
});
//

app.get("/", (req, res) => {
  res.send("Working!");
});

app.listen(3000, (req, res) => {
  console.log("Listening at port 3000");
});


