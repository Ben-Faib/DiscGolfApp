  
\-- \=====================================================  
\-- Player Leaderboard  
\-- Shows player rankings by skill division with top 3 scorecard totals  
\-- \=====================================================

CREATE OR ALTER VIEW vw\_PlayerLeaderboard AS  
WITH ScorecardTotals AS (  
    \-- Calculate total score for each player per scorecard  
    SELECT   
        s.ScorecardID,  
        s.PlayerID,  
        p.FirstName,  
        p.LastName,  
        p.SkillDivision,  
        SUM(s.Strokes) AS ScorecardTotal  
    FROM Score s  
    INNER JOIN Player p ON s.PlayerID \= p.PlayerID  
    GROUP BY s.ScorecardID, s.PlayerID, p.FirstName, p.LastName, p.SkillDivision  
),  
Top3Scorecards AS (  
    \-- Get the top 3 scorecard totals for each player  
    SELECT   
        PlayerID,  
        FirstName,  
        LastName,  
        SkillDivision,  
        ScorecardTotal,  
        ROW\_NUMBER() OVER (PARTITION BY PlayerID ORDER BY ScorecardTotal DESC) AS ScoreRank  
    FROM ScorecardTotals  
),  
PlayerStats AS (  
    \-- Aggregate the top 3 scores and other stats  
    SELECT   
        PlayerID,  
        FirstName,  
        LastName,  
        SkillDivision,  
        COUNT(\*) AS Top3RoundsUsed,  
        SUM(ScorecardTotal) AS HighTotal,  
        MAX(ScorecardTotal) AS BestScorecardTotal  
    FROM Top3Scorecards  
    WHERE ScoreRank \<= 3  
    GROUP BY PlayerID, FirstName, LastName, SkillDivision  
)  
SELECT   
    ps.SkillDivision,  
    ps.FirstName,  
    ps.LastName,  
    ISNULL(total\_rounds.TotalRounds, 0\) AS RoundsPlayed,  
    ps.HighTotal,  
    ps.BestScorecardTotal,  
    RANK() OVER (PARTITION BY ps.SkillDivision ORDER BY ps.HighTotal DESC) AS DivisionRank  
FROM PlayerStats ps  
LEFT JOIN (  
    SELECT PlayerID, COUNT(DISTINCT ScorecardID) AS TotalRounds  
    FROM Score  
    GROUP BY PlayerID  
) total\_rounds ON ps.PlayerID \= total\_rounds.PlayerID  
\-- ORDER BY removed from view (apply when querying)  
GO

\-- \=====================================================  
\-- Player Score History  
\-- Shows all scorecard totals with ranking and top 3 indicator  
\-- \=====================================================

CREATE OR ALTER VIEW vw\_PlayerScoreHistory AS  
SELECT   
    p.PlayerID,  
    p.FirstName,  
    p.LastName,  
    p.SkillDivision,  
    s.ScorecardID,  
    sc.EventID,  
    e.EventDate,  
    e.Name AS EventName,  
    SUM(s.Strokes) AS ScorecardTotal,  
    ROW\_NUMBER() OVER (PARTITION BY p.PlayerID ORDER BY SUM(s.Strokes) DESC) AS ScoreRank,  
    CASE   
        WHEN ROW\_NUMBER() OVER (PARTITION BY p.PlayerID ORDER BY SUM(s.Strokes) DESC) \<= 3   
        THEN 'Yes'   
        ELSE 'No'   
    END AS CountsTowardTotal  
FROM Score s  
INNER JOIN Player p ON s.PlayerID \= p.PlayerID  
INNER JOIN Scorecard sc ON s.ScorecardID \= sc.ScorecardID  
INNER JOIN Event e ON sc.EventID \= e.EventID  
GROUP BY p.PlayerID, p.FirstName, p.LastName, p.SkillDivision,   
         s.ScorecardID, sc.EventID, e.EventDate, e.Name  
\-- ORDER BY removed from view (apply when querying)  
GO

\-- \=====================================================  
\-- Event Hole Statistics  
\-- Detailed stats for each hole including difficulty ratings  
\-- \=====================================================

