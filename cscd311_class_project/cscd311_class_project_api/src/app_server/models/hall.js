let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let _           = require('../utils/scripts/underscore.js');

/*
structure
    name : '',
    blocks:[
            {name: "Block " + i, rooms: [
                {type: '4-in-room', identifiers: [
                    {
                        room_id: prefix+i+postfix,
                        capacity: capacity,
                        occupants: [],
                        room_gender: (gender==='mf')? (i%2 === 0)? "male": "female" : gender
                    },
                    {
                        room_id: prefix+i+postfix,
                        capacity: capacity,
                        occupants: [],
                        room_gender: (gender==='mf')? (i%2 === 0)? "male": "female" : gender
                    }
                ]},
                {type: '2-in-room', identifiers: get_num_array(101, 150, 2, "mf", i, "")},
                {type: '1-in-room', identifiers: get_num_array(151, 170, 1, "mf", i, "")}
        ])
    ]

 */

const HallSchema = new Schema({
    name: String,
    blocks: [
        {
            name: String,
            rooms: [Object
                // {
                //     type: String,
                //     identifiers: [
                //         {
                //             room_id: String,
                //             capacity: Number,
                //             occupants: [String],
                //             room_gender: String
                //         }
                //     ]
                // }
            ]
        }
    ]
});

HallSchema.methods.getBlocksDefinitions = function(){
    return this.blocks.map((block)=> {
        return {
            name: block.name,
            room_types: block.rooms.map((room_def) => {
                return room_def.type;
            })
        };
    });
};

HallSchema.methods.getBlockRoom = function(query, room_query){
    return _.where(
                _.findWhere(
                    _.findWhere(
                        this.blocks, {name: query.block_name}
                        ).rooms, {type: query.room_type}
                        ).identifiers, room_query
    );
};

HallSchema.methods.getBlockRoomsByType = function(query){
    //room_obj = {room_id: query.room_id, room_gender:"male", capacity: 4}
    return _.findWhere(
            _.findWhere(
                this.blocks, {name: query.block_name}
            ).rooms, query.room_type
    );
};

HallSchema.methods.getBlockRooms = function(query){
    //room_obj = {room_id: query.room_id, room_gender:"male", capacity: 4}
    return _.findWhere(
        this.blocks, {name: query.block_name}
    );
};


HallSchema.methods.addStudentToRoom = function(student, block_name, room_type, room_id){
    this.findOneAndUpdate({
        name: block_name,
        'rooms.$.type': room_type,
        'rooms.$.identifiers.$.room_id': room_id},
        { $set: {
            'rooms.$.identifiers.$.occupants': getBlockRoom(
                {block_name: block_name, room_type: room_type,},
                {room_id: room_id}).occupants.push(student._id)
            }
        }).exec((err, docs) => {
            if (docs !== null){
                console.log("update success");
            }
        });
};



const Hall = mongoose.model('Hall', HallSchema);

module.exports = {
    Hall: Hall,
    HallSchema: HallSchema
};