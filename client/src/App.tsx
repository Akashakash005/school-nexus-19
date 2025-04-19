import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProfilePage from "@/pages/profile-page";
import StaffPage from "@/pages/staff-page";
import StudentsPage from "@/pages/students-page";
import ClassesPage from "@/pages/classes-page";
import ClassDetailPage from "@/pages/class-detail-page";
import SubjectsPage from "@/pages/subjects-page";
import AttendancePage from "@/pages/attendance-page";
import FeesPage from "@/pages/fees-page";
import { ProtectedRoute } from "./lib/protected-route";
import BillsPage from "@/pages/bills-page";
import MessagesPage from "@/pages/messages-page";

// Main router component
function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />

      {/* Protected routes requiring authentication */}
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/staff" component={StaffPage} />
      <ProtectedRoute path="/students" component={StudentsPage} />
      <ProtectedRoute path="/classes" component={ClassesPage} />
      <ProtectedRoute path="/classes/:gradeId/:sectionId" component={ClassDetailPage} />
      <ProtectedRoute path="/subjects" component={SubjectsPage} />
      <ProtectedRoute path="/attendance" component={AttendancePage} />
      <ProtectedRoute path="/fees" component={FeesPage} />
      <ProtectedRoute path="/bills" component={BillsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Main app component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;