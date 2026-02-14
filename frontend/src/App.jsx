import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';

import AddEditKnowledge from './pages/AddEditKnowledge';
import SelectRole from './pages/SelectRole';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import Dashboard from './pages/Dashboard';
import AdminConsole from './pages/AdminConsole';
import PublicProfile from './pages/PublicProfile';
import KnowledgeView from './pages/KnowledgeView';
import Layout from './components/Layout';


import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/add" element={<AddEditKnowledge />} />
          <Route path="/edit/:id" element={<AddEditKnowledge />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/profile/:username" element={<PublicProfile />} />
          <Route path="/view/:id" element={<KnowledgeView />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
