const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb://127.0.0.1:27017/knowledge_repo";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected...");
        const users = await User.find({});
        console.log("Users found:", users.length);

        for (let u of users) {
            console.log(`User: ${u.email}, Role: ${u.role}, CreatedAt: ${u.createdAt}`);
        }

        console.log("Done.");
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
