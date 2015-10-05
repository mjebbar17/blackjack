
'use strict';

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var db = require('../models');
var ResultModel = db.ResultModel;

router.post('/result', function (req, res) {

    var resultObj =
    {
        username : req.body.username,
        cards: req.body.cards,
        stake: req.body.stake,
        result: req.body.result,
        cardValue: req.body.cardValue
    };

    var resultModel = new ResultModel(resultObj);

    resultModel.save(function (err, saved) {
        if (err)res.status(500).send(err);
        else res.status(201).send(saved);
    });
});

router.get('/result/:username', function(req, res){

    var username = req.params.username;

    ResultModel.find({'username' : username}, function(err, docs){
        if (err) {
            res.status(500).send(err);
        }
        else {

            res.status(200).send(generateStats(docs));
        }
    });

});

module.exports = router;

function generateStats(results){
    var results = {
        games : results.length,
        wins : _.filter(results, function(result){if(result.result == "win") return result}).length,
        losses : _.filter(results, function(result){if(result.result == "lost") return result}).length,
        draws : _.filter(results, function(result){if(result.result == "draw") return result}).length
    };
    return results;
}