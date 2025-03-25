
// Get running queries
// SELECT query_id, query, elapsed, read_rows, memory_usage FROM system.processes;

// Get query history
// SELECT event_time, query, query_duration_ms FROM system.query_log 
// WHERE event_time > now() - INTERVAL 1 HOUR 
// ORDER BY event_time DESC;

// Get user sessions
// SELECT user, address, elapsed, query FROM system.processes;

// Check disk space usage