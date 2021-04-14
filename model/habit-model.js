const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const habitSchema = new Schema(
    {
        description: String,
        active: Boolean,
        passiveUpdate: Boolean,
        goal: Number,
        daysLogged: Number,
        daysLeft: Number,
        createdAt: String, 
        lastUpdated: String,
        updatedToday: Boolean,
        completed: Boolean,
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
);

module.exports = mongoose.model('Habit', habitSchema);