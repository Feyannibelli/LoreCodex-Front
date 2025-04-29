import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext.tsx'

const Profile: React.FC = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile-container">
            <h2>User Profile</h2>

            <div className="profile-info">
                <div className="info-row">
                    <strong>Username:</strong>
                    <span>{user.username}</span>
                </div>

                <div className="info-row">
                    <strong>Email:</strong>
                    <span>{user.email}</span>
                </div>
            </div>

            <Button onClick={handleLogout} className="logout-button">
                Log out
            </Button>
        </div>
    )
}

export default Profile