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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Edit, Trash, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Staff form schema
const staffFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  subject: z.string().min(1, "Subject specialization is required"),
  joiningDate: z.date({
    required_error: "Joining date is required",
  }),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

// Sample staff data
const sampleStaffData = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@school.com",
    subject: "Mathematics",
    phoneNumber: "123-456-7890",
    joiningDate: new Date("2023-03-15"),
    status: "active",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    email: "jane.smith@school.com",
    subject: "English",
    phoneNumber: "123-456-7891",
    joiningDate: new Date("2022-06-22"),
    status: "active",
  },
  {
    id: 3,
    fullName: "Bob Johnson",
    email: "bob.johnson@school.com",
    subject: "Science",
    phoneNumber: "123-456-7892",
    joiningDate: new Date("2024-01-10"),
    status: "active",
  },
  {
    id: 4,
    fullName: "Sarah Williams",
    email: "sarah.williams@school.com",
    subject: "History",
    phoneNumber: "123-456-7893",
    joiningDate: new Date("2023-09-05"),
    status: "active",
  },
  {
    id: 5,
    fullName: "Michael Brown",
    email: "michael.brown@school.com",
    subject: "Physical Education",
    phoneNumber: "123-456-7894",
    joiningDate: new Date("2022-08-14"),
    status: "active",
  },
];

/**
 * Staff management page component
 * Allows school admins to manage teachers and staff
 */
export default function StaffPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffData, setStaffData] = useState(sampleStaffData);
  const [editingStaff, setEditingStaff] = useState<typeof sampleStaffData[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);
  
  // Initialize form
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      email: "",
      fullName: "",
      phoneNumber: "",
      subject: "",
      joiningDate: new Date(),
    }
  });
  
  // Set form values when editing
  const openEditDialog = (staff: typeof sampleStaffData[0]) => {
    setEditingStaff(staff);
    form.reset({
      email: staff.email,
      fullName: staff.fullName,
      phoneNumber: staff.phoneNumber,
      subject: staff.subject,
      joiningDate: staff.joiningDate,
    });
    setIsDialogOpen(true);
  };
  
  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingStaff(null);
    }
    setIsDialogOpen(open);
  };
  
  // Handle form submission for creating/editing staff
  const onSubmit = (data: StaffFormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (editingStaff) {
        // Update existing staff
        setStaffData(staffData.map(staff => 
          staff.id === editingStaff.id 
            ? { ...staff, ...data } 
            : staff
        ));
        toast({
          title: "Staff Updated",
          description: `${data.fullName} has been updated successfully.`,
        });
      } else {
        // Create new staff
        setStaffData([
          ...staffData,
          {
            id: staffData.length + 1,
            ...data,
            status: "active",
          }
        ]);
        toast({
          title: "Staff Added",
          description: `${data.fullName} has been added to the staff.`,
        });
      }
      
      setIsSubmitting(false);
      setIsDialogOpen(false);
      form.reset();
      setEditingStaff(null);
    }, 1000);
  };
  
  // Handle staff deletion
  const handleDelete = (id: number) => {
    setStaffToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (staffToDelete !== null) {
      // Delete staff member
      setStaffData(staffData.filter(staff => staff.id !== staffToDelete));
      toast({
        title: "Staff Removed",
        description: "The staff member has been removed successfully.",
      });
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
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
      header: "Subject",
      accessorKey: "subject",
    },
    {
      header: "Phone",
      accessorKey: "phoneNumber",
    },
    {
      header: "Joining Date",
      accessorKey: "joiningDate",
      cell: (staff: any) => format(new Date(staff.joiningDate), "PPP"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (staff: any) => (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          {staff.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (staff: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(staff)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(staff.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Staff Management">
      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Staff</CardTitle>
              <CardDescription>All academic staff</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{staffData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Departments</CardTitle>
              <CardDescription>Subject specializations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Set(staffData.map(staff => staff.subject)).size}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">New Staff</CardTitle>
              <CardDescription>Added this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {staffData.filter(staff => 
                  staff.joiningDate.getMonth() === new Date().getMonth() && 
                  staff.joiningDate.getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Staff Table with Add Staff Button */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Staff List</h2>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingStaff ? "Edit Staff" : "Add New Staff"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStaff 
                          ? "Update the staff member's information" 
                          : "Fill in the details to add a new staff member"}
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
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="123-456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject Specialization</FormLabel>
                            <FormControl>
                              <Input placeholder="Mathematics" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="joiningDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Joining Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
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
                                    date > new Date() || date < new Date("1900-01-01")
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
                        {isSubmitting ? "Saving..." : editingStaff ? "Update Staff" : "Add Staff"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <DataTable 
            data={staffData}
            columns={columns}
            searchPlaceholder="Search staff..."
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
              Are you sure you want to remove this staff member? This action cannot be undone.
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