CREATE OR ALTER VIEW vw\_EventHoleStats AS  
SELECT   
    e.EventID,  
    e.Name AS EventName,  
    e.EventDate,  
    e.HoleCount,  
    el.HoleNumber,  
    el.DistanceFeet,  
      
    \-- Basket Information  
    b.BasketID,  
    b.Brand AS BasketBrand,  
    b.Model AS BasketModel,  
    b.ChainCount,  
    b.HasUpperBand,  
      
    \-- Obstacle Information  
    o.ObstacleID,  
    o.Elevation,  
    o.IsMandatory,  
    o.BodyPosition,  
    o.Obstruction,  
    o.Description AS ObstacleDescription,  
      
    \-- Scoring Statistics  
    COUNT(DISTINCT s.PlayerID) AS PlayersAttempted,  
    ROUND(AVG(CAST(s.Strokes AS FLOAT)), 2\) AS AvgScore,  
    MIN(s.Strokes) AS MinScore,  
    MAX(s.Strokes) AS MaxScore,  
    SUM(s.Strokes) AS TotalScore,  
      
    \-- Difficulty Rating (lower avg score \= harder hole since higher is better)  
    CASE   
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \>= 2.5 THEN 'Easy'  
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \>= 2.0 THEN 'Moderate'  
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \>= 1.5 THEN 'Difficult'  
        ELSE 'Very Difficult'  
    END AS DifficultyRating,  
      
    \-- Rank holes by difficulty within event (1 \= hardest)  
    RANK() OVER (PARTITION BY e.EventID ORDER BY AVG(CAST(s.Strokes AS FLOAT)) ASC) AS DifficultyRank

FROM Event e  
INNER JOIN EventLayout el ON e.EventID \= el.LayoutID  
LEFT JOIN LayoutObstacle lo ON el.LayoutID \= lo.LayoutID AND el.HoleNumber \= lo.HoleNumber  
LEFT JOIN Obstacle o ON lo.ObstacleID \= o.ObstacleID  
LEFT JOIN LayoutBasket lb ON el.LayoutID \= lb.LayoutID AND el.HoleNumber \= lb.HoleNumber  
LEFT JOIN Basket b ON lb.BasketID \= b.BasketID  
LEFT JOIN Scorecard sc ON e.EventID \= sc.EventID  
LEFT JOIN Score s ON sc.ScorecardID \= s.ScorecardID AND el.HoleNumber \= s.HoleNumber

GROUP BY   
    e.EventID, e.Name, e.EventDate, e.HoleCount, el.HoleNumber, el.DistanceFeet,  
    b.BasketID, b.Brand, b.Model, b.ChainCount, b.HasUpperBand,  
    o.ObstacleID, o.Elevation, o.IsMandatory, o.BodyPosition, o.Obstruction, o.Description  
\-- ORDER BY removed from view (apply when querying)  
GO

\-- \=====================================================  
\-- Event Summary  
\-- High-level event statistics  
\-- \=====================================================

CREATE OR ALTER VIEW vw\_EventSummary AS  
SELECT   
    e.EventID,  
    e.Name AS EventName,  
    e.EventDate,  
    e.HoleCount,  
      
    \-- Player Statistics  
    COUNT(DISTINCT sc.ScorecardID) AS TotalScorecards,  
    COUNT(DISTINCT s.PlayerID) AS TotalPlayers,  
      
    \-- Overall Scoring  
    ISNULL(ROUND(AVG(CAST(s.Strokes AS FLOAT)), 2), 0\) AS OverallAvgScore

FROM Event e  
LEFT JOIN EventLayout el ON e.EventID \= el.LayoutID  
LEFT JOIN LayoutObstacle lo ON el.LayoutID \= lo.LayoutID AND el.HoleNumber \= lo.HoleNumber  
LEFT JOIN Obstacle o ON lo.ObstacleID \= o.ObstacleID  
LEFT JOIN Scorecard sc ON e.EventID \= sc.EventID  
LEFT JOIN Score s ON sc.ScorecardID \= s.ScorecardID

GROUP BY e.EventID, e.Name, e.EventDate, e.HoleCount  
\-- ORDER BY removed from view (apply when querying)  
GO

\-- \=====================================================  
\-- Hole Difficulty Ranking  
\-- Ranks holes across all events by difficulty  
\-- \=====================================================

CREATE OR ALTER VIEW vw\_HoleDifficultyRanking AS  
SELECT   
    e.EventID,  
    e.Name AS EventName,  
    el.HoleNumber,  
    el.DistanceFeet,  
      
    \-- Obstacle summary  
    ISNULL(o.Description, 'None') AS ObstacleDescription,  
    ISNULL(o.Elevation, 0\) as Elevation,  
    CASE WHEN o.IsMandatory \= 1 THEN 'Yes' ELSE 'No' END AS IsMandatory,  
    CASE WHEN o.Obstruction \= 1 THEN 'Yes' ELSE 'No' END AS HasObstruction,  
      
    \-- Scoring stats  
    COUNT(s.ScoreID) AS TimesPlayed,  
    ISNULL(ROUND(AVG(CAST(s.Strokes AS FLOAT)), 2), 0\) AS AvgScore,  
      
    \-- Difficulty rating  
   CASE   
    WHEN AVG(CAST(s.Strokes AS FLOAT)) \>= 2.5 THEN 'Easy'  
    WHEN AVG(CAST(s.Strokes AS FLOAT)) \>= 2.0 THEN 'Moderate'  
    WHEN AVG(CAST(s.Strokes AS FLOAT)) \>= 1.5 THEN 'Difficult'  
    WHEN AVG(CAST(s.Strokes AS FLOAT)) IS NULL THEN 'None'  
    ELSE 'Very Difficult'  
