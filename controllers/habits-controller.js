const Habit = require('../model/habit-model');
const Mongoose = require('mongoose');

exports.loadHabits = async (req, res, next) => {
    let currentDate = req.get('Timestamp');
    let editedHabits = [];
    let failedHabits = [];

    // let habits = await Habit.find({ creator: req.userId});
    let habits = await Habit.find({ creator: "603168f75359b2042c42b1d4"});

    habits = Array.from(habits);

    for(let i = 0; i < habits.length; i++) {  
        let diffTime = Math.abs(new Date(currentDate) - new Date(habits[i].lastUpdated));
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // check how many days have passed since last log in and adjust accordingly
        if (diffDays > 0) {
            if (!habits[i].active) {
                if (habits[i].updatedToday) {
                    habits[i] = await Habit.findOneAndUpdate({ creator: req.userId, description: habits[i].description }, { lastUpdated: new Date(currentDate), $inc : {daysLogged: diffDays - 1, daysLeft: -diffDays}}, {
                        new: true
                    })
                } else {
                    habits[i] = await Habit.findOneAndUpdate({ creator: req.userId, description: habits[i].description }, { lastUpdated: new Date(currentDate), $inc : { daysLogged: diffDays,daysLeft: -diffDays}}, {
                        new: true
                    })

                    if (habits[i].daysLogged === habits[i].goal) {
                        habits[i] = await Habit.findOneAndUpdate({ creator: req.userId, description: habits[i].description}, {completed: true})
                    }
                }
            }

            if (habits[i].active) {
                habits[i] = await Habit.findOneAndUpdate({ creator: req.userId, description: habits[i].description }, { lastUpdated: new Date(currentDate), $inc : { daysLeft: -diffDays }}, {
                    new: true
                })
            }
            
            habits[i] = await Habit.findOneAndUpdate({ creator: req.userId, description: habits[i].description }, { updatedToday: false }, {
                new: true
            })
        }
        
        // check if days passed has reached 0
        // goal has not been reached
        if (habits[i].daysLeft <= 0 && !habits[i].completed) {
            failedHabits.push(habits[i].description);
        }
    }

    habits = await Habit.find({ creator: req.userId});

    // push retreived data into new array to hide userId
    Array.from(habits).forEach((habit) => {
        let habitToLoad = {};
        habitToLoad.active = habit.active;
        habitToLoad.description = habit.description;
        habitToLoad.goal = habit.goal;
        habitToLoad.daysLogged = habit.daysLogged;
        habitToLoad.daysLeft = habit.daysLeft;
        habitToLoad.skipDays = habit.skipDays;
        habitToLoad.streak = habit.streak;
        habitToLoad.lastUpdated = habit.lastUpdated;
        habitToLoad.createdAt = habit.createdAt;
        habitToLoad.updatedToday = habit.updatedToday;
        habitToLoad.completed = habit.completed;

        editedHabits.push(habitToLoad);
    });

    // check for any failed habits
    for (let i=0; i < editedHabits.length; i++) {
        for (let k=0; k < failedHabits.length; k++) {
            if (editedHabits[i].description == failedHabits[k]) {
                editedHabits[i].failed = true;
            } else {
                editedHabits[i].failed = false;
            }
        }
    }
    
    res.json({editedHabits});
};

exports.addNewHabit = (req, res, next) => {
    console.log(req.body.createdAtDate);

    const habit = new Habit({
        description: req.body.description,
        active: req.body.updateStyle == 'active' ? true : false,
        goal: req.body.daysGoal,
        daysLogged: 0,
        daysLeft: req.body.daysLeft,
        lastUpdated: req.get('Timestamp'),
        updatedToday: false,
        completed: false,
        createdAt: req.body.createdAtDate,
        creator: Mongoose.Types.ObjectId(req.userId)
    });
    
    habit.save()
        .then(() => {
            res.status(201).json({message: 'new habit added'});
        })
        .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
        });
    
};

exports.logHabit = async (req, res, next) => {
    console.log(req.userId, req.body.habitDesc);
    let habitType;

    let habit = await Habit.findOne({ creator: req.userId, description: req.body.habitDesc });

    if (habit.active && habit.daysLogged === habit.goal - 1) {
        habitType = { 
            type: 'active',
            increment: 1,
            completed: true
        }
    } else if (habit.active) {
        habitType = {
            type: 'active',
            increment: 1,
            completed: false
        }
    } else {
        habitType = {
            type: 'passive',
            increment: 0,
            completed: false
        }
    }

    // check to see if habit has already been updated today
    habit.updatedToday === true ? habitType.increment = 0 : '';

    Habit.findOneAndUpdate({ creator: req.userId, description: req.body.habitDesc }, { updatedToday: true, lastUpdated: req.body.lastUpdated, completed: habitType.completed, $inc : { daysLogged: habitType.increment}}, {
        new: true
    })
    .then((habit) => {
        let habitToUpdate = {};
        habitToUpdate.active = habit.active;
        habitToUpdate.description = habit.description;
        habitToUpdate.goal = habit.goal;
        habitToUpdate.daysLogged = habit.daysLogged;
        habitToUpdate.daysLeft = habit.daysLeft;
        habitToUpdate.skipDays = habit.skipDays;
        habitToUpdate.streak = habit.streak;
        habitToUpdate.lastUpdated = req.body.lastUpdated;
        habitToUpdate.updatedToday = habit.updatedToday;
        habitToUpdate.createdAt = habit.createdAt;

        console.log(habitToUpdate);
        res.status(201).json(habitToUpdate);

        console.log(new Date(habit.createdAt).getTime(), new Date(habit.lastUpdated).getTime());
    })
    .catch(err => {
        if (!err.statusCode) {
        err.statusCode = 500;
        }
        next(err);
    });
}

exports.timesUpLog = async (req, res, next) => {
    // active habits that aren't logged the previous day need to have a day subtracted from daysLeft

    let habits = Array.from(req.body);
    console.log(habits[0].description.toString());

    for (let habit of habits) {
        await Habit.findOneAndUpdate({ creator: req.userId, description: habit.description.toString()}, { updatedToday: false }, {new: true});
    }

    res.status(201).json({ message: 'habit updated' });
}


exports.deleteHabit = (req, res, next) => {
    Habit.findOneAndDelete({ creator: req.userId, description: req.body.description })
        .then(() => {
            res.status(204).json();
        })
        .catch(err => {
            if (!err.statusCode) {
            err.statusCode = 500;
            }
            next(err);
        });
};