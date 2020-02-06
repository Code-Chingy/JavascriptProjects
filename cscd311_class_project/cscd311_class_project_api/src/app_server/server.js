const express       = require("express");
const Functions     = require('./functions.js');
const MiddleWares   = require('./middlewares.js');
const Controllers   = require('../controllers.js');
const DBConnector   = require('./utils/database.js');

let flash    	    = require('connect-flash');
let jwt             = require('jsonwebtoken');
let cookie_parser   = require('cookie-parser');
// let session         = require('express-session');
const app           = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
// app.use(session());
app.use(cookie_parser());
app.engine('html', require('ejs').renderFile);
app.use(flash());
// app.set('view engine', 'ejs');

app.get("/", (req, res)=>{
    res.render('index.html');
});

app.get("/login", (req, res)=>{
    res.render('login.html');
});

app.post("/login", (req, res)=>{
    Functions.loginUser(req, res);
});

app.get("/profile", MiddleWares.authenticationRequired, (req, res)=>{
    let student = req.student;
    //TODO : list student names : dob : level : course : residence status and registered hall
    student.fullname = student.getFullName();
    student.dob = "5 September 1997";
    res.status(200).render('profile.html', {student: student});
});

app.get("/register-residence",  MiddleWares.authenticationRequired,(req, res)=>{
    //TODO: assign student hall
    res.status(200).render('setup-residence.html');
});


app.get("/get-data",  MiddleWares.authenticationRequired,(req, res)=>{
    //TODO: assign student hall
    let body = req.body;
    let student = req.student;
    //TODO: allow student change hall if already has hall
    // res.status(200).render('setup-residence.views', {halls: halls, blocks: blocks});
});


app.get("/hall-list", (req, res)=>{
    //TODO: assign student hall
    require('./models/hall.js').Hall.find({}).exec((err, halls)=>{
        if (!err){
            let hall_list = halls.map((hall)=>{
                return {id: hall._id, name: hall.name};
            });

            res.status(200).render('hall-list.html', {hall_list: hall_list});
        }
    });
});


app.get("/hall-databases/:hall", (req, res)=>{
    if (req.params.hasOwnProperty('hall')) {
        let hall = req.params.hall;
        if (hall != null) {
            require('./models/student.js').Student
                .find({'residence_info.hall_id': hall._id}).exec((err, students)=>{
                    if (!err && students != null) {
                        require('./models/hall.js').Hall.findOne({_id: hall}).exec((err, hall)=>{
                            if (hall != null) {
                                res.render("hall-data-table-view.html", {hall_name: hall.name, students: students});
                            }
                        });
                    }
                    else{
                        res.render("hall-data-table-view.html", {hall_name: hall.name, students: []});
                    }
            });
        }
    }
});

module.exports.AppServer = app;

module.exports.Database = DBConnector;