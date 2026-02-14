const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function verify() {
    try {
        console.log("1. Fetching all items...");
        const items = await get('http://localhost:5000/knowledge/all');

        if (!Array.isArray(items) || items.length === 0) {
            console.error("No items returned from /all");
            process.exit(1);
        }

        const firstId = items[0]._id;
        console.log(`Found ID: ${firstId}`);

        console.log("2. Fetching single item...");
        const item = await get(`http://localhost:5000/knowledge/${firstId}`);

        if (item && item._id === firstId) {
            console.log("✅ Single item verification SUCCESS!");
            console.log(`Title: ${item.title}`);
        } else {
            console.error("❌ Single item verification FAILED");
            console.log("Response:", item);
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

verify();
