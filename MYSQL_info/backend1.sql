use clean_counselling; 

TRUNCATE TABLE SeatCutoffs; 
TRUNCATE TABLE SeatAllocation; 

-- stuff for continuity of databases 


-- Truncate the existing LoginInfo table
TRUNCATE TABLE LoginInfo;

-- Insert the student data
INSERT INTO LoginInfo (Login_Id, Type, Login, Password, Student_Id, College_Id)
VALUES
  (1, 'student', 'alice.smith', 'password123', 1, NULL),
  (2, 'student', 'bob.johnson', 'securePass456', 2, NULL), 
  (3, 'student', 'charlie.williams', 'strongPass789', 3, NULL),
  (4, 'student', 'diana.brown', 'myPass321', 4, NULL),
  (5, 'student', 'ethan.jones', 'bestPass654', 5, NULL),
  (6, 'student', 'fiona.garcia', 'greatPass234', 6, NULL),
  (7, 'student', 'george.martinez', 'coolPass456', 7, NULL),
  (8, 'student', 'hannah.rodriguez', 'awesomePass789', 8, NULL),
  (9, 'student', 'ian.wilson', 'incrediblePass321', 9, NULL),
  (10, 'student', 'jessica.lee', 'amazingPass654', 10, NULL),
  (11, 'student', 'kevin.harris', 'superPass987', 11, NULL),
  (12, 'student', 'laura.clark', 'fantasyPass654', 12, NULL),
  (13, 'student', 'mason.lewis', 'legendaryPass321', 13, NULL),
  (14, 'student', 'nora.walker', 'epicPass789', 14, NULL),
  (15, 'student', 'oliver.hall', 'mythicPass456', 15, NULL);

-- Insert the college data
INSERT INTO LoginInfo (Login_Id, Type, Login, Password, Student_Id, College_Id)
VALUES
  (16, 'college', 'engg_college_a', 'collegePass001', NULL, 1),
  (17, 'college', 'med_college_b', 'collegePass002', NULL, 2),
  (18, 'college', 'arts_college_c', 'collegePass003', NULL, 3),
  (19, 'college', 'sci_college_d', 'collegePass004', NULL, 4),
  (20, 'college', 'comm_college_e', 'collegePass005', NULL, 5);

-- Insert the admin data
INSERT INTO LoginInfo (Login_Id, Type, Login, Password, Student_Id, College_Id)
VALUES
  (21, 'admin', 'admin1', 'adminPass123', NULL, NULL),
  (22, 'admin', 'admin2', 'adminSecure456', NULL, NULL),
  (23, 'admin', 'admin3', 'adminStrong789', NULL, NULL);

UPDATE Colleges SET College_Name = 'Engineering College A', Seat_Freezing_Price = 500.00 WHERE College_Id = '1';
UPDATE Colleges SET College_Name = 'Medical College B', Seat_Freezing_Price = 220.00 WHERE College_Id = '2';
UPDATE Colleges SET College_Name = 'Arts College C', Seat_Freezing_Price = 230.00 WHERE College_Id = '3';
UPDATE Colleges SET College_Name = 'Science College D', Seat_Freezing_Price = 900.00 WHERE College_Id = '4';
UPDATE Colleges SET College_Name = 'Commerce College E', Seat_Freezing_Price = 850.00 WHERE College_Id = '5';
UPDATE Colleges SET College_Name = 'Engineering College F', Seat_Freezing_Price = 1200.00 WHERE College_Id = '6';
UPDATE Colleges SET College_Name = 'Medical College G', Seat_Freezing_Price = 1600.00 WHERE College_Id = '7';
UPDATE Colleges SET College_Name = 'Arts College H', Seat_Freezing_Price = 950.00 WHERE College_Id = '8';
UPDATE Colleges SET College_Name = 'Science College I', Seat_Freezing_Price = 700.00 WHERE College_Id = '9';
UPDATE Colleges SET College_Name = 'Commerce College J', Seat_Freezing_Price = 1100.00 WHERE College_Id = '10';
UPDATE Colleges SET College_Name = 'Engineering College K', Seat_Freezing_Price = 1300.00 WHERE College_Id = '11';
UPDATE Colleges SET College_Name = 'Medical College L', Seat_Freezing_Price = 1700.00 WHERE College_Id = '12';
UPDATE Colleges SET College_Name = 'Arts College M', Seat_Freezing_Price = 750.00 WHERE College_Id = '13';
UPDATE Colleges SET College_Name = 'Science College N', Seat_Freezing_Price = 680.00 WHERE College_Id = '14';
UPDATE Colleges SET College_Name = 'Commerce College O', Seat_Freezing_Price = 1250.00 WHERE College_Id = '15';

