// src/pages/ListsPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import userListService, { UserListResponse } from '@/services/userListService';

const ListsPage: React.FC = () => {
    const [lists, setLists] = useState<UserListResponse[]>([]);

    useEffect(() => {
        userListService
            .getAll()          // asegúrate de implementar este método en el service
            .then(setLists)
            .catch(console.error);
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Lists</h1>
                <Link
                    to="/lists/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create List +
                </Link>
            </div>

            <ul className="space-y-4">
                {lists.map(list => (
                    <li key={list.id}>
                        <Link
                            to={`/lists/${list.id}`}
                            className="block border rounded-lg p-4 hover:shadow-lg transition"
                        >
                            <h2 className="text-xl font-semibold">{list.title}</h2>
                            {list.description && (
                                <p className="text-gray-500 mt-1">{list.description}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-2">
                                {new Date(list.createdAt).toLocaleDateString()}
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListsPage;
