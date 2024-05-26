// const { bool } = require('joi');
const mongoose = require('mongoose')
const passportLocalMongoose=require("passport-local-mongoose");

main().then(console.log("Connected to DB!")).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Ecom');
}

const customerSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    
    address:{
        type:String,
        // required:true
    },
    
    orders:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }],
    isAdmin:{
        type:Boolean,
        default:false
    }
});

customerSchema.plugin(passportLocalMongoose);
const Customer = new mongoose.model('Customer',customerSchema);

module.exports = Customer;