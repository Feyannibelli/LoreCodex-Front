// src/pages/ListDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import userListService, { UserListResponse } from '../../services/userListService';

const ListDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const listId = Number(id);
    const [list, setList] = useState<UserListResponse | null>(null);
    const [author, setAuthor] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!listId) return;
        setLoading(true);

        userListService.getListById(listId)
            .then(l => {
                console.log('Lista cargada:', l); // <-- Verifica aquí los items
                setList(l);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [listId]);

    useEffect(() => {
        if (!listId) return;
        // 2) load the author name
        userListService.getListAuthor(listId)
            .then(setAuthor)
            .catch(console.error);
    }, [listId]);

    if (loading) return <div className="p-8 text-center">Cargando lista…</div>;
    if (!list) return <div className="p-8 text-center text-red-600">Lista no encontrada</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">{list.title}</h1>
                {list.description && <p className="text-gray-600 mt-1">{list.description}</p>}
                <p className="text-sm text-gray-500 mt-2">
                    by{' '}
                    <Link to={`/profile/${list.userId}`} className="font-semibold hover:underline">
                        {author || `Usuario ${list.userId}`}
                    </Link>{' '}
                    · {new Date(list.createdAt).toLocaleDateString()}
                </p>
            </div>

            {/* Items grid */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {list.items.map(item => (
                    <li
                        key={item.id}
                        className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
                    >
                        <Link to={`/${item.type.toLowerCase()}/${item.referenceId}`}>
                            <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{item.type}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListDetailPage;
