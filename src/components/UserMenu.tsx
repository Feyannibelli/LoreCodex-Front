import React from "react";
import { NavLink } from "react-router-dom";

const UserMenu: React.FC = () => {
    return (
        <nav className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-6 justify-center">
            <NavLink
                to="/guides"
                className={({ isActive }) =>
                    `font-semibold transition-colors ${
                        isActive
                            ? 'text-orange-600 border-b-2 border-orange-500 pb-1'
                            : 'text-slate-700 hover:text-indigo-600'
                    }`
                }
            >
                Guides
            </NavLink>

            <NavLink
                to="/games"
                className={({ isActive }) =>
                    `font-semibold transition-colors ${
                        isActive
                            ? 'text-orange-600 border-b-2 border-orange-500 pb-1'
                            : 'text-slate-700 hover:text-indigo-600'
                    }`
                }
            >
                Games
            </NavLink>

            <NavLink
                to="/lists"
                className={({ isActive }) =>
                    `font-semibold transition-colors ${
                        isActive
                            ? 'text-orange-600 border-b-2 border-orange-500 pb-1'
                            : 'text-slate-700 hover:text-indigo-600'
                    }`
                }
            >
                Lists
            </NavLink>

            <NavLink
                to="/challenges"
                className={({ isActive }) =>
                    `font-semibold transition-colors ${
                        isActive
                            ? 'text-orange-600 border-b-2 border-orange-500 pb-1'
                            : 'text-slate-700 hover:text-indigo-600'
                    }`
                }
            >
                Challenges
            </NavLink>

            {/* NUEVO enlace */}
            <NavLink
                to="/news"
                className={({ isActive }) =>
                    `font-semibold transition-colors ${
                        isActive
                            ? 'text-orange-600 border-b-2 border-orange-500 pb-1'
                            : 'text-slate-700 hover:text-indigo-600'
                    }`
                }
            >
                News
            </NavLink>
        </nav>
    );
};

export default UserMenu;
