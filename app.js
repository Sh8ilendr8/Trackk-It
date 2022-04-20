//jshint esversion:8
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const https=require("https");


const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(session({
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb+srv://admin-track:TrackkIt@trackkit.wtvak.mongodb.net/TrackkItDB",
{useNewUrlParser: true
}).then(()=>{
  console.log("Connection successful");
}).catch((err)=>{
  console.log("no connection");
});




const userSchema = new mongoose.Schema ({
  email: String,
  password:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});






app.get("/", function(req, res){
  res.render("index");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact",{success:""});
});

app.get("/bmi", function(req, res){
  res.render("bmi");
});

app.get("/register", function(req, res){
  res.render("register",{success:""});
});

app.get("/information", function(req, res){
  res.render("information",{success:""});
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/profile", function(req, res){
  if (req.isAuthenticated()){
      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      var day= date+"-"+month+"-"+year;

      Dailydata.deleteMany({name:req.user.username, date:{$ne:day}}, function(err){
        if(err){
          console.log(err);
        }
      });

      Information.find({email:req.user.username},function(err,data){
        Fooddata.find({name:req.user.username, date: day},function(err,foods){
            if(err){
              console.log(err);
            }
            if(foods.length==0){
                res.render("profile" ,{cal:"0", pr:"0",ch:"0", fa:"0", car:"0",n : data[0].name,h:data[0].height,w:data[0].weight,b:data[0].bmi,bm:data[0].bmr,c:data[0].idealcal});
            }
            else{
                res.render("profile" ,{cal:(foods[0].calorie).toFixed(2), pr:(foods[0].protien).toFixed(2),ch:(foods[0].cholestrol).toFixed(2), fa:(foods[0].fat).toFixed(2), car:(foods[0].carbohydrate).toFixed(2), n : data[0].name,h:data[0].height,w:data[0].weight,b:data[0].bmi,bm:data[0].bmr,c:data[0].idealcal});
            }
        });
      });

  }
  else {
    res.redirect("/login");
    }
});


app.get("/food", function(req, res){
  if (req.isAuthenticated()){
      res.render("food",{n:"Meal",p:"", c:"", f:"", ca:"",ch:""});
  }
  else {
    res.redirect("/login");
  }
});

app.get("/instructions", function(req, res){
  if (req.isAuthenticated()){
    res.render("instructions");
  }
  else {
    res.redirect("/login");
  }
});

app.get("/addfood", function(req, res){
  if (req.isAuthenticated()){
    res.render("addfood",{success:""});
  }
  else {
    res.redirect("/login");
  }
});


app.get("/exercise", function(req, res){

  if (req.isAuthenticated())
  {
      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      var day= date+"-"+month+"-"+year;
      Exercisedata.find({name:req.user.username, date: day},function(err,exercises)
      {
        if(err){
            console.log(err);}
        if (exercises.length==0){
            res.render("exercise",{w:"0", r:"0", c:"0", y:"0", o:"0" });
        }
        else
        {
            res.render("exercise",{w:exercises[0].walking, r:exercises[0].running, c: exercises[0].cycling, y:exercises[0].yoga, o:exercises[0].other});
        }
      });
  }
  else {
      res.redirect("/login");
  }
});


app.get("/track", function(req, res){
    if (req.isAuthenticated()){




     Dailydata.find({name:req.user.username},function(err,foods){
          if(err){
            console.log(err);
          }
          var l= foods.length;
          if(l==0)
          {
            res.render("track",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:0, gavg:0,
                                 gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:0, gbvg:0,
                                 gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:0, gcvg:0,
                                 gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:0, gdvg:0,
                                 geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:0, gevg:0  });
          }
          else if(l==1)
          {
            res.render("track",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:0, gavg:foods[l-1].calorie,
                                gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:0, gbvg:foods[l-1].protien,
                                gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:0, gcvg:foods[l-1].carbohydrate,
                                gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:0, gdvg:foods[l-1].cholestrol,
                                geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:0, gevg:foods[l-1].fat });
          }
          else if(l==2)
          {
            res.render("track",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
          }
          else if(l==3)
          {
            res.render("track",{gava:0, gavb:0, gavc:0, gavd:0, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                 gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                 gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                 gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                 geva:0, gevb:0, gevc:0, gevd:0, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
          }
          else if(l==4)
          {
            res.render("track",{gava:0, gavb:0, gavc:0, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                 gbva:0, gbvb:0, gbvc:0, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                 gcva:0, gcvb:0, gcvc:0, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                 gdva:0, gdvb:0, gdvc:0, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                 geva:0, gevb:0, gevc:0, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
          }
          else if(l==5)
          {
            res.render("track",{gava:0, gavb:0, gavc:foods[l-5].calorie, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                 gbva:0, gbvb:0, gbvc:foods[l-5].protien, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                 gcva:0, gcvb:0, gcvc:foods[l-5].carbohydrate, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                 gdva:0, gdvb:0, gdvc:foods[l-5].cholestrol, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                 geva:0, gevb:0, gevc:foods[l-5].fat, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
          }
          else if(l==6)
          {
            res.render("track",{gava:0, gavb:foods[l-6].calorie, gavc:foods[l-5].calorie, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                 gbva:0, gbvb:foods[l-6].protien, gbvc:foods[l-5].protien, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                 gcva:0, gcvb:foods[l-6].carbohydrate, gcvc:foods[l-5].carbohydrate, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                 gdva:0, gdvb:foods[l-6].cholestrol, gdvc:foods[l-5].cholestrol, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                 geva:0, gevb:foods[l-6].fat, gevc:foods[l-5].fat, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
          }
          else
          {
            res.render("track",{gava:foods[l-7].calorie, gavb:foods[l-6].calorie, gavc:foods[l-5].calorie, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                 gbva:foods[l-7].protien, gbvb:foods[l-6].protien, gbvc:foods[l-5].protien, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                 gcva:foods[l-7].carbohydrate, gcvb:foods[l-6].carbohydrate, gcvc:foods[l-5].carbohydrate, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                 gdva:foods[l-7].cholestrol, gdvb:foods[l-6].cholestrol, gdvc:foods[l-5].cholestrol, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                 geva:foods[l-7].fat, gevb:foods[l-6].fat, gevc:foods[l-5].fat, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
          }
      });
  }
    else {
        res.redirect("/login");
    }
});


app.get("/tracke", function(req, res){
  if (req.isAuthenticated()){
      Exercisedata.find({name:req.user.username},function(err,exercises){
          if(err){
            console.log(err);
          }
          var l= exercises.length;
          if(l==0)
          {
            res.render("tracke",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:0, gavg:0,
                                 gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:0, gbvg:0,
                                 gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:0, gcvg:0,
                                 gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:0, gdvg:0,
                                 geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:0, gevg:0  });
          }
          else if(l==1)
          {
            res.render("tracke",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:0, gavg:exercises[l-1].walking,
                                gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:0, gbvg:exercises[l-1].running,
                                gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:0, gcvg:exercises[l-1].cycling,
                                gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:0, gdvg:exercises[l-1].yoga,
                                geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:0, gevg:exercises[l-1].other });
          }
          else if(l==2)
          {
            res.render("tracke",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:exercises[l-2].walking, gavg:exercises[l-1].walking,
                                gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:exercises[l-2].running, gbvg:exercises[l-1].running,
                                gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:exercises[l-2].cycling, gcvg:exercises[l-1].cycling,
                                gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:exercises[l-2].yoga, gdvg:exercises[l-1].yoga,
                                geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:exercises[l-2].other, gevg:exercises[l-1].other});
          }
          else if(l==3)
          {
            res.render("tracke",{gava:0, gavb:0, gavc:0, gavd:0, gave:exercises[l-3].walking, gavf:exercises[l-2].walking, gavg:exercises[l-1].walking,
                                gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:exercises[l-3].running, gbvf:exercises[l-2].running, gbvg:exercises[l-1].running,
                                gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:exercises[l-3].cycling, gcvf:exercises[l-2].cycling, gcvg:exercises[l-1].cycling,
                                gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:exercises[l-3].yoga, gdvf:exercises[l-2].yoga, gdvg:exercises[l-1].yoga,
                                geva:0, gevb:0, gevc:0, gevd:0, geve:exercises[l-3].other, gevf:exercises[l-2].other, gevg:exercises[l-1].other});
          }
          else if(l==4)
          {
            res.render("tracke",{gava:0, gavb:0, gavc:0, gavd:exercises[l-4].walking, gave:exercises[l-3].walking, gavf:exercises[l-2].walking, gavg:exercises[l-1].walking,
                                gbva:0, gbvb:0, gbvc:0, gbvd:exercises[l-4].running, gbve:exercises[l-3].running, gbvf:exercises[l-2].running, gbvg:exercises[l-1].running,
                                gcva:0, gcvb:0, gcvc:0, gcvd:exercises[l-4].cycling, gcve:exercises[l-3].cycling, gcvf:exercises[l-2].cycling, gcvg:exercises[l-1].cycling,
                                gdva:0, gdvb:0, gdvc:0, gdvd:exercises[l-4].yoga, gdve:exercises[l-3].yoga, gdvf:exercises[l-2].yoga, gdvg:exercises[l-1].yoga,
                                geva:0, gevb:0, gevc:0, gevd:exercises[l-4].other, geve:exercises[l-3].other, gevf:exercises[l-2].other, gevg:exercises[l-1].other});
          }
          else if(l==5)
          {
            res.render("tracke",{gava:0, gavb:0, gavc:exercises[l-5].walking, gavd:exercises[l-4].walking, gave:exercises[l-3].walking, gavf:exercises[l-2].walking, gavg:exercises[l-1].walking,
                                 gbva:0, gbvb:0, gbvc:exercises[l-5].running, gbvd:exercises[l-4].running, gbve:exercises[l-3].running, gbvf:exercises[l-2].running, gbvg:exercises[l-1].running,
                                 gcva:0, gcvb:0, gcvc:exercises[l-5].cycling, gcvd:exercises[l-4].cycling, gcve:exercises[l-3].cycling, gcvf:exercises[l-2].cycling, gcvg:exercises[l-1].cycling,
                                 gdva:0, gdvb:0, gdvc:exercises[l-5].yoga, gdvd:exercises[l-4].yoga, gdve:exercises[l-3].yoga, gdvf:exercises[l-2].yoga, gdvg:exercises[l-1].yoga,
                                 geva:0, gevb:0, gevc:exercises[l-5].other, gevd:exercises[l-4].other, geve:exercises[l-3].other, gevf:exercises[l-2].other, gevg:exercises[l-1].other});
          }
          else if(l==6)
          {
            res.render("tracke",{gava:0, gavb:exercises[l-6].walking, gavc:exercises[l-5].walking, gavd:exercises[l-4].walking, gave:exercises[l-3].walking, gavf:exercises[l-2].walking, gavg:exercises[l-1].walking,
                                gbva:0, gbvb:exercises[l-6].running, gbvc:exercises[l-5].running, gbvd:exercises[l-4].running, gbve:exercises[l-3].running, gbvf:exercises[l-2].running, gbvg:exercises[l-1].running,
                                gcva:0, gcvb:exercises[l-6].cycling, gcvc:exercises[l-5].cycling, gcvd:exercises[l-4].cycling, gcve:exercises[l-3].cycling, gcvf:exercises[l-2].cycling, gcvg:exercises[l-1].cycling,
                                gdva:0, gdvb:exercises[l-6].yoga, gdvc:exercises[l-5].yoga, gdvd:exercises[l-4].yoga, gdve:exercises[l-3].yoga, gdvf:exercises[l-2].yoga, gdvg:exercises[l-1].yoga,
                                geva:0, gevb:exercises[l-6].other, gevc:exercises[l-5].other, gevd:exercises[l-4].other, geve:exercises[l-3].other, gevf:exercises[l-2].other, gevg:exercises[l-1].other});
          }
          else
          {
            res.render("tracke",{gava:exercises[l-7].walking, gavb:exercises[l-6].walking, gavc:exercises[l-5].walking, gavd:exercises[l-4].walking, gave:exercises[l-3].walking, gavf:exercises[l-2].walking, gavg:exercises[l-1].walking,
                                 gbva:exercises[l-7].running, gbvb:exercises[l-6].running, gbvc:exercises[l-5].running, gbvd:exercises[l-4].running, gbve:exercises[l-3].running, gbvf:exercises[l-2].running, gbvg:exercises[l-1].running,
                                 gcva:exercises[l-7].cycling, gcvb:exercises[l-6].cycling, gcvc:exercises[l-5].cycling, gcvd:exercises[l-4].cycling, gcve:exercises[l-3].cycling, gcvf:exercises[l-2].cycling, gcvg:exercises[l-1].cycling,
                                 gdva:exercises[l-7].yoga, gdvb:exercises[l-6].yoga, gdvc:exercises[l-5].yoga, gdvd:exercises[l-4].yoga, gdve:exercises[l-3].yoga, gdvf:exercises[l-2].yoga, gdvg:exercises[l-1].yoga,
                                 geva:exercises[l-7].other, gevb:exercises[l-6].other, gevc:exercises[l-5].other, gevd:exercises[l-4].other, geve:exercises[l-3].other, gevf:exercises[l-2].other, gevg:exercises[l-1].other});
          }
        });
    }
  else {
      res.redirect("/login");
  }
});




app.get("/trackn", function(req, res){
    if (req.isAuthenticated()){
        Fooddata.find({name:req.user.username},function(err,foods){
            if(err){
              console.log(err);
            }
            var l= foods.length;
            if(l==0)
            {
              res.render("trackn",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:0, gavg:0,
                                   gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:0, gbvg:0,
                                   gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:0, gcvg:0,
                                   gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:0, gdvg:0,
                                   geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:0, gevg:0  });
            }
            else if(l==1)
            {
              res.render("trackn",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:0, gavg:foods[l-1].calorie,
                                  gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:0, gbvg:foods[l-1].protien,
                                  gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:0, gcvg:foods[l-1].carbohydrate,
                                  gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:0, gdvg:foods[l-1].cholestrol,
                                  geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:0, gevg:foods[l-1].fat });
            }
            else if(l==2)
            {
              res.render("trackn",{gava:0, gavb:0, gavc:0, gavd:0, gave:0, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                  gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:0, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                  gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:0, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                  gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:0, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                  geva:0, gevb:0, gevc:0, gevd:0, geve:0, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
            }
            else if(l==3)
            {
              res.render("trackn",{gava:0, gavb:0, gavc:0, gavd:0, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                   gbva:0, gbvb:0, gbvc:0, gbvd:0, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                   gcva:0, gcvb:0, gcvc:0, gcvd:0, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                   gdva:0, gdvb:0, gdvc:0, gdvd:0, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                   geva:0, gevb:0, gevc:0, gevd:0, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
            }
            else if(l==4)
            {
              res.render("trackn",{gava:0, gavb:0, gavc:0, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                   gbva:0, gbvb:0, gbvc:0, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                   gcva:0, gcvb:0, gcvc:0, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                   gdva:0, gdvb:0, gdvc:0, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                   geva:0, gevb:0, gevc:0, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
            }
            else if(l==5)
            {
              res.render("trackn",{gava:0, gavb:0, gavc:foods[l-5].calorie, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                   gbva:0, gbvb:0, gbvc:foods[l-5].protien, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                   gcva:0, gcvb:0, gcvc:foods[l-5].carbohydrate, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                   gdva:0, gdvb:0, gdvc:foods[l-5].cholestrol, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                   geva:0, gevb:0, gevc:foods[l-5].fat, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
            }
            else if(l==6)
            {
              res.render("trackn",{gava:0, gavb:foods[l-6].calorie, gavc:foods[l-5].calorie, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                   gbva:0, gbvb:foods[l-6].protien, gbvc:foods[l-5].protien, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                   gcva:0, gcvb:foods[l-6].carbohydrate, gcvc:foods[l-5].carbohydrate, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                   gdva:0, gdvb:foods[l-6].cholestrol, gdvc:foods[l-5].cholestrol, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                   geva:0, gevb:foods[l-6].fat, gevc:foods[l-5].fat, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
            }
            else
            {
              res.render("trackn",{gava:foods[l-7].calorie, gavb:foods[l-6].calorie, gavc:foods[l-5].calorie, gavd:foods[l-4].calorie, gave:foods[l-3].calorie, gavf:foods[l-2].calorie, gavg:foods[l-1].calorie,
                                   gbva:foods[l-7].protien, gbvb:foods[l-6].protien, gbvc:foods[l-5].protien, gbvd:foods[l-4].protien, gbve:foods[l-3].protien, gbvf:foods[l-2].protien, gbvg:foods[l-1].protien,
                                   gcva:foods[l-7].carbohydrate, gcvb:foods[l-6].carbohydrate, gcvc:foods[l-5].carbohydrate, gcvd:foods[l-4].carbohydrate, gcve:foods[l-3].carbohydrate, gcvf:foods[l-2].carbohydrate, gcvg:foods[l-1].carbohydrate,
                                   gdva:foods[l-7].cholestrol, gdvb:foods[l-6].cholestrol, gdvc:foods[l-5].cholestrol, gdvd:foods[l-4].cholestrol, gdve:foods[l-3].cholestrol, gdvf:foods[l-2].cholestrol, gdvg:foods[l-1].cholestrol,
                                   geva:foods[l-7].fat, gevb:foods[l-6].fat, gevc:foods[l-5].fat, gevd:foods[l-4].fat, geve:foods[l-3].fat, gevf:foods[l-2].fat, gevg:foods[l-1].fat});
            }
        });
    }
    else {
      res.redirect("/login");
    }
  });


app.get("/logout", function(req, res){
      req.logout();
      res.redirect("/");
});







app.post("/register", function(req, res){

  User.register({username:req.body.username}, req.body.password, function(err, user){
    if (err) {
      res.render("register",{success:"Sorry!!! User email id  is already registered"} );
    } else {
      passport.authenticate("local")(req, res, function(){
        req.logout();
        res.redirect("/login");
      });
    }
  });

});


app.post("/login", function(req, res){

    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

  req.login(user, function(err){
    if (err) {
    res.render("login",{success : "Error !!!  Please fill all the credentials."});
    } else {
      passport.authenticate("local")(req, res, function(){
        Information.find({email:req.body.username},function(err,data){
          if(err)
          {
            console.log(err);
          }
          if(data.length==0)
          {
            res.render("information",{success:"Please fill the form before login"});
          }
          else{

                 res.redirect("/profile");
               }
      });
  });
}
});
});

const foodSchema = new mongoose.Schema ({
  name: String,
  date: String,
  calorie: Number,
  protien: Number,
  carbohydrate: Number,
  fat: Number,
  cholestrol: Number
});
const Fooddata = new mongoose.model("Fooddata", foodSchema);


const dailySchema = new mongoose.Schema ({
  name: String,
  date: String,
  calorie: Number,
  protien: Number,
  carbohydrate: Number,
  fat: Number,
  cholestrol: Number
});
const Dailydata = new mongoose.model("Dailydata", dailySchema);



app.post("/addfood",function(req,resp){

  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let day= date+"-"+month+"-"+year;


  Fooddata.find({name:req.user.username, date: day},function(err,foods)
  {
    if(err){
    console.log(err);}
    if(foods.length==0)
    {

      const newdaily= new Dailydata({
        name: req.user.username,
        date:day,
        calorie: req.body.calories,
        protien:req.body.protein,
        carbohydrate:req.body.carbohydrate,
        fat: req.body.fat,
        cholestrol: req.body.cholestrol
      });

        newdaily.save();

      const newfood= new Fooddata({
        name: req.user.username,
        date:day,
        calorie: req.body.calories,
        protien:req.body.protein,
        carbohydrate:req.body.carbohydrate,
        fat: req.body.fat,
        cholestrol: req.body.cholestrol
      });
      newfood.save(function(err){
        if(err){
          resp.render("addfood",{success : "Error !!!  Please fill all the credentials."});
        }else {
          resp.render("addfood",{success : "Thank you !!!  Your personalized meal is saved"});
        }
      });
    }
  else
  {
    var c = parseFloat(foods[0].calorie);
    c= c+   parseFloat(req.body.calories);

    var p= parseFloat(foods[0].protien);
    p= p+ parseFloat(req.body.protein);

    var ch= parseFloat(foods[0].cholestrol);
    ch= ch+ parseFloat(req.body.cholestrol);

    var ca= parseFloat(foods[0].carbohydrate);
    ca= ca+ parseFloat(req.body.carbohydrate);

    var f= parseFloat(foods[0].fat);
    f= f+ parseFloat(req.body.fat);


     Fooddata.updateOne({name:req.user.username, date: day},{$set:{calorie:c, protien:p, cholestrol:ch, carbohydrate: ca, fat:f}},function(err){
      if(err){
      console.log(err);}
    });

    Dailydata.find({name:req.user.username, date: day},function(err,daily){
      var l =daily.length;
      var v =parseFloat(daily[l-1].calorie);
      v=v+ parseFloat(req.body.calories);
      var w =parseFloat(daily[l-1].protien);
      w=w+ parseFloat(req.body.protein);
      var x =parseFloat(daily[l-1].carbohydrate);
      x=x+ parseFloat(req.body.carbohydrate);
      var y =parseFloat(daily[l-1].fat);
      y=y+ parseFloat(req.body.fat);
      var z =parseFloat(daily[l-1].cholestrol);
      z=z+ parseFloat(req.body.cholestrol);




      const newdaily= new Dailydata({
      name: req.user.username,
      date:day,
      calorie: v,
      protien: w,
      carbohydrate:x,
      fat: y,
      cholestrol: z
    });

      newdaily.save();
    });
     resp.render("addfood",{success : "Thank you !!!  Your personalized meal is saved"});
}
});
});

app.post("/food",function(req,resp){


const query=req.body.username;
const ser=req.body.serving;
https.get('https://api.calorieninjas.com/v1/nutrition?query='+ser+" " +query, {
  "headers":{
      'X-Api-Key':process.env.key
  }
},  async (res)=> {


  res.on('data', async  (d) => {
var da= await d;
 var dy =JSON.parse(da);

  if(dy.items.length!=0)
  {
       var v=0, w=0, x=0, y=0, z=0;
       for(var i=0; i<dy.items.length; i++)
       {
         v= v+ dy.items[i].calories;
         w= w+ dy.items[i].protein_g;
         x=x+ dy.items[i].carbohydrates_total_g;
         y=y+ dy.items[i].fat_total_g;
         z=z+ dy.items[i].cholesterol_mg;
       }



  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let day= date+"-"+month+"-"+year;
  Fooddata.find({name:req.user.username, date: day},function(err,foods)
  {
    if(err){
    console.log(err);}
    if(foods.length==0)
    {
    const newfood= new Fooddata({
    date:day,
    name:req.user.username,
    calorie: v,
    protien:w,
    carbohydrate:x,
    fat: y,
    cholestrol: z
    });
    newfood.save();

    const newdaily= new Dailydata({
      name: req.user.username,
      date:day,
      calorie: v,
      protien:w,
      carbohydrate:x,
      fat: y,
      cholestrol: z
    });

      newdaily.save();

    resp.render("food",{n:query, c:v,p:w,ch:z,f:y, ca:x});
  }
  else
  {
    var c = parseFloat(foods[0].calorie);
    c= c+   parseFloat(v);

    var p= parseFloat(foods[0].protien);
    p= p+ parseFloat(w);

    var ch= parseFloat(foods[0].cholestrol);
    ch= ch+ parseFloat(z);

    var ca= parseFloat(foods[0].carbohydrate);
    ca= ca+ parseFloat(x);

    var f= parseFloat(foods[0].fat);
    f= f+ parseFloat(y);

     Fooddata.updateOne({name:req.user.username, date: day},{$set:{calorie:c, protien:p, cholestrol:ch, carbohydrate: ca, fat:f}},function(err){
      if(err){
      console.log(err);}
    });

    Dailydata.find({name:req.user.username, date: day},function(err,daily){
      var l =daily.length;
      var f =(daily[l-1].calorie);
      f=f+ v;
      var g =(daily[l-1].protien);
      g=g+ w;
      var h =(daily[l-1].carbohydrate);
      h=h+ x;
      var i =(daily[l-1].fat);
      i=i+ y;
      var j =(daily[l-1].cholestrol);
      j=j+ z;



    const newdaily= new Dailydata({
      name: req.user.username,
      date:day,
      calorie: f,
      protien:g,
      carbohydrate:h,
      fat: i,
      cholestrol:j
    });

      newdaily.save();
    });

   resp.render("food",{n:query, c:v,p:w,ch:z,f:y, ca:x});
}
});
}
else{
  resp.render("addfood",{success:""});
}

});


}).on('error', (e) => {
  console.error(e);
});
});

const exerciseSchema = new mongoose.Schema ({
  name: String,
  date: String,
  walking: Number,
  running: Number,
  cycling: Number,
  yoga: Number,
  other: Number
});
const Exercisedata = new mongoose.model("Exercisedata", exerciseSchema);

app.post("/exercise",function(req, res){
var wal=0, cyc=0, run=0, yog=0, oth=0;
var exer = req.body.exercise;
var dur= req.body.time;
if(exer==1)
wal=dur;
else if(exer==2)
run=dur;
else if(exer==3)
cyc=dur;
else if(exer==4)
yog=dur;
else if(exer==5)
oth=dur;
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let day= date+"-"+month+"-"+year;
Exercisedata.find({name:req.user.username, date: day},function(err,exercises)
{
  if(err){
  console.log(err);}
  if(exercises.length==0)
  {
    const newexercise= new Exercisedata({
      date:day,
      name:req.user.username,
      walking:wal,
      running:run,
      cycling: cyc,
      yoga:yog,
      other:oth
      });
      newexercise.save();
      res.render("exercise",{w:wal,r:run,c:cyc,y:yog,o:oth});
  }
 else{
      if(exer==1)
      {
        var w = parseInt(exercises[0].walking);
         w= w+ parseInt(dur);
        Exercisedata.updateOne({name:req.user.username, date: day},{$set:{walking: w}},function(err){
          if(err){
          console.log(err);}
        });
        res.render("exercise",{w:w, r:exercises[0].running, c: exercises[0].cycling, y:exercises[0].yoga, o:exercises[0].other});
      }
      if(exer==2)
      {
        var r = parseInt(exercises[0].running);
         r= r+ parseInt(dur);
        Exercisedata.updateOne({name:req.user.username, date: day},{$set:{running: r}} ,function(err){
          if(err){
          console.log(err);}
        });
        res.render("exercise",{w:exercises[0].walking, r:r, c: exercises[0].cycling, y:exercises[0].yoga, o:exercises[0].other});
      }
      if(exer==3)
      {
        var c = parseInt(exercises[0].cycling);
         c= c+ parseInt(dur);
        Exercisedata.updateOne({name:req.user.username, date: day},{$set:{cycling: c}} ,function(err){
          if(err){
          console.log(err);}
        });
        res.render("exercise",{w:exercises[0].walking, r:exercises[0].running, c: c, y:exercises[0].yoga, o:exercises[0].other});
      }
      if(exer==4)
      {
        var y = parseInt(exercises[0].yoga);
         y= y+ parseInt(dur);
        Exercisedata.updateOne({name:req.user.username, date: day},{$set:{yoga: y}} ,function(err){
          if(err){
          console.log(err);}
        });
        res.render("exercise",{w:exercises[0].walking, r:exercises[0].running, c: exercises[0].cycling, y:y, o:exercises[0].other});
      }
      if(exer==5)
      {
        var o = parseInt(exercises[0].other);
         o= o+ parseInt(dur);
        Exercisedata.updateOne({name:req.user.username, date: day},{$set:{other: o}} ,function(err){
          if(err){
          console.log(err);}
        });
       res.render("exercise",{w:exercises[0].walking, r:exercises[0].running, c: exercises[0].cycling, y:exercises[0].yoga, o:o});
  }
}
});

});

const informationSchema = new mongoose.Schema ({
  email: String,
  name: String,
  height: Number,
  weight: Number,
  bmi:Number,
  bmr:Number,
  idealcal:Number
});

const Information = new mongoose.model("Information", informationSchema);

app.post("/information", function(req, res){

var h= req.body.height;
var w= req.body.weight;
var g=req.body.gender;
var f=req.body.fat;
var a=req.body.activity;
var go= req.body.goal;
var bm=( w/((h*h)/10000)).toFixed(2);
var mr=Math.round( w*(parseFloat(g))*24*(parseFloat(f))*(parseFloat(a)));
var ic=0;

if(go==="1"){
 ic=mr- 400;}
else if(go==="2"){
 ic=mr+400;}
else{
 ic=mr;}
 const newInformation= new Information({

   email: req.user.username,
   name: req.body.name,
   height: h,
   weight: w,
   bmi: bm,
   bmr: mr,
   idealcal: ic
});

newInformation.save(function(err){
  if(err){
  console.log(err);}
  else{
  res.redirect("/profile");}

});

});






const contactSchema = new mongoose.Schema ({
  name: {
    type: String,
 required: true
},
  email: {
    type: String,
   lowercase: true,
   required: true
  },
  message: {
    type: String,
   required: true
 },
});
 const Contact = new mongoose.model("Contact", contactSchema);
app.post("/contact", function(req, res){
const newContact= new Contact({
  name: req.body.fname,
  email: req.body.username,
  message: req.body.message
});

newContact.save(function(err){
  if(err){
    res.render("contact",{success : "Error !!!  Please fill all the credentials."});
  }else {
    res.render("contact",{success :"Thank you !!!  Your message is received. Our team will contact you as soon as possible." });
  }
});
});






app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
