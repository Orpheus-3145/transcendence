\c ${POSTGRES_DB};

-- user can connect db
GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
-- user can do queries on db
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${POSTGRES_USER};
-- and use the id fields
GRANT SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO ${POSTGRES_USER};
-- and for every new entity created
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${POSTGRES_USER};

CREATE TABLE IF NOT EXISTS Users (
	user_id SERIAL PRIMARY KEY,
	nickname TEXT UNIQUE NOT NULL,
	-- status ENUM ('online', 'offline', 'ingame') DEFAULT 'offline',
	greeting TEXT DEFAULT 'Hello, I have just landed!',
	authkey TEXT DEFAULT NULL,
	profile_photo TEXT DEFAULT 'default_profile_photo.png',
	time_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	intra_name TEXT NOT NULL,
	intra_surname TEXT NOT NULL,
	intra_email TEXT
);

CREATE TYPE FRIEND_REQUEST_STATUS AS ENUM ('active', 'inactive', 'pending');
CREATE TABLE IF NOT EXISTS Friends (
	sender_id INTEGER NOT NULL CHECK (sender_id > 0),
	receiver_id INTEGER NOT NULL CHECK (receiver_id > 0),
	request_status FRIEND_REQUEST_STATUS NOT NULL,

	PRIMARY KEY (sender_id, receiver_id),
	FOREIGN KEY (sender_id) REFERENCES Users (user_id),
	FOREIGN KEY (receiver_id) REFERENCES Users (user_id)
);

CREATE TABLE IF NOT EXISTS Games (
	game_id SERIAL PRIMARY KEY,
	player1_id INTEGER NOT NULL CHECK (player1_id > 0),
	player2_id INTEGER NOT NULL CHECK (player2_id > 0),
	player1_score INTEGER NOT NULL DEFAULT 0 CHECK (player1_score >= 0),
	player2_score INTEGER NOT NULL DEFAULT 0 CHECK (player2_score >= 0),
	date_match DATE DEFAULT CURRENT_DATE,
	powerups_used INTEGER DEFAULT 0,

	FOREIGN KEY (player1_id) REFERENCES Users (user_id),
	FOREIGN KEY (player2_id) REFERENCES Users (user_id)
);

-- Think about dynamic tables f.e. table for every channel like: Channel_id_Members
CREATE TYPE CHANNEL_TYPE AS ENUM ('public', 'protected', 'private', 'chat');
CREATE TABLE IF NOT EXISTS Channels (
	channel_id SERIAL PRIMARY KEY,
	ch_type CHANNEL_TYPE DEFAULT 'public',
	title TEXT DEFAULT 'Welcome to my Channel!',
	channel_photo TEXT DEFAULT 'default_channel_photo.png',
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE CHANNEL_ROLE AS ENUM ('owner', 'admin', 'member');
CREATE TABLE IF NOT EXISTS Channel_Members (
	channel_id INTEGER NOT NULL CHECK (channel_id > 0),
	user_id INTEGER NOT NULL CHECK (user_id > 0),
	member_role CHANNEL_ROLE DEFAULT 'member',

	PRIMARY KEY (channel_id, user_id),
	FOREIGN KEY (user_id) REFERENCES Users (user_id),
	FOREIGN KEY (channel_id) REFERENCES Channels (channel_id)
);

CREATE TABLE IF NOT EXISTS Messages (
	msg_id SERIAL PRIMARY KEY,
	sender_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	content TEXT NOT NULL,
	send_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	FOREIGN KEY (sender_id) REFERENCES Users (user_id),
	FOREIGN KEY (receiver_id) REFERENCES Users (user_id)
);

CREATE TYPE NOTIFICATION_TYPE AS ENUM ('Message', 'Friend Request', 'Game Invite', 'Group Chat');
CREATE TYPE NOTIFICATION_STATUS AS ENUM ('Accepted', 'Declined', 'Pending', 'None');
CREATE TABLE IF NOT EXISTS Notifications (
	id SERIAL PRIMARY KEY,
	sender_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	type NOTIFICATION_TYPE NOT NULL,
	status NOTIFICATION_STATUS NOT NULL DEFAULT 'Pending',
	content TEXT DEFAULT '',
	powerup INTEGER DEFAULT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

	FOREIGN KEY (sender_id) REFERENCES Users(user_id),
	FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
)