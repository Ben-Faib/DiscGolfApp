-- =====================================================
-- STATS VIEWS MIGRATION
-- Run this against your PuttingLeague database to fix missing stats
-- =====================================================

USE [PuttingLeague]
GO

-- =====================================================
-- 1. Hot Round Per Event View
-- Shows the highest scoring round for each event by division
-- =====================================================

CREATE OR ALTER VIEW [dbo].[vw_HotRoundPerEvent] AS
WITH RoundTotals AS (
    SELECT 
        sc.EventID,
        e.Name AS EventName,
        e.EventDate,
        s.ScorecardID,
        s.PlayerID,
        p.FirstName,
        p.LastName,
        p.SkillDivision,
        SUM(s.Strokes) AS RoundTotal,
        COUNT(s.HoleNumber) AS HolesPlayed
    FROM Score s
    INNER JOIN Player p ON s.PlayerID = p.PlayerID
    INNER JOIN Scorecard sc ON s.ScorecardID = sc.ScorecardID
    INNER JOIN Event e ON sc.EventID = e.EventID
    GROUP BY sc.EventID, e.Name, e.EventDate, s.ScorecardID, s.PlayerID, 
             p.FirstName, p.LastName, p.SkillDivision
),
RankedRounds AS (
    SELECT 
        EventID,
        EventName,
        EventDate,
        ScorecardID,
        PlayerID,
        FirstName,
        LastName,
        SkillDivision,
        RoundTotal,
        HolesPlayed,
        RANK() OVER (PARTITION BY EventID, SkillDivision ORDER BY RoundTotal DESC) AS DivisionRank,
        RANK() OVER (PARTITION BY EventID ORDER BY RoundTotal DESC) AS OverallRank
    FROM RoundTotals
)
SELECT 
    EventName,
    EventDate,
    SkillDivision,
    FirstName + ' ' + LastName AS PlayerName,
    RoundTotal,
    HolesPlayed,
    DivisionRank,
    OverallRank,
    CASE 
        WHEN OverallRank = 1 THEN 'Hot Round Overall'
        WHEN DivisionRank = 1 THEN 'Hot Round - ' + SkillDivision
        ELSE ''
    END AS BadgeType
FROM RankedRounds
WHERE DivisionRank = 1
GO

-- =====================================================
-- 2. Podium Percentage View
-- Shows top 3 finish rate by player
-- =====================================================

CREATE OR ALTER VIEW [dbo].[vw_PodiumPercentage] AS
WITH RoundTotals AS (
    SELECT 
        sc.EventID,
        e.EventDate,
        e.Name AS EventName,
        s.ScorecardID,
        s.PlayerID,
        p.FirstName,
        p.LastName,
        p.SkillDivision,
        SUM(s.Strokes) AS RoundTotal
    FROM Score s
    INNER JOIN Player p ON s.PlayerID = p.PlayerID
    INNER JOIN Scorecard sc ON s.ScorecardID = sc.ScorecardID
    INNER JOIN Event e ON sc.EventID = e.EventID
    GROUP BY sc.EventID, e.EventDate, e.Name, s.ScorecardID, s.PlayerID,
             p.FirstName, p.LastName, p.SkillDivision
),
RankedByEvent AS (
    SELECT 
        EventID,
        EventDate,
        EventName,
        ScorecardID,
        PlayerID,
        FirstName,
        LastName,
        SkillDivision,
        RoundTotal,
        RANK() OVER (PARTITION BY EventID, SkillDivision ORDER BY RoundTotal DESC) AS DivisionRank
    FROM RoundTotals
),
PlayerStreaks AS (
    SELECT 
        PlayerID,
        FirstName,
        LastName,
        SkillDivision,
        EventID,
        EventDate,
        EventName,
        DivisionRank,
        CASE WHEN DivisionRank <= 3 THEN 1 ELSE 0 END AS IsTop3
    FROM RankedByEvent
)
SELECT 
    FirstName + ' ' + LastName AS PlayerName,
    SkillDivision,
    COUNT(CASE WHEN IsTop3 = 1 THEN 1 END) AS PodiumFinishes,
    COUNT(*) AS TotalRounds,
    CAST(COUNT(CASE WHEN IsTop3 = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,1)) AS PodiumPercentage
FROM PlayerStreaks
GROUP BY PlayerID, FirstName, LastName, SkillDivision
GO

-- =====================================================
-- 3. Top Card Per Event View
-- Shows the highest scoring card (group) per event
-- =====================================================

