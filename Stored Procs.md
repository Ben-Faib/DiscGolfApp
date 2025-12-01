\-- \=====================================================  
\-- SEQUENCES  
\-- \=====================================================

\-- EventID  
IF NOT EXISTS (SELECT \* FROM sys.sequences WHERE name \= 'Event\_Seq')  
BEGIN  
    DECLARE @StartValue INT;  
    SELECT @StartValue \= ISNULL(MAX(EventID), 0\) \+ 1 FROM Event;  
      
    DECLARE @SQL NVARCHAR(MAX);  
    SET @SQL \= N'CREATE SEQUENCE Event\_Seq AS INT START WITH ' \+ CAST(@StartValue AS NVARCHAR(10)) \+ ' INCREMENT BY 1;';  
    EXEC sp\_executesql @SQL;  
END  
GO

\-- ScoreID  
IF NOT EXISTS (SELECT \* FROM sys.sequences WHERE name \= 'ScoreID\_Seq')  
BEGIN  
    DECLARE @StartValue INT;  
    SELECT @StartValue \= ISNULL(MAX(ScoreID), 0\) \+ 1 FROM Score;  
      
    DECLARE @SQL NVARCHAR(MAX);  
    SET @SQL \= N'CREATE SEQUENCE ScoreID\_Seq AS INT START WITH ' \+ CAST(@StartValue AS NVARCHAR(10)) \+ ' INCREMENT BY 1;';  
    EXEC sp\_executesql @SQL;  
END  
GO

\-- ScorecardID  
IF NOT EXISTS (SELECT \* FROM sys.sequences WHERE name \= 'Scorecard\_Seq')  
BEGIN  
    DECLARE @StartValue INT;  
    SELECT @StartValue \= ISNULL(MAX(ScorecardID), 0\) \+ 1 FROM Scorecard;  
      
    DECLARE @SQL NVARCHAR(MAX);  
    SET @SQL \= N'CREATE SEQUENCE Scorecard\_Seq AS INT START WITH ' \+ CAST(@StartValue AS NVARCHAR(10)) \+ ' INCREMENT BY 1;';  
    EXEC sp\_executesql @SQL;  
END  
GO

\-- PlayerID  
IF NOT EXISTS (SELECT \* FROM sys.sequences WHERE name \= 'PlayerID\_Seq')  
BEGIN  
    DECLARE @StartValue INT;  
    SELECT @StartValue \= ISNULL(MAX(PlayerID), 0\) \+ 1 FROM Player;  
      
    DECLARE @SQL NVARCHAR(MAX);  
    SET @SQL \= N'CREATE SEQUENCE PlayerID\_Seq AS INT START WITH ' \+ CAST(@StartValue AS NVARCHAR(10)) \+ ' INCREMENT BY 1;';  
    EXEC sp\_executesql @SQL;  
END  
GO

\-- \=====================================================  
\-- PROCEDURES  
\-- \=====================================================

USE \[PuttingLeague\]  
GO

/\*\*\*\*\*\* Object:  StoredProcedure \[dbo\].\[UpdateSequences\]    Script Date: 11/30/2025 3:07:06 PM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

\-- \=====================================================  
\-- PROCEDURE: Update Sequences  
\-- \=====================================================

CREATE OR ALTER PROCEDURE \[dbo\].\[UpdateSequences\]

AS  
BEGIN  
    SET NOCOUNT ON;  
      
   \--EVENTID RESET  
DECLARE @NewEventValue BIGINT;  
SELECT @NewEventValue \= max(eventID) \+ 1 from event;

DECLARE @sqlCommandEvent NVARCHAR(MAX);  
    SET @sqlCommandEvent \= N'ALTER SEQUENCE Event\_Seq RESTART WITH ' \+ CAST(@NewEventValue AS NVARCHAR(MAX)) \+ N';';

EXEC sp\_executesql @sqlCommandEvent;

\--PLAYERID RESET  
DECLARE @NewPlayerValue BIGINT;  
SELECT @NewPlayerValue \= max(PlayerID) \+ 1 from player;

