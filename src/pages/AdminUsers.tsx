import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext.tsx';
import authService, { UserData } from '../services/authService';
import '../css/AdminUsers.css';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirigir si no es administrador
        if (!isAdmin) {
            navigate('/');
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await authService.getAllUsers();
                setUsers(data);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los usuarios');
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAdmin, navigate]);

    const handleDeleteUser = async (userId: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await authService.deleteUser(userId);
                // Actualizar la lista de usuarios después de eliminar
                setUsers(users.filter(user => user.id !== userId));
            } catch (err) {
                setError('Error al eliminar el usuario');
            }
        }
    };

    if (loading) return <div>Cargando usuarios...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-users-container">
            <h2>Administración de Usuarios</h2>

            <table className="users-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Acciones</th>
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
                                onClick={() => handleDeleteUser(user.id)}
                                className="delete-button"
                            >
                                Eliminar
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsers;
