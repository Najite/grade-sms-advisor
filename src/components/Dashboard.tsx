import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, TrendingUp, MessageSquare, Award, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  averageCGPA: number;
  smsSent: number;
  recentResults: any[];
  gradeDistribution: { [key: string]: number };
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    averageCGPA: 0,
    smsSent: 0,
    recentResults: [],
    gradeDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total students
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get total courses
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Get SMS sent count
      const { count: smsCount } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('sms_sent', true);

      // Get recent results with student and course info
      const { data: recentResults } = await supabase
        .from('results')
        .select(`
          *,
          students (first_name, last_name, student_id),
          courses (course_name, course_code),
          semesters (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get grade distribution
      const { data: gradeData } = await supabase
        .from('results')
        .select('grade');

      const gradeDistribution = gradeData?.reduce((acc: { [key: string]: number }, result) => {
        acc[result.grade] = (acc[result.grade] || 0) + 1;
        return acc;
      }, {}) || {};

      // Calculate average CGPA
      const { data: cgpaData } = await supabase
        .from('cgpa_records')
        .select('cumulative_gpa');

      const averageCGPA = cgpaData && cgpaData.length > 0
        ? cgpaData.reduce((sum, record) => sum + parseFloat(record.cumulative_gpa.toString()), 0) / cgpaData.length
        : 0;

      setStats({
        totalStudents: studentsCount || 0,
        totalCourses: coursesCount || 0,
        averageCGPA: parseFloat(averageCGPA.toFixed(2)),
        smsSent: smsCount || 0,
        recentResults: recentResults || [],
        gradeDistribution
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card hover:shadow-primary transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-primary transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Available courses</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-primary transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.averageCGPA}</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-primary transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.smsSent}</div>
            <p className="text-xs text-muted-foreground">Notifications delivered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Grade Distribution</span>
            </CardTitle>
            <CardDescription>Current semester grade breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getGradeColor(grade)}>{grade}</Badge>
                    <span className="text-sm text-foreground">Grade {grade}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max(10, (count / Math.max(...Object.values(stats.gradeDistribution))) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              <span>Recent Results</span>
            </CardTitle>
            <CardDescription>Latest result entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentResults.length > 0 ? (
                stats.recentResults.map((result: any) => (
                  <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {result.students?.first_name} {result.students?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {result.courses?.course_code} - {result.semesters?.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getGradeColor(result.grade)}>{result.grade}</Badge>
                      <span className="text-sm font-medium">{result.score}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-6">No recent results</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;