## Project Overview

**ft_transcendence** is a web development project centered on creating a single-page application (SPA) that allows users to play the classic game Pong against each other. The project emphasizes modern web development practices, utilizing NestJS for the backend, a TypeScript framework for the frontend, and PostgreSQL for the database. The application will feature a user-friendly interface, real-time multiplayer capabilities, a chat system, and robust security measures.

## Objectives
- Develop a single-page application for playing Pong online.
- Implement real-time multiplayer functionality.
- Create a comprehensive user account system with OAuth, two-factor authentication, and user profiles.
- Integrate a chat system with features like public and private channels, direct messaging, and user blocking.
- Ensure the application adheres to high security standards.

## Technical Requirements
1. **Backend**: The backend must be developed using NestJS.
2. **Frontend**: The frontend must be created using a TypeScript framework of choice.
3. **Database**: PostgreSQL is required as the database management system.
4. **Compatibility**: The application must be compatible with the latest stable versions of Google Chrome and one other web browser.
5. **Deployment**: The entire application must be deployable via a single `docker-compose up --build` command, utilizing Docker in rootless mode for security.

## Core Features
### User Account Management
- OAuth login via 42 intranet.
- Unique usernames and avatars.
- Two-factor authentication.
- Friend system with online status indicators.
- Display of user statistics and match history.

### Chat System
- Creation of public, private, and password-protected channels.
- Direct messaging between users.
- Blocking functionality.
- Channel administration capabilities including setting passwords, kicking, banning, and muting users.
- Integration with the game invitation system.

### Pong Game
- Real-time Pong gameplay between users.
- Matchmaking system for automatic player pairing.
- Options for game customization (e.g., power-ups, different maps) while retaining a classic mode.
- Responsiveness to network issues to ensure a smooth user experience.

## Security Considerations
- Passwords must be hashed before storing.
- Protection against SQL injection attacks.
- Server-side validation of all forms and user inputs.
- Secure storage of credentials, API keys, and environment variables in a `.env` file, excluded from version control.

