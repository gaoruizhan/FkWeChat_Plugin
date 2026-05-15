import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/layout';
import Home from '@/pages/Home';
import PluginDetail from '@/pages/PluginDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plugin/:folder" element={<PluginDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