DECLARE @sqlCommandPlayer NVARCHAR(MAX);  
    SET @sqlCommandPlayer \= N'ALTER SEQUENCE PlayerID\_Seq RESTART WITH ' \+ CAST(@NewPlayerValue AS NVARCHAR(MAX)) \+ N';';

EXEC sp\_executesql @sqlCommandPlayer;

\--SCOREID RESET  
DECLARE @NewScoreValue BIGINT;  
SELECT @NewScoreValue \= max(ScoreID) \+ 1 from Score;

DECLARE @sqlCommandScore NVARCHAR(MAX);  
    SET @sqlCommandScore \= N'ALTER SEQUENCE ScoreID\_Seq RESTART WITH ' \+ CAST(@NewScoreValue AS NVARCHAR(MAX)) \+ N';';

EXEC sp\_executesql @sqlCommandScore;

\--SCORECARDID RESET  
DECLARE @NewScorecardValue BIGINT;  
SELECT @NewScorecardValue \= max(ScorecardID) \+ 1 from scorecard;

DECLARE @sqlCommandScorecard NVARCHAR(MAX);  
    SET @sqlCommandScorecard \= N'ALTER SEQUENCE Scorecard\_Seq RESTART WITH ' \+ CAST(@NewScorecardValue AS NVARCHAR(MAX)) \+ N';';

EXEC sp\_executesql @sqlCommandScorecard;

END;  
GO

\-- \=====================================================  
\-- Create New Event  
\-- \=====================================================

