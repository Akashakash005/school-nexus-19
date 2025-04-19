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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Edit, PlusCircle, Trash } from "lucide-react";

// Subject form schema
const subjectFormSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  description: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

// Sample subject data
const sampleSubjectData = [
  {
    id: 1,
    name: "Mathematics",
    description: "Algebra, Calculus, Geometry, and Statistics",
    teachers: 5,
    classes: ["Class 8A", "Class 9A", "Class 10A", "Class 10B"],
  },
  {
    id: 2,
    name: "English",
    description: "Grammar, Literature, and Composition",
    teachers: 4,
    classes: ["Class 8A", "Class 8B", "Class 9A", "Class 9B"],
  },
  {
    id: 3,
    name: "Science",
    description: "Physics, Chemistry, and Biology",
    teachers: 6,
    classes: ["Class 8A", "Class 8B", "Class 9A", "Class 9B", "Class 10A", "Class 10B"],
  },
  {
    id: 4,
    name: "History",
    description: "World History and Cultural Studies",
    teachers: 3,
    classes: ["Class 8A", "Class 9A", "Class 10A"],
  },
  {
    id: 5,
    name: "Computer Science",
    description: "Programming, Data Structures, and Algorithms",
    teachers: 2,
    classes: ["Class 9A", "Class 10A"],
  },
  {
    id: 6,
    name: "Physical Education",
    description: "Sports, Health, and Fitness",
    teachers: 2,
    classes: ["Class 8A", "Class 8B", "Class 9A", "Class 9B", "Class 10A", "Class 10B"],
  },
];

/**
 * Subjects management page component
 * Allows school admins to manage subjects and their assignments
 */
export default function SubjectsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectData, setSubjectData] = useState(sampleSubjectData);
  const [editingSubject, setEditingSubject] = useState<typeof sampleSubjectData[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);
  
  // Initialize form
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });
  
  // Set form values when editing
  const openEditDialog = (subject: typeof sampleSubjectData[0]) => {
    setEditingSubject(subject);
    form.reset({
      name: subject.name,
      description: subject.description,
    });
    setIsDialogOpen(true);
  };
  
  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setEditingSubject(null);
    }
    setIsDialogOpen(open);
  };
  
  // Handle form submission for creating/editing subjects
  const onSubmit = (data: SubjectFormValues) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      if (editingSubject) {
        // Update existing subject
        setSubjectData(subjectData.map(subject => 
          subject.id === editingSubject.id 
            ? { 
                ...subject, 
                name: data.name,
                description: data.description || subject.description,
              } 
            : subject
        ));
        toast({
          title: "Subject Updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new subject
        setSubjectData([
          ...subjectData,
          {
            id: subjectData.length + 1,
            name: data.name,
            description: data.description || "No description available",
            teachers: 0,
            classes: [],
          }
        ]);
        toast({
          title: "Subject Added",
          description: `${data.name} has been added successfully.`,
        });
      }
      
      setIsSubmitting(false);
      setIsDialogOpen(false);
      form.reset();
      setEditingSubject(null);
    }, 1000);
  };
  
  // Handle subject deletion
  const handleDelete = (id: number) => {
    setSubjectToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (subjectToDelete !== null) {
      // Delete subject
      setSubjectData(subjectData.filter(subject => subject.id !== subjectToDelete));
      toast({
        title: "Subject Removed",
        description: "The subject has been removed successfully.",
      });
      setIsDeleteModalOpen(false);
      setSubjectToDelete(null);
    }
  };
  
  // DataTable columns configuration
  const columns = [
    {
      header: "Subject Name",
      accessorKey: "name",
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Teachers",
      accessorKey: "teachers",
      cell: (subject: any) => (
        <Badge variant="outline" className="bg-primary-100 text-primary-800">
          {subject.teachers} teachers
        </Badge>
      ),
    },
    {
      header: "Classes",
      accessorKey: "classes",
      cell: (subject: any) => (
        <div className="flex flex-wrap gap-1">
          {subject.classes.length > 0 ? (
            <>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {subject.classes.length} classes
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">
                {subject.classes.slice(0, 3).join(", ")}
                {subject.classes.length > 3 && "..."}
              </span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No classes assigned</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (subject: any) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(subject)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Group subjects by teacher count for summary
  const categorizeSubjects = () => {
    const high = subjectData.filter(s => s.teachers >= 5);
    const medium = subjectData.filter(s => s.teachers >= 3 && s.teachers < 5);
    const low = subjectData.filter(s => s.teachers < 3);
    
    return { high, medium, low };
  };
  
  const { high, medium, low } = categorizeSubjects();

  return (
    <DashboardLayout title="Subject Management">
      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Subjects</CardTitle>
              <CardDescription>Offered in curriculum</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{subjectData.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Total Teachers</CardTitle>
              <CardDescription>Across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {subjectData.reduce((sum, subject) => sum + subject.teachers, 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Class Coverage</CardTitle>
              <CardDescription>Subject-class mappings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {subjectData.reduce((sum, subject) => sum + subject.classes.length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Subject Distribution */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Subject Distribution by Teacher Allocation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-success mr-2" />
                <h3 className="font-medium">Well Staffed (5+ teachers)</h3>
              </div>
              <p className="text-2xl font-bold text-success">{high.length} subjects</p>
              <div className="mt-2 text-sm text-muted-foreground">
                {high.map(s => s.name).join(", ")}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-medium">Adequate (3-4 teachers)</h3>
              </div>
              <p className="text-2xl font-bold text-amber-500">{medium.length} subjects</p>
              <div className="mt-2 text-sm text-muted-foreground">
                {medium.map(s => s.name).join(", ")}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <BookOpen className="h-5 w-5 text-destructive mr-2" />
                <h3 className="font-medium">Understaffed ({'<'}3 teachers)</h3>
              </div>
              <p className="text-2xl font-bold text-destructive">{low.length} subjects</p>
              <div className="mt-2 text-sm text-muted-foreground">
                {low.map(s => s.name).join(", ")}
              </div>
            </div>
          </div>
        </div>
        
        {/* Subjects Table with Add Subject Button */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Subject List</h2>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSubject ? "Edit Subject" : "Add New Subject"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSubject 
                          ? "Update the subject information" 
                          : "Fill in the details to add a new subject"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Mathematics" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Brief description of the subject" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : editingSubject ? "Update Subject" : "Add Subject"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <DataTable 
            data={subjectData}
            columns={columns}
            searchPlaceholder="Search subjects..."
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
              Are you sure you want to remove this subject? This action cannot be undone and may affect class schedules.
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