UPDATE SeatDistribution SET Total_Seats = 8 WHERE College_Id = '1' AND Course_Id = '1';
UPDATE SeatDistribution SET Total_Seats = 6 WHERE College_Id = '1' AND Course_Id = '2';
UPDATE SeatDistribution SET Total_Seats = 8 WHERE College_Id = '2' AND Course_Id = '3';
UPDATE SeatDistribution SET Total_Seats = 8 WHERE College_Id = '2' AND Course_Id = '4';
UPDATE SeatDistribution SET Total_Seats = 7 WHERE College_Id = '3' AND Course_Id = '5';
UPDATE SeatDistribution SET Total_Seats = 1 WHERE College_Id = '3' AND Course_Id = '6';
UPDATE SeatDistribution SET Total_Seats = 2 WHERE College_Id = '4' AND Course_Id = '7';
UPDATE SeatDistribution SET Total_Seats = 9 WHERE College_Id = '4' AND Course_Id = '8';
UPDATE SeatDistribution SET Total_Seats = 7 WHERE College_Id = '5' AND Course_Id = '9';
UPDATE SeatDistribution SET Total_Seats = 8 WHERE College_Id = '5' AND Course_Id = '10';
UPDATE SeatDistribution SET Total_Seats = 10 WHERE College_Id = '6' AND Course_Id = '11';
UPDATE SeatDistribution SET Total_Seats = 6 WHERE College_Id = '7' AND Course_Id = '12';
UPDATE SeatDistribution SET Total_Seats = 6 WHERE College_Id = '8' AND Course_Id = '13';
UPDATE SeatDistribution SET Total_Seats = 5 WHERE College_Id = '9' AND Course_Id = '14';
UPDATE SeatDistribution SET Total_Seats = 3 WHERE College_Id = '10' AND Course_Id = '15';






select * from SeatDistribution; 



DELIMITER //

CREATE PROCEDURE seat_allocation_results()
BEGIN 
    -- Declare variables for cursor handling and seat allocation tracking
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_Student_Id INT;
    DECLARE v_College_Id INT;
    DECLARE v_Course_Id INT;
    DECLARE v_Preference_Order INT;
    DECLARE v_Category VARCHAR(10);
    DECLARE v_student_rank INT;
    DECLARE v_Total_Seats INT;
    DECLARE v_Allocated_Seats INT;

    -- Declare a cursor for the ordered student preferences
    DECLARE cur CURSOR FOR 
    SELECT Student_Id, College_Id, Course_Id, Preference_Order, Category, student_rank 
    FROM temp_table 
    ORDER BY 
        CASE 
            WHEN Category = 'SC/ST' THEN 1
            WHEN Category = 'OBC' THEN 2
            ELSE 3
        END, 
        student_rank, 
        Preference_Order;

    -- Declare a handler to set the 'done' flag when the cursor is exhausted
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

	
    CREATE TEMPORARY TABLE IF NOT EXISTS temp_table AS 
    SELECT p.Student_Id, p.College_Id, p.Course_Id, p.Preference_Order, s.Category, s.student_rank  
    FROM Preferences p 
    JOIN Students s ON p.Student_Id = s.Student_Id;
    
    
    CREATE TABLE IF NOT EXISTS Final_Allocations (
        Student_Id INT PRIMARY KEY,
        College_Id INT,
        Course_Id INT
    );

    
    OPEN cur;

    read_loop: LOOP
      
        FETCH cur INTO v_Student_Id, v_College_Id, v_Course_Id, v_Preference_Order, v_Category, v_student_rank;

       
        IF done THEN
            LEAVE read_loop;
        END IF;

        
        SELECT Total_Seats INTO v_Total_Seats 
        FROM SeatDistribution 
        WHERE College_Id = v_College_Id AND Course_Id = v_Course_Id;

        
        SELECT COUNT(*) INTO v_Allocated_Seats 
        FROM Final_Allocations 
        WHERE College_Id = v_College_Id AND Course_Id = v_Course_Id;

     
        IF v_Allocated_Seats < v_Total_Seats THEN
            INSERT IGNORE INTO Final_Allocations (Student_Id, College_Id, Course_Id) 
            VALUES (v_Student_Id, v_College_Id, v_Course_Id);
        END IF;
    END LOOP;


    CLOSE cur;


    DROP TEMPORARY TABLE IF EXISTS temp_table;


    
