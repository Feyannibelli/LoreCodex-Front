import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.tsx';
import Modal from '../../components/Modal.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import authService, { UserData } from '../../services/authService.ts';
import '../../css/AdminUsers.css';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    useEffect(() => {
        // Redirect if not an administrator
        if (!isAdmin) {
            navigate('/');
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await authService.getAllUsers();
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error('Expected array but got:', data);
                    setError('Error: User data does not have the expected format');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Error loading users');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAdmin, navigate]);

    const openDeleteModal = (userId: number) => {
        setUserToDelete(userId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    const confirmDelete = async () => {
        if (userToDelete === null) return;

        try {
            await authService.deleteUser(userToDelete);
            // Update user list after deletion
            setUsers(users.filter(user => user.id !== userToDelete));
            closeModal();
        } catch (err) {
            setError('Error deleting user');
            closeModal();
        }
    };

    if (loading) return <div>Loading users...</div>;

    if (!Array.isArray(users)) {
        return <div className="error-message">Error: Users could not be loaded correctly</div>;
    }

    return (
        <div className="admin-users-container">
            <h2>User Administration</h2>

            {error && <div className="error-message">{error}</div>}

            <table className="users-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                            <Button
                                onClick={() => openDeleteModal(user.id)}
                                className="delete-button"
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                title="Confirm deletion"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />
        </div>
    );
};

export default AdminUsers;