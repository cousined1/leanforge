import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import KeywordDetail from './pages/KeywordDetail';
import CategoryListing from './pages/CategoryListing';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/keyword/:slug" element={<KeywordDetail />} />
        <Route path="/category/:slug" element={<CategoryListing />} />
      </Routes>
    </Layout>
  );
}
