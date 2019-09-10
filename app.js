require('dotenv').config();
var request = require('request-promise');
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
let userToken
passport.use(new Strategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/return'
},
function(accessToken, refreshToken, profile, cb) {
  console.log('ACESS TOKEN => '+accessToken)
  userToken = accessToken
  return cb(null, profile);
}));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',  
  passport.authenticate('facebook', {
    scope: ['user_photos', 'publish_to_groups']
  }
));



app.get('/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });
app.get('/profile/:albumId/photos',function(req,res){
  const userFieldSet = 'picture, photos'
  const options = {
    method: 'GET',
    uri: `https://graph.facebook.com/v4.0/${req.params.albumId}`,
    qs: {
      access_token: userToken,
      fields: userFieldSet
    }
  };
  request(options)
    .then(fbRes => {
      res.json(fbRes);
    })
})
app.post('/profile/:albumId/photos',function(req,res){
  const userFieldSet =" 'url': 'https://i.imgur.com/erdQsjh.jpg', 'no_story':'true', 'picture','photos'"
  const options ={
    method:'POST',
    uri:`https://graph.facebook.com/v4.0/${req.params.albumId}`,
    qs:{
      access_token: userToken,
      fields:userFieldSet
    }
  };
  request(options)
  .then(fbRes=>{
    res.json(fbRes)
  })
})

// app.listen(process.env['PORT'] || 3000);



// var express = require('express')
var fs = require('fs')
var https = require('https')
// var app = express()

// app.get('/', function (req, res) {
//   res.send('hello world')
// })

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/')
})