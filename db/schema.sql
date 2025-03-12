-- schema.sql

-- Table: submissions
-- One row per user/test. Tracks user info, completion status, etc.
CREATE TABLE IF NOT EXISTS submissions (
    submission_id TEXT PRIMARY KEY,       -- unique ID for this submission
    user_name TEXT,                       -- optional: store user's name
    user_email TEXT,                      -- optional: store user's email
    submission_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_complete INTEGER DEFAULT 0         -- 0 = in progress, 1 = finished
);

-- Table: submission_responses
-- Stores each individual answer. One row per question for each submission.
CREATE TABLE IF NOT EXISTS submission_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- internal row ID
    submission_id TEXT,                   -- links to submissions.submission_id
    question_id TEXT,                     -- e.g. "Q1", "Q2", ...
    numeric_response INTEGER,             -- if scale question (1..7)
    text_response TEXT,                   -- if open-ended question
    response_time DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint (optional but recommended for data integrity)
    FOREIGN KEY (submission_id) REFERENCES submissions (submission_id)
);

-- You can add additional indexes if needed for performance, for example:
-- CREATE INDEX idx_submission_responses_submission_id ON submission_responses (submission_id);