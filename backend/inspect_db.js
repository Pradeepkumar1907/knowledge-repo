const mongoose = require('mongoose');
const path = require('path');

async function checkDB() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect('mongodb://127.0.0.1:27017/knowledge_repo');
        console.log("Connected.");

        // Define schemas in script to avoid require issues
        const NotificationSchema = new mongoose.Schema({
            recipient: mongoose.Schema.Types.ObjectId,
            sender: mongoose.Schema.Types.ObjectId,
            type: String,
            article: mongoose.Schema.Types.ObjectId,
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        });
        const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

        const UserSchema = new mongoose.Schema({ name: String, email: String });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const allNotifications = await Notification.find().limit(10);
        console.log(`Total Notifications found (limited to 10): ${allNotifications.length}`);

        if (allNotifications.length > 0) {
            console.log("Sample Notification recipients:");
            allNotifications.forEach(n => console.log(` - ID: ${n._id}, Recipient: ${n.recipient}, Type: ${n.type}`));
        }

        const allUsers = await User.find().limit(5);
        console.log("Sample Users:");
        allUsers.forEach(u => console.log(` - ${u.name} (${u.email}) ID: ${u._id}`));

        process.exit(0);
    } catch (err) {
        console.error("Error in check script:", err);
        process.exit(1);
    }
}

checkDB();
