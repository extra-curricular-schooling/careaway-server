const express = require('express');
const app = express();
const bodyParser = require('body-parser'); // Parses request bodies
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const consign = require('consign');
const proxy = require('express-http-proxy');
const routes = require('./proxyRoutes');
const session = require('express-session');
const csrf = require('csurf');
var breached = false;
var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.set('trust proxy', 1) // trust first proxy - only if secure is true for express-session
const MongoStore = require('connect-mongo')(session);
const corsOptions = {
  origin: 'http://localhost:8081',
  credentials: true,
  optionsSuccessStatus: 200
};

// Allows only one cross origin site.
app.use(cors(corsOptions));
app.use(helmet()); 

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(session({
  secret: 'thesecret',
  resave: false,
  saveUninitialized: false,
  name: 'sessionID',
  cookie: {
    path: '/',
    proxy: true,
    expires: expiryDate,
    httpOnly: false,
    secure: false
  },
  store: new MongoStore({
    url: 'mongodb://localhost:27017/test',
  })
}));

const csrfProtection = csrf();
//app.use(csrfProtection);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/', (req, res, next) => {
  console.log("Here");
  next();
})
/* app.use('/', (req, res) => {
  const token = req.csrfToken();
  res.locals.csrfToken = token;
  res.header['x-csrf-token'] = token;
  console.log(`The token ${token}`);
  return res.json({ csrfToken : token });
}); */

app.use(function(req,res,next){
  if (breached) {
      res.sendFile('/breached.html',{root: __dirname });
  } else {
      next();
  }
  
});
 
app.get('/sys', function (req,res){   
  res.sendFile('/sys-ad.html',{root: __dirname });
});

app.post('/breach', function (req,res){   
  breached = true;
});

app.use('/registerPatient', proxy('localhost:4100', {
  proxyReqPathResolver: function(req) {
    return routes.registerPatient;
  } 
}));

app.use('/registerMed', proxy('localhost:4100', {
  proxyReqPathResolver: function(req) {
    return routes.registerMed;
  } 
}));

app.use('/login', proxy('localhost:4100', {
  proxyReqPathResolver: function(req) {
    return routes.login;
  }
}));

app.use('/ssoRegisterPatient', proxy('localhost:4100', {
  proxyReqPathResolver: function(req) {
    return routes.ssoRegisterPatient;
  }
}));

app.use('/ssoRegisterMed', proxy('localhost:4100', {
  proxyReqPathResolver: function(req) {
    return routes.ssoRegisterMed;
  }
}));


module.exports = app;