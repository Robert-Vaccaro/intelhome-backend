
var mongoose = require('mongoose');

const ProviderSchema = new mongoose.Schema({
    providerID: String,
    email: String,
    phoneNumber: String,
    firstName: String,
    lastName: String,
    calendlyURL: String,
    profilePhotoURL: String,
    rate: Number,
    createdAt: String,
    updatedAt: String,
    verified: Boolean,
    categories: Array,
    about: String,
    education: String,
    experience: String,
    customFields: Object,
    testimonials: Array
});

module.exports = mongoose.model("Provider", ProviderSchema);