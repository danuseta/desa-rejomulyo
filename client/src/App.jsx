import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/layouts/MainLayout';
import Login from './pages/auth/Login';
import { useAuth } from './context/AuthContext';

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
import Warning from './pages/admin/Warning';
import ManageLetterTemplates from './pages/superadmin/ManageLetterTemplates';
import TemplateForm from './pages/superadmin/TemplateForm';
import ManageAdmin from './pages/superadmin/ManageAdmin';
import VillageSettings from './pages/superadmin/VillageSettings';

const RoleBasedRoute = ({ element: Element, roles = [] }) => {
  const { user } = useAuth();
  
  if (roles.length && !roles.includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }
  
  return Element;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Default Redirect */}
          <Route path="/" element={
            <PrivateRoute>
              {({ user }) => (
                <Navigate to="/admin" replace />
              )}
            </PrivateRoute>
          } />
          
          {/* Admin Routes - Accessible by both admin and super_admin */}
          <Route path="/admin" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Citizen Routes */}
            <Route path="citizens" element={<Citizens />} />
            <Route path="citizens/:id" element={<CitizenDetail />} />
            
            {/* Super Admin Only Routes */}
            <Route path="citizens/add" element={
              <RoleBasedRoute element={<AddCitizen />} roles={['super_admin']} />
            } />
            <Route path="citizens/edit/:id" element={
              <RoleBasedRoute element={<EditCitizen />} roles={['super_admin']} />
            } />
            <Route path="citizens/import" element={
              <RoleBasedRoute element={<ImportCitizen />} roles={['super_admin']} />
            } />
            
            {/* Letter Management Routes */}
            <Route path="create-letter" element={<CreateLetter />} />
            <Route path="letter-history" element={<LetterHistory />} />
            <Route path="letter-templates" element={<ViewLetterTemplates />} />
            
            {/* Other Admin Routes */}
            <Route path="warning" element={<Warning />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={
            <PrivateRoute roles={['super_admin']}>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/admin" replace />} />
            <Route path="manage-admin" element={<ManageAdmin />} />
            <Route path="letter-templates" element={<ManageLetterTemplates />} />
            <Route path="letter-templates/add" element={<TemplateForm />} />
            <Route path="letter-templates/edit/:id" element={<TemplateForm />} />
            <Route path="village-settings" element={<VillageSettings />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;