let Student     = require('./models/student.js').Student;
let jwt         = require('jsonwebtoken');
const SECRET_KEY    = "Code-Chingy@TechupStudio";

function authenticationRequired(req, res, next) {
    let auth_token = req.cookies.auth_token;
    jwt.verify(auth_token, SECRET_KEY, function(err, decoded) {
        if (!err) {
            let stu_id = decoded.id;
            Student.findOne({ id: stu_id}).exec(function(err, student){
                if (student != null){
                    req.student = student;
                    next();
                }
                else{
                    res.redirect('/login');
                }
            })
        }
        else{
            res.redirect('/login');
        }
    });
}

module.exports = {
    authenticationRequired : authenticationRequired
};