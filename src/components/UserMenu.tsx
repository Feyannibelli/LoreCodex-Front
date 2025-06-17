import React from "react";
import { Link } from "react-router-dom";

const UserMenu: React.FC = () => {
    return (
        <nav className="bg-gray-100 p-4 flex gap-4 justify-center">
            <Link
                to="/guides"
                className="text-gray-700 hover:text-blue-500 font-semibold"
            >
                Guides
            </Link>

            <Link
                to="/games"
                className="text-gray-700 hover:text-blue-500 font-semibold"
            >
                Games
            </Link>

            <Link
                to="/lists"
                className="text-gray-700 hover:text-blue-500 font-semibold"
            >
                Lists
            </Link>

            <Link
                to="/challenges"
                className="text-gray-700 hover:text-blue-500 font-semibold"
            >
                Challenges
            </Link>

            {/* NUEVO enlace */}
            <Link
                to="/news"
                className="text-gray-700 hover:text-blue-500 font-semibold"
            >
                News
            </Link>

            <Link
                to="/challenges"
                className="text-gray-700 hover:text-blue-500 font-semibold"
            >
                Challenges
        </Link>
        </nav>
    );
};

export default UserMenu;