CREATE TABLE IF NOT EXISTS Final_Allocations_Name (
    Student_Name VARCHAR(255),
    Course_Name VARCHAR(255),
    College_Name VARCHAR(255),
    PRIMARY KEY (Student_Name, Course_Name, College_Name)
);

INSERT IGNORE INTO Final_Allocations_Name (Student_Name, Course_Name, College_Name)
SELECT 
    s.Student_Id,
    c.Course_Name,
    co.College_Name
FROM 
    Final_Allocations fa
JOIN 
    Students s ON fa.Student_Id = s.Student_Id
JOIN 
    Courses c ON fa.Course_Id = c.Course_Id
JOIN 
    Colleges co ON fa.College_Id = co.College_Id;

SELECT * from Final_Allocations_Name;

    
END //

DELIMITER ;


call seat_allocation_results; 










-- SELECT * from Final_Allocations_Name
-- WHERE Student_Name = (
-- 	SELECT Student_id
-- 	FROM LoginInfo
-- 	WHERE type = 'student'
-- 	AND login = 'alice.smith'
-- 	AND password = 'password123' ); 
--     
-- drop table Final_Allocations_Name; 



INSERT INTO SeatAllocation(Student_Id, College_Id, Course_Id, Round_Id, Status, Decision) 
SELECT Student_Id, College_Id, Course_Id, 1, 'allocated','freeze' from Final_Allocations; 
SELECT * from SeatAllocation; 


-- SELECT fa.Student_Name, co.Seat_Freezing_Price*
-- (SELECT ci.Fee_Percentage from CategoryInfo ci WHERE Category = 
-- (SELECT Category FROM Students WHERE Student_Id = 
-- (SELECT Student_Id FROM LoginInfo WHERE Login = 'alice.smith')))
--  FROM Final_Allocations_Name fa 
-- JOIN Colleges co ON fa.College_Name = co.College_Name WHERE Student_Name = (SELECT Login_Id FROM LoginInfo WHERE Login = 'alice.smith'); 





-- WITH StudentCategory AS (
--     SELECT s.Category
--     FROM Students s
--     JOIN LoginInfo li ON li.Login = 'bob.johnson'
--     WHERE s.Student_Id = li.Student_Id
-- ),
-- FeePercentage AS (
--     SELECT ci.Fee_Percentage
--     FROM CategoryInfo ci
--     JOIN StudentCategory sc ON ci.Category = sc.Category
-- )
-- SELECT fa.Student_Name, 
--        co.Seat_Freezing_Price * fp.Fee_Percentage
-- FROM Final_Allocations_Name fa
-- JOIN Colleges co ON fa.College_Name = co.College_Name
-- JOIN LoginInfo li ON fa.Student_Name = li.Login_Id
-- JOIN FeePercentage fp ON 1 = 1
-- WHERE li.Login = 'bob.johnson';



