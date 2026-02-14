const mongoose = require('mongoose');
const Knowledge = require('./models/Knowledge');
const User = require('./models/User');

// Connect to MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/knowledge_repo";

const categories = ['Programming', 'Science', 'Math', 'History', 'General'];
const authors = ['Robert', 'Allen', 'Steve', 'Dustin', 'Peter'];

const programmingTopics = [
    "Data Structures & Algorithms: Trees and Graphs", "Operating Systems: Process Scheduling", "Database Management Systems: Normalization", "Computer Networks: TCP/IP Protocol Suite", "Software Engineering: Agile Methodologies",
    "Artificial Intelligence: Heuristic Search", "Compiler Design: Lexical Analysis", "Computer Architecture: Pipelining", "Distributed Systems: Consensus Algorithms", "Cybersecurity: Public Key Infrastructure",
    "Cloud Computing: AWS Services Overview", "Mobile App Development with React Native", "Full Stack Development: MERN Stack Guide", "Machine Learning: Supervised vs Unsupervised", "Introduction to Blockchain Technology",
    "Automata Theory and Computability", "Digital Logic Design: Karnaugh Maps", "Object-Oriented Analysis and Design", "Human-Computer Interaction Principles", "Computer Graphics: Ray Tracing",
    "Internet of Things (IoT) Architecture", "Big Data Analytics with Hadoop", "Natural Language Processing Fundamentals", "Ethical Hacking and Penetration Testing", "Quantum Computing: Qubits and Gates"
];

const scienceTopics = [
    "Quantum Mechanics: The Schrödinger Equation", "Organic Chemistry: Reaction Mechanisms", "Molecular Biology: Protein Synthesis", "Astrophysics: Stellar Evolution", "Thermodynamics: Entropy and Enthalpy",
    "Fluid Mechanics: Bernoulli's Principle", "Genetics: CRISPR-Cas9 Technology", "Neuroscience: Synaptic Transmission", "Environmental Science: Climate Models", "Solid State Physics: Crystal Lattices",
    "Microbiology: Bacterial Pathogenesis", "Immunology: Adaptive Immune Response", "Biochemistry: Metabolic Pathways", "Geology: Plate Tectonics and Seismology", "Ecology: Ecosystem Dynamics",
    "Nuclear Physics: Fission and Fusion", "Optical Physics: Lasers and Photonics", "Materials Science: Nanomaterials", "Botany: Plant Physiology", "Zoology: Vertebrate Anatomy",
    "Analytical Chemistry: Spectroscopy", "Physical Chemistry: Chemical Kinetics", "Astronomy: Exoplanet Detection", "Marine Biology: Coral Reef Systems", "Biotechnology: Fermentation Processes"
];

const mathTopics = [
    "Advanced Calculus: Multivariable Integration", "Linear Algebra: Eigenvalues and Eigenvectors", "Differential Equations: Laplace Transforms", "Discrete Mathematics: Graph Theory", "Probability and Statistics: Hypothesis Testing",
    "Abstract Algebra: Groups and Rings", "Real Analysis: Convergence and Limits", "Complex Analysis: Cauchy-Riemann Equations", "Numerical Methods: Root Finding Algorithms", "Topology: Compactness and Connectedness",
    "Number Theory: Modular Arithmetic", "Operations Research: Linear Programming", "Vector Calculus: Divergence and Curl", "Combinatorics: Permutations and Combinations", "Mathematical Logic: Predicate Calculus",
    "Game Theory: Nash Equilibrium", "Cryptography: RSA Algorithm", "Fourier Analysis: Series and Transforms", "Differential Geometry: Curves and Surfaces", "Stochastic Processes: Markov Chains",
    "Set Theory: Zorn's Lemma", "Actuarial Mathematics: Life Contingencies", "Mathematical Modeling in Biology", "Functional Analysis: Hilbert Spaces", "History of Mathematics: The Greeks"
];

const historyTopics = [
    "World History: Causes of WWII", "European History: The Enlightenment", "American History: The Civil War Reconstruction", "Ancient Civilizations: Mesopotamia", "Political Science: International Relations Theory",
    "Sociology: Social Stratification", "Anthropology: Cultural Relativism", "Archaeology: Radiocarbon Dating", "Economics: Macroeconomic Policy", "Psychology: Cognitive Behavioral Therapy",
    "Philosophy: Existentialism", "Art History: The Renaissance Era", "Music History: Baroque to Classical", "Literature: Shakespearean Tragedies", "Geography: Geopolitics of the Middle East",
    "Religious Studies: Comparative Mythology", "Gender Studies: Feminist Theory", "Media Studies: Evolution of Journalism", "Legal Studies: Constitutional Law", "Education: Montessori Method",
    "Linguistics: Chomsky's Universal Grammar", "Asian History: The Meiji Restoration", "African History: Post-Colonial Independence", "Latin American History: The Maya Civilization", "History of Science: The Scientific Revolution"
];

const generalTopics = [
    "Research Methodology: Writing a Thesis", "Effective Communication Skills for Professionals", "Project Management: PMP Essentials", "Critical Thinking and Logic", "Academic Writing: APA and MLA Styles",
    "Public Speaking and Presentation Skills", "Time Management for University Students", "Financial Literacy: Investing 101", "Mental Health Awareness in Academia", "Career Development: Resume Building",
    "Leadership Dynamics in Organizations", "Ethics in the Digital Age", "Sustainable Living Practices", "Introduction to Entrepreneurship", "Global Citizenship and Civic Responsibility",
    "Information Literacy: Evaluating Sources", "Stress Management Techniques", "Intercultural Communication", "The Future of Work: AI and Automation", "Digital Marketing Fundamentals",
    "Innovation and Design Thinking", "Conflict Resolution Strategies", "Personal Branding for Graduates", "Networking Skills for Career Growth", "Study Skills: Active Recall and Spaced Repetition"
];

const getTopics = (category) => {
    switch (category) {
        case 'Programming': return programmingTopics;
        case 'Science': return scienceTopics;
        case 'Math': return mathTopics;
        case 'History': return historyTopics;
        case 'General': return generalTopics;
        default: return [];
    }
};

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB for seeding...");

        // Clear existing data to avoid duplicates
        await Knowledge.deleteMany({});
        await User.deleteMany({});
        console.log("🗑️  Cleared existing knowledge and user data.");

        // Skip seeding users: Google OAuth creates users on first login
        await User.deleteMany({});
        console.log("👤 Skipped seeding users (Google OAuth will create on login).");

        let docs = [];

        for (let cat of categories) {
            const topics = getTopics(cat);
            for (let topic of topics) {
                docs.push({
                    title: topic,
                    category: cat,
                    content: `This is a detailed article/note about ${topic}. It covers the fundamental concepts, history, and practical applications in the field of ${cat}. \n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
                    author: authors[Math.floor(Math.random() * authors.length)],
                    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random past date
                });
            }
        }

        await Knowledge.insertMany(docs);
        console.log(`✅ Successfully added ${docs.length} entries to the database!`);

        mongoose.connection.close();
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seedDB();
