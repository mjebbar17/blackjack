

    'use strict';

    var express = require('express');
    var bodyParser = require('body-parser');
    var app = express();

    // support json
    app.use(bodyParser.json({}));

    //CORS
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // initialize mongo
    require('./mongodb')("mongodb://localhost/Beamary");


     //configure controllers and routes
    app.use("", require('./controllers'));

    // catch uncaught exceptions
    process.on('uncaughtException', function (err) {
        console.log('uncaughtException: ' + err.stack);
    });

    // start http server
    app.listen(8111, function (err) {
        if (err) console.log('Failed to start server, ' + err);
        else console.log('Started server');
    });