END AS DifficultyRating,  
      
    \-- Success rate (score of 2 or 3\)  
    ISNULL(ROUND((SUM(CASE WHEN s.Strokes \>= 2 THEN 1 ELSE 0 END) \* 100.0 / NULLIF(COUNT(s.ScoreID), 0)), 1), 0\) AS SuccessRatePercent

FROM Event e  
INNER JOIN EventLayout el ON e.EventID \= el.LayoutID  
LEFT JOIN LayoutObstacle lo ON el.LayoutID \= lo.LayoutID AND el.HoleNumber \= lo.HoleNumber  
LEFT JOIN Obstacle o ON lo.ObstacleID \= o.ObstacleID  
LEFT JOIN Scorecard sc ON e.EventID \= sc.EventID  
LEFT JOIN Score s ON sc.ScorecardID \= s.ScorecardID AND el.HoleNumber \= s.HoleNumber

GROUP BY   
    e.EventID, e.Name, el.HoleNumber, el.DistanceFeet,  
    o.Description, o.Elevation, o.IsMandatory, o.Obstruction  
\-- ORDER BY removed from view (apply when querying)  
GO

USE \[PuttingLeague\]  
GO

/\*\*\*\*\*\* Object:  View \[dbo\].\[vw\_HotRoundPerEvent\]    Script Date: 11/28/2025 2:33:50 PM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

\-- \=====================================================  
\-- Hot Round / Best Round Per Event  
\-- Shows the highest scoring round for each event by division  
\-- \=====================================================

CREATE OR ALTER VIEW \[dbo\].\[vw\_HotRoundPerEvent\] AS  
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
    INNER JOIN Player p ON s.PlayerID \= p.PlayerID  
    INNER JOIN Scorecard sc ON s.ScorecardID \= sc.ScorecardID  
    INNER JOIN Event e ON sc.EventID \= e.EventID  
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
    FirstName \+ ' ' \+ LastName AS PlayerName,  
    RoundTotal,  
    HolesPlayed,  
    DivisionRank,  
    OverallRank,  
    CASE   
        WHEN OverallRank \= 1 THEN 'Hot Round Overall'  
        WHEN DivisionRank \= 1 THEN 'Hot Round \- ' \+ SkillDivision  
        ELSE ''  
    END AS BadgeType  
FROM RankedRounds  
WHERE DivisionRank \= 1  
GO

USE \[PuttingLeague\]  
GO

/\*\*\*\*\*\* Object:  View \[dbo\].\[vw\_PodiumPercentage\]    Script Date: 11/28/2025 2:34:12 PM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

\-- \=====================================================  
\-- Longest Streak in Top 3 by Division  
\-- Tracks consecutive rounds where player finished in top 3  
\-- \=====================================================

CREATE OR ALTER VIEW \[dbo\].\[vw\_PodiumPercentage\] AS  
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
    INNER JOIN Player p ON s.PlayerID \= p.PlayerID  
    INNER JOIN Scorecard sc ON s.ScorecardID \= sc.ScorecardID  
    INNER JOIN Event e ON sc.EventID \= e.EventID  
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
        CASE WHEN DivisionRank \<= 3 THEN 1 ELSE 0 END AS IsTop3  
    FROM RankedByEvent  
)  
SELECT   
    FirstName \+ ' ' \+ LastName AS PlayerName,  
    SkillDivision,  
    COUNT(CASE WHEN IsTop3 \= 1 THEN 1 END) AS PodiumFinishes,  
    COUNT(\*) AS TotalRounds,  
    CAST(COUNT(CASE WHEN IsTop3 \= 1 THEN 1 END) \* 100.0 / NULLIF(COUNT(\*), 0\) AS DECIMAL(5,1)) AS PodiumPercentage  
FROM PlayerStreaks  
GROUP BY PlayerID, FirstName, LastName, SkillDivision  
GO

USE \[PuttingLeague\]  
GO