CREATE OR ALTER PROCEDURE CreateEvent  
    @Name VARCHAR(150),  
    @LayoutID INT \= 1,  
    @HoleCount INT \= 9  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @NewEventID INT;  
      
    \-- Validate name is provided  
    IF @Name IS NULL OR LTRIM(RTRIM(@Name)) \= ''  
    BEGIN  
        RAISERROR('Event name is required', 16, 1);  
        RETURN;  
    END  
      
    \-- Default LayoutID to 1 if NULL  
    IF @LayoutID IS NULL  
    BEGIN  
        SET @LayoutID \= 1;  
    END  
      
    \-- Default HoleCount to 9 if NULL  
    IF @HoleCount IS NULL  
    BEGIN  
        SET @HoleCount \= 9;  
    END  
      
    \-- Validate HoleCount is positive  
    IF @HoleCount \<= 0 OR @HoleCount \> 9  
    BEGIN  
        RAISERROR('Hole count must be greater than 0 and less than 10', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate LayoutID exists (optional \- comment out if not needed)  
    IF NOT EXISTS (SELECT 1 FROM EventLayout WHERE LayoutID \= @LayoutID)  
    BEGIN  
        RAISERROR('Invalid LayoutID \- layout does not exist', 16, 1);  
        RETURN;  
    END  
      
    \-- Get next EventID from sequence  
    SET @NewEventID \= NEXT VALUE FOR Event\_Seq;  
      
    \-- Insert new event with explicit EventID and current date  
    INSERT INTO Event (EventID, EventDate, HoleCount, Name)  
    VALUES (@NewEventID, GETDATE(), @HoleCount, @Name);  
      
    \-- Return the new event info  
    SELECT   
        @NewEventID AS NewEventID,  
        @Name AS EventName,  
        GETDATE() AS EventDate,  
        @HoleCount AS HoleCount,  
        @LayoutID AS LayoutID;  
END;  
GO

\-- \=====================================================  
\-- Create New Player  
\-- \=====================================================  
\-- \=====================================================

CREATE OR ALTER PROCEDURE CreatePlayer  
    @FirstName VARCHAR(100),  
    @LastName VARCHAR(100),  
    @Email VARCHAR(255),  
    @SkillDivision VARCHAR(50)  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @NewPlayerID INT;  
      
    \-- Validate skill division  
    IF @SkillDivision NOT IN ('Beginner', 'Intermediate', 'Advanced')  
    BEGIN  
        RAISERROR('Skill division must be Beginner, Intermediate, or Advanced', 16, 1);  
        RETURN;  
    END  
      
    \-- Check if email already exists  
    IF EXISTS (SELECT 1 FROM Player WHERE Email \= @Email)  
    BEGIN  
        RAISERROR('Email already exists', 16, 1);  
        RETURN;  
    END  
      
    \-- Get next PlayerID from sequence  
    SET @NewPlayerID \= NEXT VALUE FOR PlayerID\_Seq;  
      
    \-- Insert new player with explicit PlayerID  
    INSERT INTO Player (PlayerID, FirstName, LastName, Email, SkillDivision, DateInserted)  
    VALUES (@NewPlayerID, @FirstName, @LastName, @Email, @SkillDivision, GETDATE());  
      
    \-- Return the new player info  
    SELECT   
        @NewPlayerID AS NewPlayerID,  
        @FirstName AS FirstName,  
        @LastName AS LastName,  
        @Email AS Email,  
        @SkillDivision AS SkillDivision;  
END;  
GO

\-- \=====================================================  
\-- Create New Scorecard  
\-- \=====================================================

CREATE OR ALTER PROCEDURE CreateScorecard  
    @EventID INT,  
    @CreatedByPlayerID INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @NewScorecardID INT;  
      
    \-- Validate event exists  
    IF NOT EXISTS (SELECT 1 FROM Event WHERE EventID \= @EventID)  
    BEGIN  
        RAISERROR('Invalid EventID', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate player exists  
    IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @CreatedByPlayerID)  
    BEGIN  
        RAISERROR('Invalid PlayerID', 16, 1);  
        RETURN;  
    END  
      
    \-- Get next ScorecardID from sequence  
    SET @NewScorecardID \= NEXT VALUE FOR Scorecard\_Seq;  
      
    \-- Insert new scorecard with explicit ScorecardID  
    INSERT INTO Scorecard (ScorecardID, EventID, CreatedByPlayerID, CreatedAt)  
    VALUES (@NewScorecardID, @EventID, @CreatedByPlayerID, GETDATE());  
      
    \-- Return the new scorecard info  
    SELECT   
        @NewScorecardID AS NewScorecardID,  
        @EventID AS EventID,  
        @CreatedByPlayerID AS CreatedByPlayerID,  
        GETDATE() AS CreatedAt;  
END;  
GO

\-- \=====================================================  
\-- Add Scorecard Members (Up to 4 Players)  
\-- \=====================================================  
CREATE OR ALTER PROCEDURE AddScorecardMembers  
    @ScorecardID INT,  
    @EventID INT,  
    @Player1ID INT \= NULL,  
    @Player2ID INT \= NULL,  
    @Player3ID INT \= NULL,  
    @Player4ID INT \= NULL  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @MemberCount INT \= 0;  
      
    \-- Validate scorecard exists  
    IF NOT EXISTS (SELECT 1 FROM Scorecard WHERE ScorecardID \= @ScorecardID)  
    BEGIN  
        RAISERROR('Invalid ScorecardID', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate event exists  
    IF NOT EXISTS (SELECT 1 FROM Event WHERE EventID \= @EventID)  
    BEGIN  
        RAISERROR('Invalid EventID', 16, 1);  
        RETURN;  
    END  
      
    \-- Check that at least one player is provided  
    IF @Player1ID IS NULL AND @Player2ID IS NULL AND @Player3ID IS NULL AND @Player4ID IS NULL  
    BEGIN  
        RAISERROR('At least one PlayerID must be provided', 16, 1);  
        RETURN;  
    END  
      
    \-- Insert Player 1  
    IF @Player1ID IS NOT NULL  
    BEGIN  
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player1ID)  
        BEGIN  
            RAISERROR('Invalid Player1ID', 16, 1);  
            RETURN;  
        END  
          
        SET @MemberCount \= @MemberCount \+ 1;  
          
        INSERT INTO ScorecardMember (ScorecardID, PlayerID, MemberPosition)  
        VALUES (@ScorecardID, @Player1ID, 1);  
    END  
      
    \-- Insert Player 2  
    IF @Player2ID IS NOT NULL  
    BEGIN  
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player2ID)  
        BEGIN  
            RAISERROR('Invalid Player2ID', 16, 1);  
            RETURN;  
        END  
          
        SET @MemberCount \= @MemberCount \+ 1;  
          
        INSERT INTO ScorecardMember (ScorecardID, PlayerID, MemberPosition)  
        VALUES (@ScorecardID, @Player2ID, 2);  
    END  
      
    \-- Insert Player 3  
    IF @Player3ID IS NOT NULL  
    BEGIN  
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player3ID)  
        BEGIN  
            RAISERROR('Invalid Player3ID', 16, 1);  
            RETURN;  
        END  
          
        SET @MemberCount \= @MemberCount \+ 1;  
          
        INSERT INTO ScorecardMember (ScorecardID, PlayerID, MemberPosition)  
        VALUES (@ScorecardID, @Player3ID, 3);  
    END  
      
    \-- Insert Player 4  
    IF @Player4ID IS NOT NULL  
    BEGIN  
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player4ID)  
        BEGIN  
            RAISERROR('Invalid Player4ID', 16, 1);  
            RETURN;  
        END  
          
        SET @MemberCount \= @MemberCount \+ 1;  
          
        INSERT INTO ScorecardMember (ScorecardID, PlayerID, MemberPosition)  
        VALUES (@ScorecardID, @Player4ID, 4);  
    END  
      
    \-- Return success message  
    SELECT @MemberCount AS MembersAdded,  
           @ScorecardID AS ScorecardID,  
           @EventID AS EventID;  
