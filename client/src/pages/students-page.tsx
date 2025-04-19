import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Edit, Trash, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Student form schema
const studentFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  dob: z.date({
    required_error: "Date of birth is required",
  }),
  classId: z.string({
    required_error: "Please select a class",
  }),
  parentId: z.string().optional(),
  parentContact: z.string().min(10, "Please enter a valid parent contact number"),
  admissionDate: z.date({
    required_error: "Admission date is required",
  }),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

// Sample student data
const sampleStudentData = [
  {
    id: 1,
    fullName: "Alex Johnson",
    username: "alex.j",
    email: "alex.johnson@school.com",
    gender: "male",
    dob: new Date("2012-05-15"),
    className: "Class 9A",
    parentName: "Robert Johnson",
    parentContact: "555-123-4567",
    admissionDate: new Date("2023-03-15"),
    status: "active",
  },
  {
    id: 2,
    fullName: "Samantha Lee",
    email: "samantha.lee@school.com",
    gender: "female",
    dob: new Date("2011-08-22"),
    className: "Class 10B",
    parentName: "David Lee",
    admissionDate: new Date("2022-06-22"),
    status: "active",
  },
  {
    id: 3,
    fullName: "Tyler Martinez",
    email: "tyler.martinez@school.com",
    gender: "male",
    dob: new Date("2013-01-10"),
    className: "Class 8C",
    parentName: "Maria Martinez",
    admissionDate: new Date("2024-01-10"),
    status: "active",
  },
  {
    id: 4,
    fullName: "Emma Williams",
    email: "emma.williams@school.com",
    gender: "female",
    dob: new Date("2012-09-05"),
    className: "Class 9A",
    parentName: "Sarah Williams",
    admissionDate: new Date("2023-09-05"),
    status: "active",
  },
  {
    id: 5,
    fullName: "Noah Brown",
    email: "noah.brown@school.com",
    gender: "male",
    dob: new Date("2011-08-14"),
    className: "Class 10B",
    parentName: "Michael Brown",
    admissionDate: new Date("2022-08-14"),
    status: "active",
  },
];

// Sample classes for dropdown
const sampleClasses = [
  { id: "1", grade: "8", section: "A", name: "Class 8A" },
  { id: "2", grade: "8", section: "B", name: "Class 8B" },
  { id: "3", grade: "8", section: "C", name: "Class 8C" },
  { id: "4", grade: "9", section: "A", name: "Class 9A" },
  { id: "5", grade: "9", section: "B", name: "Class 9B" },
  { id: "6", grade: "10", section: "A", name: "Class 10A" },
  { id: "7", grade: "10", section: "B", name: "Class 10B" },
];

// Sample parents for dropdown
const sampleParents = [
  { id: "1", name: "Robert Johnson" },
  { id: "2", name: "David Lee" },
  { id: "3", name: "Maria Martinez" },
  { id: "4", name: "Sarah Williams" },
  { id: "5", name: "Michael Brown" },
];

/**
 * Students management page component
 * Allows school admins and teachers to manage students
 */
