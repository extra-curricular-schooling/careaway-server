const config = require('@treatmentConfig');

const models = require('@treatment/app/setup');

module.exports = (app) => {
    const api = app.treatment_management.app.api.data_analysis;
    app.route(config.routes.getDiagnoses).get(api.getDiagnoses(models.UserRepo, models.DB));
    app.route(config.routes.getTreatmentmeter).get(api.getTreatmentmeter(models.UserRepo, models.DB));
    app.route(config.routes.getTreatmentchecklist).get(api.getTreatmentchecklist(models.UserRepo, models.DB));
}