END;  
GO

\-- \=====================================================  
\-- Insert Scores for All Players on One Hole  
\-- \=====================================================

USE \[PuttingLeague\]  
GO

/\*\*\*\*\*\* Object:  StoredProcedure \[dbo\].\[InsertHoleScores\]    Script Date: 11/26/2025 7:03:55 PM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

CREATE OR ALTER PROCEDURE InsertHoleScores  
    @ScorecardID INT,  
    @HoleNumber INT,  
    @Player1ID INT,  
    @Player1Score INT,  
    @Player2ID INT,  
    @Player2Score INT,  
    @Player3ID INT \= NULL,  
    @Player3Score INT \= NULL,  
    @Player4ID INT \= NULL,  
    @Player4Score INT \= NULL  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @EventID INT;  
    DECLARE @HoleCount INT;  
    DECLARE @ExistingScores INT;  
    DECLARE @PlayerCount INT \= 0;  
      
    \-- Validate scorecard exists  
    SELECT @EventID \= EventID  
    FROM Scorecard  
    WHERE ScorecardID \= @ScorecardID;  
      
    IF @EventID IS NULL  
    BEGIN  
        RAISERROR('Invalid ScorecardID', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate hole number  
    SELECT @HoleCount \= HoleCount  
    FROM Event  
    WHERE EventID \= @EventID;  
      
    IF @HoleNumber \< 1 OR @HoleNumber \> @HoleCount  
    BEGIN  
        RAISERROR('Invalid hole number for this event', 16, 1);  
        RETURN;  
    END  
      
    \-- Check if scores already exist for this hole  
    SELECT @ExistingScores \= COUNT(\*)  
    FROM Score  
    WHERE ScorecardID \= @ScorecardID  
      AND HoleNumber \= @HoleNumber;  
      
    IF @ExistingScores \> 0  
    BEGIN  
        RAISERROR('Scores already exist for this hole. Use UPDATE instead.', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate Player 1 (required)  
    IF @Player1ID IS NULL OR @Player1Score IS NULL  
    BEGIN  
        RAISERROR('Player 1 ID and Score are required', 16, 1);  
        RETURN;  
    END  
      
    IF @Player1Score NOT BETWEEN 0 AND 3  
    BEGIN  
        RAISERROR('Player 1 score must be between 0 and 3', 16, 1);  
        RETURN;  
    END  
      
    IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player1ID)  
    BEGIN  
        RAISERROR('Player 1 ID is invalid', 16, 1);  
        RETURN;  
    END  
      
    SET @PlayerCount \= @PlayerCount \+ 1;  
      
    \-- Validate Player 2 (required)  
    IF @Player2ID IS NULL OR @Player2Score IS NULL  
    BEGIN  
        RAISERROR('Player 2 ID and Score are required (minimum 2 players)', 16, 1);  
        RETURN;  
    END  
      
    IF @Player2Score NOT BETWEEN 0 AND 3  
    BEGIN  
        RAISERROR('Player 2 score must be between 0 and 3', 16, 1);  
        RETURN;  
    END  
      
    IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player2ID)  
    BEGIN  
        RAISERROR('Player 2 ID is invalid', 16, 1);  
        RETURN;  
    END  
      
    SET @PlayerCount \= @PlayerCount \+ 1;  
      
    \-- Validate Player 3 (optional)  
    IF @Player3ID IS NOT NULL OR @Player3Score IS NOT NULL  
    BEGIN  
        IF @Player3ID IS NULL OR @Player3Score IS NULL  
        BEGIN  
            RAISERROR('Player 3 ID and Score must both be provided or both be NULL', 16, 1);  
            RETURN;  
        END  
          
        IF @Player3Score NOT BETWEEN 0 AND 3  
        BEGIN  
            RAISERROR('Player 3 score must be between 0 and 3', 16, 1);  
            RETURN;  
        END  
          
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player3ID)  
        BEGIN  
            RAISERROR('Player 3 ID is invalid', 16, 1);  
            RETURN;  
        END  
          
        SET @PlayerCount \= @PlayerCount \+ 1;  
    END  
      
    \-- Validate Player 4 (optional)  
    IF @Player4ID IS NOT NULL OR @Player4Score IS NOT NULL  
    BEGIN  
        IF @Player4ID IS NULL OR @Player4Score IS NULL  
        BEGIN  
            RAISERROR('Player 4 ID and Score must both be provided or both be NULL', 16, 1);  
            RETURN;  
        END  
          
        IF @Player4Score NOT BETWEEN 0 AND 3  
        BEGIN  
            RAISERROR('Player 4 score must be between 0 and 3', 16, 1);  
            RETURN;  
        END  
          
        IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @Player4ID)  
        BEGIN  
            RAISERROR('Player 4 ID is invalid', 16, 1);  
            RETURN;  
        END  
          
        SET @PlayerCount \= @PlayerCount \+ 1;  
    END  
      
    \-- Insert Player 1 and 2 (always required)  
    INSERT INTO Score (ScoreID, ScorecardID, PlayerID, HoleNumber, Strokes, RecordedAt)  
    VALUES   
        (NEXT VALUE FOR ScoreID\_Seq, @ScorecardID, @Player1ID, @HoleNumber, @Player1Score, GETDATE()),  
        (NEXT VALUE FOR ScoreID\_Seq, @ScorecardID, @Player2ID, @HoleNumber, @Player2Score, GETDATE());  
      
    \-- Insert Player 3 if provided  
    IF @Player3ID IS NOT NULL  
    BEGIN  
        INSERT INTO Score (ScoreID, ScorecardID, PlayerID, HoleNumber, Strokes, RecordedAt)  
        VALUES (NEXT VALUE FOR ScoreID\_Seq, @ScorecardID, @Player3ID, @HoleNumber, @Player3Score, GETDATE());  
    END  
      
    \-- Insert Player 4 if provided  
    IF @Player4ID IS NOT NULL  
    BEGIN  
        INSERT INTO Score (ScoreID, ScorecardID, PlayerID, HoleNumber, Strokes, RecordedAt)  
        VALUES (NEXT VALUE FOR ScoreID\_Seq, @ScorecardID, @Player4ID, @HoleNumber, @Player4Score, GETDATE());  
    END  
      
    \-- Return success message  
    SELECT   
        'Successfully inserted scores for ' \+ CAST(@PlayerCount AS VARCHAR(1)) \+ ' players on hole ' \+ CAST(@HoleNumber AS VARCHAR(10)) AS Result,  
        @PlayerCount AS PlayersInserted;  
