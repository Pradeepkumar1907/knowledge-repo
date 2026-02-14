const axios = require('axios');

async function test() {
    try {
        console.log("Fetching all...");
        const res = await axios.get('http://localhost:5000/knowledge/all');
        const items = res.data;
        if (items.length === 0) {
            console.log("No items found.");
            return;
        }
        const firstId = items[0]._id;
        console.log("First ID:", firstId);

        console.log("Fetching single item...");
        const res2 = await axios.get(`http://localhost:5000/knowledge/${firstId}`);
        console.log("Single Item Title:", res2.data.title);
        console.log("Success!");
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) console.error("Response:", err.response.status, err.response.data);
    }
}

test();
