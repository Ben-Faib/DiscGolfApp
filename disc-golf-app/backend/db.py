"""
Database connection module for Azure SQL Server
"""
import pyodbc
import os

# Database configuration
DB_CONFIG = {
    'driver': 'ODBC Driver 18 for SQL Server',
    'server': 'infsci2710-project.database.windows.net',
    'database': 'PuttingLeague',
    'username': 'sqladmin',
    'password': 'D1sk&Chain'
}

def get_connection():
    """Create and return a database connection"""
    conn_str = (
        f"Driver={{{DB_CONFIG['driver']}}};"
        f"Server=tcp:{DB_CONFIG['server']},1433;"
        f"Database={DB_CONFIG['database']};"
        f"Uid={DB_CONFIG['username']};"
        f"Pwd={DB_CONFIG['password']};"
        f"Encrypt=yes;"
        f"TrustServerCertificate=no;"
        f"Connection Timeout=30;"
    )
    return pyodbc.connect(conn_str)

def execute_query(query, params=None):
    """Execute a SELECT query and return results as list of dicts"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
    finally:
        cursor.close()
        conn.close()

def execute_proc(proc_name, params=None):
    """Execute a stored procedure and return results"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if params:
            placeholders = ', '.join(['?' for _ in params])
            cursor.execute(f"EXEC {proc_name} {placeholders}", params)
        else:
            cursor.execute(f"EXEC {proc_name}")
        
        # Try to get results if any
        try:
            columns = [column[0] for column in cursor.description]
            results = []
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            conn.commit()
            return results
        except:
            conn.commit()
            return {"success": True}
    finally:
        cursor.close()
        conn.close()

def execute_insert(query, params):
    """Execute an INSERT/UPDATE query"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        conn.commit()
        return {"success": True}
    finally:
        cursor.close()
        conn.close()

