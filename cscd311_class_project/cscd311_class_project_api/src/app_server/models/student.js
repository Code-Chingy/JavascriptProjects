let mongoose    = require('mongoose');
let bcrypt      = require('bcrypt-nodejs');
let Schema      = mongoose.Schema;


const StudentSchema = new Schema({
    id : String,
    pin : String,
    course: String,
    gender: String,
    dob: Date,
    firstname: String,
    lastname: String,
    middlename: String,
    level: Number,
    password: String,
    residence_info: {
        status: Boolean,
        hall_id: String,
        block_id: String,
        room_id: String
    },
    department: String,
});

StudentSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


StudentSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

StudentSchema.methods.getFullName = function(){
    return "" + this.lastname
            + (this.middlename === undefined || this.middlename === null) ? "": this.middlename
            + this.firstname;
};

const Student = mongoose.model('Student', StudentSchema);

module.exports = {
    Student: Student,
    StudentSchema: StudentSchema
};