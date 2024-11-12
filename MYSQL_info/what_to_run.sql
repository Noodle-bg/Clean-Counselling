-- PROCEDURES:
use clean_counselling;
USE clean_counselling;
DROP PROCEDURE IF EXISTS AllocateSeats;
DELIMITER //

CREATE PROCEDURE AllocateSeats()
BEGIN
    -- Variables for the latest round and student processing
    DECLARE latest_round INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE curr_student_id INT;
    DECLARE curr_student_category VARCHAR(10);
    DECLARE is_allocated BOOLEAN;
    
    -- Cursor to process students in rank order
    -- Modified to include student_rank in SELECT and remove DISTINCT
    DECLARE student_cursor CURSOR FOR
        SELECT s.Student_Id, s.Category
        FROM Students s
        JOIN Preferences p ON s.Student_Id = p.Student_Id
        WHERE s.has_frozen = FALSE
        GROUP BY s.Student_Id, s.Category, s.student_rank  -- Group by to deduplicate
        ORDER BY s.student_rank;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Get latest completed round
    SELECT MAX(Round_Number) INTO latest_round 
    FROM CounselingSessions 
    WHERE end_date < CURRENT_TIMESTAMP();
    
    -- Exit if no completed round or allocations exist
    IF latest_round IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No completed counseling round found';
    END IF;
    
    IF EXISTS (SELECT 1 FROM SeatAllocation WHERE Round_Id = latest_round) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Allocations already exist for this round';
    END IF;

    -- Start transaction
    START TRANSACTION;
    
    -- Open cursor and start processing students
    OPEN student_cursor;
    
    student_loop: LOOP
        FETCH student_cursor INTO curr_student_id, curr_student_category;
        IF done THEN
            LEAVE student_loop;
        END IF;
        
        SET is_allocated = FALSE;
        
        -- Try to allocate based on preferences
        -- For SC/ST Category
        IF curr_student_category = 'SC/ST' THEN
            INSERT INTO SeatAllocation (Student_Id, College_Id, Course_Id, Round_Id, Status)
            SELECT 
                p.Student_Id, p.College_Id, p.Course_Id, latest_round, 'allocated'
            FROM Preferences p
            JOIN SeatDistribution sd ON p.College_Id = sd.College_Id AND p.Course_Id = sd.Course_Id
            WHERE p.Student_Id = curr_student_id
            AND sd.remaining_scst > 0
            ORDER BY p.Preference_Order
            LIMIT 1;
            
            IF ROW_COUNT() > 0 THEN
                SET is_allocated = TRUE;
                -- Update remaining seats
                UPDATE SeatDistribution sd
                JOIN SeatAllocation sa ON sd.College_Id = sa.College_Id 
                    AND sd.Course_Id = sa.Course_Id
                SET sd.remaining_scst = sd.remaining_scst - 1
                WHERE sa.Student_Id = curr_student_id
                AND sa.Round_Id = latest_round;
            END IF;
            
        -- For OBC Category
        ELSEIF curr_student_category = 'OBC' THEN
            INSERT INTO SeatAllocation (Student_Id, College_Id, Course_Id, Round_Id, Status)
            SELECT 
                p.Student_Id, p.College_Id, p.Course_Id, latest_round, 'allocated'
            FROM Preferences p
            JOIN SeatDistribution sd ON p.College_Id = sd.College_Id AND p.Course_Id = sd.Course_Id
            WHERE p.Student_Id = curr_student_id
            AND sd.remaining_obc > 0
            ORDER BY p.Preference_Order
            LIMIT 1;
            
            IF ROW_COUNT() > 0 THEN
                SET is_allocated = TRUE;
                -- Update remaining seats
                UPDATE SeatDistribution sd
                JOIN SeatAllocation sa ON sd.College_Id = sa.College_Id 
                    AND sd.Course_Id = sa.Course_Id
                SET sd.remaining_obc = sd.remaining_obc - 1
                WHERE sa.Student_Id = curr_student_id
                AND sa.Round_Id = latest_round;
            END IF;
            
        -- For General Category
        ELSE
            INSERT INTO SeatAllocation (Student_Id, College_Id, Course_Id, Round_Id, Status)
            SELECT 
                p.Student_Id, p.College_Id, p.Course_Id, latest_round, 'allocated'
            FROM Preferences p
            JOIN SeatDistribution sd ON p.College_Id = sd.College_Id AND p.Course_Id = sd.Course_Id
            WHERE p.Student_Id = curr_student_id
            AND sd.remaining_general > 0
            ORDER BY p.Preference_Order
            LIMIT 1;
            
            IF ROW_COUNT() > 0 THEN
                SET is_allocated = TRUE;
                -- Update remaining seats
                UPDATE SeatDistribution sd
                JOIN SeatAllocation sa ON sd.College_Id = sa.College_Id 
                    AND sd.Course_Id = sa.Course_Id
                SET sd.remaining_general = sd.remaining_general - 1
                WHERE sa.Student_Id = curr_student_id
                AND sa.Round_Id = latest_round;
            END IF;
        END IF;
        
        -- If no allocation was possible, mark as not allocated
        IF NOT is_allocated THEN
            INSERT INTO SeatAllocation (Student_Id, Round_Id, Status)
            VALUES (curr_student_id, latest_round, 'not allocated');
        END IF;
        
    END LOOP;
    
    CLOSE student_cursor;
    
    -- Clear preferences after allocation
    TRUNCATE TABLE Preferences;
    
    COMMIT;
