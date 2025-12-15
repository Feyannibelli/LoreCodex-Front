import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.tsx';
import Modal from '../../components/Modal.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import authService, { UserData } from '../../services/authService.ts';
import { Trash2 } from 'lucide-react';

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

    if (loading) return (
        <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    );

    if (!Array.isArray(users)) {
        return <div className="rounded-md bg-destructive/10 p-4 text-destructive">Error: Users could not be loaded correctly</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">User Administration</h2>

            {error && <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>}

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">ID</th>
                                <th className="px-6 py-3 font-medium">Username</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-muted-foreground">{user.id}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{user.username}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDeleteModal(user.id)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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