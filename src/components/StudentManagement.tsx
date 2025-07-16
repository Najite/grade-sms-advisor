import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, UserPlus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  program: string;
  year_of_study: number;
  created_at: string;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    program: "",
    year_of_study: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      const { error } = await supabase
        .from('students')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student added successfully",
      });

      setIsAddDialogOpen(false);
      setFormData({
        student_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        program: "",
        year_of_study: 1
      });
      fetchStudents();
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getYearSuffix = (year: number) => {
    if (year === 1) return "1st";
    if (year === 2) return "2nd";
    if (year === 3) return "3rd";
    return `${year}th`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <span>Student Management</span>
              </CardTitle>
              <CardDescription>Manage student records and enrollments</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>Enter student information below</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        value={formData.student_id}
                        onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                        placeholder="STU001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year_of_study">Year</Label>
                      <Input
                        id="year_of_study"
                        type="number"
                        min="1"
                        max="6"
                        value={formData.year_of_study}
                        onChange={(e) => setFormData({...formData, year_of_study: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john.doe@university.edu"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">Program</Label>
                    <Input
                      id="program"
                      value={formData.program}
                      onChange={(e) => setFormData({...formData, program: e.target.value})}
                      placeholder="Computer Science"
                    />
                  </div>
                  <Button onClick={handleAddStudent} className="w-full">
                    Add Student
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students by name, ID, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{student.program}</Badge>
                        </TableCell>
                        <TableCell>{getYearSuffix(student.year_of_study)} Year</TableCell>
                        <TableCell className="text-sm">{student.phone_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <UserPlus className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {searchTerm ? "No students found matching your search" : "No students found"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;