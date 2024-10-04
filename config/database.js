var mongoose = require('mongoose');
let env = require('../config/env');

mongoose.set('strictQuery', false)
mongoose.connect(env.mongoDd, {
}) .then(() => console.log('Database Connected'))
.catch(err => console.log(err));
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
    console.log("connected")
});
console.log("db")
module.exports = { db };