const api = {};

const returnUser = (userObject) => {
  const user = {
    username: userObject.username,
    firstName: userObject.accountType.firstName,
    lastName: userObject.accountType.lastName
  }
  return user;
}
const processPatientList = (patientList) => {
  let patients = [];
  for(let i in patientList) {
    patients.push(returnUser(patientList[i]));
  }
  return patients;
}
api.getUser = (UserRepo, DB) => (req, res) => {
  // Gets the data of one user.
  DB.then(database => {
    const userRepo = new UserRepo(database);
    userRepo.FindUser(req.query.username).then(result => {
      // Construct the user object being returned.
      const user = returnUser(result.User[0]);
      const returning = {success: true, user: user};
      res.json(returning);
    }).catch(error => {
      console.log("An error occurred getting the specified user.");
      res.json({success: false});
    });
  });
}

api.getAllPatients = (UserRepo, DB) => (req, res) => {
  // Gets all patients under the medical professional.
  DB.then(database => {
    const userRepo = new UserRepo(database);
    userRepo.FindPatient(req.query.code).then(result => {
      // Successfully queried a list of patients. Sends back to client.
      result.success = true;
      result.patients = processPatientList(result.patients);
      console.log("The patient list: " + result.patients);
      res.json(result);
    }).catch(error => {
      console.log("An error has occurred getting the medical professional's patients.");
      res.json({success: false});
    })
  });
}

api.getAppointmentPatientInfo = (UserRepo, DB) => (req, res) => {
  DB.then(database => {
    const userRepo = new UserRepo(database);
    
    userRepo.FindUser(req.query.username).then(result => {
      // Construct the user object being returned.
      const patient = returnUser(result.User[0]);
      userRepo.FindMP(result.User[0].accountType.medicalcode).then(result => {
        // Need to add this into the user repo
        const mp = [];
        mp.push(returnUser(result));
        
        const returning = {success: true, patient: patient, mp: mp};
        res.json(returning);
      });
    }).catch(error => {
      console.log("An error occurred getting the specified user.");
      res.json({success: false});
    });
  });
}

module.exports = api;