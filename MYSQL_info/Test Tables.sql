-- drop database clean_counselling;
create database clean_counselling;
use clean_counselling;

-- Colleges Table
CREATE TABLE Colleges (
    College_Id INT PRIMARY KEY AUTO_INCREMENT,
    College_Name VARCHAR(100),
    Seat_Freezing_Price DECIMAL(10,2)
);

-- Courses Table
CREATE TABLE Courses (
    Course_Id INT PRIMARY KEY AUTO_INCREMENT,
    Course_Name VARCHAR(100)
);

-- Students Table
CREATE TABLE Students (
    Student_Id INT PRIMARY KEY AUTO_INCREMENT,
    Student_Name VARCHAR(100),
    Email VARCHAR(100),
    Phone_Number VARCHAR(15),
    Parent_Name VARCHAR(100),
    Parent_Phone_Number VARCHAR(15),
    Category ENUM('General', 'OBC', 'SC/ST'),
    student_rank INT
);

-- Category Fee Percentage Table
CREATE TABLE CategoryInfo (
    Category ENUM('General', 'OBC', 'SC/ST') PRIMARY KEY,
    Fee_Percentage DECIMAL(3, 2),
    Seat_Percentage DECIMAL(5, 4) -- Percentage of total seats allocated for each category
);

-- Seat Distribution Table
CREATE TABLE SeatDistribution (
    College_Id INT,
    Course_Id INT,
    Total_Seats INT,
    PRIMARY KEY (College_Id, Course_Id),
    FOREIGN KEY (College_Id) REFERENCES Colleges(College_Id),
    FOREIGN KEY (Course_Id) REFERENCES Courses(Course_Id)
);

-- Counseling Sessions Table
CREATE TABLE CounselingSessions (
    Session_Name VARCHAR(100),
    Round_Number INT PRIMARY KEY,
    start_Date DATE,
    end_date DATE
);



-- Seat Allocation Table
CREATE TABLE SeatAllocation (
    Student_Id INT,
    College_Id INT,
    Course_Id INT,
    Round_Id INT,
    Status ENUM('allocated', 'not allocated'),
    Decision ENUM('freeze', 'slide'),
    PRIMARY KEY (Student_Id, College_Id, Course_Id),
    FOREIGN KEY (Student_Id) REFERENCES Students(Student_Id),
    FOREIGN KEY (College_Id) REFERENCES Colleges(College_Id),
    FOREIGN KEY (Course_Id) REFERENCES Courses(Course_Id),
    FOREIGN KEY (Round_Id) REFERENCES CounselingSessions(Round_Number)
);

-- Student Preferences Table
CREATE TABLE Preferences (
    Student_Id INT,
    College_Id INT,
    Course_Id INT,
    Preference_Order INT,
    PRIMARY KEY (Student_Id, College_Id, Course_Id),
    FOREIGN KEY (Student_Id) REFERENCES Students(Student_Id),
    FOREIGN KEY (College_Id) REFERENCES Colleges(College_Id),
    FOREIGN KEY (Course_Id) REFERENCES Courses(Course_Id)
);

-- Public Seat Cutoff Table
CREATE TABLE SeatCutoffs (
    College_Id INT,
    Course_Id INT,
    Round_Id INT,
    Cutoff_Rank_General INT,
    Cutoff_Rank_OBC INT,
    Cutoff_Rank_SC_ST INT,
    PRIMARY KEY (College_Id, Course_Id, Round_Id),
    FOREIGN KEY (College_Id) REFERENCES Colleges(College_Id),
    FOREIGN KEY (Course_Id) REFERENCES Courses(Course_Id),
    FOREIGN KEY (Round_Id) REFERENCES CounselingSessions(Round_Number)
);

-- Payments Table for Fee Management
CREATE TABLE Payments (
    Payment_Id INT PRIMARY KEY AUTO_INCREMENT,
    Student_Id INT,
    Amount DECIMAL(10, 2),
    Payment_Date DATE,
    Status ENUM('pending', 'completed', 'failed'),
    FOREIGN KEY (Student_Id) REFERENCES Students(Student_Id)
);


CREATE TABLE LoginInfo (
    Login_Id INT PRIMARY KEY AUTO_INCREMENT,
    Type VARCHAR(10) NOT NULL CHECK (Type IN ('student', 'college', 'admin')),
    Login VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(100) NOT NULL,
    Student_Id INT,
    College_Id INT,
    FOREIGN KEY (Student_Id) REFERENCES Students(Student_Id),
    FOREIGN KEY (College_Id) REFERENCES Colleges(College_Id)
);
