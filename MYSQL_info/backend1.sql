use clean_counselling; 

TRUNCATE TABLE SeatCutoffs; 
TRUNCATE TABLE SeatAllocation; 

-- stuff for continuity of databases 

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


    SELECT * FROM Final_Allocations;
    
END //

DELIMITER ;
	
call seat_allocation_results; 
-- select * from Final_Allocations; 

CREATE TABLE IF NOT EXISTS Final_Allocations_Name (
    Student_Name VARCHAR(255),
    Course_Name VARCHAR(255),
    College_Name VARCHAR(255),
    PRIMARY KEY (Student_Name, Course_Name, College_Name)
);

INSERT INTO Final_Allocations_Name (Student_Name, Course_Name, College_Name)
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


-- SELECT * from Final_Allocations_Name
-- WHERE Student_Name = (
-- 	SELECT Student_id
-- 	FROM LoginInfo
-- 	WHERE type = 'student'
-- 	AND login = 'alice.smith'
-- 	AND password = 'password123' ); 
--     
-- drop table Final_Allocations_Name; 



