let Student = require('./student.js').Student;
let StudentSchema = require('./student.js').StudentSchema;
let Hall = require('./hall.js').Hall;


function addDummyDatabaseData(){
    //TODO: add dummy hall data and student data to database

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //dummy students
    Student.find().exec((err, students)=>{

        if (students === null || students.length === 0) {

            //creating dummy students data
            let DEPARTMENTS = ['dept_a', 'dept_b', 'dept_c', 'dept_d', 'dept_e'];
            let COURSES = ['course_a', 'course_b', 'course_c', 'course_d', 'course_e'];
            let LEVELS = [100, 200, 300, 400];
            for (let i = 0; i < 10; i++) {
                new Student({
                    id: String(10660000 + Math.floor(Math.random() * 20)),
                    pin: '1234',
                    department: DEPARTMENTS[getRandomInt(0, DEPARTMENTS.length)],
                    course: COURSES[getRandomInt(0, COURSES.length)],
                    dob: new Date(),
                    gender: (i % 2 === 0) ? "male":"female",
                    firstname: "temp",
                    middlename: "student",
                    lastname: "no_" + i,
                    password:  StudentSchema.methods.generateHash("password"),
                    level: LEVELS[getRandomInt(0, LEVELS.length)],
                    residence_info: {}
                }).save();
            }

            console.log("created dummy student");

        }
        else{
            console.log("dummy students already exists");
        }

    });

    function get_num_array(start, end, capacity, gender='mf',prefix='', postfix=''){
        let arr = [];
        // prefix = (typeof prefix === "undefined")? "": prefix;
        // postfix = (typeof prefix === "undefined")? "": postfix;
        for (let i=start;i<end+1;i++){
            arr.push({
                room_id: prefix+i+postfix,
                capacity: capacity,
                occupants: [],
                room_gender: (gender==='mf')? (i%2 === 0)? "male": "female" : gender
            });
        }
        return arr;
    }


    Hall.find().exec((err, halls)=>{

        if (halls === null || halls.length === 0){

            //building Pent Hall
            let pentHall = new Hall({
                name: "Pentagon Hostel",
                blocks: [],
            });

            for (let i in ["A", "B", "C", "D"]) {
                pentHall.blocks.push({
                    name: "Block " + i, rooms: [
                        {type: '4-in-room', identifiers: get_num_array(1, 100, 4, "mf", i, "")},
                        {type: '2-in-room', identifiers: get_num_array(101, 150, 2, "mf", i, "")},
                        {type: '1-in-room', identifiers: get_num_array(151, 170, 1, "mf", i, "")}
                    ]
                })
            }

            //building TF Hostel
            let tfHostel = new Hall({
                name: "James Topp Nelson Yankah",
                blocks: [],
            });

            for (let i in ["A1", "B1", "A2", "B2"]) {
                tfHostel.blocks.push({
                    name: "Block " + i, rooms: [
                        {type: '4-in-room', identifiers: get_num_array(1, 50, 4, "mf", i, "")},
                        {type: '2-in-room', identifiers: get_num_array(51, 100, 2, "mf", i, "")},
                    ]
                })
            }


            //building Common Wealth Hall
            let commonWealthHall = new Hall({
                name: "Common Wealth Hall",
                blocks: [],
            });

            for (let i in ["A", "B", "C", "D", "E"]) {
                commonWealthHall.blocks.push({
                    name: "Block " + i, rooms: [
                        {type: '3-in-room', identifiers: get_num_array(1, 50, 3, "male", i, "")},
                        {type: 'long-room', identifiers: get_num_array(51, 60, 8, "male", i, "")},
                    ]
                })
            }

            //building Volta Hall
            let voltaHall = new Hall({
                name: "Volta Hall",
                blocks: [],
            });

            voltaHall.blocks.push({
                name: "Main", rooms: [
                    {type: '3-in-room', identifiers: get_num_array(1, 400, 3, "female", "Main", "")},
                ]
            });

            for (let i in ["A", "B", "C"]) {
                voltaHall.blocks.push({
                    name: "Annex " + i, rooms: [
                        {type: '3-in-room', identifiers: get_num_array(1, 100, 3, "female", i, "")},
                    ]
                })
            }


            //building sarbah Hall
            let sarbahHall = new Hall({
                name: "Sarbah Hall",
                blocks: [],
            });

            sarbahHall.blocks.push({
                name: "Main", rooms: [
                    {type: '4-in-room', identifiers: get_num_array(1, 400, 3, "mf", "m_", "")},
                ]
            });

            for (let i in ["A", "B", "C", "D"]) {
                sarbahHall.blocks.push({
                    name: "Annex " + i, rooms: [
                        {type: '3-in-room', identifiers: get_num_array(1, 100, 3, "mf", i, "")},
                    ]
                })
            }

            //building akuafo Hall
            let akuafoHall = new Hall({
                name: "Akuafo Hall",
                blocks: [],
            });

            akuafoHall.blocks.push({
                name: "Main", rooms: [
                    {type: '4-in-room', identifiers: get_num_array(1, 400, 3, "mf", "m_", "")},
                ]
            });

            for (let i in ["A", "B", "C", "D"]) {
                akuafoHall.blocks.push({
                    name: "Annex " + i, rooms: [
                        {type: '3-in-room', identifiers: get_num_array(1, 100, 3, "mf", i, "")},
                    ]
                })
            }

            //building jubilee Hall
            let jubileeHall = new Hall({
                name: "Jubilee Hall",
                blocks: [],
            });

            jubileeHall.blocks.push({
                name: "Main", rooms: [
                    {type: '4-in-room', identifiers: get_num_array(1, 400, 3, "mf", "Main", "")},
                ]
            });


            pentHall.save();
            tfHostel.save();
            voltaHall.save();
            akuafoHall.save();
            sarbahHall.save();
            jubileeHall.save();
            commonWealthHall.save();

            console.log("created dummy halls");

        }
        else{
            console.log("dummy halls already exists");
        }

    });

}

module.exports = addDummyDatabaseData;
