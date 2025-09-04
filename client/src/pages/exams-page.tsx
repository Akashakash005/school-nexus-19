import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2, Edit, Book } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// Types and schemas
const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  term: z.string().min(1, "Please select a term"),
  classId: z.string().min(1, "Please select a class"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  subjects: z.array(z.object({
    subjectId: z.string().min(1, "Please select a subject"),
    examDate: z.date({
      required_error: "Exam date is required",
    }),
    maxMarks: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Max marks must be a positive number",
    }),
  })).min(1, "At least one subject is required"),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface Exam {
  id: number;
  title: string;
  term: string;
  className: string;
  startDate: string;
  endDate: string;
  subjects: number;
  status: "upcoming" | "ongoing" | "completed";
}

interface ExamSubject {
  id: number;
  subjectName: string;
  examDate: string;
  maxMarks: number;
}

// Sample data
const sampleClasses = [
  { id: "1", name: "Class 6A" },
  { id: "2", name: "Class 7B" },
  { id: "3", name: "Class 8C" },
  { id: "4", name: "Class 9A" },
  { id: "5", name: "Class 10B" },
];

const sampleSubjects = [
  { id: "1", name: "Mathematics" },
  { id: "2", name: "English" },
  { id: "3", name: "Science" },
  { id: "4", name: "Social Studies" },
  { id: "5", name: "Hindi" },
  { id: "6", name: "Computer Science" },
];

const sampleExams: Exam[] = [
  {
    id: 1,
    title: "Mid Term Examination",
    term: "Term 1",
    className: "Class 9A",
    startDate: "2025-05-15",
    endDate: "2025-05-22",
    subjects: 5,
    status: "upcoming",
  },
  {
    id: 2,
    title: "Final Examination",
    term: "Term 2",
    className: "Class 10B",
    startDate: "2025-06-10",
    endDate: "2025-06-18",
    subjects: 6,
    status: "upcoming",
  },
];

export default function ExamsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isSubjectsDialogOpen, setIsSubjectsDialogOpen] = useState(false);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const { toast } = useToast();

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      term: "",
      classId: "",
      startDate: undefined,
      endDate: undefined,
      subjects: [
        {
          subjectId: "",
          examDate: undefined,
          maxMarks: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const getStatusBadge = (status: Exam["status"]) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "ongoing":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Ongoing</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Completed</Badge>;
    }
  };

  const onSubmit = (data: ExamFormValues) => {
    // In a real app, this would make an API call
    console.log("Exam data:", data);
    
    toast({
      title: "Exam Created",
      description: `${data.title} has been scheduled successfully with ${data.subjects.length} subjects.`,
    });

    setIsDialogOpen(false);
    form.reset();
  };

  const handleDeleteExam = (examId: number) => {
    // In a real app, this would make an API call to delete the exam and all related data
    toast({
      title: "Exam Deleted",
      description: "Exam and all related data have been deleted successfully.",
    });
  };

  const handleViewSubjects = (exam: Exam) => {
    setSelectedExam(exam);
    // Mock exam subjects data
    setExamSubjects([
      { id: 1, subjectName: "Mathematics", examDate: "2025-05-15", maxMarks: 100 },
      { id: 2, subjectName: "English", examDate: "2025-05-16", maxMarks: 100 },
      { id: 3, subjectName: "Science", examDate: "2025-05-17", maxMarks: 100 },
    ]);
    setIsSubjectsDialogOpen(true);
  };

  const examColumns: any[] = [
    {
      accessorKey: "title",
      header: "Exam Title",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "term",
      header: "Term",
    },
    {
      accessorKey: "className",
      header: "Class",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }: any) => format(new Date(row.getValue("startDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }: any) => format(new Date(row.getValue("endDate")), "MMM dd, yyyy"),
    },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Book className="h-4 w-4" />
          {row.getValue("subjects")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => getStatusBadge(row.getValue("status")),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const exam = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewSubjects(exam)}
            >
              View Subjects
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Edit Feature",
                  description: "Edit functionality will be available in the next update.",
                });
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteExam(exam.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout title="Exams">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
            <p className="text-muted-foreground">
              Manage examinations and their subjects
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exam Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mid Term Examination" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="term"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Term 1">Term 1</SelectItem>
                              <SelectItem value="Term 2">Term 2</SelectItem>
                              <SelectItem value="Term 3">Term 3</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    
                    <div className="space-y-2">
                      <Label>Exam Period</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Start date</span>
                                      )}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => {
                                      const startDate = form.getValues('startDate');
                                      return date < new Date() || (startDate && date < startDate);
                                    }}
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
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>End date</span>
                                      )}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => {
                                      const startDate = form.getValues('startDate');
                                      return date < new Date() || (startDate && date < startDate);
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Exam Subjects</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({
                          subjectId: "",
                          examDate: undefined,
                          maxMarks: "",
                        })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>
                    
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <FormField
                            control={form.control}
                            name={`subjects.${index}.subjectId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {sampleSubjects.map((subject) => (
                                      <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
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
                            name={`subjects.${index}.examDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Exam Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick date</span>
                                        )}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => {
                                      const startDate = form.getValues('startDate');
                                      return date < new Date() || (startDate && date < startDate);
                                    }}
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
                            name={`subjects.${index}.maxMarks`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Marks</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Exam</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={examColumns} data={sampleExams} />
          </CardContent>
        </Card>

        {/* Exam Subjects Dialog */}
        <Dialog open={isSubjectsDialogOpen} onOpenChange={setIsSubjectsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedExam?.title} - Subjects
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {examSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{subject.subjectName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Date: {format(new Date(subject.examDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Max Marks: {subject.maxMarks}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}