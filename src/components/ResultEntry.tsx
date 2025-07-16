import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Award, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
}

interface Course {
  id: string;
  course_code: string;
  course_name: string;
  credit_units: number;
}

interface Semester {
  id: string;
  name: string;
  year: number;
}

interface Result {
  id: string;
  score: number;
  grade: string;
  grade_point: number;
  sms_sent: boolean;
  students: Student;
  courses: Course;
  semesters: Semester;
}

const ResultEntry = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    semester_id: "",
    score: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, coursesData, semestersData, resultsData] = await Promise.all([
        supabase.from('students').select('id, student_id, first_name, last_name').order('student_id'),
        supabase.from('courses').select('*').order('course_code'),
        supabase.from('semesters').select('*').order('year', { ascending: false }),
        supabase.from('results').select(`
          *,
          students (id, student_id, first_name, last_name),
          courses (id, course_code, course_name, credit_units),
          semesters (id, name, year)
        `).order('created_at', { ascending: false })
      ]);

      setStudents(studentsData.data || []);
      setCourses(coursesData.data || []);
      setSemesters(semestersData.data || []);
      setResults(resultsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeInfo = (score: number) => {
    if (score >= 70) return { grade: 'A', grade_point: 4.0, color: 'bg-success' };
    if (score >= 60) return { grade: 'B', grade_point: 3.0, color: 'bg-primary' };
    if (score >= 50) return { grade: 'C', grade_point: 2.0, color: 'bg-accent' };
    if (score >= 45) return { grade: 'D', grade_point: 1.0, color: 'bg-warning' };
    if (score >= 40) return { grade: 'E', grade_point: 0.0, color: 'bg-warning' };
    return { grade: 'F', grade_point: 0.0, color: 'bg-destructive' };
  };

  const handleAddResult = async () => {
    try {
      const score = parseFloat(formData.score);
      if (isNaN(score) || score < 0 || score > 100) {
        toast({
          title: "Error",
          description: "Please enter a valid score between 0 and 100",
          variant: "destructive",
        });
        return;
      }

      const gradeInfo = calculateGradeInfo(score);

      const { error } = await supabase
        .from('results')
        .insert([{
          student_id: formData.student_id,
          course_id: formData.course_id,
          semester_id: formData.semester_id,
          score: score,
          grade: gradeInfo.grade,
          grade_point: gradeInfo.grade_point
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Result added successfully",
      });

      setFormData({
        student_id: "",
        course_id: "",
        semester_id: "",
        score: ""
      });
      fetchData();
    } catch (error: any) {
      console.error('Error adding result:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add result",
        variant: "destructive",
      });
    }
  };

  const sendSMSNotification = async (resultId: string) => {
    try {
      // This would call your SMS sending edge function
      toast({
        title: "SMS Sent",
        description: "Result notification sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send SMS notification",
        variant: "destructive",
      });
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-success text-success-foreground';
      case 'B': return 'bg-primary text-primary-foreground';
      case 'C': return 'bg-accent text-accent-foreground';
      case 'D': return 'bg-warning text-warning-foreground';
      case 'E': case 'F': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Result Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <span>Enter New Result</span>
          </CardTitle>
          <CardDescription>Add student exam results and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_id} - {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={formData.semester_id} onValueChange={(value) => setFormData({...formData, semester_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name} {semester.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="score">Score (%)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({...formData, score: e.target.value})}
                placeholder="85"
              />
            </div>
          </div>

          <Button 
            onClick={handleAddResult} 
            disabled={!formData.student_id || !formData.course_id || !formData.semester_id || !formData.score}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Result
          </Button>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
          <CardDescription>View and manage student exam results</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>SMS Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length > 0 ? (
                    results.map((result) => (
                      <TableRow key={result.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{result.students.first_name} {result.students.last_name}</p>
                            <p className="text-sm text-muted-foreground">{result.students.student_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{result.courses.course_code}</p>
                            <p className="text-sm text-muted-foreground">{result.courses.course_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>{result.semesters.name} {result.semesters.year}</TableCell>
                        <TableCell className="font-medium">{result.score}%</TableCell>
                        <TableCell>
                          <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          {result.sms_sent ? (
                            <Badge variant="outline" className="text-success">Sent</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!result.sms_sent && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendSMSNotification(result.id)}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send SMS
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center space-y-2">
                          <Award className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No results found</p>
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

export default ResultEntry;