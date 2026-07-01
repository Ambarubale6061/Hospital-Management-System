import { Switch, Route, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import { SocketProvider } from "@/lib/socket";
import { NotificationsProvider } from "@/lib/notifications";
import { ProtectedRoute } from "@/components/protected-route";
import { AppLayout } from "@/components/app-layout";
import { Toaster } from "@/components/toaster";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import HospitalSettings from "@/pages/hospital-settings";
import AuditLog from "@/pages/audit-log";
import MedicalRecords from "@/pages/medical-records";
import Queue from "@/pages/queue";
import Receptionists from "@/pages/receptionists";
import Reports from "@/pages/reports";
import Schedule from "@/pages/schedule";

import Appointments from "@/pages/appointments/index";
import NewAppointment from "@/pages/appointments/new";
import AppointmentDetail from "@/pages/appointments/[id]";

import Patients from "@/pages/patients/index";
import NewPatient from "@/pages/patients/new";
import PatientDetail from "@/pages/patients/[id]";

import Doctors from "@/pages/doctors/index";
import NewDoctor from "@/pages/doctors/new";
import DoctorDetail from "@/pages/doctors/[id]";

import Departments from "@/pages/departments/index";

import Prescriptions from "@/pages/prescriptions/index";
import NewPrescription from "@/pages/prescriptions/new";
import PrescriptionDetail from "@/pages/prescriptions/[id]";

import Bills from "@/pages/bills/index";
import NewBill from "@/pages/bills/new";
import BillDetail from "@/pages/bills/[id]";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        {isLoading ? null : isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />

      {/* Root: landing page for guests, dashboard for signed-in users */}
      <Route path="/">
        {isLoading ? null : isAuthenticated ? <Redirect to="/dashboard" /> : <Landing />}
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        <AuthedLayout><Dashboard /></AuthedLayout>
      </Route>

      <Route path="/appointments">
        <AuthedLayout><Appointments /></AuthedLayout>
      </Route>
      <Route path="/appointments/new">
        <AuthedLayout><NewAppointment /></AuthedLayout>
      </Route>
      <Route path="/appointments/:id">
        <AuthedLayout><AppointmentDetail /></AuthedLayout>
      </Route>

      <Route path="/patients">
        <AuthedLayout><Patients /></AuthedLayout>
      </Route>
      <Route path="/patients/new">
        <AuthedLayout><NewPatient /></AuthedLayout>
      </Route>
      <Route path="/patients/:id">
        <AuthedLayout><PatientDetail /></AuthedLayout>
      </Route>

      <Route path="/doctors">
        <AuthedLayout><Doctors /></AuthedLayout>
      </Route>
      <Route path="/doctors/new">
        <AuthedLayout><NewDoctor /></AuthedLayout>
      </Route>
      <Route path="/doctors/:id">
        <AuthedLayout><DoctorDetail /></AuthedLayout>
      </Route>

      <Route path="/departments">
        <AuthedLayout><Departments /></AuthedLayout>
      </Route>

      <Route path="/prescriptions">
        <AuthedLayout><Prescriptions /></AuthedLayout>
      </Route>
      <Route path="/prescriptions/new">
        <AuthedLayout><NewPrescription /></AuthedLayout>
      </Route>
      <Route path="/prescriptions/:id">
        <AuthedLayout><PrescriptionDetail /></AuthedLayout>
      </Route>

      <Route path="/bills">
        <AuthedLayout><Bills /></AuthedLayout>
      </Route>
      <Route path="/bills/new">
        <AuthedLayout><NewBill /></AuthedLayout>
      </Route>
      <Route path="/bills/:id">
        <AuthedLayout><BillDetail /></AuthedLayout>
      </Route>

      <Route path="/queue">
        <AuthedLayout><Queue /></AuthedLayout>
      </Route>
      <Route path="/schedule">
        <AuthedLayout><Schedule /></AuthedLayout>
      </Route>
      <Route path="/medical-records">
        <AuthedLayout><MedicalRecords /></AuthedLayout>
      </Route>
      <Route path="/receptionists">
        <AuthedLayout><Receptionists /></AuthedLayout>
      </Route>
      <Route path="/reports">
        <AuthedLayout><Reports /></AuthedLayout>
      </Route>
      <Route path="/audit-log">
        <AuthedLayout><AuditLog /></AuthedLayout>
      </Route>
      <Route path="/hospital-settings">
        <AuthedLayout><HospitalSettings /></AuthedLayout>
      </Route>
      <Route path="/profile">
        <AuthedLayout><Profile /></AuthedLayout>
      </Route>
      <Route path="/settings">
        <AuthedLayout><Settings /></AuthedLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <NotificationsProvider>
            <Router />
            <Toaster />
          </NotificationsProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}