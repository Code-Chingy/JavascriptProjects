const Database = require('./utils/database.js');
const Models = require('../models.js');
const Admin = Models.Admin;
const Client = Models.Client;
const Building = Models.Building;
const bcrypt = require('bcrypt');



function validateAuthToken(token) {
    //TODO : decrypt with bycrypt
    try {
        return token.toString().split(":-:")[1].split('|').length === 3;
    }catch (e) {
        return false;
    }
}


function getCredentialsFromAuthToken(token) {
    //decrypt-token let token = bcrypt.getRounds(tokenHash);
    if (validateAuthToken(token)) {
        let credentials = token.toString().split(":-:")[1].split('|');
        return {
            username: credentials[0],
            password: credentials[1],
            timestamp: credentials[2]
        }
    }
}


async function validateUserLoginCredentials(username, password) {
    let admin =  await Admin.findOne({ username: username});
    return bcrypt.compareSync(password, admin.password)
}


async function validateUserAuthToken(token) {

    if (validateAuthToken(token)) {
        let credentials = getCredentialsFromAuthToken(token);
        if (credentials !== null) {
            let now = new Date();
            let before = new Date(credentials.timestamp);
            let timePast = now - before;
            if (timePast < (60000 * 60)) {
                return await validateUserLoginCredentials(credentials.username, credentials.password)
            }
        }
    }

    return false;
}


async function generateUserAuthToken(username, password) {
    let result = await validateUserLoginCredentials(username, password);
    if (result){
        let token = 'token:-:'+username+'|'+password+'|'+new Date();
        // let salt = bcrypt.genSaltSync(10);
        // let hashToken = bcrypt.hashSync(token, salt);
        let admin = await getUserWithCredentials(username, password);
        if (admin !== null){
            console.log(admin);
            admin.auth_token.push(token);
            let result =  await Admin.updateOne({_id: admin.id}, {auth_token: admin.auth_token}, (e, r)=>{});
            if (result.ok === 1 && result.n === 1){
                return token;
            }
        }
    }
}


async function getUserWithCredentials(username, password) {
    let found = await validateUserLoginCredentials(username, password);
    if (found){ return await Admin.findOne({username: username}) }
}


async function getUserFromAuthToken(token) {
    let credentials = getCredentialsFromAuthToken(token);
    return await getUserWithCredentials(credentials.username, credentials.password);
}


//args validators

function validateSignUpArgs(args){
    return args.hasOwnProperty('username') && args.hasOwnProperty('password') &&
        args.hasOwnProperty('email') && args.hasOwnProperty('full_name');
}

function validateSignInArgs(args){
    return args.hasOwnProperty('username') && args.hasOwnProperty('password');
}

function validateAddRoomArgs(args){
    return args.hasOwnProperty('type') && args.hasOwnProperty('price') && args.hasOwnProperty('utilities')
        && args.hasOwnProperty('identifiers') && args.hasOwnProperty('rented_rooms');
}

function validateSetupArgs(args) {
    //TODO : decrypt with bycrypt
    let result = false;
    if (args.hasOwnProperty('name') && (typeof args.name === "string" || typeof args.name === "number")){
        result = true;
    }
    if (args.hasOwnProperty('type') && (typeof args.name === "string" || typeof args.name === "number")){
        result = true;
    }
    if (args.hasOwnProperty('location') && args.hasOwnProperty('payment_methods')){
        if (typeof args.payment_methods === "object"){

            if (args.hasOwnProperty('rooms')){
                 return typeof args.rooms === "object";
            }
            return true;
        }
    }

    return result;
}


/*
get user info validate then register building if not exist
redirect user to /setup - with user token
*/

function registerUser(req, res) {

    let argsData = req.body;

    if (validateSignUpArgs(argsData)){

        Admin.findOne({ username: argsData.username}).exec(function(err, admin) {
            if (admin === null){
                Admin.findOne({ email: argsData.email}).exec(function(err, admin) {
                    if (admin === null){

                        bcrypt.genSalt(10, (err, salt)=>{
                            bcrypt.hash(argsData.password, salt, (err, hash)=>{
                                let admin = new Admin({
                                    username: argsData.username,
                                    password: hash,
                                    email: argsData.email,
                                    full_name: argsData.full_name,
                                    auth_token: [],
                                    capabilities: ['select','delete','update','insert','add_worker', 'remove_worker']
                                });

                                admin.save();

                                console.log("new user added : ", admin);
                                res.status(200).json({status: "success", result: {redirect: "/setup"}});
                            });
                        });
                    }
                    else{
                        console.log("username already exist!");
                        res.status(200).json({status: "success", result: {message: "email already exist!"}});
                    }
                });
            }
            else {
                console.log("username already exist!");
                res.status(200).json({status: "success", result: {message: "username already exist!"}});
            }
        });
    }
    else{
        res.status(200).json({
            status: "failed",
            result: {message: "invalid registration arguments : username, password, email and full_name required"}
        });
    }

}


/*
 login user
*/

