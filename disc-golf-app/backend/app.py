"""
Flask API for Disc Golf Putting League
Connects to Azure SQL Server backend
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import execute_query, execute_proc, execute_insert
from datetime import date

app = Flask(__name__)

# Explicit CORS configuration for Chrome compatibility
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 600  # Cache preflight requests for 10 minutes
    }
})

# ============================================
# PLAYERS
# ============================================

@app.route('/api/players', methods=['GET'])
def get_players():
    """Get all players"""
    try:
        results = execute_query("SELECT * FROM Player ORDER BY LastName, FirstName")
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Get a single player by ID"""
    try:
        results = execute_query("SELECT * FROM Player WHERE PlayerID = ?", [player_id])
        if results:
            return jsonify(results[0])
        return jsonify({"error": "Player not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players', methods=['POST'])
def create_player():
    """Create a new player using CreatePlayer stored proc"""
    try:
        data = request.json
        result = execute_proc("CreatePlayer", [
            data['firstName'],
            data['lastName'],
            data['email'],
            data['skillDivision']
        ])
        # execute_proc returns an array, but we need the first result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 201
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# LEADERBOARD / STATS
# ============================================

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get player leaderboard from vw_PlayerLeaderboard view
    
    Query params:
        division: Filter by skill division (e.g. 'Advanced')
        eventLimit: 'latest' (default), 'all', or number (e.g. '5' for last 5 events)
    """
    try:
        division = request.args.get('division')
        event_limit = request.args.get('eventLimit', 'latest')
        
        # The leaderboard view aggregates across all events
        # For event-specific filtering, we need a different approach
        if event_limit == 'all':
            if division:
                results = execute_query(
                    "SELECT * FROM vw_PlayerLeaderboard WHERE SkillDivision = ? ORDER BY HighTotal DESC",
                    [division]
                )
            else:
                results = execute_query(
                    "SELECT * FROM vw_PlayerLeaderboard ORDER BY SkillDivision, HighTotal DESC"
                )
        elif event_limit == 'latest':
            # Get leaderboard based on most recent event only
            if division:
                results = execute_query("""
                    WITH LatestEvent AS (
                        SELECT TOP 1 EventID, EventDate FROM Event ORDER BY EventDate DESC, EventID DESC
                    ),
                    LatestScores AS (
                        SELECT 
                            p.PlayerID,
                            p.FirstName,
                            p.LastName,
                            p.SkillDivision,
                            psh.ScorecardTotal,
                            ROW_NUMBER() OVER (PARTITION BY p.SkillDivision ORDER BY psh.ScorecardTotal DESC) as DivisionRank
                        FROM vw_PlayerScoreHistory psh
                        JOIN Player p ON psh.PlayerID = p.PlayerID
                        WHERE psh.EventID = (SELECT EventID FROM LatestEvent)
                        AND p.SkillDivision = ?
                    )
                    SELECT 
                        SkillDivision,
                        FirstName,
                        LastName,
                        1 as RoundsPlayed,
                        ScorecardTotal as HighTotal,
                        ScorecardTotal as BestScorecardTotal,
                        DivisionRank
                    FROM LatestScores
                    ORDER BY HighTotal DESC
                """, [division])
            else:
                results = execute_query("""
                    WITH LatestEvent AS (
                        SELECT TOP 1 EventID, EventDate FROM Event ORDER BY EventDate DESC, EventID DESC
                    ),
                    LatestScores AS (
                        SELECT 
                            p.PlayerID,
                            p.FirstName,
                            p.LastName,
                            p.SkillDivision,
                            psh.ScorecardTotal,
                            ROW_NUMBER() OVER (PARTITION BY p.SkillDivision ORDER BY psh.ScorecardTotal DESC) as DivisionRank
                        FROM vw_PlayerScoreHistory psh
                        JOIN Player p ON psh.PlayerID = p.PlayerID
                        WHERE psh.EventID = (SELECT EventID FROM LatestEvent)
                    )
                    SELECT 
                        SkillDivision,
                        FirstName,
                        LastName,
                        1 as RoundsPlayed,
                        ScorecardTotal as HighTotal,
                        ScorecardTotal as BestScorecardTotal,
                        DivisionRank
                    FROM LatestScores
                    ORDER BY SkillDivision, HighTotal DESC
                """)
        else:
            # Get leaderboard from the last N events
            try:
                limit = int(event_limit)
                if division:
                    results = execute_query("""
                        WITH RecentEvents AS (
                            SELECT DISTINCT TOP (?) EventDate FROM Event ORDER BY EventDate DESC
                        ),
                        FilteredScores AS (
                            SELECT 
                                p.PlayerID,
                                p.FirstName,
                                p.LastName,
                                p.SkillDivision,
                                psh.ScorecardTotal
                            FROM vw_PlayerScoreHistory psh
                            JOIN Player p ON psh.PlayerID = p.PlayerID
                            WHERE psh.EventDate IN (SELECT EventDate FROM RecentEvents)
                            AND p.SkillDivision = ?
                        ),
                        Aggregated AS (
                            SELECT 
                                FirstName,
                                LastName,
                                SkillDivision,
                                COUNT(*) as RoundsPlayed,
                                SUM(ScorecardTotal) as HighTotal,
                                MAX(ScorecardTotal) as BestScorecardTotal
                            FROM FilteredScores
                            GROUP BY PlayerID, FirstName, LastName, SkillDivision
                        )
                        SELECT 
                            *,
                            ROW_NUMBER() OVER (PARTITION BY SkillDivision ORDER BY HighTotal DESC) as DivisionRank
                        FROM Aggregated
                        ORDER BY HighTotal DESC
                    """, [limit, division])
                else:
                    results = execute_query("""
                        WITH RecentEvents AS (
                            SELECT DISTINCT TOP (?) EventDate FROM Event ORDER BY EventDate DESC
                        ),
                        FilteredScores AS (
                            SELECT 
                                p.PlayerID,
                                p.FirstName,
                                p.LastName,
                                p.SkillDivision,
                                psh.ScorecardTotal
                            FROM vw_PlayerScoreHistory psh
                            JOIN Player p ON psh.PlayerID = p.PlayerID
                            WHERE psh.EventDate IN (SELECT EventDate FROM RecentEvents)
                        ),
                        Aggregated AS (
                            SELECT 
                                FirstName,
                                LastName,
                                SkillDivision,
                                COUNT(*) as RoundsPlayed,
                                SUM(ScorecardTotal) as HighTotal,
                                MAX(ScorecardTotal) as BestScorecardTotal
                            FROM FilteredScores
                            GROUP BY PlayerID, FirstName, LastName, SkillDivision
                        )
                        SELECT 
                            *,
                            ROW_NUMBER() OVER (PARTITION BY SkillDivision ORDER BY HighTotal DESC) as DivisionRank
                        FROM Aggregated
                        ORDER BY SkillDivision, HighTotal DESC
                    """, [limit])
            except ValueError:
                if division:
                    results = execute_query(
                        "SELECT * FROM vw_PlayerLeaderboard WHERE SkillDivision = ? ORDER BY HighTotal DESC",
                        [division]
                    )
                else:
                    results = execute_query(
                        "SELECT * FROM vw_PlayerLeaderboard ORDER BY SkillDivision, HighTotal DESC"
                    )
        
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/history', methods=['GET'])
def get_player_history(player_id):
    """Get player's score history from vw_PlayerScoreHistory view"""
    try:
        results = execute_query(
            "SELECT * FROM vw_PlayerScoreHistory WHERE PlayerID = ? ORDER BY ScorecardTotal DESC",
            [player_id]
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def handle_missing_view(view_name, error):
    """Helper to gracefully handle missing database views in development"""
    error_str = str(error)
    # Check if it's a "object not found" error (42S02)
    if '42S02' in error_str or 'Invalid object name' in error_str:
        print(f"[DEV] View '{view_name}' not found in database.")
        print(f"[DEV] To create this view, run the SQL from 'Scoreboard Views.md'")
        print(f"[DEV] Returning empty array for now...")
        return jsonify({
            "_dev_warning": f"View '{view_name}' does not exist in the database. Create it from Scoreboard Views.md",
            "data": []
        })
    return None

@app.route('/api/stats/hot-rounds', methods=['GET'])
def get_hot_rounds():
    """Get hot rounds (best player rounds per event) from vw_HotRoundPerEvent view
    
    Query params:
        eventLimit: 'latest' (default), 'all', or number (e.g. '5' for last 5 events)
    """
    try:
        event_limit = request.args.get('eventLimit', 'latest')
        
        if event_limit == 'all':
            results = execute_query(
                "SELECT * FROM vw_HotRoundPerEvent ORDER BY EventDate DESC, SkillDivision, OverallRank"
            )
        elif event_limit == 'latest':
            # Get only the most recent event's hot rounds
            results = execute_query("""
                SELECT * FROM vw_HotRoundPerEvent 
                WHERE EventDate = (SELECT MAX(EventDate) FROM vw_HotRoundPerEvent)
                ORDER BY SkillDivision, OverallRank
            """)
        else:
            # Get hot rounds from the last N events
            try:
                limit = int(event_limit)
                results = execute_query("""
                    WITH RecentEvents AS (
                        SELECT DISTINCT TOP (?) EventDate 
                        FROM vw_HotRoundPerEvent 
                        ORDER BY EventDate DESC
                    )
                    SELECT h.* FROM vw_HotRoundPerEvent h
                    INNER JOIN RecentEvents r ON h.EventDate = r.EventDate
                    ORDER BY h.EventDate DESC, h.SkillDivision, h.OverallRank
                """, [limit])
            except ValueError:
                results = execute_query(
                    "SELECT * FROM vw_HotRoundPerEvent ORDER BY EventDate DESC, SkillDivision, OverallRank"
                )
        
        return jsonify(results)
    except Exception as e:
        fallback = handle_missing_view('vw_HotRoundPerEvent', e)
        if fallback:
            return fallback
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/podium', methods=['GET'])
def get_podium_stats():
    """Get podium percentage stats from vw_PodiumPercentage view
    
    Query params:
        eventLimit: 'latest' (default), 'all', or number (e.g. '5' for last 5 events)
    """
    try:
        event_limit = request.args.get('eventLimit', 'latest')
        
        if event_limit == 'all':
            results = execute_query(
                "SELECT * FROM vw_PodiumPercentage ORDER BY PodiumPercentage DESC"
            )
        elif event_limit == 'latest':
            # Get podium stats only from the most recent event
            results = execute_query("""
                WITH LatestEvent AS (
                    SELECT MAX(EventDate) as MaxDate FROM Event
                ),
                LatestPodium AS (
                    SELECT 
                        CONCAT(p.FirstName, ' ', p.LastName) AS PlayerName,
                        p.SkillDivision,
                        CASE WHEN psh.ScoreRank <= 3 THEN 1 ELSE 0 END AS IsPodium,
                        1 AS RoundCount
                    FROM vw_PlayerScoreHistory psh
                    JOIN Player p ON psh.PlayerID = p.PlayerID
                    WHERE psh.EventDate = (SELECT MaxDate FROM LatestEvent)
                )
                SELECT 
                    PlayerName,
                    SkillDivision,
                    SUM(IsPodium) AS PodiumFinishes,
                    COUNT(*) AS TotalRounds,
                    CAST(SUM(IsPodium) * 100.0 / COUNT(*) AS DECIMAL(5,2)) AS PodiumPercentage
                FROM LatestPodium
                GROUP BY PlayerName, SkillDivision
                ORDER BY PodiumPercentage DESC
            """)
        else:
            # Get podium stats from the last N events
            try:
                limit = int(event_limit)
                results = execute_query("""
                    WITH RecentEvents AS (
                        SELECT DISTINCT TOP (?) EventDate FROM Event ORDER BY EventDate DESC
                    ),
                    FilteredPodium AS (
                        SELECT 
                            CONCAT(p.FirstName, ' ', p.LastName) AS PlayerName,
                            p.SkillDivision,
                            CASE WHEN psh.ScoreRank <= 3 THEN 1 ELSE 0 END AS IsPodium,
                            1 AS RoundCount
                        FROM vw_PlayerScoreHistory psh
                        JOIN Player p ON psh.PlayerID = p.PlayerID
                        WHERE psh.EventDate IN (SELECT EventDate FROM RecentEvents)
                    )
                    SELECT 
                        PlayerName,
                        SkillDivision,
                        SUM(IsPodium) AS PodiumFinishes,
                        COUNT(*) AS TotalRounds,
                        CAST(SUM(IsPodium) * 100.0 / COUNT(*) AS DECIMAL(5,2)) AS PodiumPercentage
                    FROM FilteredPodium
                    GROUP BY PlayerName, SkillDivision
                    ORDER BY PodiumPercentage DESC
                """, [limit])
            except ValueError:
                results = execute_query(
                    "SELECT * FROM vw_PodiumPercentage ORDER BY PodiumPercentage DESC"
                )
        
        return jsonify(results)
    except Exception as e:
        fallback = handle_missing_view('vw_PodiumPercentage', e)
        if fallback:
            return fallback
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/top-cards', methods=['GET'])
def get_top_cards():
    """Get top cards (best group scores per event) from vw_TopCardPerEvent view
    
    Query params:
        eventLimit: 'latest' (default), 'all', or number (e.g. '5' for last 5 events)
    """
    try:
        event_limit = request.args.get('eventLimit', 'latest')
        
        if event_limit == 'all':
            results = execute_query(
                "SELECT * FROM vw_TopCardPerEvent ORDER BY EventDate DESC, CardRank"
            )
        elif event_limit == 'latest':
            # Get only the most recent event's top cards
            results = execute_query("""
                SELECT * FROM vw_TopCardPerEvent 
                WHERE EventDate = (SELECT MAX(EventDate) FROM vw_TopCardPerEvent)
                ORDER BY CardRank
            """)
        else:
            # Get top cards from the last N events
            try:
                limit = int(event_limit)
                results = execute_query("""
                    WITH RecentEvents AS (
                        SELECT DISTINCT TOP (?) EventDate 
                        FROM vw_TopCardPerEvent 
                        ORDER BY EventDate DESC
                    )
                    SELECT t.* FROM vw_TopCardPerEvent t
                    INNER JOIN RecentEvents r ON t.EventDate = r.EventDate
                    ORDER BY t.EventDate DESC, t.CardRank
                """, [limit])
            except ValueError:
                results = execute_query(
                    "SELECT * FROM vw_TopCardPerEvent ORDER BY EventDate DESC, CardRank"
                )
        
        return jsonify(results)
    except Exception as e:
        fallback = handle_missing_view('vw_TopCardPerEvent', e)
        if fallback:
            return fallback
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/hole-difficulty', methods=['GET'])
def get_hole_difficulty():
    """Get hole difficulty rankings from vw_HoleDifficultyRanking view
    
    Query params:
        eventLimit: 'latest' (default), 'all', or number (e.g. '5' for last 5 events)
    """
    try:
        event_limit = request.args.get('eventLimit', 'latest')
        
        if event_limit == 'all':
            results = execute_query(
                "SELECT * FROM vw_HoleDifficultyRanking ORDER BY AvgScore ASC"
            )
        elif event_limit == 'latest':
            # Get only the most recent event's hole difficulty
            results = execute_query("""
                WITH LatestEvent AS (
                    SELECT MAX(e.EventDate) as MaxDate FROM Event e
                    WHERE e.EventID IN (SELECT DISTINCT EventID FROM vw_HoleDifficultyRanking)
                )
                SELECT h.* FROM vw_HoleDifficultyRanking h
                JOIN Event e ON h.EventID = e.EventID
                WHERE e.EventDate = (SELECT MaxDate FROM LatestEvent)
                ORDER BY h.AvgScore ASC
            """)
        else:
            # Get hole difficulty from the last N events
            try:
                limit = int(event_limit)
                results = execute_query("""
                    WITH RecentEvents AS (
                        SELECT DISTINCT TOP (?) e.EventID, e.EventDate 
                        FROM Event e
                        WHERE e.EventID IN (SELECT DISTINCT EventID FROM vw_HoleDifficultyRanking)
                        ORDER BY e.EventDate DESC
                    )
                    SELECT h.* FROM vw_HoleDifficultyRanking h
                    INNER JOIN RecentEvents r ON h.EventID = r.EventID
                    ORDER BY r.EventDate DESC, h.AvgScore ASC
                """, [limit])
            except ValueError:
                results = execute_query(
                    "SELECT * FROM vw_HoleDifficultyRanking ORDER BY AvgScore ASC"
                )
        
        return jsonify(results)
    except Exception as e:
        fallback = handle_missing_view('vw_HoleDifficultyRanking', e)
        if fallback:
            return fallback
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/basket-stats', methods=['GET'])
def get_basket_stats():
    """Get basket difficulty stats from vw_HardestBaskets view
    
    Query params:
        eventLimit: 'latest' (default), 'all', or number (e.g. '5' for last 5 events)
        
    Note: Basket stats aggregate across events where baskets were used.
    The eventLimit filters which events are included in the aggregation.
    """
    try:
        event_limit = request.args.get('eventLimit', 'latest')
        
        # For basket stats, we use the full view but note in the response
        # that we're showing overall stats. Event-specific filtering would
        # require a different query structure since baskets span multiple events.
        if event_limit == 'all':
            results = execute_query(
                "SELECT * FROM vw_HardestBaskets ORDER BY DifficultyRank"
            )
        else:
            # For 'latest' or N events, still return all basket stats
            # since basket difficulty is best understood across all uses
            results = execute_query(
                "SELECT * FROM vw_HardestBaskets ORDER BY DifficultyRank"
            )
        
        return jsonify(results)
    except Exception as e:
        fallback = handle_missing_view('vw_HardestBaskets', e)
        if fallback:
            return fallback
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats/card-details/<int:scorecard_id>', methods=['GET'])
def get_card_details(scorecard_id):
    """Get detailed card information including per-hole scores for all players
    
    Returns:
        - Card info (event, total, players)
        - Per-hole scores for each player
        - Best/worst hole performance
        - Individual player totals ranked
        - Compare player's scores if playerId query param provided
    """
    try:
        compare_player_id = request.args.get('playerId', type=int)
        
        # Get card info with event details
        card_info = execute_query("""
            SELECT 
                s.ScorecardID,
                s.EventID,
                e.Name as EventName,
                e.EventDate,
                e.HoleCount,
                (SELECT SUM(sc.Strokes) FROM Score sc WHERE sc.ScorecardID = s.ScorecardID) as CardTotal
            FROM Scorecard s
            JOIN Event e ON s.EventID = e.EventID
            WHERE s.ScorecardID = ?
        """, [scorecard_id])
        
        if not card_info:
            return jsonify({"error": "Card not found"}), 404
        
        # Get all members and their scores
        members = execute_query("""
            SELECT 
                sm.PlayerID,
                p.FirstName,
                p.LastName,
                p.SkillDivision,
                sm.MemberPosition,
                (SELECT SUM(sc.Strokes) FROM Score sc 
                 WHERE sc.ScorecardID = sm.ScorecardID AND sc.PlayerID = sm.PlayerID) as PlayerTotal
            FROM ScorecardMember sm
            JOIN Player p ON sm.PlayerID = p.PlayerID
            WHERE sm.ScorecardID = ?
            ORDER BY PlayerTotal DESC
        """, [scorecard_id])
        
        # Get per-hole scores
        scores = execute_query("""
            SELECT 
                sc.HoleNumber,
                sc.PlayerID,
                sc.Strokes,
                p.FirstName,
                p.LastName
            FROM Score sc
            JOIN Player p ON sc.PlayerID = p.PlayerID
            WHERE sc.ScorecardID = ?
            ORDER BY sc.HoleNumber, sc.PlayerID
        """, [scorecard_id])
        
        # Calculate best/worst hole (by combined score)
        hole_totals = {}
        for score in scores:
            hole = score['HoleNumber']
            if hole not in hole_totals:
                hole_totals[hole] = 0
            hole_totals[hole] += score['Strokes']
        
        best_hole = max(hole_totals.items(), key=lambda x: x[1]) if hole_totals else (0, 0)
        worst_hole = min(hole_totals.items(), key=lambda x: x[1]) if hole_totals else (0, 0)
        
        result = {
            'card': card_info[0],
            'members': members,
            'scores': scores,
            'bestHole': {'hole': best_hole[0], 'total': best_hole[1]},
            'worstHole': {'hole': worst_hole[0], 'total': worst_hole[1]},
        }
        
        # If comparing to a specific player, get their scores for the same event
        if compare_player_id:
            event_id = card_info[0]['EventID']
            compare_scores = execute_query("""
                SELECT 
                    sc.HoleNumber,
                    sc.Strokes,
                    s.ScorecardID
                FROM Score sc
                JOIN Scorecard s ON sc.ScorecardID = s.ScorecardID
                JOIN ScorecardMember sm ON s.ScorecardID = sm.ScorecardID AND sm.PlayerID = sc.PlayerID
                WHERE s.EventID = ? AND sc.PlayerID = ?
                ORDER BY sc.HoleNumber
            """, [event_id, compare_player_id])
            
            compare_total = sum(s['Strokes'] for s in compare_scores) if compare_scores else 0
            result['compareScores'] = {
                'playerId': compare_player_id,
                'scores': compare_scores,
                'total': compare_total
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# EVENTS
# ============================================

@app.route('/api/layouts', methods=['GET'])
def get_layouts():
    """Get all available layouts with hole count"""
    try:
        results = execute_query("""
            SELECT 
                LayoutID,
                COUNT(*) as HoleCount,
                SUM(DistanceFeet) as TotalDistance
            FROM EventLayout
            GROUP BY LayoutID
            ORDER BY LayoutID
        """)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all events"""
    try:
        results = execute_query("SELECT * FROM Event ORDER BY EventDate DESC")
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events', methods=['POST'])
def create_event():
    """Create a new event using CreateEvent stored proc"""
    try:
        data = request.json
        result = execute_proc("CreateEvent", [
            data['name'],
            data.get('layoutId', 1)  # Default to layoutId 1
        ])
        # execute_proc returns an array, but we need the first result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 201
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    """Get a single event by ID"""
    try:
        results = execute_query("SELECT * FROM Event WHERE EventID = ?", [event_id])
        if results:
            return jsonify(results[0])
        return jsonify({"error": "Event not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>/holes', methods=['GET'])
def get_event_holes(event_id):
    """Get hole stats for an event from vw_EventHoleStats view"""
    try:
        results = execute_query(
            "SELECT * FROM vw_EventHoleStats WHERE EventID = ? ORDER BY HoleNumber",
            [event_id]
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>/layout', methods=['GET'])
def get_event_layout(event_id):
    """Get event layout (holes with distances)"""
    try:
        results = execute_query(
            "SELECT * FROM EventLayout WHERE LayoutID = ? ORDER BY HoleNumber",
            [event_id]
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/summary', methods=['GET'])
def get_events_summary():
    """Get event summaries from vw_EventSummary view"""
    try:
        results = execute_query("SELECT * FROM vw_EventSummary ORDER BY EventDate DESC")
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>/generate-mock-data', methods=['POST'])
def generate_mock_data(event_id):
    """Generate mock scorecards and scores for an event using stored procedures
    
    Calls:
        - GenerateScorecards @EventID = event_id
        - GenerateScoresForEvent @EventID = event_id
    """
    try:
        # First verify the event exists
        event = execute_query("SELECT EventID FROM Event WHERE EventID = ?", [event_id])
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        # Generate scorecards for the event
        scorecards_result = execute_proc("GenerateScorecards", [event_id])
        
        # Generate scores for the event
        scores_result = execute_proc("GenerateScoresForEvent", [event_id])
        
        return jsonify({
            "success": True,
            "eventId": event_id,
            "scorecardsResult": scorecards_result[0] if isinstance(scorecards_result, list) and len(scorecards_result) > 0 else scorecards_result,
            "scoresResult": scores_result[0] if isinstance(scores_result, list) and len(scores_result) > 0 else scores_result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    """Delete an event using DeleteEvent stored proc
    
    Body params:
        confirmDelete: boolean - Must be true to actually delete
    """
    try:
        data = request.json
        confirm_delete = data.get('confirmDelete', False)
        
        result = execute_proc("DeleteEvent", [
            event_id,
            1 if confirm_delete else 0  # Convert boolean to bit
        ])
        
        # execute_proc returns an array, get the first result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 200
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# SCORECARDS
# ============================================

@app.route('/api/scorecards', methods=['GET'])
def get_scorecards():
    """Get all scorecards with event info"""
    try:
        results = execute_query("""
            SELECT s.*, e.Name as EventName, e.EventDate, e.HoleCount,
                   p.FirstName, p.LastName
            FROM Scorecard s
            JOIN Event e ON s.EventID = e.EventID
            LEFT JOIN Player p ON s.CreatedByPlayerID = p.PlayerID
            ORDER BY s.CreatedAt DESC
        """)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards/<int:scorecard_id>', methods=['GET'])
def get_scorecard(scorecard_id):
    """Get a single scorecard with members and scores"""
    try:
        # Get scorecard info
        scorecard = execute_query("""
            SELECT s.*, e.Name as EventName, e.EventDate, e.HoleCount
            FROM Scorecard s
            JOIN Event e ON s.EventID = e.EventID
            WHERE s.ScorecardID = ?
        """, [scorecard_id])
        
        if not scorecard:
            return jsonify({"error": "Scorecard not found"}), 404
        
        # Get members
        members = execute_query("""
            SELECT sm.*, p.FirstName, p.LastName, p.SkillDivision
            FROM ScorecardMember sm
            JOIN Player p ON sm.PlayerID = p.PlayerID
            WHERE sm.ScorecardID = ?
            ORDER BY sm.MemberPosition
        """, [scorecard_id])
        
        # Get scores
        scores = execute_query("""
            SELECT * FROM Score
            WHERE ScorecardID = ?
            ORDER BY HoleNumber, PlayerID
        """, [scorecard_id])
        
        result = scorecard[0]
        result['members'] = members
        result['scores'] = scores
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards', methods=['POST'])
def create_scorecard():
    """Create a new scorecard using CreateScorecard stored proc"""
    try:
        data = request.json
        result = execute_proc("CreateScorecard", [
            data['eventId'],
            data['createdByPlayerId']
        ])
        # execute_proc returns an array, but we need the first (and only) result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 201
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards/<int:scorecard_id>/members', methods=['POST'])
def add_scorecard_members(scorecard_id):
    """Add members to a scorecard using AddScorecardMembers stored proc"""
    try:
        data = request.json
        # Get eventId from scorecard
        scorecard = execute_query(
            "SELECT EventID FROM Scorecard WHERE ScorecardID = ?",
            [scorecard_id]
        )
        if not scorecard:
            return jsonify({"error": "Scorecard not found"}), 404
        
        event_id = scorecard[0]['EventID']
        
        result = execute_proc("AddScorecardMembers", [
            scorecard_id,
            event_id,
            data.get('player1Id'),
            data.get('player2Id'),
            data.get('player3Id'),
            data.get('player4Id')
        ])
        # execute_proc returns an array, but we need the first result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 201
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards/<int:scorecard_id>/members/<int:player_id>', methods=['DELETE'])
def remove_scorecard_member(scorecard_id, player_id):
    """Remove a player from a scorecard using RemovePlayerFromScorecard stored proc
    
    Authorization: Requester must be either the scorecard creator OR the player being removed
    """
    try:
        data = request.json
        requesting_player_id = data.get('requestingPlayerId')
        
        # Verify the scorecard exists and get creator info
        scorecard = execute_query(
            "SELECT CreatedByPlayerID FROM Scorecard WHERE ScorecardID = ?",
            [scorecard_id]
        )
        
        if not scorecard:
            return jsonify({"error": "Scorecard not found"}), 404
        
        creator_id = scorecard[0]['CreatedByPlayerID']
        
        # Check authorization: requester must be creator OR the player being removed
        if requesting_player_id != creator_id and requesting_player_id != player_id:
            return jsonify({"error": "You can only remove yourself or be the scorecard creator to remove others"}), 403
        
        # Call the stored procedure to remove the player
        # Note: Procedure expects @PlayerID first, then @ScorecardID
        result = execute_proc("RemovePlayerFromScorecard", [
            player_id,
            scorecard_id
        ])
        
        # execute_proc returns an array, but we need the first result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 200
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards/<int:scorecard_id>/scores', methods=['POST'])
def insert_hole_scores(scorecard_id):
    """Insert scores for a hole using InsertHoleScores stored proc"""
    try:
        data = request.json
        result = execute_proc("InsertHoleScores", [
            scorecard_id,
            data['holeNumber'],
            data['player1Id'], data['player1Score'],
            data['player2Id'], data['player2Score'],
            data.get('player3Id'), data.get('player3Score'),  # Optional
            data.get('player4Id'), data.get('player4Score')   # Optional
        ])
        # execute_proc returns an array, but we need the first result object
        if isinstance(result, list) and len(result) > 0:
            return jsonify(result[0]), 201
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards/<int:scorecard_id>/scores/<int:hole_number>', methods=['GET'])
def get_hole_scores(scorecard_id, hole_number):
    """Get scores for a specific hole"""
    try:
        results = execute_query("""
            SELECT s.*, p.FirstName, p.LastName
            FROM Score s
            JOIN Player p ON s.PlayerID = p.PlayerID
            WHERE s.ScorecardID = ? AND s.HoleNumber = ?
            ORDER BY s.PlayerID
        """, [scorecard_id, hole_number])
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scores/<int:score_id>', methods=['PUT'])
def update_score(score_id):
    """Update an individual score (only scorecard creator can update)"""
    try:
        data = request.json
        player_id = data.get('playerId')
        
        # Verify the requesting player is the scorecard creator
        result = execute_query("""
            SELECT sc.CreatedByPlayerID 
            FROM Score s
            JOIN Scorecard sc ON s.ScorecardID = sc.ScorecardID
            WHERE s.ScoreID = ?
        """, [score_id])
        
        if not result:
            return jsonify({"error": "Score not found"}), 404
        if result[0]['CreatedByPlayerID'] != player_id:
            return jsonify({"error": "Only the scorecard creator can update scores"}), 403
        
        execute_insert(
            "UPDATE Score SET Strokes = ? WHERE ScoreID = ?",
            [data['strokes'], score_id]
        )
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scorecards/<int:scorecard_id>', methods=['DELETE'])
def delete_scorecard(scorecard_id):
    """Delete a scorecard (only scorecard creator can delete)"""
    try:
        data = request.json
        player_id = data.get('playerId')
        
        # Verify the requesting player is the scorecard creator
        result = execute_query(
            "SELECT CreatedByPlayerID FROM Scorecard WHERE ScorecardID = ?",
            [scorecard_id]
        )
        
        if not result:
            return jsonify({"error": "Scorecard not found"}), 404
        if result[0]['CreatedByPlayerID'] != player_id:
            return jsonify({"error": "Only the scorecard creator can delete this scorecard"}), 403
        
        # Delete scores first (foreign key constraint)
        execute_insert("DELETE FROM Score WHERE ScorecardID = ?", [scorecard_id])
        
        # Delete scorecard members
        execute_insert("DELETE FROM ScorecardMember WHERE ScorecardID = ?", [scorecard_id])
        
        # Delete the scorecard
        execute_insert("DELETE FROM Scorecard WHERE ScorecardID = ?", [scorecard_id])
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# PLAYER SCORECARDS
# ============================================

@app.route('/api/players/<int:player_id>/scorecards', methods=['GET'])
def get_player_scorecards(player_id):
    """Get all scorecards for a player"""
    try:
        results = execute_query("""
            SELECT DISTINCT s.*, e.Name as EventName, e.EventDate, e.HoleCount,
                   (SELECT SUM(sc.Strokes) FROM Score sc 
                    WHERE sc.ScorecardID = s.ScorecardID AND sc.PlayerID = ?) as TotalScore
            FROM Scorecard s
            JOIN Event e ON s.EventID = e.EventID
            JOIN ScorecardMember sm ON s.ScorecardID = sm.ScorecardID
            WHERE sm.PlayerID = ?
            ORDER BY s.CreatedAt DESC
        """, [player_id, player_id])
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        execute_query("SELECT 1")
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

