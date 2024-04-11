const mongoose = require('mongoose')

main().then(console.log("Connected to DB!")).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Ecom');
}

const orderSchema = new mongoose.Schema({
    productId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Listing",
        // required:true
    },
    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        // required:true,
    },
    address:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    payment_mode:{
        type:String,
        required:true
    },
    total:{
        type:Number,
    }
});

const Order=new mongoose.model("Order",orderSchema);

module.exports = Order;