END;  
GO

\-- \=====================================================  
\-- REMOVE PLAYER FROM SCORECARD    
\-- \=====================================================

CREATE OR ALTER PROCEDURE RemovePlayerFromScorecard  
    @PlayerID INT,  
    @ScorecardID INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @CreatedByPlayerID INT;  
    DECLARE @ScoreCount INT;  
    DECLARE @MemberExists INT;  
      
    \-- Validate PlayerID exists  
    IF NOT EXISTS (SELECT 1 FROM Player WHERE PlayerID \= @PlayerID)  
    BEGIN  
        RAISERROR('Invalid PlayerID \- player does not exist', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate ScorecardID exists  
    SELECT @CreatedByPlayerID \= CreatedByPlayerID  
    FROM Scorecard  
    WHERE ScorecardID \= @ScorecardID;  
      
    IF @CreatedByPlayerID IS NULL  
    BEGIN  
        RAISERROR('Invalid ScorecardID \- scorecard does not exist', 16, 1);  
        RETURN;  
    END  
      
    \-- Check if player created the scorecard  
    IF @CreatedByPlayerID \= @PlayerID  
    BEGIN  
        RAISERROR('Cannot remove player who created the scorecard', 16, 1);  
        RETURN;  
    END  
      
    \-- Check if player is a member of this scorecard  
    SELECT @MemberExists \= COUNT(\*)  
    FROM ScorecardMember  
    WHERE ScorecardID \= @ScorecardID  
      AND PlayerID \= @PlayerID;  
      
    IF @MemberExists \= 0  
    BEGIN  
        RAISERROR('Player is not a member of this scorecard', 16, 1);  
        RETURN;  
    END  
      
    \-- Begin transaction to ensure data integrity  
    BEGIN TRANSACTION;  
      
    BEGIN TRY  
        \-- Step 1: Delete all scores for this player on this scorecard  
        DELETE FROM Score  
        WHERE ScorecardID \= @ScorecardID  
          AND PlayerID \= @PlayerID;  
          
        SET @ScoreCount \= @@ROWCOUNT;  
          
        \-- Step 2: Remove player from scorecard members  
        DELETE FROM ScorecardMember  
        WHERE ScorecardID \= @ScorecardID  
          AND PlayerID \= @PlayerID;  
          
        \-- Commit the transaction  
        COMMIT TRANSACTION;  
          
        \-- Return success message with details  
        SELECT   
            'Successfully removed player from scorecard' AS Result,  
            @PlayerID AS PlayerID,  
            @ScorecardID AS ScorecardID,  
            @ScoreCount AS ScoresDeleted;  
              
    END TRY  
    BEGIN CATCH  
        \-- Rollback transaction on error  
        IF @@TRANCOUNT \> 0  
            ROLLBACK TRANSACTION;  
          
        \-- Re-throw the error  
        DECLARE @ErrorMessage NVARCHAR(4000) \= ERROR\_MESSAGE();  
        DECLARE @ErrorSeverity INT \= ERROR\_SEVERITY();  
        DECLARE @ErrorState INT \= ERROR\_STATE();  
          
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);  
    END CATCH  