export default function StudentsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState(sampleStudentData);
  const [editingStudent, setEditingStudent] = useState<typeof sampleStudentData[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  
  // Initialize form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      fullName: "",
      gender: "male",
      dob: undefined,
      classId: "",
      parentId: "",
      parentContact: "",
      admissionDate: new Date(),
    }
  });
  
  // Set form values when editing
  const openEditDialog = (student: typeof sampleStudentData[0]) => {
    setEditingStudent(student);
    
    // Find the class ID based on class name
    const classItem = sampleClasses.find(c => c.name === student.className);
    const classId = classItem ? classItem.id : "";
    
    // Find parent ID based on parent name
    const parentItem = sampleParents.find(p => p.name === student.parentName);
    const parentId = parentItem ? parentItem.id : "";
    
    form.reset({
      email: student.email,
      username: student.username || '', // Handle existing data without username
      password: '', // Don't populate password on edit
      fullName: student.fullName,
      gender: student.gender as any,
      dob: student.dob,
      classId: classId,
      parentId: parentId,
      parentContact: student.parentContact || '', // Handle existing data without parentContact
      admissionDate: student.admissionDate,
    });
    setIsDialogOpen(true);
  };
  
  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingStudent(null);
    }
    setIsDialogOpen(open);
  };
  
  // Handle form submission for creating/editing students
  const onSubmit = (data: StudentFormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Get class name from class ID
      const selectedClass = sampleClasses.find(c => c.id === data.classId);
      const className = selectedClass ? selectedClass.name : "";
      
      // Get parent name from parent ID
      const selectedParent = sampleParents.find(p => p.id === data.parentId);
      const parentName = selectedParent ? selectedParent.name : "";
      
      if (editingStudent) {
        // Update existing student
        setStudentData(studentData.map(student => 
          student.id === editingStudent.id 
            ? { 
                ...student, 
                fullName: data.fullName,
                email: data.email,
                gender: data.gender,
                dob: data.dob,
                className: className,
                parentName: parentName,
                admissionDate: data.admissionDate,
              } 
            : student
        ));
        toast({
          title: "Student Updated",
          description: `${data.fullName} has been updated successfully.`,
        });
      } else {
        // Create new student
        setStudentData([
          ...studentData,
          {
            id: studentData.length + 1,
            fullName: data.fullName,
            email: data.email,
            gender: data.gender,
            dob: data.dob,
            className: className,
            parentName: parentName,
            admissionDate: data.admissionDate,
            status: "active",
          }
        ]);
        toast({
          title: "Student Added",
          description: `${data.fullName} has been added successfully.`,
        });
      }
      
      setIsSubmitting(false);
      setIsDialogOpen(false);
      form.reset();
      setEditingStudent(null);
    }, 1000);
  };
  
  // Handle student deletion
  const handleDelete = (id: number) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (studentToDelete !== null) {
      // Delete student
      setStudentData(studentData.filter(student => student.id !== studentToDelete));
      toast({
        title: "Student Removed",
        description: "The student has been removed successfully.",
      });
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };
  
  // DataTable columns configuration
  const columns = [
    {
      header: "Name",
      accessorKey: "fullName",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Class",
      accessorKey: "className",
    },
    {
      header: "Gender",
      accessorKey: "gender",
      cell: (student: any) => (
        <span className="capitalize">{student.gender}</span>
      ),
    },
    {
      header: "Date of Birth",
      accessorKey: "dob",
      cell: (student: any) => format(new Date(student.dob), "PP"),
    },
    {
      header: "Parent",
      accessorKey: "parentName",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (student: any) => (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          {student.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (student: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(student)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Count students by class
  const studentsByClass = sampleClasses.map(cls => {
    const count = studentData.filter(student => student.className === cls.name).length;
    return { name: cls.name, count };
  });

  return (
    <DashboardLayout title="Student Management">
      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Students</CardTitle>
              <CardDescription>All enrolled students</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{studentData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Classes</CardTitle>
              <CardDescription>Total active classes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Set(studentData.map(student => student.className)).size}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">New Students</CardTitle>
              <CardDescription>Added this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {studentData.filter(student => 
                  student.admissionDate.getMonth() === new Date().getMonth() && 
                  student.admissionDate.getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Class Distribution */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Class Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {studentsByClass.map((cls, index) => (
              <div key={index} className="border rounded-lg p-4 text-center">
                <p className="font-medium text-primary">{cls.name}</p>
                <p className="text-2xl font-bold">{cls.count}</p>
                <p className="text-xs text-muted-foreground">students</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Students Table with Add Student Button */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Student List</h2>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingStudent ? "Edit Student" : "Add New Student"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStudent 
                          ? "Update the student's information" 
                          : "Fill in the details to add a new student"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@school.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("2000-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="classId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Class</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sampleClasses.map(cls => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {cls.name}
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
                        name="parentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sampleParents.map(parent => (
                                  <SelectItem key={parent.id} value={parent.id}>
                                    {parent.name}
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
                        name="parentContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Parent phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="admissionDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Admission Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("2010-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <DataTable 
            data={studentData}
            columns={columns}
            searchPlaceholder="Search students..."
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
              Are you sure you want to remove this student? This action cannot be undone.
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
