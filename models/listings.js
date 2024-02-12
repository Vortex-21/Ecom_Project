const mongoose = require('mongoose')

main().then(console.log("Connected to DB!")).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Ecom');
}

const listingSchema = new mongoose.Schema({
    images:[
        {
            type:String
        }
    ],
    name:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    description:String

});

const Listing = mongoose.model('Listing',listingSchema);

module.exports = Listing;