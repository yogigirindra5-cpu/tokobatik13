import { useLocation } from 'react-router-dom';
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import AppRoutes from "./routes";

export default function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      <AppRoutes />
      {!isAdminPage && <Footer />}
    </>
  );
}