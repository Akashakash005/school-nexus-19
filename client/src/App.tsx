import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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
import StudentClassesPage from "@/pages/student/student-classes-page";
import StudentFeesPage from "@/pages/student/student-fees-page";
import StudentMessagesPage from "@/pages/student/student-messages-page";
import TeacherClassesPage from "@/pages/teacher/teacher-classes-page";
import TeacherMessagesPage from "@/pages/teacher/teacher-messages-page";
import StudentDashboardPage from "@/pages/student/student-dashboard-page"; // Added import
import TeacherDashboardPage from "@/pages/teacher/teacher-dashboard-page"; // Added import
import StudentAttendancePage from "./pages/student/student-attendance-page";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />

      {/* Protected routes requiring authentication */}
      <ProtectedRoute
        path="/"
        component={() => {
          const { user } = useAuth();
          return user?.role === "student" ? (
            <StudentDashboardPage />
          ) : (
            <TeacherDashboardPage />
          );
        }}
      />

      <ProtectedRoute path="/profile" component={ProfilePage} />

      {/* Admin routes */}
      <ProtectedRoute path="/staff" component={StaffPage} />
      <ProtectedRoute path="/students" component={StudentsPage} />
      <ProtectedRoute path="/classes" component={ClassesPage} />
      <ProtectedRoute
        path="/classes/:gradeId/:sectionId"
        component={ClassDetailPage}
      />
      <ProtectedRoute path="/subjects" component={SubjectsPage} />
      <ProtectedRoute path="/attendance" component={AttendancePage} />
      <ProtectedRoute path="/fees" component={FeesPage} />
      <ProtectedRoute path="/bills" component={BillsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />

      {/* Student routes */}
      <ProtectedRoute path="/student/classes" component={StudentClassesPage} />
      <ProtectedRoute path="/student/fees" component={StudentFeesPage} />
      <ProtectedRoute
        path="/student/messages"
        component={StudentMessagesPage}
      />
      <ProtectedRoute
        path="/student/attendance"
        component={StudentAttendancePage}
      />

      {/* Teacher routes */}
      <ProtectedRoute path="/teacher/classes" component={TeacherClassesPage} />
      <ProtectedRoute
        path="/teacher/dashboard"
        component={TeacherClassesPage}
      />
      <ProtectedRoute
        path="/teacher/messages"
        component={TeacherMessagesPage}
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Main app component
export default function App() {
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
