import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import AppLayout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetail from "./pages/BookDetail";
import UploadBook from "./pages/UploadBook";
import EditBook from "./pages/EditBook";
import Dashboard from "./pages/Dashboard";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import NotFound from "./pages/NotFound";

const App = () => (
  <ConfigProvider
    theme={{
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: "#0369a1",
        borderRadius: 8,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }
    }}
  >
    <AuthProvider>
      <BookProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route
                path="upload"
                element={
                  <ProtectedRoute>
                    <UploadBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="books/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditBook />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="purchase/success" element={<PurchaseSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer position="top-right" theme="colored" />
      </BookProvider>
    </AuthProvider>
  </ConfigProvider>
);

export default App;
