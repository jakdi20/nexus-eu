-- Enable REPLICA IDENTITY FULL for messages table to ensure Realtime UPDATE events work correctly
ALTER TABLE messages REPLICA IDENTITY FULL;