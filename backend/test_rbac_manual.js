require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const roleMiddleware = require('./middleware/roleMiddleware');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream(__dirname + '/test_output.log', { flags: 'w' });
const logStdout = process.stdout;

console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
};
console.error = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
};
const { requireAuth } = require('./middleware/auth');
require('dotenv').config();

const app = express();
app.use(express.json());

// Routes
app.use(authRoutes);

// Mock Protected Route
app.get('/faculty-only', requireAuth, roleMiddleware.protectFaculty, (req, res) => {
    res.json({ message: "Welcome Faculty" });
});

const PORT = 5002; // Use generic port
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/knowledge_repo";

let server;

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        server = app.listen(PORT, async () => {
            console.log(`Test server running on port ${PORT}`);

            try {
                // Cleanup previous runs
                await User.deleteMany({ email: /^testuser_/ });
                try {
                    await User.collection.dropIndex('username_1');
                    console.log("Dropped legacy username index");
                } catch (e) {
                    console.log("Index username_1 not found or already dropped");
                }
                console.log("Cleaned up old test users");

                // 1. Create Test User (Role = NULL)
                const email = `testuser_${Date.now()}@example.com`;
                // Log Schema paths to debug
                console.log("User Schema Paths:", Object.keys(User.schema.paths));
                console.log("User Schema Obj:", User.schema.obj);
                console.log("User Schema Tree:", User.schema.tree);

                const user = new User({
                    name: "Test User",
                    email: email,
                    googleId: "google_id_" + Date.now()
                    // role: null // Let default take over
                });
                await user.save();
                console.log(`1. Created User with role: ${user.role}`);

                // 2. Simulate Login (Get Temp Token)
                const secret = process.env.JWT_SECRET || 'change_this_secret';
                const tempToken = jwt.sign(
                    { userId: user._id.toString(), role: 'guest' },
                    secret,
                    { expiresIn: '1h' }
                );

                // 3. Call /auth/set-role to "student"
                console.log("2. Calling /auth/set-role (expecting success)...");
                const resSetRole = await fetch(`http://localhost:${PORT}/auth/set-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tempToken}`
                    },
                    body: JSON.stringify({ role: 'student' })
                });

                const dataSetRole = await resSetRole.json();
                if (resSetRole.status === 200 && dataSetRole.user.role === 'student') {
                    console.log("   ✅ Success: Role set to student");
                } else {
                    console.error("   ❌ Failed:", resSetRole.status, dataSetRole);
                }

                // 4. Verify Access to Faculty Route with Student Token
                const studentToken = dataSetRole.token;
                console.log("3. Accessing /faculty-only with Student Token (expecting 403)...");
                const resProtec = await fetch(`http://localhost:${PORT}/faculty-only`, {
                    headers: { 'Authorization': `Bearer ${studentToken}` }
                });

                if (resProtec.status === 403) {
                    console.log("   ✅ Success: Access Denied (403)");
                } else {
                    console.error("   ❌ Failed: Got status", resProtec.status);
                }

                // 5. Cleanup
                await User.findByIdAndDelete(user._id);
                console.log("4. Cleanup done");

            } catch (err) {
                console.error("Test Logic Error:", err.message);
                if (err.errors) console.error("Validation Errors:", JSON.stringify(err.errors, null, 2));
                console.error(err);
            } finally {
                server.close();
                await mongoose.connection.close();
                process.exit(0);
            }
        });

    } catch (err) {
        console.error("Server Start Error:", err);
        process.exit(1);
    }
}

run();
