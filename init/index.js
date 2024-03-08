let mongoose = require('mongoose')
let Listing = require('../models/listings.js')
let data = require('./data.js')
let {upload_file}=require("../cloudConfig.js")
main().then(console.log("Connected to DB!")).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Ecom');
}
console.log(Listing);
const initDB=async()=>{
    // await Listing.deleteMany({}); 
    await Listing.insertMany(data);
    console.log('DB initialised!');
}

// initDB();
upload_file();
