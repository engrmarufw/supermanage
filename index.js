const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const multer = require('multer');


const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());

// const jwtCheck = auth({
//     audience: 'thisisidentifire23asdf@#98432nsdnks2%$#^&*(&jsdbfksfsa',
//     issuerBaseURL: 'https://dev-icsfxvl2us1gz6jr.us.auth0.com/',
//     tokenSigningAlg: 'RS256'
// });

// app.use(jwtCheck);

const uri = process.env.MONGODB_URL;
const upload = multer();

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the cliddent to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db('aistmanage').collection('user');
        const teacherCollection = client.db('aistmanage').collection('teacher');
        const studentCollection = client.db('aistmanage').collection('student');
        const idCardsCollection = client.db('aistmanage').collection('idcards');
        const departmentCollection = client.db('aistmanage').collection('departments');
        const noticeCollection = client.db('aistmanage').collection('notices');
        const themeCollection = client.db('aistmanage').collection('theme');
        const photogalleryCollection = client.db('aistmanage').collection('photogallery');
        app.post('/users', async (req, res) => {
            const user = req.body;
            // Check if a user with the same email already exists
            const existingUser = await userCollection.findOne({ email: user.email });

            if (existingUser) {
                return res.send('userexists');
            }

            const hashedPassword = await bcrypt.hash(user?.password, 10);
            user.password = hashedPassword
            const result = await userCollection.insertOne(user);
            res.send(result);
        })


        //get single students
        app.get('/institute/:id', async (req, res) => {
            const id = req.params.id;;
            const query = { _id: new ObjectId(id) }
            const projection = { role: 0, password: 0, _id: 0 }
            const result = await userCollection.findOne(query, { projection });
            console.log(result);
            res.send(result);
        });



        // teacher apis


        //teachers
        app.post('/teachers', async (req, res) => {
            const teacher = req.body;

            // Check if a user with the same email already exists
            const existingUser = await teacherCollection.findOne({ email: teacher.email });

            if (existingUser) {
                return res.send('userexists');
            }

            // If user doesn't exist, proceed with inserting
            const hashedPassword = await bcrypt.hash(teacher?.password, 10);
            teacher.password = hashedPassword;
            const result = await teacherCollection.insertOne(teacher);
            res.send(result);
        })

        //teacher update
        app.put('/teachers/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedTeacher = req.body;

            const update = {
                $set: updatedTeacher
            }

            const result = await teacherCollection.updateOne(filter, update, options);
            res.send(result);
        })
        app.get('/teachers', async (req, res) => {
            const token = req.headers.token;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const teachers = await teacherCollection.find().toArray();

                // Send the users back to the client
                res.send(teachers);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });
        app.get('/publicteachers', async (req, res) => {
            const teachers = await teacherCollection.find({}, { projection: { password: 0, role: 0, salary: 0, joiningdate: 0, number: 0, bloodgroup: 0, education: 0, email: 0 } }).toArray();
            res.send(teachers);
        });

        app.delete('/teachers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await teacherCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/teachers/:id', async (req, res) => {
            const token = req.headers.token;
            console.log(token);
            const id = req.params.id;;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const query = { _id: new ObjectId(id) }
                const result = await teacherCollection.findOne(query);
                res.send(result);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });


        // students apis


        //students
        app.post('/students', async (req, res) => {
            const student = req.body;
            // Check if a user with the same email already exists
            const existingUser = await studentCollection.findOne({ email: student.email });

            if (existingUser) {
                return res.send('userexists');
            }
            const hashedPassword = await bcrypt.hash(student?.password, 10);
            student.password = hashedPassword
            const result = await studentCollection.insertOne(student);
            res.send(result);
        })

        //student update
        app.put('/students/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedStudent = req.body;

            const update = {
                $set: updatedStudent
            }

            const result = await studentCollection.updateOne(filter, update, options);
            res.send(result);
        })
        //get students /
        app.get('/students', async (req, res) => {
            const token = req.headers.token;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const students = await studentCollection.find().toArray();

                // Send the users back to the client
                res.send(students);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });

        //delete students
        app.delete('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await studentCollection.deleteOne(query);
            res.send(result);
        })
        //get single students
        app.get('/students/:id', async (req, res) => {
            const token = req.headers.token;
            console.log(token);
            const id = req.params.id;;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const query = { _id: new ObjectId(id) }
                const result = await studentCollection.findOne(query);
                res.send(result);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });




        // logged user 
        app.get('/loggeduser', async (req, res) => {
            const token = req.headers.token;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {

                const curentUser = await userCollection.findOne({ email: user.email }) || await teacherCollection.findOne({ email: user.email }) || await studentCollection.findOne({ $or: [{ email: user.email }, { roll: user.email }] });

                res.send(curentUser);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });



        // logged user 
        app.put('/loggeduser/:id', async (req, res) => {
            const id = req.params.id;
            const token = req.headers.token;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const filter = { _id: new ObjectId(id) }
                const options = { upsert: true };
                const updatedStudent = req.body;

                const update = {
                    $set: updatedStudent
                }
                const curentUser = await userCollection.findOne({ email: user.email }) || await teacherCollection.findOne({ email: user.email }) || await studentCollection.findOne({ $or: [{ email: user.email }, { roll: user.email }] });

                if (curentUser?.role == "Admin") {
                    const result = await userCollection.updateOne(filter, update, options);
                    res.send(result);
                }
                if (curentUser?.role == "Teacher") {
                    const result = await teacherCollection.updateOne(filter, update, options);
                    res.send(result);
                }
                if (curentUser?.role == "Student") {
                    const result = await studentCollection.updateOne(filter, update, options);
                    res.send(result);
                }
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });




        // image upload 


        app.post('/imguploadimgbb', upload.single('image'), async (req, res) => {
            const a = req.file

            try {
                const blob = new Blob([a.buffer], { type: a.mimetype });
                const formData = new FormData();
                formData.append('image', blob, a.originalname);
                const response = await fetch('https://api.imgbb.com/1/upload?key=2a55d4892836932d2e39cadb5508ce97', {
                    method: 'POST',
                    body: formData,
                });
                console.log(response.data);
                if (response.ok) {
                    const data = await response.json();
                    const imgbbUrl = data.data.url;
                    res.send(JSON.stringify(imgbbUrl));
                } else {
                    console.error('Error uploading image to imgbb:', response.statusText);
                    res.send(response.status);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                res.send(error);
            }
        })
        // multiimage upload 


        app.post('/multiimguploadimgbb', upload.array('images', 10), async (req, res) => {
            try {
                const files = req.files;
                const imageUrls = [];

                for (const file of files) {
                    const blob = new Blob([file.buffer], { type: file.mimetype });

                    const formData = new FormData();
                    formData.append('image', blob, file.originalname);

                    const response = await fetch('https://api.imgbb.com/1/upload?key=2a55d4892836932d2e39cadb5508ce97', {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const imgbbUrl = data.data.url;
                        imageUrls.push(imgbbUrl);
                    } else {
                        console.error('Error uploading image to imgbb:', response.statusText);
                        res.status(response.status).send(response.statusText);
                        return;
                    }
                }

                res.json(imageUrls);

            } catch (error) {
                console.error('Error uploading image:', error);
                res.status(500).send(error);
            }
        });


        //email
        app.post('/sendemail', async (req, res) => {
            const mail = req.body
            console.log(mail);
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            const body = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Template</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 0;
                    }
            
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
            
                    .header {
                        text-align: center;
                        background-color: #e1fbfc;
                        padding: 10px;
                    }
            
                    .footer {
                        text-align: center;
                        background-color: #e1fbfc;
                        padding: 10px;
                    }
            
                    .body-content {
                        padding: 20px;
                        background-color: #ffffff;
                    }
            
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #007BFF;
                        color: white !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bolder !important;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to AIST</h1>
                    </div>
            
                    <div class="body-content">
                        <h2>Assalamualqum, ${mail.name}</h2>
                        <h3>Here is your account details</h3>
                        <p>Email: <strong>${mail.email}</strong></p>
                        <p>Password: <strong>${mail.password}</strong></p>
                        <p>Click the button below to visit our website:</p>
                        <a href="https://www.pasherdukan.xyz" target="_blank" class="button">Visit Our Website</a>
                    </div>
            
                    <div class="footer">
                        <p>Thank you for being a part of our community!</p>
                    </div>
                </div>
            </body>
            </html>
            `;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: mail.email,
                subject: 'subject',
                html: body // Assuming you want to send an HTML template
            };
            await transporter.sendMail(mailOptions);
            res.send();

        })


        //idcards
        app.post('/idcards', async (req, res) => {
            const idcards = req.body;
            const result = await idCardsCollection.insertOne(idcards);
            res.send(result);
        })

        app.post("/login", async (req, res) => {
            const user = req.body;
            console.log(user);

            const requser = await userCollection.findOne({ $and: [{ email: user.email }] }) || await teacherCollection.findOne({ $and: [{ email: user.email }] }) || await studentCollection.findOne({ $or: [{ email: user.email }, { roll: user.email }] });
            if (requser) {
                if (await bcrypt.compare(user.password, requser.password)) {
                    const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: "24h",
                    });

                    if (res.status(201)) {
                        return res.json({ status: "ok", data: token });
                    } else {
                        return res.json({ error: "error" });
                    }
                }
            }
            res.json({ status: "error", error: "InvAlidPassword" });
        });


        app.get('/users', async (req, res) => {
            const token = req.headers.token;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const users = await userCollection.find().toArray();

                // Send the users back to the client
                res.send(users);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });



        app.get('/idcards', async (req, res) => {
            const token = req.headers.token;
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, res) => {
                if (err) {
                    return "token expired";
                }
                return res;
            });
            if (user == "token expired") {
                return res.send({ status: "error", data: "token expired" });
            }
            if (user) {
                const idcards = await idCardsCollection.find().toArray();

                // Send the users back to the client
                res.send(idcards);
            }
            else {
                return res.send({ status: "error", data: "unauthorized" });
            }
        });

        app.delete('/idcards/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await idCardsCollection.deleteOne(query);
            res.send(result);
        })






        //departments
        app.post('/departments', async (req, res) => {
            const department = req.body;

            // Check if a user with the same email already exists
            const existingUser = await departmentCollection.findOne({ name: department.name });

            if (existingUser) {
                return res.send('userexists');
            }
            const result = await departmentCollection.insertOne(department);
            res.send(result);
        })

        //department update
        app.put('/departments/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDepartment = req.body;

            const update = {
                $set: updatedDepartment
            }

            const result = await departmentCollection.updateOne(filter, update, options);
            res.send(result);
        })
        app.get('/departments', async (req, res) => {
            const departments = await departmentCollection.find().toArray();
            res.send(departments);
        });

        app.delete('/departments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await departmentCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/departments/:id', async (req, res) => {
            const id = req.params.id;;
            const query = { _id: new ObjectId(id) }
            const result = await departmentCollection.findOne(query);
            res.send(result);
        });





        //notices
        app.post('/notices', async (req, res) => {
            const notice = req.body;
            const result = await noticeCollection.insertOne(notice);
            res.send(result);
        })

        //notice update
        app.put('/notices/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatednotice = req.body;

            const update = {
                $set: updatednotice
            }

            const result = await noticeCollection.updateOne(filter, update, options);
            res.send(result);
        })
        app.get('/notices', async (req, res) => {
            const notices = await noticeCollection.find().toArray();
            res.send(notices);
        });

        app.delete('/notices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await noticeCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/notices/:id', async (req, res) => {
            const id = req.params.id;;
            const query = { _id: new ObjectId(id) }
            const result = await noticeCollection.findOne(query);
            res.send(result);
        });




        //photogallerys
        app.post('/photogallerys', async (req, res) => {
            const notice = req.body;
            const result = await photogalleryCollection.insertOne(notice);
            res.send(result);
        })

        //photogallerys update
        app.put('/photogallerys/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatePhotoGallery = req.body;

            const update = {
                $set: updatePhotoGallery
            }

            const result = await photogalleryCollection.updateOne(filter, update, options);
            res.send(result);
        })
        app.get('/photogallerys', async (req, res) => {
            const photogallerys = await photogalleryCollection.find().toArray();
            res.send(photogallerys);
        });

        app.delete('/photogallerys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await photogalleryCollection.deleteOne(query);
            res.send(result);
        })
        app.get('/photogallerys/:id', async (req, res) => {
            const id = req.params.id;;
            const query = { _id: new ObjectId(id) }
            const result = await photogalleryCollection.findOne(query);
            res.send(result);
        });




        // app.get('/coffee', async (req, res) => {
        //     const cursor = coffeeCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        // app.get('/coffee/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await coffeeCollection.findOne(query);
        //     res.send(result);
        // })

        // app.post('/coffee', async (req, res) => {
        //     const newCoffee = req.body;
        //     console.log(newCoffee);
        //     const result = await coffeeCollection.insertOne(newCoffee);
        //     res.send(result);
        // })

        // app.put('/coffee/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) }
        //     const options = { upsert: true };
        //     const updatedCoffee = req.body;

        //     const coffee = {
        //         $set: {
        //             name: updatedCoffee.name,
        //             quantity: updatedCoffee.quantity,
        //             supplier: updatedCoffee.supplier,
        //             taste: updatedCoffee.taste,
        //             category: updatedCoffee.category,
        //             details: updatedCoffee.details,
        //             photo: updatedCoffee.photo
        //         }
        //     }

        //     const result = await coffeeCollection.updateOne(filter, coffee, options);
        //     res.send(result);
        // })

        // app.delete('/coffee/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await coffeeCollection.deleteOne(query);
        //     res.send(result);
        // })

        // // user related apis
        // app.get('/user', async (req, res) => {
        //     const cursor = userCollection.find();
        //     const users = await cursor.toArray();
        //     res.send(users);
        // })

        // app.post('/user', async (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     const result = await userCollection.insertOne(user);
        //     res.send(result);
        // });

        // app.patch('/user', async (req, res) => {
        //     const user = req.body;
        //     const filter = { email: user.email }
        //     const updateDoc = {
        //         $set: {
        //             lastLoggedAt: user.lastLoggedAt
        //         }
        //     }
        //     const result = await userCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // })

        // app.delete('/user/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await userCollection.deleteOne(query);
        //     res.send(result);
        // })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('AIST making server is running')
})

app.listen(port, () => {
    console.log(`AIST Server is running on port: ${port}`)
})