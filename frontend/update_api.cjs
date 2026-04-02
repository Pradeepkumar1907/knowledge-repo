const fs = require('fs');

const filesToUpdate = [
  { path: 'pages/StudentDashboard.jsx', depth: 1 },
  { path: 'pages/SelectRole.jsx', depth: 1 },
  { path: 'pages/Search.jsx', depth: 1 },
  { path: 'pages/SavedArticles.jsx', depth: 1 },
  { path: 'pages/PublicProfile.jsx', depth: 1 },
  { path: 'pages/Login.jsx', depth: 1 },
  { path: 'pages/KnowledgeView.jsx', depth: 1 },
  { path: 'pages/Home.jsx', depth: 1 },
  { path: 'pages/FollowList.jsx', depth: 1 },
  { path: 'pages/FacultyDashboard.jsx', depth: 1 },
  { path: 'pages/Chat.jsx', depth: 1 },
  { path: 'pages/AdminConsole.jsx', depth: 1 },
  { path: 'pages/AdminCategories.jsx', depth: 1 },
  { path: 'pages/AddEditKnowledge.jsx', depth: 1 },
  { path: 'components/NotificationDropdown.jsx', depth: 1 },
  { path: 'components/chat/ConversationList.jsx', depth: 2 }
];

for (const file of filesToUpdate) {
  const fullPath = 'src/' + file.path;
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let importStr = "import API from '../api';";
  if (file.depth === 2) importStr = "import API from '../../api';";
  
  content = content.replace("const API = import.meta.env.VITE_API_URL;", importStr);
  fs.writeFileSync(fullPath, content);
  console.log('Modified ' + fullPath);
}
