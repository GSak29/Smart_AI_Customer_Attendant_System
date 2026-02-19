import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Upload from './pages/Upload';
import NotificationsHistory from './pages/NotificationsHistory';





function App() {
  return (
    <Router>
      <AuthProvider>
        <ProductProvider>
          <Routes>
            <Route path="/login" element={<Login />} />


            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/notifications-history" element={<NotificationsHistory />} />

              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProductProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
