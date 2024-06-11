-- Users Table
--     id: User ID
--     nickname: Nickname
--     password: Password
--     authkey: Auth Key
--     name: First Name
--     surname: Last Name
--     profile_photo: Profile Photo
--     time_creation: Creation Time
-- User Friendship Table
--     sender_id: Sender ID
--     receiver_id: Receiver ID
--     time_request: Request Time
--     time_confirm: Confirm Time
--     User Chat Table
--     user_id: User ID
--     chat_id: Chat ID
--     time_creation: Creation Time
-- Chat Table
--     id: Chat ID
--     name: Chat Name
--     security: Security Level
--     password: Chat Password
--     time_creation: Creation Time
-- Chat User Table
--     chat_id: Chat ID
--     user_id: User ID
--     warrant: User Role
--     time_join: Join Time
-- Message Table
--     id: Message ID
--     user_id: User ID
--     chat_id: Chat ID
--     text: Message Text
--     time_send: Send Time
-- Game Table
--     id: Game ID
--     owner_id: Owner ID
--     rival_id: Rival ID
--     score_owner: Owner Score
--     score_rival: Rival Score
--     original_pong: Bool
--     public_game: Bool
--     time_request: Request Time
--     time_start: Start Time
--     time_end: End Time


CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(50) NOT NULL,
  authkey VARCHAR(50) DEFAULT NULL,
  name VARCHAR(50) DEFAULT 'TEMP',
  surname VARCHAR(50) DEFAULT 'TEMP',
  profile_photo VARCHAR(50) DEFAULT 'default_profile_photo.png',
  time_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_friendship (
  sender_id INTEGER REFERENCES users(id),
  receiver_id INTEGER REFERENCES users(id),
  time_request TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  time_confirm TIMESTAMP DEFAULT NULL,
  PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS user_chat (
  user_id INTEGER REFERENCES users(id),
  chat_id INTEGER REFERENCES chat(id),
  time_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (user_id, chat_id)
);

CREATE TABLE IF NOT EXISTS chat (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL DEFAULT 'Transcended?',
  security VARCHAR(50) CHECK (security IN ('public', 'private', 'password')),
  password VARCHAR(50) DEFAULT NULL,
  time_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_user (
  chat_id INTEGER REFERENCES chat(id),
  user_id INTEGER REFERENCES users(id),
  warrant VARCHAR(50) CHECK (warrant IN ('User', 'Admin', 'Owner')),
  time_join TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS message (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  chat_id INTEGER REFERENCES chat(id),
  text TEXT NOT NULL,
  time_send TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id),
  rival_id INTEGER REFERENCES users(id),
  score_owner INTEGER NOT NULL,
  score_rival INTEGER NOT NULL,
  original_pong BOOLEAN NOT NULL DEFAULT true,
  public_game BOOLEAN NOT NULL DEFAULT false,
  time_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_start TIMESTAMP,
  time_end TIMESTAMP
);