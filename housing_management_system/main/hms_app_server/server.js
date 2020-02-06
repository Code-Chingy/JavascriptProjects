const express = require("express");
const bodyParser = require("body-parser");
const Functions = require('./functions.js');
const Controllers = require('../controllers.js');
const DBConnector = require('./utils/database.js');
const app  = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
// bodyParser = require('body-parser');
// app.use(express.static('./views/static/public'));

app.get("/", (req, res)=>{
    /*
        send welcome page, about , contact , advertise our service, api documentation etc
    */
    res.status(200).end("<h1>Welcome</h1><br/><p>to the housing management system api home page</p>");
});

app.post("/", (req, res)=>{
    /*
        send welcome page, about , contact , advertise our service, api documentation etc
    */
    console.log("\n\n");
    console.log(req.query);
    console.log(req.body);
    console.log("\n\n");
    res.status(200).json({result: {request: req.toString(), response: res.toString()}});
});


app.post("/signup", (req, res)=>{
    Functions.registerUser(req, res);
});


app.post("/setup-building", (req, res)=>{
    Functions.setupBuilding(req, res);
});


app.post("/setup-building/add_room", (req, res)=>{
    Functions.setupAddRoom(req, res);
});


app.post("/login", (req, res)=>{
    Functions.loginUser(req, res)
});

app.post("/login/auth/token", (req, res)=>{
    Functions.getAuthToken(req, res);
});


app.post("/forgot_password", (req, res)=>{
    console.log(req.query);
    /*
        recover admin password using verified email
    */
    res.status(200).json({"result": "success"});
});


app.post("/verify_email", (req, res)=>{
    console.log(req.query);
    /*
        verify admin email
    */
    res.status(200).json({"result": "success"});
});


app.post("/edit_details", (req, res)=>{
    console.log(req.query);
    /*
        change admin details | password, email, fullname
    */
    res.status(200).json({"result": "success"});
});


app.post("/workspace", (req, res)=>{
    /*
        get rooms available , rooms occupied and time left for expiry and client payment details
     */
    Functions.getWorkSpace(req, res);
});


app.post("/workspace/query", (req, res)=>{
    console.log(req.query);
    /*
        search anything with this route, rooms, clients, admins, late payers, due client, reserved rooms etc
     */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/add_client", (req, res)=>{
    console.log(req.query);
    /*
        add new client but commit if user reserves or check_in a room
            info :
                -name
                -contact
                -job
                -dynamic-info

     */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/remove_client", (req, res)=>{
    console.log(req.query);
    /*
        checkout client and delete client from db
     */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/client/details", (req, res)=>{
    console.log(req.query);
    /*
        get client info | room number, room type, payment info, user personal details - name etc
     */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/client/details/edit", (req, res)=>{
    console.log(req.query);
    /*
       edit client info | room number, room type, payment info, user personal details - name etc
    */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/client/reserve_room", (req, res)=>{
    console.log(req.query);
    /*
         reserve rom for client (put in prefereneces - if paid | free to reserve)
      */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/client/check_in_room", (req, res)=>{
    console.log(req.query);
    /*
         give room to client and start count down time for expiry
      */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/client/check_out_room", (req, res)=>{
    console.log(req.query);
    /*
        check user payment-status and alert user
         check user out of room and declare room empty
     */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/settings", (req, res)=>{
    console.log(req.query);
    /*
        add new admins, change building info, delete account, reset database - redo setup, edit and add more setup info
        more option
            -- delete client from database on check_out
            -- //think of more options

     */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/delete_account", (req, res)=>{
    console.log(req.query);
    /*
        delete building , users and client from database
    */
    res.status(200).json({"result": "success"});
});


app.post("/workspace/logout", (req, res)=>{
    console.log(req.query);
    /*
        log admin out
    */
    res.status(200).json({"result": "success"});
});


//app.listen(3000, '127.0.0.0.1', 551 , callback)
//app.listen(3000, '127.0.0.0.1', callback)


module.exports.AppServer = app;

module.exports.Database = DBConnector;