END;  
GO

\-- \=====================================================  
\-- Generate Missing Scores   
\-- \=====================================================

CREATE OR ALTER PROCEDURE GenerateScoresForHole  
    @ScorecardID INT,  
    @HoleNumber INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @EventID INT;  
    DECLARE @HoleCount INT;  
    DECLARE @PlayerID INT;  
    DECLARE @SkillDivision VARCHAR(50);  
    DECLARE @Score INT;  
    DECLARE @NextScoreID INT;  
    DECLARE @ExistingScores INT;  
      
    \-- Validate scorecard exists and get event info  
    SELECT @EventID \= EventID  
    FROM Scorecard  
    WHERE ScorecardID \= @ScorecardID;  
      
    IF @EventID IS NULL  
    BEGIN  
        RAISERROR('Invalid ScorecardID', 16, 1);  
        RETURN;  
    END  
      
    \-- Validate hole number  
    SELECT @HoleCount \= HoleCount  
    FROM Event  
    WHERE EventID \= @EventID;  
      
    IF @HoleNumber \< 1 OR @HoleNumber \> @HoleCount  
    BEGIN  
        RAISERROR('Invalid hole number for this event', 16, 1);  
        RETURN;  
    END  
      
    \-- Check if scores already exist for this hole  
    SELECT @ExistingScores \= COUNT(\*)  
    FROM Score  
    WHERE ScorecardID \= @ScorecardID  
      AND HoleNumber \= @HoleNumber;  
      
    IF @ExistingScores \> 0  
    BEGIN  
        RAISERROR('Scores already exist for this hole', 16, 1);  
        RETURN;  
    END  
      
    \-- Get next ScoreID  
    SELECT @NextScoreID \= ISNULL(MAX(ScoreID), 0\) \+ 1 FROM Score;  
      
    \-- Cursor to loop through all players on scorecard  
    DECLARE player\_cursor CURSOR FOR  
        SELECT sm.PlayerID, p.SkillDivision  
        FROM ScorecardMember sm  
        INNER JOIN Player p ON sm.PlayerID \= p.PlayerID  
        WHERE sm.ScorecardID \= @ScorecardID  
        ORDER BY sm.MemberPosition;  
      
    OPEN player\_cursor;  
      
    FETCH NEXT FROM player\_cursor INTO @PlayerID, @SkillDivision;  
      
    WHILE @@FETCH\_STATUS \= 0  
    BEGIN  
        \-- Generate random score based on skill division  
        SET @Score \= CASE   
            WHEN @SkillDivision \= 'Beginner' THEN FLOOR(RAND() \* 2\)        \-- 0-1  
            WHEN @SkillDivision \= 'Intermediate' THEN FLOOR(RAND() \* 3\)    \-- 0-2  
            ELSE FLOOR(1 \+ RAND() \* 3\)                                      \-- 1-3 for Advanced  
        END;  
          
        \-- Insert score  
        INSERT INTO Score (ScoreID, ScorecardID, PlayerID, HoleNumber, Strokes, RecordedAt)  
        VALUES (@NextScoreID, @ScorecardID, @PlayerID, @HoleNumber, @Score, GETDATE());  
          
        SET @NextScoreID \= @NextScoreID \+ 1;  
          
        FETCH NEXT FROM player\_cursor INTO @PlayerID, @SkillDivision;  
    END  
      
    CLOSE player\_cursor;  
    DEALLOCATE player\_cursor;  
      
    \-- Return success message  
    SELECT 'Scores generated for hole ' \+ CAST(@HoleNumber AS VARCHAR(10)) AS Result;  
