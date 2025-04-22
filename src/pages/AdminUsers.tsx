import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import authService, { UserData } from '../services/authService';
import '../css/AdminUsers.css';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    useEffect(() => {
        // Redirigir si no es administrador
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
                    setError('Error: Los datos de usuarios no tienen el formato esperado');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Error al cargar los usuarios');
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
            // Actualizar la lista de usuarios después de eliminar
            setUsers(users.filter(user => user.id !== userToDelete));
            closeModal();
        } catch (err) {
            setError('Error al eliminar el usuario');
            closeModal();
        }
    };

    if (loading) return <div>Cargando usuarios...</div>;

    if (!Array.isArray(users)) {
        return <div className="error-message">Error: No se pudieron cargar los usuarios correctamente</div>;
    }

    return (
        <div className="admin-users-container">
            <h2>Administración de Usuarios</h2>

            {error && <div className="error-message">{error}</div>}

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
                                onClick={() => openDeleteModal(user.id)}
                                className="delete-button"
                            >
                                Eliminar
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
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
            />
        </div>
    );
};

export default AdminUsers;