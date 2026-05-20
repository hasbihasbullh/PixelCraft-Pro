import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProcessorPage from './pages/ProcessorPage';
import MetadataPage from './pages/MetadataPage';
import AnalyzerPage from './pages/AnalyzerPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/process" element={<ProcessorPage />} />
        <Route path="/metadata" element={<MetadataPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
      </Routes>
    </Router>
  );
}
