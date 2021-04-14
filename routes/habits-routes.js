const express = require('express');
const router = express.Router();

const habitController = require('../controllers/habits-controller');
const tokenCheck = require('../middleware/token-check');

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Timestamp');
//     next();
// });

router.get('/habits', tokenCheck, habitController.loadHabits);

router.post('/add-habit', tokenCheck, habitController.addNewHabit);

router.post('/log-habit', tokenCheck, habitController.logHabit);

router.post('/times-up', tokenCheck, habitController.timesUpLog);

router.delete('/delete-habit', tokenCheck, habitController.deleteHabit);

module.exports = router;

