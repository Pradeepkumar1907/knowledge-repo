const mongoose = require('mongoose');

async function checkDetails() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/knowledge_repo');

        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            role: String
        }));

        const Notification = mongoose.model('Notification', new mongoose.Schema({
            recipient: mongoose.Schema.Types.ObjectId,
            sender: mongoose.Schema.Types.ObjectId,
            type: String,
            read: Boolean,
            createdAt: { type: Date, default: Date.now }
        }));

        console.log("--- ALL NOTIFICATIONS ---");
        const notifs = await Notification.find();
        console.log(`Count: ${notifs.length}`);

        for (const n of notifs) {
            const recipient = await User.findById(n.recipient);
            const sender = await User.findById(n.sender);
            console.log(`ID: ${n._id}`);
            console.log(`  Type: ${n.type}`);
            console.log(`  Recipient: ${recipient ? recipient.name : 'Unknown'} (${n.recipient})`);
            console.log(`  Sender: ${sender ? sender.name : 'Unknown'} (${n.sender})`);
            console.log(`  Created: ${n.createdAt}`);
        }

        console.log("\n--- RECENT USERS ---");
        const users = await User.find().sort({ _id: -1 }).limit(5);
        users.forEach(u => {
            console.log(`[${u.role}] ${u.name} (${u.email}) ID: ${u._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDetails();
