import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Providers/UserContext/User";
import axios from "axios";

const LogoutPage: React.FC = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const BACKEND_URL: string = import.meta.env.ORIGIN_URL_BACK || 'http://localhost:4000';
  
  useEffect(() => {
    async function logout() {
      try {
        const response = await axios.get(BACKEND_URL + '/auth/logout', { withCredentials: true });
        setUser({ id: 0 });
        navigate(response.data.redirectTo);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    logout();
  }, []);

  return (<div></div>)
};

export default LogoutPage;