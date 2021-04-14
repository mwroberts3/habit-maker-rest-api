const express = require('express'),
app = express();

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const habitRoutes = require('./routes/habits-routes');
const authRoutes = require('./routes/auth-routes');

app.use(bodyParser.json()); //application/json

app.get("/", (req, res) => {
    res.send("Habit Maker Rest API");
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Timestamp');
    next();
});

app.use('/habits', habitRoutes);

app.use(authRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ko3ht.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(process.env.PORT || 5050);
    })
    .catch(err => console.log(err));