const {listingSchema} = require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");

module.exports.validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if (result.error) {
    console.log("ERROR: ", result.error);
    throw new ExpressError(500, "Validation Error");
  } else {
    next();
  }
};

module.exports.isAdministrator=(req,res,next)=>{
  if(!req.isAuthenticated()){
    req.session.toRedirect = req.originalUrl;
    req.flash("error","You must be logged in .");
    res.redirect("/customers/login");
  }
  else if(!req.user.isAdmin){
    req.flash("error","Unauthorized.");
    res.redirect("/listings")
  }
  else{
    next();
  }
}

module.exports.isLoggedIn=(req,res,next)=>{
  if(!req.isAuthenticated()){
    // console.log(req.originalUrl);
    req.session.toRedirect = req.originalUrl;
    req.flash("error","You must be logged in .")
    res.redirect("/customers/login");
  }
  else{
    next();
  }
}

module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.toRedirect){
    res.locals.toRedirect = req.session.toRedirect;
  }
  next();
}
