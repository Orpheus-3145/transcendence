import React from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../../AuthContext';
import './Profile.css'; // Import CSS for the profile button

const Profile: React.FC = () => {
  // const { isLoggedIn, user } = useAuth();
  const isLoggedIn = null;
  const user = {name: null, photo: null}
  return (
    <>
      {isLoggedIn && user ? (
        <Link to={`/profile/${user.name}`}>
          <img src={user.photo || '/default-profile.png'} alt="Profile" className="profile-icon" />
        </Link>
      ) : (
        <Link to="/login">
          <button className="profile-button">Login</button>
        </Link>
      )}
    </>
  );
};

export default Profile;
