import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ViewPage from './pages/ViewPage';
import EditPage from './pages/EditPage';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view/:title" element={<ViewPage />} />
          <Route path="/edit/:title" element={<EditPage />} />
          <Route path="/create" element={<EditPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
