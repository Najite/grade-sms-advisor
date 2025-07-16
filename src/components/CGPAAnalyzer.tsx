import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, AlertCircle, Award, Target, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  program: string;
}

interface CGPARecord {
  semester_gpa: number;
  cumulative_gpa: number;
  total_credit_units: number;
  semesters: {
    name: string;
    year: number;
  };
}

interface CGPAAnalysis {
  student: Student;
  records: CGPARecord[];
  currentCGPA: number;
  trend: 'up' | 'down' | 'stable';
  classification: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const CGPAAnalyzer = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [analysis, setAnalysis] = useState<CGPAAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, first_name, last_name, program')
        .order('student_id');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    }
  };

  const analyzeCGPA = async (studentId: string) => {
    setLoading(true);
    try {
      // Get student info
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Get CGPA records
      const { data: cgpaData, error: cgpaError } = await supabase
        .from('cgpa_records')
        .select(`
          *,
          semesters (name, year)
        `)
        .eq('student_id', studentId)
        .order('semesters(year)', { ascending: true });

      if (cgpaError) throw cgpaError;

      // Calculate analysis
      const records = cgpaData || [];
      const currentCGPA = records.length > 0 ? records[records.length - 1].cumulative_gpa : 0;
      
      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (records.length > 1) {
        const lastTwo = records.slice(-2);
        if (lastTwo[1].cumulative_gpa > lastTwo[0].cumulative_gpa) trend = 'up';
        else if (lastTwo[1].cumulative_gpa < lastTwo[0].cumulative_gpa) trend = 'down';
      }

      // Classification
      const classification = getClassification(currentCGPA);
      
      // Risk assessment and recommendations
      const { riskLevel, recommendations } = getRecommendations(currentCGPA, records);

      setAnalysis({
        student: studentData,
        records,
        currentCGPA,
        trend,
        classification,
        recommendations,
        riskLevel
      });

    } catch (error: any) {
      console.error('Error analyzing CGPA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze CGPA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getClassification = (cgpa: number): string => {
    if (cgpa >= 3.7) return "First Class Honours";
    if (cgpa >= 3.3) return "Second Class Honours (Upper Division)";
    if (cgpa >= 2.7) return "Second Class Honours (Lower Division)";
    if (cgpa >= 2.0) return "Third Class Honours";
    return "Pass";
  };

  const getRecommendations = (cgpa: number, records: CGPARecord[]) => {
    const recommendations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (cgpa < 2.0) {
      riskLevel = 'high';
      recommendations.push("Seek academic counseling immediately");
      recommendations.push("Consider reducing course load to focus on improving grades");
      recommendations.push("Utilize tutoring services and study groups");
      recommendations.push("Meet with academic advisor to discuss academic standing");
    } else if (cgpa < 2.7) {
      riskLevel = 'medium';
      recommendations.push("Improve study habits and time management");
      recommendations.push("Seek help from professors during office hours");
      recommendations.push("Consider forming study groups with classmates");
      recommendations.push("Focus on courses with higher credit values");
    } else if (cgpa < 3.3) {
      riskLevel = 'low';
      recommendations.push("Maintain consistent study schedule");
      recommendations.push("Challenge yourself with advanced courses");
      recommendations.push("Consider research opportunities or internships");
    } else {
      riskLevel = 'low';
      recommendations.push("Excellent performance! Keep up the good work");
      recommendations.push("Consider pursuing honors programs or research");
      recommendations.push("Explore leadership opportunities");
      recommendations.push("Prepare for graduate school applications if interested");
    }

    // Trend-based recommendations
    if (records.length > 1) {
      const trend = records[records.length - 1].cumulative_gpa - records[records.length - 2].cumulative_gpa;
      if (trend < -0.2) {
        recommendations.push("Address declining performance - identify problem areas");
      } else if (trend > 0.2) {
        recommendations.push("Great improvement! Continue with current strategies");
      }
    }

    return { riskLevel, recommendations };
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>CGPA Analysis & Advisory</span>
          </CardTitle>
          <CardDescription>Analyze student performance and get academic recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student to analyze" />
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
            <Button 
              onClick={() => selectedStudent && analyzeCGPA(selectedStudent)}
              disabled={!selectedStudent || loading}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              {loading ? "Analyzing..." : "Analyze CGPA"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Current Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {analysis.currentCGPA.toFixed(2)}
                </div>
                <p className="text-muted-foreground">Current CGPA</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Classification:</span>
                  <Badge variant="secondary">{analysis.classification}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Trend:</span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(analysis.trend)}
                    <span className="text-sm capitalize">{analysis.trend}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Risk Level:</span>
                  <Badge className={getRiskColor(analysis.riskLevel)}>
                    {analysis.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to First Class</span>
                  <span>{Math.min(100, (analysis.currentCGPA / 3.7) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(100, (analysis.currentCGPA / 3.7) * 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-accent" />
                <span>Academic Advisory</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 rounded-lg bg-muted/50">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance History */}
          {analysis.records.length > 0 && (
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Performance History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">{record.semesters.name} {record.semesters.year}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.total_credit_units} credit units
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          CGPA: {record.cumulative_gpa.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Semester: {record.semester_gpa.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CGPAAnalyzer;