CREATE OR ALTER VIEW [dbo].[vw_TopCardPerEvent] AS
WITH CardTotals AS (
    SELECT 
        sc.EventID,
        e.Name AS EventName,
        e.EventDate,
        s.ScorecardID,
        SUM(s.Strokes) AS CardTotal,
        COUNT(DISTINCT s.PlayerID) AS PlayerCount,
        COUNT(DISTINCT s.HoleNumber) AS HolesPlayed
    FROM Score s
    INNER JOIN Scorecard sc ON s.ScorecardID = sc.ScorecardID
    INNER JOIN Event e ON sc.EventID = e.EventID
    INNER JOIN Player p ON s.PlayerID = p.PlayerID
    GROUP BY sc.EventID, e.Name, e.EventDate, s.ScorecardID
),
cardMates AS (
    SELECT scorecardID, STRING_AGG(playerName, ', ') AS Players
    FROM (
        SELECT DISTINCT s.scorecardID, s.playerID, p.FirstName + ' ' + p.LastName AS playerName
        FROM Score s
        JOIN Player p ON s.playerID = p.playerID
    ) t
    GROUP BY scorecardID
),
RankedCards AS (
    SELECT 
        ct.EventID,
        EventName,
        EventDate,
        CardTotal,
        PlayerCount,
        HolesPlayed,
        Players,
        RANK() OVER (PARTITION BY ct.EventID ORDER BY CardTotal DESC) AS CardRank
    FROM CardTotals ct
    JOIN cardMates cm ON ct.ScorecardID = cm.ScorecardID
)
SELECT 
    EventName,
    EventDate,
    CardRank,
    CardTotal,
    PlayerCount,
    HolesPlayed,
    CAST(CardTotal * 1.0 / NULLIF(HolesPlayed, 0) AS DECIMAL(5,2)) AS AvgScorePerHole,
    Players
FROM RankedCards
WHERE CardRank <= 3
GO

-- =====================================================
-- 4. Hardest Baskets View
-- Shows baskets with lowest average scores (hardest)
-- =====================================================

CREATE OR ALTER VIEW [dbo].[vw_HardestBaskets] AS
SELECT 
    b.Brand,
    b.Model,
    b.ChainCount,
    CASE WHEN b.HasUpperBand = 1 THEN 'Yes' ELSE 'No' END AS HasUpperBand,
    COUNT(DISTINCT el.LayoutID) AS TimesUsed,
    COUNT(DISTINCT s.ScoreID) AS TotalAttempts,
    ROUND(AVG(CAST(s.Strokes AS FLOAT)), 2) AS AvgScore,
    SUM(CASE WHEN s.Strokes = 0 THEN 1 ELSE 0 END) AS ZeroScores,
    SUM(CASE WHEN s.Strokes = 1 THEN 1 ELSE 0 END) AS OneScores,
    SUM(CASE WHEN s.Strokes = 2 THEN 1 ELSE 0 END) AS TwoScores,
    SUM(CASE WHEN s.Strokes = 3 THEN 1 ELSE 0 END) AS PerfectScores,
    CASE 
        WHEN AVG(CAST(s.Strokes AS FLOAT)) < 1.0 THEN 'Extremely Difficult'
        WHEN AVG(CAST(s.Strokes AS FLOAT)) < 1.5 THEN 'Very Difficult'
        WHEN AVG(CAST(s.Strokes AS FLOAT)) < 2.0 THEN 'Difficult'
        WHEN AVG(CAST(s.Strokes AS FLOAT)) < 2.5 THEN 'Moderate'
        ELSE 'Easy'
    END AS DifficultyRating,
    RANK() OVER (ORDER BY AVG(CAST(s.Strokes AS FLOAT)) ASC) AS DifficultyRank
FROM Basket b
INNER JOIN LayoutBasket lb ON b.BasketID = lb.BasketID
INNER JOIN EventLayout el ON lb.LayoutID = el.LayoutID AND lb.HoleNumber = el.HoleNumber
INNER JOIN Event e ON el.LayoutID = e.EventID
INNER JOIN Scorecard sc ON e.EventID = sc.EventID
INNER JOIN Score s ON sc.ScorecardID = s.ScorecardID AND el.HoleNumber = s.HoleNumber
GROUP BY b.BasketID, b.Brand, b.Model, b.ChainCount, b.HasUpperBand
GO

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to confirm views were created successfully
-- =====================================================

PRINT 'Views created successfully. Running verification queries...'
GO

SELECT 'vw_HotRoundPerEvent' AS ViewName, COUNT(*) AS RowCount FROM vw_HotRoundPerEvent;
SELECT 'vw_PodiumPercentage' AS ViewName, COUNT(*) AS RowCount FROM vw_PodiumPercentage;
SELECT 'vw_TopCardPerEvent' AS ViewName, COUNT(*) AS RowCount FROM vw_TopCardPerEvent;
SELECT 'vw_HardestBaskets' AS ViewName, COUNT(*) AS RowCount FROM vw_HardestBaskets;
GO

PRINT 'Migration complete!'
GO

