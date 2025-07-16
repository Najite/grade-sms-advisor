import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, MessageSquare, Users, TrendingUp, Award } from "lucide-react";
import StudentManagement from "@/components/StudentManagement";
import ResultEntry from "@/components/ResultEntry";
import CGPAAnalyzer from "@/components/CGPAAnalyzer";
import SMSNotifications from "@/components/SMSNotifications";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">UniResults</h1>
                <p className="text-sm text-muted-foreground">Student Result Management System</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Academic Year 2024</p>
                <p className="text-xs text-muted-foreground">Fall Semester</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Students</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </TabsTrigger>
            <TabsTrigger value="cgpa" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">CGPA Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <ResultEntry />
          </TabsContent>

          <TabsContent value="cgpa" className="space-y-6">
            <CGPAAnalyzer />
          </TabsContent>

          <TabsContent value="sms" className="space-y-6">
            <SMSNotifications />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
