import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/layouts/MainLayout';
import Login from './pages/auth/Login';

// Pages
import Dashboard from './pages/admin/Dashboard';
import Citizens from './pages/admin/Citizens';
import AddCitizen from './pages/admin/Citizens/AddCitizen';
import EditCitizen from './pages/admin/Citizens/EditCitizen';
import CitizenDetail from './pages/admin/Citizens/CitizenDetail';
import ImportCitizen from './pages/admin/Citizens/ImportCitizen';
import CreateLetter from './pages/admin/CreateLetter';
import LetterHistory from './pages/admin/LetterHistory';
import ViewLetterTemplates from './pages/admin/ViewLetterTemplates';
import Settings from './pages/admin/Settings';
import Warning from './pages/admin/Warning'; // Tambahkan import Warning
import ManageLetterTemplates from './pages/superadmin/ManageLetterTemplates';
import TemplateForm from './pages/superadmin/TemplateForm';
import ManageAdmin from './pages/superadmin/ManageAdmin';
import VillageSettings from './pages/superadmin/VillageSettings';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PrivateRoute>
            {({ user }) => (
              <Navigate to={user?.role === 'super_admin' ? '/admin' : '/admin'} replace />
            )}
          </PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes - Bisa diakses admin dan super_admin */}
          <Route path="/admin" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="citizens" element={<Citizens />} />
            <Route path="citizens/add" element={<AddCitizen />} />
            <Route path="citizens/edit/:id" element={<EditCitizen />} />
            <Route path="citizens/:id" element={<CitizenDetail />} />
            <Route path="citizens/import" element={<ImportCitizen />} />
            <Route path="warning" element={<Warning />} /> {/* Tambahkan route Warning */}
            <Route path="create-letter" element={<CreateLetter />} />
            <Route path="letter-history" element={<LetterHistory />} />
            <Route path="letter-templates" element={<ViewLetterTemplates />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/admin" replace />} />
            <Route path="manage-admin" element={<ManageAdmin />} />
            <Route path="letter-templates" element={<ManageLetterTemplates />} />
            <Route path="letter-templates/add" element={<TemplateForm />} />
            <Route path="letter-templates/edit/:id" element={<TemplateForm />} />
            <Route path="village-settings" element={<VillageSettings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={
            <Navigate to="/admin" replace />
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;