function loginUser(req, res) {

    let argsData = req.body;

    if (validateSignInArgs(argsData)){

        Admin.findOne({ username: argsData.username}).exec(function(err, admin){
            if (admin === null){
                res.status(200).json({
                    status: "failed",
                    result: "invalid login credentials!"
                });
            }
            else{
                bcrypt.compare(argsData.password, admin.password).then((match)=>{
                    if (match){
                        generateUserAuthToken(argsData.username, argsData.password).then((token)=>{
                            if (token !== undefined){
                                console.log(token);
                                res.status(200).json({
                                    status: "success",
                                    result: {token: token}
                                })
                            }
                            else{
                                res.status(200).json({
                                    status: "failed",
                                    result: "could not generate token"
                                })
                            }
                        });
                    }
                    else{
                        res.status(200).json({
                            status: "failed",
                            result: "invalid login credentials"
                        });
                    }
                });
            }
        });
    }
    else{
        res.status(200).json({
            status: "failed",
            result: {message: "invalid registration arguments : username and password required"}
        });
    }
}


/*
 login user
*/

function getAuthToken(req, res) {
    //TODO : generate token using jwt
    let argsData = req.body;
    if (validateSignInArgs(argsData)){
        getUserWithCredentials(argsData.username, argsData.password).then((admin)=>{
            if (admin !== null){
                generateUserAuthToken(argsData.username, argsData.password).then((token)=>{
                    console.log(token);
                    if (token === undefined){
                        res.status(200).json({status: "failed", result: "could not generate token!"})
                    }
                    else{
                        res.status(200).json({status: "success", result: {token: token}})
                    }
                });
            }
            else{
                res.status(200).json({status: "failed", result: "invalid user credentials!"})
            }
        });
    }
}


/*
 make admin user add details about building
*/

function setupBuilding(req, res) {

    tokenRequiredWrapper(req, res).then((data)=>{

        let argsData = data.request.body;

        if (validateSetupArgs(argsData)){
            //validate Args Data
            getUserFromAuthToken(data.request.headers['auth-token']).then((admin)=>{

                if (admin !== null){

                    if (admin.building === undefined || admin.building === null){
                        Building.findOne({name: argsData.name}).exec(function (err, result) {
                            if (result === null){
                                let building = new Building();
                                building.name = argsData.name;
                                building.type = argsData.type;
                                building.location = argsData.location;
                                building.payment_methods = argsData.payment_methods;
                                building.admins = [admin._id];
                                building.rooms = [];
                                building.save();
                                admin.building = building._id;
                                Admin.updateOne({_id: admin.id}, {building: building._id}, (e, r)=>{
                                    data.response.status(200).json({status: "success", result: {"redirect": "/workspace"}});
                                });
                            }
                            else{
                                data.response.status(200).json({status: "failed", result: "building with this name already exist!"});
                            }
                        });
                    }else{
                        data.response.status(200).json({status: "failed", result: "you already setup a building!"});
                    }

                }
                else{
                    data.response.status(200).json({status: "failed", result: "user not found"});
                }
            });
        }

    }).catch((data)=>{});

}

function setupAddRoom(req, res) {
    //get and verify auth then show details about admin, building, clients

    tokenRequiredWrapper(req, res).then((data)=>{

        let argsData = data.request.body;

        if (validateAddRoomArgs(argsData)) {
            //validate Args Data
            getUserFromAuthToken(data.request.headers['auth-token']).then((admin)=>{
                if (admin.building !== undefined && admin.building !== null){
                    Building.findOne({_id: admin.building}).then((building)=>{
                        if (building !== null){
                            building.rooms.push({
                                type: argsData.type,
                                price: argsData.price,
                                utilities: argsData.utilities,
                                identifiers: argsData.identifiers,
                                rented_rooms: argsData.rented_rooms
                            });
                            //TODO : validate new rooms type and check room identifiers and rented rooms list
                            Building.updateOne({_id: building._id}, {rooms: building.rooms}, (e,r)=>{
                                data.response.status(200).json({status: r, result: building});
                            });
                        }
                    });
                }
                else{
                    data.response.status(200).json({status: "failed", result: "you haven't registered a building!"});
                }
            });
        }
        else{
            data.response.status(200).json({result: "invalid args"})
        }

    }).catch((data)=>{});

}

function getWorkSpace(req, res) {
    //get and verify auth then show details about admin, building, clients
    tokenRequiredWrapper(req, res).then((data)=>{
        getUserFromAuthToken(req.headers['auth-token']).then((admin)=> {
            if (admin.building !== undefined) {
                Building.findOne({_id: admin.building}).then((building) => {
                    if (building !== null){
                        data.response.status(200).json({status: "success", result: building})
                    }
                    else{
                        data.response.status(200).json({status: "failed", result: "could not find your building"})
                    }
                });
            }
            else{
                data.response.status(200).json({
                    status: "failed",
                    result: "you haven't registered any building. please register your building at /setup"
                });
            }
        });
    }).catch((data)=>{ });
}

function tokenRequiredWrapper(req, res){
    return new Promise((resolve,reject)=>{
        if (req.headers.hasOwnProperty('auth-token')) {

            let token = req.headers['auth-token'];

            validateUserAuthToken(token).then((valid)=>{
                if (valid){
                    resolve({request: req, response: res});
                }
                else{
                    res.status(200).json({status: "failed", result: "invalid token"});
                    reject({request: req, response: res});
                }
            });
        }
        else{
            res.status(200).json({status: "failed", result: "no auth-token provided"});
            reject({request: req, response: res});
        }
    });

}

module.exports = {
    registerUser : registerUser,
    loginUser : loginUser,
    getAuthToken : getAuthToken,
    setupBuilding : setupBuilding,
    setupAddRoom : setupAddRoom,
    getWorkSpace : getWorkSpace
};