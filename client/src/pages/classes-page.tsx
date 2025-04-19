import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import DashboardLayout from "@/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, FolderPlus, Trash, Users } from "lucide-react";

// Class form schema
const classFormSchema = z.object({
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  classTeacherId: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

// Sample class data
const sampleClassData = [
  {
    id: 1,
    name: "Class 8A",
    section: "A",
    classTeacherName: "John Doe",
    studentCount: 42,
  },
  {
    id: 2,
    name: "Class 8B",
    section: "B",
    classTeacherName: "Jane Smith",
    studentCount: 38,
  },
  {
    id: 3,
    name: "Class 9A",
    section: "A",
    classTeacherName: "Bob Johnson",
    studentCount: 45,
  },
  {
    id: 4,
    name: "Class 9B",
    section: "B",
    classTeacherName: "Sarah Williams",
    studentCount: 40,
  },
  {
    id: 5,
    name: "Class 10A",
    section: "A",
    classTeacherName: "Michael Brown",
    studentCount: 38,
  },
  {
    id: 6,
    name: "Class 10B",
    section: "B",
    classTeacherName: "Emily Davis",
    studentCount: 36,
  },
];

// Sample teachers for dropdown
const sampleTeachers = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Bob Johnson" },
  { id: "4", name: "Sarah Williams" },
  { id: "5", name: "Michael Brown" },
  { id: "6", name: "Emily Davis" },
];

/**
 * Classes management page component
 * Allows school admins to manage class structures
 */
export default function ClassesPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classData, setClassData] = useState(sampleClassData);
  const [editingClass, setEditingClass] = useState<typeof sampleClassData[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  
  // Initialize form
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      grade: "",
      section: "",
      classTeacherId: "",
    }
  });
  
  // Set form values when editing
  const openEditDialog = (classItem: typeof sampleClassData[0]) => {
    setEditingClass(classItem);
    
    // Find the teacher ID based on teacher name
    const teacherItem = sampleTeachers.find(t => t.name === classItem.classTeacherName);
    const teacherId = teacherItem ? teacherItem.id : "";
    
    // Extract grade from class name (e.g., "Class 8A" -> "8")
    const grade = classItem.name.split(" ")[1].charAt(0);
    
    form.reset({
      grade: grade,
      section: classItem.section,
      classTeacherId: teacherId,
    });
    setIsDialogOpen(true);
  };
  
  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingClass(null);
    }
    setIsDialogOpen(open);
  };
  
  // Handle form submission for creating/editing classes
  const onSubmit = (data: ClassFormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Get teacher name from teacher ID
      const selectedTeacher = sampleTeachers.find(t => t.id === data.classTeacherId);
      const teacherName = selectedTeacher ? selectedTeacher.name : "";
      
      // Create class name from grade and section
      const className = `Class ${data.grade}${data.section}`;
      
      if (editingClass) {
        // Update existing class
        setClassData(classData.map(cls => 
          cls.id === editingClass.id 
            ? { 
                ...cls, 
                name: className,
                section: data.section,
                classTeacherName: teacherName,
              } 
            : cls
        ));
        toast({
          title: "Class Updated",
          description: `${className} has been updated successfully.`,
        });
      } else {
        // Create new class
        setClassData([
          ...classData,
          {
            id: classData.length + 1,
            name: className,
            section: data.section,
            classTeacherName: teacherName,
            studentCount: 0,
          }
        ]);
        toast({
          title: "Class Added",
          description: `${className} has been added successfully.`,
        });
      }
      
      setIsSubmitting(false);
      setIsDialogOpen(false);
      form.reset();
      setEditingClass(null);
    }, 1000);
  };
  
  // Handle class deletion
  const handleDelete = (id: number) => {
    setClassToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (classToDelete !== null) {
      // Delete class
      setClassData(classData.filter(cls => cls.id !== classToDelete));
      toast({
        title: "Class Removed",
        description: "The class has been removed successfully.",
      });
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };
  
  // DataTable columns configuration
  const columns = [
    {
      header: "Class Name",
      accessorKey: "name",
    },
    {
      header: "Section",
      accessorKey: "section",
    },
    {
      header: "Class Teacher",
      accessorKey: "classTeacherName",
    },
    {
      header: "Students",
      accessorKey: "studentCount",
      cell: (cls: any) => (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {cls.studentCount} students
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (cls: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(cls)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Class Management">
      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Classes</CardTitle>
              <CardDescription>Active classes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{classData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Students</CardTitle>
              <CardDescription>In all classes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {classData.reduce((sum, cls) => sum + cls.studentCount, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Average Class Size</CardTitle>
              <CardDescription>Students per class</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {classData.length > 0 
                  ? Math.round(classData.reduce((sum, cls) => sum + cls.studentCount, 0) / classData.length) 
                  : 0}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Class Distribution by Grade */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Class Distribution by Grade</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["8", "9", "10"].map((grade) => {
              const gradeClasses = classData.filter(cls => cls.name.includes(`Class ${grade}`));
              const totalStudents = gradeClasses.reduce((sum, cls) => sum + cls.studentCount, 0);
              
              return (
                <div key={grade} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Grade {grade}</h3>
                    <Badge variant="outline">{gradeClasses.length} classes</Badge>
                  </div>
                  <p className="text-2xl font-bold">{totalStudents} students</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {gradeClasses.map(cls => {
                      // Extract section from class name (e.g., "Class 8A" -> "A")
                      const section = cls.section;
                      
                      return (
                        <div 
                          key={cls.id} 
                          className="flex justify-between p-2 my-1 bg-blue-50 rounded-md cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                          onClick={() => navigate(`/classes/${grade}/${section}`)}
                        >
                          <span className="font-medium">{cls.name}</span>
                          <span>{cls.studentCount} students</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Classes Table with Add Class Button */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Class List</h2>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingClass ? "Edit Class" : "Add New Class"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingClass 
                          ? "Update the class information" 
                          : "Fill in the details to add a new class"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[...Array(12)].map((_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    Grade {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {['A', 'B', 'C', 'D', 'E', 'F'].map((section) => (
                                  <SelectItem key={section} value={section}>
                                    Section {section}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="classTeacherId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class Teacher</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class teacher" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sampleTeachers.map(teacher => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingClass ? "Update Class" : "Add Class"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <DataTable 
            data={classData}
            columns={columns}
            searchPlaceholder="Search classes..."
            onSearch={(query) => {
              console.log("Search query:", query);
              // Implement search logic in a real app
            }}
          />
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
