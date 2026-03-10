import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Home from './pages/Home';

import AddEditKnowledge from './pages/AddEditKnowledge';
import SelectRole from './pages/SelectRole';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminConsole from './pages/AdminConsole';
import AdminCategories from './pages/AdminCategories';
import SavedArticles from './pages/SavedArticles';
import PublicProfile from './pages/PublicProfile';
import KnowledgeView from './pages/KnowledgeView';
import Layout from './components/Layout';
import Search from './pages/Search';
import Chat from './pages/Chat';
import FollowList from './pages/FollowList';


import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/categories" element={<AdminCategories />} />
            <Route path="/login" element={<Login />} />

            <Route path="/add" element={<AddEditKnowledge />} />
            <Route path="/edit/:id" element={<AddEditKnowledge />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
            <Route path="/admin" element={<AdminConsole />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/saved" element={<SavedArticles />} />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route path="/view/:id" element={<KnowledgeView />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/followers" element={<FollowList />} />
            <Route path="/following" element={<FollowList />} />
            <Route path="/followers/:userId" element={<FollowList />} />
            <Route path="/following/:userId" element={<FollowList />} />
          </Routes>

        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
