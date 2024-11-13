
-- To handle changes in preferences.

CREATE PROCEDURE UpdateStudentPreferences(
    IN p_student_id INT,
    IN p_preferences JSON
)
BEGIN
    DECLARE v_preference JSON;
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_college_id INT;
    DECLARE v_course_id INT;
    DECLARE v_preference_order INT;
    
    -- Start transaction
    START TRANSACTION;
    
    DELETE FROM Preferences WHERE Student_Id = p_student_id;
    

    IF JSON_LENGTH(p_preferences) < 3 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Minimum 3 preferences required';
    END IF;
    
    -- Loop through preferences
    preferences_loop: LOOP
        IF v_index = JSON_LENGTH(p_preferences) THEN
            LEAVE preferences_loop;
        END IF;
        
        -- Extract values
        SET v_preference = JSON_EXTRACT(p_preferences, CONCAT('$[', v_index, ']'));
        SET v_college_id = JSON_EXTRACT(v_preference, '$.collegeId');
        SET v_course_id = JSON_EXTRACT(v_preference, '$.courseId');
        SET v_preference_order = JSON_EXTRACT(v_preference, '$.preferenceOrder');
        
        -- Validate course is offered by college
        IF NOT EXISTS (
            SELECT 1 
            FROM SeatDistribution 
            WHERE College_Id = v_college_id 
            AND Course_Id = v_course_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Course not offered by selected college';
        END IF;
        
        -- Check for duplicates
        IF EXISTS (
            SELECT 1 
            FROM Preferences 
            WHERE Student_Id = p_student_id 
            AND College_Id = v_college_id 
            AND Course_Id = v_course_id
        ) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Duplicate college-course combination not allowed';
        END IF;
        
        -- Insert preference
        INSERT INTO Preferences (
            Student_Id, 
            College_Id, 
            Course_Id, 
            Preference_Order
        ) VALUES (
            p_student_id,
            v_college_id,
            v_course_id,
            v_preference_order
        );
        
        SET v_index = v_index + 1;
    END LOOP;
    
    -- Commit transaction
    COMMIT;
END //

DELIMITER ;

-- SEAT ALLOCATION PROCEDURE
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


-- Getting current Round information:
DELIMITER //

CREATE PROCEDURE GetCurrentRoundStatus()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_round_number INT;
    DECLARE v_session_name VARCHAR(100);
    DECLARE v_start_date TIMESTAMP;
    DECLARE v_end_date TIMESTAMP;
    DECLARE v_current_round_found BOOLEAN DEFAULT FALSE;
    
    -- Cursor for all rounds ordered by start date
    DECLARE round_cursor CURSOR FOR 
        SELECT Round_Number, Session_Name, start_Date, end_date
        FROM CounselingSessions
        ORDER BY start_Date;
    
    -- Handler for when cursor reaches end
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Create temporary table to store result
    DROP TEMPORARY TABLE IF EXISTS temp_round_status;
    CREATE TEMPORARY TABLE temp_round_status (
        Round_Number INT,
        Session_Name VARCHAR(100),
        start_Date TIMESTAMP,
        end_date TIMESTAMP,
        round_status VARCHAR(20),
        next_round_number INT,
        next_round_start TIMESTAMP
    );
    
    -- Open cursor and loop through rounds
    OPEN round_cursor;
    
    read_loop: LOOP
        FETCH round_cursor INTO v_round_number, v_session_name, v_start_date, v_end_date;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Check if this is the current or next round
        IF NOT v_current_round_found THEN
            IF CURRENT_TIMESTAMP BETWEEN v_start_date AND v_end_date THEN
                -- Current round
                INSERT INTO temp_round_status
                SELECT 
                    v_round_number,
                    v_session_name,
                    v_start_date,
                    v_end_date,
                    'current',
                    LEAD(Round_Number) OVER (),
                    LEAD(start_Date) OVER ()
                FROM CounselingSessions
                WHERE Round_Number = v_round_number;
                
                SET v_current_round_found = TRUE;
                
            ELSEIF CURRENT_TIMESTAMP < v_start_date THEN
                -- Next round
                INSERT INTO temp_round_status
                SELECT 
                    v_round_number,
                    v_session_name,
                    v_start_date,
                    v_end_date,
                    'next',
                    NULL,
                    NULL
                FROM CounselingSessions
                WHERE Round_Number = v_round_number;
                
                SET v_current_round_found = TRUE;
            END IF;
        END IF;
    END LOOP;
    
    CLOSE round_cursor;
    
    -- If no current or next round found, get the last completed round
    IF NOT v_current_round_found THEN
        INSERT INTO temp_round_status
        SELECT 
            Round_Number,
            Session_Name,
            start_Date,
            end_date,
            'completed',
            NULL,
            NULL
        FROM CounselingSessions
        WHERE end_date < CURRENT_TIMESTAMP
        ORDER BY end_date DESC
        LIMIT 1;
    END IF;
    
    -- Return the result
    SELECT 
        Round_Number,
        Session_Name,
        start_Date,
        end_date,
        round_status,
        next_round_number,
        next_round_start,
        CASE
            WHEN round_status = 'current' THEN TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, end_date)
            WHEN round_status = 'next' THEN TIMESTAMPDIFF(SECOND, CURRENT_TIMESTAMP, start_Date)
            ELSE 0
        END * 1000 as timeRemaining
    FROM temp_round_status;
    
    -- Clean up
    DROP TEMPORARY TABLE IF EXISTS temp_round_status;
END //

DELIMITER ;



-- Triggers
-- BEFORE PREFERENCES UPDATE
'BEGIN
    DECLARE active_round INT;
    
    -- Check if round is ongoing
    SELECT Round_Number INTO active_round
    FROM CounselingSessions 
    WHERE CURRENT_TIMESTAMP BETWEEN start_Date AND end_date 
    ORDER BY Round_Number DESC
    LIMIT 1;

    IF active_round IS NULL THEN
        SIGNAL SQLSTATE ''45000''
        SET MESSAGE_TEXT = ''Preferences can only be set during active rounds'';
    END IF;
END'
   

-- AVOID DUP Preferences:
-- PreventDuplicatePreferences
'BEGIN
    DECLARE duplicateCount INT;

    SELECT COUNT(*) INTO duplicateCount
    FROM Preferences
    WHERE Student_Id = NEW.Student_Id AND College_Id = NEW.College_Id AND Course_Id = NEW.Course_Id;

    IF duplicateCount > 0 THEN
        SIGNAL SQLSTATE ''45000''
        SET MESSAGE_TEXT = ''Duplicate preference for the same college and course is not allowed.'';
    END IF;
END'

-- After seat decision
--after_seat_decision
'BEGIN
    DECLARE student_category VARCHAR(10);
    
    -- Get the student''s category safely
    SET student_category = (SELECT Category FROM Students WHERE Student_Id = NEW.Student_Id LIMIT 1);

    IF NEW.Decision = ''freeze'' THEN
        UPDATE Students SET has_frozen = TRUE 
        WHERE Student_Id = NEW.Student_Id;
    
    ELSEIF NEW.Decision = ''slide'' AND OLD.Decision IS NULL THEN
        -- Only increment remaining seats if there was a previous allocation
        IF OLD.College_Id IS NOT NULL AND OLD.Course_Id IS NOT NULL THEN
            IF student_category = ''OBC'' THEN
                UPDATE SeatDistribution 
                SET remaining_obc = remaining_obc + 1 
                WHERE College_Id = OLD.College_Id 
                AND Course_Id = OLD.Course_Id;
                
            ELSEIF student_category = ''SC/ST'' THEN
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
END'

