import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="home">
      <header className="home-header">
        <h1>ft_transcendence</h1>
        <p>A modern web application to play Pong online with real-time multiplayer capabilities.</p>
      </header>
      <section className="project-overview">
        <h2>Project Overview</h2>
        <p><strong>ft_transcendence</strong> is a web development project centered on creating a single-page application (SPA) that allows users to play the classic game Pong against each other. The project emphasizes modern web development practices, utilizing NestJS for the backend, a TypeScript framework for the frontend, and PostgreSQL for the database. The application will feature a user-friendly interface, real-time multiplayer capabilities, a chat system, and robust security measures.</p>
      </section>
      <section className="objectives">
        <h2>Objectives</h2>
        <ul>
          <li>Develop a single-page application for playing Pong online.</li>
          <li>Implement real-time multiplayer functionality.</li>
          <li>Create a comprehensive user account system with OAuth, two-factor authentication, and user profiles.</li>
          <li>Integrate a chat system with features like public and private channels, direct messaging, and user blocking.</li>
          <li>Ensure the application adheres to high security standards.</li>
        </ul>
      </section>
      <section className="technical-requirements">
        <h2>Technical Requirements</h2>
        <ol>
          <li><strong>Backend</strong>: The backend must be developed using NestJS.</li>
          <li><strong>Frontend</strong>: The frontend must be created using a TypeScript framework of choice.</li>
          <li><strong>Database</strong>: PostgreSQL is required as the database management system.</li>
          <li><strong>Compatibility</strong>: The application must be compatible with the latest stable versions of Google Chrome and one other web browser.</li>
          <li><strong>Deployment</strong>: The entire application must be deployable via a single <code>docker-compose up --build</code> command, utilizing Docker in rootless mode for security.</li>
        </ol>
      </section>
      <section className="core-features">
        <h2>Core Features</h2>
        <h3>User Account Management</h3>
        <ul>
          <li>OAuth login via 42 intranet.</li>
          <li>Unique usernames and avatars.</li>
          <li>Two-factor authentication.</li>
          <li>Friend system with online status indicators.</li>
          <li>Display of user statistics and match history.</li>
        </ul>
        <h3>Chat System</h3>
        <ul>
          <li>Creation of public, private, and password-protected channels.</li>
          <li>Direct messaging between users.</li>
          <li>Blocking functionality.</li>
          <li>Channel administration capabilities including setting passwords, kicking, banning, and muting users.</li>
          <li>Integration with the game invitation system.</li>
        </ul>
        <h3>Pong Game</h3>
        <ul>
          <li>Real-time Pong gameplay between users.</li>
          <li>Matchmaking system for automatic player pairing.</li>
          <li>Options for game customization (e.g., power-ups, different maps) while retaining a classic mode.</li>
          <li>Responsiveness to network issues to ensure a smooth user experience.</li>
        </ul>
      </section>
      <section className="security-considerations">
        <h2>Security Considerations</h2>
        <ul>
          <li>Passwords must be hashed before storing.</li>
          <li>Protection against SQL injection attacks.</li>
          <li>Server-side validation of all forms and user inputs.</li>
          <li>Secure storage of credentials, API keys, and environment variables in a <code>.env</code> file, excluded from version control.</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
