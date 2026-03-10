const mongoose = require('mongoose');
const fs = require('fs');
const MONGO_URI = "mongodb://127.0.0.1:27017/knowledge_repo";

async function inspect() {
    try {
        await mongoose.connect(MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ name: String, role: String }));
        const users = await User.find({});
        let out = 'USERS IN DB:\n';
        users.forEach(u => {
            out += `${u._id.toString()} - ${u.name} (${u.role})\n`;
        });
        fs.writeFileSync('c:/Users/Pradeep Kumar/OneDrive/Desktop/My Project/web-knowledge-repository/backend/users_db.txt', out);
        console.log('Done. Results in users_db.txt');
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}
inspect();
