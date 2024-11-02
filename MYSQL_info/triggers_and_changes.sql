-- USE THIS PAGE TO UPDATE ANY SQL COMMANDS ROLES FUNCTIONS PROCEDURES OR TRIGGERS CREATED TO UPDATE OTHERS.
-- UNCOMMENT PARTS OF CODE YOU CHANGED.

-- 11/2/24 Noodle
use clean_counselling;
truncate table preferences;
DELIMITER //

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
    
    -- Delete existing preferences
    DELETE FROM Preferences WHERE Student_Id = p_student_id;
    
    -- Count valid preferences
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