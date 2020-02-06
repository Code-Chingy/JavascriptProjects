let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const Admin =  new Schema({
    username: String,
    password: String,
    email: String,
    full_name: String,
    auth_token: [String],
    building: String /* reference to building */,
    capabilities: [String],
});

const AdminModel = mongoose.model('Admin', Admin);


const Client =  new Schema({
    full_name: String,
    contact: String,
    payment: {
        payment_method: String,
        total_price: Number,
        amount_paid: Number
    },
    photo_url: String,
    state: String /* -- reserved, checked in, checked_out */,
    reserved_time: String,
    checked_in_at: String /* time checked in of room*/,
    checked_out_at: String /* time checked out of room */,
    check_out_timestamp: String /* time to check out of room */,
    room: String /* reference to room */,
    building: String /* reference to building */,
    info: {/* like job title, if student school and student id etc */},
});

const ClientModel = mongoose.model('Client', Client);


const Building =  new Schema({
    name: String,
    type: String,
    location: String,
    rooms: [
        /*
      *    {
      *     type
      *     price
      *     utilities
      *     identifiers
      *     rented_rooms
      *    }
      * */
    ]

    ,
    admins: [String],
    payment_methods: [String],
});

const BuildingModel = mongoose.model('Building', Building);


const Room =  new Schema({
    state: String /* -- occupied, available */ ,
    client: Number /* reference to client */ ,
    location: String,
    description: String,
    utilities: [String],
});

const RoomModel = mongoose.model('Room', Room);



//Setting up Admins Schema and Model
//SCHEMA

//Methods
Admin.method('logout', ()=>{});
Admin.method('hasAbility', (ability)=>{
    return this.capabilities.find(ability);
});
Admin.method('addAbility', (ability)=>{
    if (['select','delete','update','insert','add_worker', 'remove_worker'].find(ability) &&
        !this.capabilities.find(ability)){
        this.capabilities.push(ability);
        this.save();
    }
});
Admin.method('removeAbility', (ability)=>{
    if (['select','delete','update','insert','create_worker'].find(ability) &&
        this.capabilities.find(ability)){
        this.capabilities.reduce((item)=> item !== ability);
        this.save();
    }
});
Admin.method('addWorker', async function(args){

});
Admin.method('removeWorker', async function(args){

});
Admin.method('getBuilding', async function(){
    return await Building.findOne({_id: this.building})
});
//Queries

Admin.statics.findByUsername = async function (key){
    return await this.find({username: new RegExp(key, 'i')});
};

Admin.statics.findByEmail = async function (key){
    return await this.find({email: new RegExp(key, 'i')});
};

Admin.statics.findByName = async function (key){
    return await this.find({full_name: new RegExp(key, 'i')});
};

Admin.statics.findByAbility = async function (key){
    return await this.find({capabilities: new RegExp(key, 'i')});
};

// Admin.query.byUsername =  function (key){
//     return this.where({ username: new RegExp(key, 'i') });
// };
//
// Admin.query.byEmail = (key)=>{
//     return this.where({ email: new RegExp(key, 'i') });
// };
//
// Admin.query.byName = (key)=>{
//     return this.where({ full_name: new RegExp(key, 'i') });
// };
//
// Admin.query.byAbility = (key)=>{
//     return this.where({ capabilities: new RegExp(key, 'i') });
// };

//MODEL
//Empty



//Setting up Admins Schema and Model
//SCHEMA

//Methods
Client.method('pay', ()=>{});
Client.method('checkOut', (ability)=>{});
Client.method('addInfo', (ability)=>{});
Client.method('putDocument', (ability)=>{});
//Queries


//MODEL
//Empty





/*

    //note: schema.where({ name: new RegExp(name, 'i') });
    //note: schema.find({ name: new RegExp(name, 'i') });
    //note: schema.find({ 'name' });

    //adding methods to schema : use schema.methods.methodName = function (args){ //implementation }
    //call await schema.methodName(args)

    //adding static methods : use schema.statics.staticMethodName(args){} || schema.static('staticMethodName', (args)=>{})
    //eg let result = await ModelInstance.staticMethodName(args)
    //note : await waits for async task to complete | turns async to sync

    //adding query helper
    //schema.query.queryHelperName = function(name) {}

  //indexing

  var animalSchema = new Schema({
    name: String,
    type: String,
    tags: { type: [String], index: true } // field level
  });

  animalSchema.index({ name: 1, type: -1 }); // schema level


  //virtual methos

  personSchema.virtual('fullName').
  get(function() { return this.name.first + ' ' + this.name.last; }).
  set(function(v) {
    this.name.first = v.substr(0, v.indexOf(' '));
    this.name.last = v.substr(v.indexOf(' ') + 1);
  });

  axl.fullName = 'William Rose';

 */

//note: await modelInstance.save() to commit to db

module.exports = {

    schemas: {
        Admin: Admin,
        Client: Client,
        Building: Building,
        Room: Room
    },
    Admin: AdminModel,
    Client: ClientModel,
    Building: BuildingModel,
    Room: RoomModel,
};
