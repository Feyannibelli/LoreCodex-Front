import React from "react";
import { NavLink } from "react-router-dom";

const UserMenu: React.FC = () => {
    return (
        <nav className="bg-surface border-b border px-4 py-3 flex gap-6 justify-center">
            <NavLink
                to="/guides"
                className={({ isActive }) =>
                    `font-semibold transition-colors ${
                        isActive
                            ? 'text-brand-500 border-b-2 border-brand-500 pb-1'
                            : 'text-text hover:text-brand-500'
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
                            ? 'text-brand-500 border-b-2 border-brand-500 pb-1'
                            : 'text-text hover:text-brand-500'
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
                            ? 'text-brand-500 border-b-2 border-brand-500 pb-1'
                            : 'text-text hover:text-brand-500'
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
                            ? 'text-brand-500 border-b-2 border-brand-500 pb-1'
                            : 'text-text hover:text-brand-500'
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
                            ? 'text-brand-500 border-b-2 border-brand-500 pb-1'
                            : 'text-text hover:text-brand-500'
                    }`
                }
            >
                News
            </NavLink>
        </nav>
    );
};

export default UserMenu;
