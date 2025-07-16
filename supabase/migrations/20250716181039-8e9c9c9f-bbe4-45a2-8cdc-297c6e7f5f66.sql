-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  program TEXT NOT NULL,
  year_of_study INTEGER NOT NULL CHECK (year_of_study > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  credit_units INTEGER NOT NULL CHECK (credit_units > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create semesters table
CREATE TABLE public.semesters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  grade VARCHAR(2) NOT NULL,
  grade_point DECIMAL(3,2) NOT NULL CHECK (grade_point >= 0 AND grade_point <= 4),
  sms_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, course_id, semester_id)
);

-- Create cgpa_records table for tracking semester and cumulative GPA
CREATE TABLE public.cgpa_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  semester_gpa DECIMAL(3,2) NOT NULL CHECK (semester_gpa >= 0 AND semester_gpa <= 4),
  cumulative_gpa DECIMAL(3,2) NOT NULL CHECK (cumulative_gpa >= 0 AND cumulative_gpa <= 4),
  total_credit_units INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, semester_id)
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cgpa_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict these later based on authentication)
CREATE POLICY "Allow public access to students" ON public.students FOR ALL USING (true);
CREATE POLICY "Allow public access to courses" ON public.courses FOR ALL USING (true);
CREATE POLICY "Allow public access to semesters" ON public.semesters FOR ALL USING (true);
CREATE POLICY "Allow public access to results" ON public.results FOR ALL USING (true);
CREATE POLICY "Allow public access to cgpa_records" ON public.cgpa_records FOR ALL USING (true);

-- Create function to calculate grade from score
CREATE OR REPLACE FUNCTION public.calculate_grade(score DECIMAL)
RETURNS TABLE(grade VARCHAR(2), grade_point DECIMAL(3,2))
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT 
    CASE 
      WHEN score >= 70 THEN 'A'
      WHEN score >= 60 THEN 'B'
      WHEN score >= 50 THEN 'C'
      WHEN score >= 45 THEN 'D'
      WHEN score >= 40 THEN 'E'
      ELSE 'F'
    END as grade,
    CASE 
      WHEN score >= 70 THEN 4.0
      WHEN score >= 60 THEN 3.0
      WHEN score >= 50 THEN 2.0
      WHEN score >= 45 THEN 1.0
      WHEN score >= 40 THEN 0.0
      ELSE 0.0
    END as grade_point;
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_results_updated_at
  BEFORE UPDATE ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.courses (course_code, course_name, credit_units) VALUES
('CS101', 'Introduction to Computer Science', 3),
('MATH201', 'Calculus II', 4),
('ENG101', 'Technical Writing', 2),
('PHY101', 'Physics I', 3),
('CS201', 'Data Structures', 3);

INSERT INTO public.semesters (name, year, start_date, end_date, is_current) VALUES
('Fall 2024', 2024, '2024-09-01', '2024-12-15', true),
('Spring 2024', 2024, '2024-01-15', '2024-05-15', false);

INSERT INTO public.students (student_id, first_name, last_name, email, phone_number, program, year_of_study) VALUES
('STU001', 'John', 'Doe', 'john.doe@university.edu', '+1234567890', 'Computer Science', 2),
('STU002', 'Jane', 'Smith', 'jane.smith@university.edu', '+1234567891', 'Computer Science', 1),
('STU003', 'Mike', 'Johnson', 'mike.johnson@university.edu', '+1234567892', 'Engineering', 3);