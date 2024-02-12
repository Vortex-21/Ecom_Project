const express = require("express")
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listings");
const ejs = require('ejs');
const path = require('path');
const methodOverride = require('method-override');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));


let methodOverride = require('method-override')

 
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

//Edit Listing Route
app.put("/listings/:id/updateData",async (req,res)=>{
    let newData = req.body.listing;
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,
        {
            name:newData.name,
            price:newData.price,
            description:newData.description
        });
    res.send("Updated!");
});
app.get("/listings/:id/editListing",async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/editListing.ejs",{listing});
});

//All Listings route
app.get("/listings",async(req,res)=>{
    let allListings = await Listing.find();
    res.render('listings/allListings.ejs',{allListings});
    // res.send("All Listings Route");
});

app.get("/",(req,res)=>{
    res.send("Working!");
});


app.listen(3000,(req,res)=>{
    console.log("Listening at port 3000");
});
