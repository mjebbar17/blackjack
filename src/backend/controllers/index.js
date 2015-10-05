
    'use strict';

    var express = require('express');
    var router = express.Router();

    router.use(require('./ResultCtrl'));

    module.exports = router;
