
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var resultSchema = new Schema({
        username: {type: String, required: true},
        cards:{type: String, required: true},
        stake:{type: Number, required: true},
        result:{type: String, required: true},
        cardValue: {type: Number, required: true}
    });

    module.exports = mongoose.model('Result', resultSchema);


