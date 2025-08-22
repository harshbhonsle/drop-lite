import UploadFile from './pages/uploadFile.jsx';
import DownloadPage from './pages/downloadPage.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadFile />} />
        <Route path="/f/:fileId" element={<DownloadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