/\*\*\*\*\*\* Object:  View \[dbo\].\[vw\_TopCardPerEvent\]    Script Date: 11/28/2025 2:34:27 PM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

\-- \=====================================================  
\-- Top Card Per Event  
\-- Shows the highest scoring card (sum of all players) per event  
\-- \=====================================================

CREATE OR ALTER VIEW \[dbo\].\[vw\_TopCardPerEvent\] AS  
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
    INNER JOIN Scorecard sc ON s.ScorecardID \= sc.ScorecardID  
    INNER JOIN Event e ON sc.EventID \= e.EventID  
    INNER JOIN Player p ON s.PlayerID \= p.PlayerID  
    GROUP BY sc.EventID, e.Name, e.EventDate, s.ScorecardID  
),  
cardMates as (  
select scorecardID, string\_agg(playerName, ', ') as Players  
from  
(  
select distinct s.scorecardID, s.playerID, p.FirstName \+ ' ' \+ p.lastname as playerName  
from  
score s  
join player p  
on s.playerID \= p.playerID  
) t  
group by scorecardID  
),  
RankedCards AS (  
    SELECT   
        EventName,  
        EventDate,  
        CardTotal,  
        PlayerCount,  
        HolesPlayed,  
        Players,  
        RANK() OVER (PARTITION BY EventID ORDER BY CardTotal DESC) AS CardRank  
    FROM CardTotals ct  
    join cardMates cm  
    on ct.ScorecardID \= cm.ScorecardID  
)  
SELECT   
    EventName,  
    EventDate,  
    CardRank,  
    CardTotal,  
    PlayerCount,  
    HolesPlayed,  
    CAST(CardTotal \* 1.0 / NULLIF(HolesPlayed, 0\) AS DECIMAL(5,2)) AS AvgScorePerHole,  
    Players  
FROM RankedCards  
WHERE CardRank \<= 3  \-- Top 3 cards per event  
GO

USE \[PuttingLeague\]  
GO

/\*\*\*\*\*\* Object:  View \[dbo\].\[vw\_HardestBaskets\]    Script Date: 11/28/2025 2:35:34 PM \*\*\*\*\*\*/  
SET ANSI\_NULLS ON  
GO

SET QUOTED\_IDENTIFIER ON  
GO

\-- \=====================================================  
\-- Hardest Baskets (Across All Events)  
\-- Shows baskets with lowest average scores (hardest)  
\-- \=====================================================

CREATE OR ALTER VIEW \[dbo\].\[vw\_HardestBaskets\] AS  
SELECT   
    b.Brand,  
    b.Model,  
    b.ChainCount,  
    CASE WHEN b.HasUpperBand \= 1 THEN 'Yes' ELSE 'No' END AS HasUpperBand,  
    COUNT(DISTINCT el.LayoutID) AS TimesUsed,  
    COUNT(DISTINCT s.ScoreID) AS TotalAttempts,  
    ROUND(AVG(CAST(s.Strokes AS FLOAT)), 2\) AS AvgScore,  
    SUM(CASE WHEN s.Strokes \= 0 THEN 1 ELSE 0 END) AS ZeroScores,  
    SUM(CASE WHEN s.Strokes \= 1 THEN 1 ELSE 0 END) AS OneScores,  
    SUM(CASE WHEN s.Strokes \= 2 THEN 1 ELSE 0 END) AS TwoScores,  
    SUM(CASE WHEN s.Strokes \= 3 THEN 1 ELSE 0 END) AS PerfectScores,  
    CASE   
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \< 1.0 THEN 'Extremely Difficult'  
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \< 1.5 THEN 'Very Difficult'  
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \< 2.0 THEN 'Difficult'  
        WHEN AVG(CAST(s.Strokes AS FLOAT)) \< 2.5 THEN 'Moderate'  
        ELSE 'Easy'  
    END AS DifficultyRating,  
    RANK() OVER (ORDER BY AVG(CAST(s.Strokes AS FLOAT)) ASC) AS DifficultyRank  
FROM Basket b  
INNER JOIN LayoutBasket lb ON b.BasketID \= lb.BasketID  
INNER JOIN EventLayout el ON lb.LayoutID \= el.LayoutID AND lb.HoleNumber \= el.HoleNumber  
INNER JOIN Event e ON el.LayoutID \= e.EventID  
INNER JOIN Scorecard sc ON e.EventID \= sc.EventID  
INNER JOIN Score s ON sc.ScorecardID \= s.ScorecardID AND el.HoleNumber \= s.HoleNumber  
GROUP BY b.BasketID, b.Brand, b.Model, b.ChainCount, b.HasUpperBand  
GO

