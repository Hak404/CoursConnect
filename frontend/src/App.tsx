import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Accueil from './pages/Accueil';
import Recherche from './pages/Recherche';
import FicheProf from './pages/FicheProf';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterStudent from './pages/RegisterStudent';
import RegisterProfessor from './pages/RegisterProfessor';
import StudentHome from './pages/student/Home';
import StudentBookings from './pages/student/StudentBookings';
import BookingDetail from './pages/student/BookingDetail';
import StudentProfilePage from './pages/student/Profile';
import Notifications from './pages/student/Notifications';
import ProfessorHome from './pages/professor/Home';
import ProfessorBookings from './pages/professor/ProfessorBookings';
import ProfessorBookingDetail from './pages/professor/ProfessorBookingDetail';
import ProfessorNotifications from './pages/professor/ProfessorNotifications';
import ProfessorProfile from './pages/professor/ProfessorProfile';
import ProfessorOffers from './pages/professor/ProfessorOffers';
import ProfessorOfferForm from './pages/professor/ProfessorOfferForm';
import ProfessorAvailability from './pages/professor/ProfessorAvailability';
import AdminDashboard from './pages/admin/Dashboard';
import Favoris from './pages/Favoris';
import ProtectedRoute from './components/ProtectedRoute';

const DASH_PREFIXES = ['/student', '/professor', '/admin'];

function AppChrome() {
  const { pathname } = useLocation();
  const isDash = DASH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <div className="app">
      {!isDash && <Header />}
      <main className={`main ${isDash ? 'main--dash' : ''}`}>
        <Routes>
          {/* Phase 1 - Public */}
          <Route path="/" element={<Accueil />} />
          <Route path="/recherche" element={<Recherche />} />
          <Route path="/professeur/:id" element={<FicheProf />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/student" element={<RegisterStudent />} />
          <Route path="/register/professor" element={<RegisterProfessor />} />

          {/* Protected dashboards */}
          <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><StudentHome /></ProtectedRoute>} />
          <Route path="/student/reservations" element={<ProtectedRoute roles={['STUDENT']}><StudentBookings /></ProtectedRoute>} />
          <Route path="/student/reservations/:id" element={<ProtectedRoute roles={['STUDENT']}><BookingDetail /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute roles={['STUDENT']}><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute roles={['STUDENT']}><Notifications /></ProtectedRoute>} />
          <Route path="/professor" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorHome /></ProtectedRoute>} />
          <Route path="/professor/reservations" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorBookings /></ProtectedRoute>} />
          <Route path="/professor/reservations/:id" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorBookingDetail /></ProtectedRoute>} />
          <Route path="/professor/notifications" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorNotifications /></ProtectedRoute>} />
          <Route path="/professor/profile" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorProfile /></ProtectedRoute>} />
          <Route path="/professor/offers" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorOffers /></ProtectedRoute>} />
          <Route path="/professor/offers/new" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorOfferForm /></ProtectedRoute>} />
          <Route path="/professor/offers/:id/edit" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorOfferForm /></ProtectedRoute>} />
          <Route path="/professor/availability" element={<ProtectedRoute roles={['PROFESSOR']}><ProfessorAvailability /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/favoris" element={<ProtectedRoute roles={['STUDENT']}><Favoris /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isDash && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppChrome />
    </AuthProvider>
  );
}
