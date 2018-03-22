module.exports = {
  database: {
    host: 'mongodb',
    port: 27017,
    dbName: 'users'
  },
  routes: {
    registerPatient: '/account/api/registration/patient',
    registerMedpro: '/account/api/registration/medical-professional',
    ssoRegisterPatient: '/account/api/ssoregistration/patient',
    ssoRegisterMed: '/account/api/ssoregistration/medical-professional',
    login: '/account/api/authentication',
    validateUsername: '/account/api/validate-username',
    securityQuestions: '/account/api/security-questions',
    validateAnswers: '/account/api/validate-answers',
    resetCreds: '/account/api/reset-creds',
    updateDiagnosis: '/account/api/update-diagnosis',
    ssoLogin: '/SSO/login',
    ssoRegistration: '/SSO/registration',
    ssoResetPassword:'/SSO/ResetPassword',
    getLoginInfo:'/account/api/getLoginInfo',
        accountBreach: 'http://localhost:4100/breach',
    getUser: '/account/api/get-user',
    getPatients: '/account/api/get-all-patients',
    getAllInfoForPatientAppointment: '/account/api/get-patient-appointment-info'
  },
  server: {
    port: 4100
  }
}