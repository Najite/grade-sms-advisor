import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Send, Clock, CheckCircle, AlertTriangle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PendingResult {
  id: string;
  score: number;
  grade: string;
  students: {
    first_name: string;
    last_name: string;
    student_id: string;
    phone_number: string;
  };
  courses: {
    course_code: string;
    course_name: string;
  };
  semesters: {
    name: string;
    year: number;
  };
}

interface SMSLog {
  id: string;
  student_name: string;
  phone_number: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
}

const SMSNotifications = () => {
  const [pendingResults, setPendingResults] = useState<PendingResult[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingResults();
    fetchSMSLogs();
  }, []);

  const fetchPendingResults = async () => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          students (first_name, last_name, student_id, phone_number),
          courses (course_code, course_name),
          semesters (name, year)
        `)
        .eq('sms_sent', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingResults(data || []);
    } catch (error) {
      console.error('Error fetching pending results:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSMSLogs = async () => {
    // In a real implementation, this would fetch from an SMS logs table
    // For now, we'll simulate some data
    const mockLogs: SMSLog[] = [
      {
        id: '1',
        student_name: 'John Doe',
        phone_number: '+1234567890',
        message: 'Your CS101 result: 85% (Grade A) is now available.',
        status: 'sent',
        sent_at: new Date().toISOString()
      }
    ];
    setSmsLogs(mockLogs);
  };

  const generateMessage = (result: PendingResult) => {
    return `Dear ${result.students.first_name}, your ${result.courses.course_code} (${result.courses.course_name}) result for ${result.semesters.name} ${result.semesters.year} is now available. Score: ${result.score}% (Grade ${result.grade}). Visit the portal for details.`;
  };

  const sendSingleSMS = async (result: PendingResult) => {
    setSending(true);
    try {
      const message = generateMessage(result);
      
      // Here you would call your SMS sending edge function
      // For now, we'll simulate the call
      console.log('Sending SMS to:', result.students.phone_number);
      console.log('Message:', message);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the result as SMS sent
      const { error } = await supabase
        .from('results')
        .update({ sms_sent: true })
        .eq('id', result.id);

      if (error) throw error;

      toast({
        title: "SMS Sent",
        description: `Result notification sent to ${result.students.first_name} ${result.students.last_name}`,
      });

      fetchPendingResults();
      fetchSMSLogs();
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send SMS",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendBulkSMS = async () => {
    setSending(true);
    try {
      let successCount = 0;
      let failCount = 0;

      for (const result of pendingResults) {
        try {
          await sendSingleSMS(result);
          successCount++;
        } catch (error) {
          failCount++;
        }
      }

      toast({
        title: "Bulk SMS Complete",
        description: `${successCount} messages sent successfully, ${failCount} failed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send bulk SMS",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-success';
      case 'failed': return 'text-destructive';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* SMS Configuration Alert */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          SMS notifications require Twilio integration. Make sure to configure your Twilio credentials in the system settings.
          <Button variant="link" className="p-0 h-auto ml-2">Configure SMS Settings</Button>
        </AlertDescription>
      </Alert>

      {/* Pending Notifications */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Pending SMS Notifications</span>
              </CardTitle>
              <CardDescription>
                Results awaiting SMS notification ({pendingResults.length} pending)
              </CardDescription>
            </div>
            {pendingResults.length > 0 && (
              <Button 
                onClick={sendBulkSMS}
                disabled={sending}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Send className="h-4 w-4 mr-2" />
                Send All ({pendingResults.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : pendingResults.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingResults.map((result) => (
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
                          <p className="text-sm text-muted-foreground">{result.semesters.name} {result.semesters.year}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{result.score}%</span>
                          <Badge variant="secondary">{result.grade}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{result.students.phone_number}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm text-muted-foreground">
                          {generateMessage(result)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => sendSingleSMS(result)}
                          disabled={sending}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending SMS notifications</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SMS Logs */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-accent" />
            <span>SMS Delivery History</span>
          </CardTitle>
          <CardDescription>Recent SMS notification logs</CardDescription>
        </CardHeader>
        <CardContent>
          {smsLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{log.student_name}</TableCell>
                      <TableCell>{log.phone_number}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">{log.message}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-1 ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          <span className="capitalize">{log.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(log.sent_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No SMS logs available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSNotifications;