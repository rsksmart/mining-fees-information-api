#!/usr/bin/env node

const config = require('./config.json');
const express = require('express');
const app = express();

const logger = require('./services/logger');

const mongoose = require('mongoose');
require('./data/models/feePaymentModel');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb.connectionString); 

const MiningRepository = require('./data/miningRepository');
const FeePaymentRoutes = require('./routes/feePaymentRoutes');

const miningRepository = new MiningRepository(mongoose);

var Web3 = require('web3');
var url = 'http://' + config.rskj.host + ':' + config.rskj.port;
var web3 = new Web3(new Web3.providers.HttpProvider(url));

var FeePaymentService = require('./services/feePaymentService');
var feePaymentService = new FeePaymentService(miningRepository, web3, config);

const router = express.Router();
const feePaymentRoutes = new FeePaymentRoutes(feePaymentService, config, router);

app.use('/api', feePaymentRoutes.getRouter());

app.use(function (req, res, next) {
	result = {};
	result.message = "Sorry, can't find that!";
	result.value = [];
	res.status(404).send(result);
})

app.listen(config.api.port);
logger.info('API listens on port ' + config.api.port);

