const cloudinary = require('cloudinary').v2
const {CloudinaryStorage}=require("multer-storage-cloudinary")
require("dotenv").config()


cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET,
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Ecom_Dev',
      allowedFormats: ["png","jpg","jpeg"]
    },
});

const upload_file=()=>{
  cloudinary.uploader.upload("./assets/bg.jpg", 
{ folder: "Ecom_Dev" },
function(error, result) { console.log(result, error); });
}

upload_file();
module.exports={cloudinary,storage,upload_file};


