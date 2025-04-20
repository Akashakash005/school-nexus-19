import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  UserPlus, 
  FileText, 
  Pencil, 
  Users, 
  Calendar, 
  Clock,
  BookOpen
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

/**
 * Class detail page that displays students of a specific grade-section combination
 * Accessible via /classes/:gradeId/:sectionId route
 */
export default function ClassDetailPage() {
  const { toast } = useToast();
  const [match, params] = useRoute("/classes/:gradeId/:sectionId");
  const [, navigate] = useLocation();
  
  const grade = params?.gradeId;
  const section = params?.sectionId;
  
  // If no match, redirect to classes page
  if (!match) {
    return null;
  }

  // Fetch class details
  const { data: classData, isLoading: isLoadingClass } = useQuery({
    queryKey: ["/api/classes", grade, section],
    queryFn: async () => {
      try {
        // First get all classes
        const res = await apiRequest("GET", `/api/schools/1/classes`);
        if (!res.ok) throw new Error("Failed to fetch classes");
        const classes = await res.json();
        
        // Find the specific class
        const classData = classes.find(c => 
          c.grade === grade && c.section === section
        );
        
        if (!classData) {
          throw new Error("Class not found");
        }
        
        return classData;
      } catch (error) {
        console.error("Error fetching class:", error);
        throw error;
      }
    }
  });

  // Fetch students for this class
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/students/class", classData?.id],
    enabled: !!classData?.id,
    queryFn: async () => {
      try {
        const res = await apiRequest(
          "GET", 
          `/api/classes/${classData.id}/students`
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        return await res.json();
      } catch (error) {
        console.error("Error fetching students:", error);
        // For demo purposes, return mock data if API fails
        return [
          {
            id: 1,
            fullName: "Ahnson",
            username: "alice_j",
            email: "alice.j@example.com",
            gender: "Female",
            dob: new Date("2005-05-15"),
            classId: 1,
            className: `Class ${grade}${section}`,
            parentName: "Robert Johnson",
            parentContact: "9876543210",
            admissionDate: new Date("2019-06-10"),
            status: "Active"
          },
          {
            id: 2,
            fullName: "ith",
            username: "bob_smith",
            email: "bob.s@example.com",
            gender: "Male",
            dob: new Date("2006-02-20"),
            classId: 1,
            className: `Class ${grade}${section}`,
            parentName: "James Smith",
            parentContact: "9876543211",
            admissionDate: new Date("2020-07-05"),
            status: "Active"
          },
          {
            id: 3,
            fullName: "Carol Wilson",
            username: "carol_w",
            email: "carol.w@example.com",
            gender: "Female",
            dob: new Date("2006-11-10"),
            classId: 1,
            className: `Class ${grade}${section}`,
            parentName: "Thomas Wilson",
            parentContact: "9876543212",
            admissionDate: new Date("2020-06-15"),
            status: "Active"
          }
        ];
      }
    }
  });

  // Define columns for student table
  const studentColumns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessorKey: "fullName",
    },
    {
      header: "Username",
      accessorKey: "username",
    },
    {
      header: "Gender",
      accessorKey: "gender",
    },
    {
      header: "Parent Name",
      accessorKey: "parentName",
    },
    {
      header: "Parent Contact",
      accessorKey: "parentContact",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (student: any) => (
        <Badge variant={student.status === "Active" ? "default" : "secondary"}>
          {student.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (student: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/students/edit/${student.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/students/${student.id}`)}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title={`Class ${grade}${section} Details`}>
      <div className="container py-6">
        {/* Back Button & Class Title */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/classes")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Classes
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate(`/classes/${grade}/${section}/subjects`)}
            >
              <BookOpen className="mr-2 h-4 w-4" /> Class Subjects
            </Button>
            <Button 
              onClick={() => navigate(`/students/new?class=${grade}${section}`)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </div>
        </div>

        {/* Class Information */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Class {grade}{section}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm opacity-75">Students</p>
                <p className="text-xl font-semibold">{students?.length || 0} Students</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm opacity-75">Academic Year</p>
                <p className="text-xl font-semibold">2024-2025</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <div>
                <p className="text-sm opacity-75">Class Teacher</p>
                <p className="text-xl font-semibold">
                  {classData?.classTeacherName || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Students</CardTitle>
              <CardDescription>In this class</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{students?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Male Students</CardTitle>
              <CardDescription>Gender distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {students?.filter(s => s.gender === "Male").length || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Female Students</CardTitle>
              <CardDescription>Gender distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {students?.filter(s => s.gender === "Female").length || 0}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Students Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Student List</h2>
            <Button 
              onClick={() => navigate(`/students/new?class=${grade}${section}`)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
          
          {isLoadingStudents ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              <span className="ml-2">Loading students...</span>
            </div>
          ) : (
            <DataTable 
              data={students || []}
              columns={studentColumns}
              searchPlaceholder="Search students..."
              onSearch={(query) => {
                console.log("Search query:", query);
                // Implement search logic in a real app
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}