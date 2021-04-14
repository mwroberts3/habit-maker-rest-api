const express = require('express');
const router = express.Router();

const habitController = require('../controllers/habits-controller');
const tokenCheck = require('../middleware/token-check');

router.get('/', tokenCheck, habitController.loadHabits);

// router.get('/habit-complete', tokenCheck, habitController.habitComplete);

router.post('/add-habit', tokenCheck, habitController.addNewHabit);

router.post('/log-habit', tokenCheck, habitController.logHabit);

router.post('/times-up', tokenCheck, habitController.timesUpLog);

router.delete('/delete-habit', tokenCheck, habitController.deleteHabit);


module.exports = router;

