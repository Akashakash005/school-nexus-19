import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/layout/dashboard-layout";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

// Student form schema aligned with DB schema
const studentFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  student_email: z.string().min(3, "email  must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dob: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  classId: z.string({
    required_error: "Please select a class",
  }),
  parentId: z.string().optional(),
  parentContact: z.string().min(10, "Please enter a valid contact number"),
  admissionDate: z.date({
    required_error: "Admission date is required",
  }),
  parentName: z.string().optional(), // Added to match API
  address: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

// Sample student data  - added id to type
interface StudentData {
  student_email: string | undefined;
  id: number;
  fullName: string;
  email: string;
  gender: "male" | "female" | "other";
  dob: Date;
  className: string;
  parentName: string;
  parentContact: string;
  admissionDate: Date;
  status: string;
  address: string;
}

// Sample classes
const sampleClasses = [{ id: "1", name: "Class 8A" }];
// Example: GET /api/schools/1/classes

// Replace with your actual schoolId source
const schoolId = 1; // or get from context, user, or route

// const fetchClassesBySchoolId = async (schoolId: number) => {
//   const res = await fetch(`/api/schools/${schoolId}/classes`);
//   if (!res.ok) throw new Error("Failed to fetch classes");
//   return res.json();
// };

// const { data: classList = [], isLoading: isClassesLoading } = useQuery({
//   queryKey: ["classes", schoolId],
//   queryFn: () => fetchClassesBySchoolId(schoolId),
//   enabled: !!schoolId,
// });

export default function StudentsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<StudentData[]>([]); // Added type
  const [school, setSchoolData] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/classes/4/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudentData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const createStudent = async (data: StudentFormValues) => {
    try {
      // 1. First, create a user (needed to get user_id)
      const userRes = await fetch("/api/register/user_student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.full_name,
          email: data.student_email,
          password: data.password,

          role: "student",
        }),
      });

      if (!userRes.ok) throw new Error("Failed to create user");
      const newUser = await userRes.json();
      const userId = newUser.id;

      // 2. Then create the student using user_id
      const studentRes = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          user_id: userId,
          school_id: 1, // hardcoded or dynamic
          admission_date: "2024-06-01", // hardcoded or dynamic
        }),
      });

      if (!studentRes.ok) throw new Error("Failed to create student");
      await fetchStudents(); // refresh student list
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  };

  const [editingStudent, setEditingStudent] = useState<StudentData | null>(
    null
  ); // Added type
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  // Initialize form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      full_name: "",
      student_email: "",
      password: "",
      dob: undefined,
      gender: "male",
      classId: "",
      parentContact: "",

      parentName: "",
      admissionDate: new Date(),
      address: "",
    },
  });

  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingStudent(null);
    }
    setIsDialogOpen(open);
  };

  // Handle edit student
  const openEditDialog = (student: StudentData) => {
    setEditingStudent(student);
    const classItem = sampleClasses.find((c) => c.name === student.className);

    form.reset({
      full_name: student.fullName,
      student_email: student.student_email,
      gender: student.gender as "male" | "female" | "other",
      dob: student.dob,
      classId: classItem?.id || "",
      parentContact: student.parentContact,
      admissionDate: student.admissionDate,
      parentName: student.parentName, // Added parentName
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const res = await fetch(`/api/students/${editingStudent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update student");
      } else {
        await createStudent(data);
      }

      toast({
        title: "Success",
        description: editingStudent
          ? "Student updated successfully"
          : "New student added successfully",
      });
      setIsDialogOpen(false);
      await fetchStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudentData((prev) =>
        prev.filter((student) => student.id !== studentToDelete)
      );
      toast({
        title: "Success",
        description: "Student removed successfully",
      });
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };
  const studentsByClass = sampleClasses.map((cls) => {
    const count = studentData.filter(
      (student) => student.className === cls.name
    ).length;
    return { name: cls.name, count };
  });
  // DataTable columns
  // const columns = [
  //   {
  //     header: "Name",
  //     accessorKey: "fullName",
  //   },
  //   {
  //     header: "student_email",
  //     accessorKey: "student_email",
  //   },
  //   {
  //     header: "Class",
  //     accessorKey: "className",
  //   },
  //   {
  //     header: "Gender",
  //     accessorKey: "gender",
  //     cell: ({ row }: any) => (
  //       <span className="capitalize">{row.original.gender}</span>
  //     ),
  //   },
  //   {
  //     header: "Date of Birth",
  //     accessorKey: "dob",
  //     cell: ({ row }: { row: { original: StudentData } }) =>
  //       format(new Date(row.original.dob), "PP"),
  //   },
  //   {
  //     header: "Parent Contact",
  //     accessorKey: "parentContact",
  //   },
  //   {
  //     header: "Status",
  //     accessorKey: "status",
  //     cell: ({ row }: { row: { original: StudentData } }) => (
  //       <Badge variant="outline" className="bg-green-100 text-green-800">
  //         {row.original.status}
  //       </Badge>
  //     ),
  //   },
  //   {
  //     header: "Actions",
  //     accessorKey: "id",
  //     cell: ({ row }: { row: { original: StudentData } }) => (
  //       <div className="flex space-x-2">
  //         <Button
  //           variant="ghost"
  //           size="icon"
  //           onClick={() => openEditDialog(row.original)}
  //         >
  //           <Edit className="h-4 w-4" />
  //         </Button>
  //         <Button
  //           variant="ghost"
  //           size="icon"
  //           onClick={() => handleDelete(row.original.id)}
  //         >
  //           <Trash className="h-4 w-4" />
  //         </Button>
  //       </div>
  //     ),
  //   },
  // ];
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
                {new Set(studentData.map((student) => student.className)).size}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">New Students</CardTitle>
              <CardDescription>Added this month</CardDescription>
            </CardHeader>
            {/* <CardContent>
              <p className="text-3xl font-bold">
                {
                  studentData.filter(
                    (student) =>
                      student.admissionDate.getMonth() ===
                        new Date().getMonth() &&
                      student.admissionDate.getFullYear() ===
                        new Date().getFullYear()
                  ).length
                }
              </p>
            </CardContent> */}
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
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                {" "}
                {/* Added overflow-y-auto */}
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
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="full_name"
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
                          name="student_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Email </FormLabel>
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
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                />
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("2000-01-01")
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
                                  {sampleClasses.map((cls) => (
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
                          name="parentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Parent phone number"
                                  {...field}
                                />
                              </FormControl>
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
                                <Input
                                  placeholder="Parent phone number"
                                  {...field}
                                />
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
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("2010-01-01")
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
                    </ScrollArea>
                    <DialogFooter className="mt-4">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? "Saving..."
                          : editingStudent
                          ? "Update Student"
                          : "Add Student"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* <DataTable
        data={studentData}
        columns={columns}
        searchPlaceholder="Search students..."
        onSearch={(query) => {
          console.log("Search query:", query);
          // Implement search logic in a real app
        }}
      /> */}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this student? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
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
