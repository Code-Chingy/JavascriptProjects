const Database      = require('./utils/database.js');
const Student       = require('./models/student.js').Student;
const Hall          = require('./models/hall.js').Hall;
const bcrypt        = require('bcrypt');
let jwt             = require('jsonwebtoken');
const SECRET_KEY    = "Code-Chingy@TechupStudio";


function validateAuthToken(token) {
    //TODO : decrypt with bycrypt
    try {
        return token.toString().split(":").length === 2;
    }catch (e) {
        return false;
    }
}


function getCredentialsFromAuthToken(token) {
    //decrypt-token let token = bcrypt.getRounds(tokenHash);
    if (validateAuthToken(token)) {
        let credentials = token.split(":");
        return {
            username: credentials[0],
            password: credentials[1],
        }
    }
}


async function validateUserLoginCredentials(username, password) {
    let student =  await Student.findOne({id: username, password: password});
    return student !== null;
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
        let token = username+':'+password;
        // let salt = bcrypt.genSaltSync(10);
        // let hashToken = bcrypt.hashSync(token, salt);
        let student = await getStudentWithCredentials(username, password);
        if (student !== null){
            console.log(student);
            student.auth_token.push(token);
            let result =  await Student.updateOne({_id: student._id}, {auth_token: student.auth_token}, (e, r)=>{});
            if (result.ok === 1 && result.n === 1){
                return token;
            }
        }
    }
}


async function getStudentWithCredentials(username, password) {
    let found = await validateUserLoginCredentials(username, password);
    if (found){ return await Student.findOne({id: username}) }
}


async function getStudentFromAuthToken(token) {
    let credentials = getCredentialsFromAuthToken(token);
    return await getStudentWithCredentials(credentials.username, credentials.password);
}


//args validators

function validateSignUpArgs(args){
    return args.hasOwnProperty('username') && args.hasOwnProperty('password') &&
        args.hasOwnProperty('email') && args.hasOwnProperty('full_name');
}

function validateSignInArgs(args){
    return args.hasOwnProperty('username') && args.hasOwnProperty('password');
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

        Student.findOne({id: argsData.username}).exec(function(err, student) {
            if (student === null){
                Student.findOne({ email: argsData.email}).exec(function(err, student) {
                    if (student === null){

                        bcrypt.genSalt(10, (err, salt)=>{
                            bcrypt.hash(argsData.password, salt, (err, hash)=>{
                                let student = new Student({
                                    username: argsData.username,
                                    password: hash,
                                    email: argsData.email,
                                    full_name: argsData.full_name,
                                    auth_token: [],
                                    capabilities: ['select','delete','update','insert','add_worker', 'remove_worker']
                                });

                                student.save();

                                console.log("new user added : ", student);
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

        Student.findOne({ id: argsData.username}).exec((err, student)=>{
            if (student === null || !student.verifyPassword(argsData.password)){
                res.status(500).json({
                    status: "failed",
                    result: "invalid login credentials!"
                });
            }
            else{
                const  expiresIn  =  24  *  60  *  60;
                const  accessToken  =  jwt.sign({ id:  student.id }, SECRET_KEY, {
                    expiresIn:  expiresIn
                });
                res.cookie('auth_token', accessToken, {maxAge: expiresIn});
                res.redirect("/profile");
            }
        });
    }
    else{
        res.status(500).json({
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
        getStudentWithCredentials(argsData.username, argsData.password).then((student)=>{
            if (student !== null){
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

function getHallData(hall){
    //TODO: get all students in hall return info blocks rooms students
}

module.exports = {
    registerUser: registerUser,
    loginUser: loginUser,
    getAuthToken: getAuthToken,
    getStudentWithToken: getStudentFromAuthToken,
    getHallData: getHallData 
};