END;  
GO

\-- \=====================================================  
\-- Generate Scores for All Holes on Scorecard  
\-- \=====================================================

CREATE OR ALTER PROCEDURE GenerateScoresForScorecard  
    @ScorecardID INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
      
    DECLARE @EventID INT;  
    DECLARE @HoleCount INT;  
    DECLARE @CurrentHole INT;  
    DECLARE @ExistingScores INT;  
      
    \-- Validate scorecard exists and get event info  
    SELECT @EventID \= EventID  
    FROM Scorecard  
    WHERE ScorecardID \= @ScorecardID;  
      
    IF @EventID IS NULL  
    BEGIN  
        RAISERROR('Invalid ScorecardID', 16, 1);  
        RETURN;  
    END  
      
    \-- Get hole count  
    SELECT @HoleCount \= HoleCount  
    FROM Event  
    WHERE EventID \= @EventID;  
      
    \-- Loop through each hole  
    SET @CurrentHole \= 1;  
      
    WHILE @CurrentHole \<= @HoleCount  
    BEGIN  
        \-- Check if scores already exist for this hole  
        SELECT @ExistingScores \= COUNT(\*)  
        FROM Score  
        WHERE ScorecardID \= @ScorecardID  
          AND HoleNumber \= @CurrentHole;  
          
        \-- Only generate if scores don't exist  
        IF @ExistingScores \= 0  
        BEGIN  
            EXEC GenerateScoresForHole @ScorecardID, @CurrentHole;  
        END  
          
        SET @CurrentHole \= @CurrentHole \+ 1;  
    END  
      
    \-- Return success message  
    SELECT 'Scores generated for all holes on scorecard ' \+ CAST(@ScorecardID AS VARCHAR(10)) AS Result;  
END;  
GO

