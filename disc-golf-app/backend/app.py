"""
Flask API for Disc Golf Putting League
Connects to Azure SQL Server backend
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import execute_query, execute_proc, execute_insert
from datetime import date

app = Flask(__name__)
CORS(app)

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
    """Get player leaderboard from vw_PlayerLeaderboard view"""
    try:
        division = request.args.get('division')
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
    """Get hot rounds (best player rounds per event) from vw_HotRoundPerEvent view"""
    try:
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
    """Get podium percentage stats from vw_PodiumPercentage view"""
    try:
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
    """Get top cards (best group scores per event) from vw_TopCardPerEvent view"""
    try:
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
    """Get hole difficulty rankings from vw_HoleDifficultyRanking view"""
    try:
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
    """Get basket difficulty stats from vw_HardestBaskets view"""
    try:
        results = execute_query(
            "SELECT * FROM vw_HardestBaskets ORDER BY DifficultyRank"
        )
        return jsonify(results)
    except Exception as e:
        fallback = handle_missing_view('vw_HardestBaskets', e)
        if fallback:
            return fallback
        return jsonify({"error": str(e)}), 500

# ============================================
# EVENTS
# ============================================

@app.route('/api/events', methods=['GET'])
def get_events():
    """Get all events"""
    try:
        results = execute_query("SELECT * FROM Event ORDER BY EventDate DESC")
        return jsonify(results)
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
            data['player3Id'], data['player3Score'],
            data['player4Id'], data['player4Score']
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

