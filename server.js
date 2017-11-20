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
const router = express.Router();             
const feePaymentRoutes = new FeePaymentRoutes(miningRepository, config, router);

app.use('/api', feePaymentRoutes.getRouter());

app.use(function (req, res, next) {

	res.status(404).send("Sorry, can't find that!");
})

app.listen(config.api.port);
logger.info('API listens on port ' + config.api.port);

