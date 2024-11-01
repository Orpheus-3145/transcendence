-- Naming convensions must be done!
CREATE TABLE IF NOT EXISTS Users (
		user_id SERIAL PRIMARY KEY,
		nickname VARCHAR(50) UNIQUE NOT NULL,
		-- status ENUM ('online', 'offline', 'ingame') DEFAULT 'offline',
		greeting VARCHAR(50) DEFAULT 'Hello, I have just landed!',
		authkey VARCHAR(50) DEFAULT NULL,
		profile_photo VARCHAR(50) DEFAULT 'default_profile_photo.png',
		time_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		intra_name VARCHAR(50),
		intra_surname VARCHAR(50),
		intra_email VARCHAR(50)
		friends TEXT[] DEFAULT '{}';
		blocked TEXT[] DEFAULT '{}';
	);

CREATE TYPE FRIEND_REQUEST_STATUS AS ENUM ('active', 'inactive', 'pending');
CREATE TABLE IF NOT EXISTS Friends (
		sender_id INTEGER NOT NULL,
		receiver_id INTEGER NOT NULL,
		request_status FRIEND_REQUEST_STATUS NOT NULL,
		PRIMARY KEY (sender_id, receiver_id),
		FOREIGN KEY (sender_id) REFERENCES Users (user_id),
		FOREIGN KEY (receiver_id) REFERENCES Users (user_id)
	);

CREATE TABLE IF NOT EXISTS Games (
		game_id SERIAL PRIMARY KEY,
		sender_id INTEGER NOT NULL,
		receiver_id INTEGER NOT NULL,
		FOREIGN KEY (sender_id) REFERENCES Users (user_id),
		FOREIGN KEY (receiver_id) REFERENCES Users (user_id),
		custom BOOLEAN NOT NULL DEFAULT false,
		score_sender INTEGER NOT NULL DEFAULT 0,
		score_receiver INTEGER NOT NULL DEFAULT 0,
		time_start TIMESTAMP,
		time_end TIMESTAMP
	);

-- Think about dynamic tables f.e. table for every channel like: Channel_id_Members
CREATE TYPE CHANNEL_TYPE AS ENUM ('public', 'protected', 'private', 'chat');
CREATE TABLE IF NOT EXISTS Channels (
		channel_id SERIAL PRIMARY KEY,
		ch_type CHANNEL_TYPE,
		title VARCHAR(50) DEFAULT 'Welcome to my Channel!',
		channel_photo VARCHAR(50) DEFAULT 'default_channel_photo.png',
		created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

CREATE TYPE CHANNEL_ROLE AS ENUM ('owner', 'admin', 'member');
CREATE TABLE IF NOT EXISTS Channel_Members (
		user_id INTEGER NOT NULL,
		channel_id INTEGER NOT NULL,
		PRIMARY KEY (channel_id, user_id),
		FOREIGN KEY (user_id) REFERENCES Users (user_id),
		FOREIGN KEY (channel_id) REFERENCES Channels (channel_id),
		member_role CHANNEL_ROLE DEFAULT 'member'
	);

CREATE TABLE IF NOT EXISTS Messages (
		msg_id SERIAL PRIMARY KEY,
		sender_id INTEGER NOT NULL,
		receiver_id INTEGER NOT NULL,
		FOREIGN KEY (sender_id) REFERENCES Users (user_id),
		FOREIGN KEY (receiver_id) REFERENCES Channels (channel_id),
		content TEXT NOT NULL,
		send_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
