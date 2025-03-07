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
	-- status ENUM ('online', 'offline', 'ingame') DEFAULT 'offline',		NB this should be used!
	greeting TEXT DEFAULT 'Hello, I have just landed!',
	authkey TEXT DEFAULT NULL,
	profile_photo TEXT DEFAULT 'default_profile_photo.png',
	time_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	intra_name TEXT NOT NULL,
	intra_surname TEXT NOT NULL,
	intra_email TEXT
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

CREATE TYPE CHANNEL_TYPE AS ENUM ('public', 'protected', 'private', 'chat');
CREATE TABLE IF NOT EXISTS Channels (
	channel_id SERIAL PRIMARY KEY,
	ch_type CHANNEL_TYPE DEFAULT 'public',
	channel_photo TEXT DEFAULT 'default_channel_photo.png',
	is_active BOOLEAN DEFAULT TRUE,
	is_direct BOOLEAN DEFAULT FALSE,
	ch_owner INTEGER NOT NULL,
	password TEXT DEFAULT NULL,
	title TEXT DEFAULT 'Welcome to my Channel!',
	channel_photo TEXT DEFAULT 'default_channel_photo.png',
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	banned ARRAY[] DEFAULT [],
	muted ARRAY[] DEFAULT [],

	FOREIGN KEY (ch_owner) REFERENCES Channel_Members(channel_member_id)
);

CREATE TYPE CHANNEL_ROLE AS ENUM ('owner', 'admin', 'member');
CREATE TABLE IF NOT EXISTS Channel_Members (
	channel_member_id SERIAL PRIMARY KEY,
	channel_id INTEGER NOT NULL CHECK (channel_id > 0),
	user_id INTEGER NOT NULL CHECK (user_id > 0),
	member_role CHANNEL_ROLE DEFAULT 'member',

	FOREIGN KEY (channel_id) REFERENCES Channels (channel_id),
	FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE IF NOT EXISTS Messages (
	msg_id SERIAL PRIMARY KEY,
	channel_id INTEGER NOT NULL,
	sender_id INTEGER NOT NULL,
	content TEXT NOT NULL,
	send_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

	FOREIGN KEY (channel_id) REFERENCES Channels (channel_id),
	FOREIGN KEY (sender_id) REFERENCES Channel_Members(channel_member_id)
);

CREATE TYPE NOTIFICATION_STATUS AS ENUM ('Accepted', 'Declined', 'Pending');
CREATE TABLE IF NOT EXISTS FriendRequests (
	id SERIAL PRIMARY KEY,
	sender_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	status NOTIFICATION_STATUS NOT NULL DEFAULT 'Pending',

	FOREIGN KEY (sender_id) REFERENCES Users(user_id),
	FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
)

CREATE TABLE IF NOT EXISTS GameInvitations (
	id SERIAL PRIMARY KEY,
	sender_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	status NOTIFICATION_STATUS NOT NULL DEFAULT 'Pending',
	powerup INTEGER DEFAULT NULL,

	FOREIGN KEY (sender_id) REFERENCES Users(user_id),
	FOREIGN KEY (receiver_id) REFERENCES Users(user_id)
)

CREATE TABLE IF NOT EXISTS MessageNotifications (
	id SERIAL PRIMARY KEY,
	message_id INTEGER NOT NULL,
	receiver_id INTEGER NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	status NOTIFICATION_STATUS NOT NULL DEFAULT 'Pending',

	FOREIGN KEY (message_id) REFERENCES Messages(msg_id),
	FOREIGN KEY (receiver_id) REFERENCES Channel_Members(channel_member_id)
)