var CryptoJS = require('crypto-js');
var jwt = require('jsonwebtoken');
const api = {};
//  Register a new user from sso into the careaway system
api.ssoRegistration = (User,Salt,UserRepo,DB) => (req, res) => {
  try{
    // Captures the JWT token received from a request from the SSO and decodes it using the secret key 
    // Returns an error (goes to catch) if the token is not valid
    var token = req.body.token;
    console.log(token);
    var decoded = jwt.verify(token,"db3OIsj+BXE9NZDy0t8W3TcNekrF+2d/1sFnWG4HnV8TZY30iTOdtVWJG8abWvB1GlOgJuQZdcF2Luqm/hccMw==");
    // This decodes the JWT to the original json object if the token has been validated
    var ssoUser = jwt.decode(token,{complete: true});
    DB.then(database => {
      var userRepo = new UserRepo(database);
      userRepo.FindUser(ssoUser.payload.username).then(function(value){
        if(value.User.length > 0){
          console.log('User already exist in our system');
          res.status(404);
          res.json({'err' : 'User already exist'});
        } else {
          var saltStrPass = CryptoJS.lib.WordArray.random(128/8).toString();
          var passHashed = CryptoJS.HmacSHA256(ssoUser.payload.password, saltStrPass).toString();
          // Saves all salt to an object
          var identifier = new Salt(saltStrPass);
          // Generates a new user using the received username and password from sso
          var newUser = new User(ssoUser.payload.username,passHashed, {role: 'SSO'}, {} ,identifier);
          userRepo.Create(newUser);
          // Return success message
          res.json({success: true});
        }
      });
    });
    // Goes here if token was invalid
  }catch(err) {
    console.log("Received a bad token");
    res.json({success: false});
  }
};
// Authenticates the SSO user into our careaway system
api.ssoLogin = (UserRepo, DB) => (req, res) => {
  try{
    // Captures the JWT token received from a request from the SSO and decodes it using the secret key 
    // Returns an error (goes to catch) if the token is not valid
    var decoded = jwt.verify(req.body.token,"db3OIsj+BXE9NZDy0t8W3TcNekrF+2d/1sFnWG4HnV8TZY30iTOdtVWJG8abWvB1GlOgJuQZdcF2Luqm/hccMw==");
    // This decodes the JWT to the original json object if the token has been validated
    var ssoUser = jwt.decode(req.body.token,{complete: true});
    DB.then(database => {
      var username = ssoUser.payload.username;
      var password = ssoUser.payload.password;
      var userRepo = new UserRepo(database);
      //  Find user in db
      userRepo.FindUser(username).then(function(value){
        // Gets the users queried for from the username
        var queriedUser = value.User;
        // Checks if a user was found
        if (queriedUser.length === 0) {
          // User was not found
          res.json({error: 'User does not exist.'});
        } else {
          // User was found
          user = queriedUser[0];
          // Hash password from request and compare with hashed password in db
          const passHashed = CryptoJS.HmacSHA256(password,user.identifier.salt).toString();
          // Checks if password matches with that in the database
          if (passHashed === user.password) {
            // Checks if this is a new user to our database
            if((Object.keys(user.accountType).length ===0)){
              // Send a request telling client to register the user
              res.json({success: true, needRegister: true});
            } else{
              // Checks if the user is a system admin
              if (user.accountType.role == 'system-admin') {
                res.sendFile('/sys-ad.html',{root: 'services/' });
              } else {
                // Checks if the user is a medical professional or patient
                res.json({success: true, accountType: queriedUser.accountType.role});
              }
            }
          } else {
          // res.json({error: 'Wrong password.'})
            console.log("Wrong pass");
            resolve(null);      
          }
        }
      });
    });
  } catch(err){
    console.log("Received a bad token");
    res.json({success: false});
  }
};

//  This Edits an existing user's password into our system
api.ssoResetPassword= (UserRepo, DB) => (req, res) => {
  try{
    // Captures the JWT token received from a request from the SSO and decodes it using the secret key 
    // Returns an error (goes to catch) if the token is not valid
    var decoded = jwt.verify(req.body.token,"db3OIsj+BXE9NZDy0t8W3TcNekrF+2d/1sFnWG4HnV8TZY30iTOdtVWJG8abWvB1GlOgJuQZdcF2Luqm/hccMw==");
    // This decodes the JWT to the original json object if the token has been validated
    var ssoUser = jwt.decode(req.body.token,{complete: true});
    DB.then(database => {
      var userRepo = new UserRepo(database);
      // Finds the existing user in the database
      userRepo.FindUser(ssoUser.payload.username).then(function(value){
        var queriedUser = value.User;
        if (queriedUser.length === 0) {
          // User does not exist return an error
          res.status(404);
        } else {
          // Get's the salt value from the user
          queriedUser = queriedUser[0];
          const newSalt = ssoUser.payload.salt;
          // Get the hashed password from the payload
          const passHashed = ssoUser.payload.password;
          // Update db with new hashed password and salt
          userRepo.ResetCredential(ssoUser.payload.username,passHashed,newSalt);
            res.status(200);
        }
      });
    });
  } catch(err){
    console.log("Received a bad token");
    res.json({success: false});
  }
};


module.exports = api;