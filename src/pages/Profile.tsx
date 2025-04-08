import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { updateUserProfile, deleteUserAccount } from "../services/userService";
import { logout } from "../services/authService";

const Profile = () => {
    const { user, setUser, setAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        newPassword: "",
    });
    const [deleteForm, setDeleteForm] = useState({
        confirmPassword: "",
        showConfirmation: false,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                email: user.email,
                newPassword: "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDeleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeleteForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const updateData = {
                username: formData.username !== user?.username ? formData.username : undefined,
                email: formData.email !== user?.email ? formData.email : undefined,
                password: formData.newPassword || undefined,
            };

            const updatedUser = await updateUserProfile(updateData);
            setUser(updatedUser);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al actualizar perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        setAuthenticated(false);
        setUser(null);
        navigate("/");
    };

    const handleDeleteAccount = async () => {
        if (!deleteForm.confirmPassword) {
            setError("Debe ingresar su contraseña para confirmar");
            return;
        }

        setLoading(true);
        try {
            await deleteUserAccount(deleteForm.confirmPassword);
            logout();
            setAuthenticated(false);
            setUser(null);
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al eliminar cuenta");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div>Cargando perfil...</div>;
    }

    return (
        <div>
            <h2>Perfil del Usuario</h2>
            {error && <div className="error-message">{error}</div>}

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nombre de usuario:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Nueva contraseña (dejar en blanco para mantener):</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="toggle-button"
                        >
                            {showPassword ? "Ocultar" : "Mostrar"}
                        </button>
                    </div>
                    <div>
                        <button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)}>
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <div>
                    <p>
                        <strong>Nombre de usuario:</strong> {user.username}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Contraseña:</strong> ********
                    </p>
                    <button onClick={() => setIsEditing(true)} className="edit-button">
                        Editar perfil
                    </button>
                </div>
            )}

            <hr />

            <div>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar sesión
                </button>

                {deleteForm.showConfirmation ? (
                    <div>
                        <p>Ingrese su contraseña para confirmar la eliminación:</p>
                        <input
                            type="password"
                            value={deleteForm.confirmPassword}
                            onChange={handleDeleteChange}
                            placeholder="Contraseña"
                        />
                        <div>
                            <button
                                onClick={handleDeleteAccount}
                                className="delete-confirm-button"
                                disabled={loading}
                            >
                                {loading ? "Eliminando..." : "Confirmar eliminación"}
                            </button>
                            <button
                                onClick={() =>
                                    setDeleteForm({ showConfirmation: false, confirmPassword: "" })
                                }
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setDeleteForm({ ...deleteForm, showConfirmation: true })}
                        className="delete-button"
                    >
                        Eliminar cuenta
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;