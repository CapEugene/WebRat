import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if(!token){
      navigate('/');
    }
    else{
      getUserProfile().then((response) => setProfile(response.data));
    }

  }, [navigate]); 

  return (
    <div>
      <h1 style={styles.title}>Profile Page</h1>
      <h2 style={styles.title}>Welcome back, {profile ? profile.username : "User"}!</h2>
    </div>
  );
};

const styles = { title: { display: 'flex', justifyContent : 'center', }
};

export default ProfilePage;