END //

DELIMITER ;
DROP TRIGGER IF EXISTS after_seat_decision;
DELIMITER //

CREATE TRIGGER after_seat_decision
AFTER UPDATE ON SeatAllocation
FOR EACH ROW
BEGIN
    DECLARE student_category VARCHAR(10);
    
    -- Get the student's category safely
    SET student_category = (SELECT Category FROM Students WHERE Student_Id = NEW.Student_Id LIMIT 1);

    IF NEW.Decision = 'freeze' THEN
        UPDATE Students SET has_frozen = TRUE 
        WHERE Student_Id = NEW.Student_Id;
    
    ELSEIF NEW.Decision = 'slide' AND OLD.Decision IS NULL THEN
        -- Only increment remaining seats if there was a previous allocation
        IF OLD.College_Id IS NOT NULL AND OLD.Course_Id IS NOT NULL THEN
            IF student_category = 'OBC' THEN
                UPDATE SeatDistribution 
                SET remaining_obc = remaining_obc + 1 
                WHERE College_Id = OLD.College_Id 
                AND Course_Id = OLD.Course_Id;
                
            ELSEIF student_category = 'SC/ST' THEN
                UPDATE SeatDistribution 
                SET remaining_scst = remaining_scst + 1 
                WHERE College_Id = OLD.College_Id 
                AND Course_Id = OLD.Course_Id;
                
            ELSE
                UPDATE SeatDistribution 
                SET remaining_general = remaining_general + 1 
                WHERE College_Id = OLD.College_Id 
                AND Course_Id = OLD.Course_Id;
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;


-- SETUP FOR DEMO
use clean_counselling;

SET SQL_SAFE_UPDATES = 0;
UPDATE SeatDistribution sd
JOIN CategoryInfo ci_general ON ci_general.Category = 'General'
JOIN CategoryInfo ci_obc ON ci_obc.Category = 'OBC'
JOIN CategoryInfo ci_scst ON ci_scst.Category = 'SC/ST'
SET 
    sd.remaining_general = FLOOR(sd.Total_Seats * ci_general.Seat_Percentage),
    sd.remaining_obc = FLOOR(sd.Total_Seats * ci_obc.Seat_Percentage),
    sd.remaining_scst = FLOOR(sd.Total_Seats * ci_scst.Seat_Percentage);
UPDATE Students SET has_frozen = FALSE;
truncate table preferences;
truncate table seatallocation;
UPDATE CounselingSessions

SET
    start_Date = CASE Round_Number
        WHEN 1 THEN NOW()
        WHEN 2 THEN NOW() + INTERVAL 2 MINUTE
        WHEN 3 THEN NOW() + INTERVAL 10 MINUTE
        WHEN 4 THEN NOW() + INTERVAL 15 MINUTE
    END,
    end_date = CASE Round_Number
        WHEN 1 THEN NOW() + INTERVAL 1 MINUTE
        WHEN 2 THEN NOW() + INTERVAL 8 MINUTE
        WHEN 3 THEN NOW() + INTERVAL 13 MINUTE
        WHEN 4 THEN NOW() + INTERVAL 16 MINUTE
    END;

select * from seatDistribution;
select * from COunselingSessions;
SET SQL_SAFE_UPDATES = 1;




-- DISPLAY LOG
use clean_counselling;
set global event_scheduler  = OFF;
select * from preferences;

select * from counselingsessions;

select * from students;
select * from seatallocation;
select * from allocationdebugview;
select * from seatdistribution;
select * from debuglog;
select * from categoryinfo;
select * from logininfo;
show procedure status;