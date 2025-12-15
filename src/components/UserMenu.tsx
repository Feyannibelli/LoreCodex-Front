import React from "react";
import { NavLink } from "react-router-dom";

const UserMenu: React.FC = () => {
    return (
        // Glassmorphism container: matches Header but slightly less opaque to blend with Hero
        <nav className="relative z-40 w-full border-b border-white/[0.02] bg-background/40 backdrop-blur-xl transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4">
                <NavLink
                    to="/guides"
                    className={({ isActive }) =>
                        `relative py-3 text-sm font-medium transition-colors hover:text-primary ${isActive
                            ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-[""]'
                            : 'text-muted-foreground'
                        }`
                    }
                >
                    Guides
                </NavLink>

                <NavLink
                    to="/games"
                    className={({ isActive }) =>
                        `relative py-3 text-sm font-medium transition-colors hover:text-primary ${isActive
                            ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-[""]'
                            : 'text-muted-foreground'
                        }`
                    }
                >
                    Games
                </NavLink>

                <NavLink
                    to="/lists"
                    className={({ isActive }) =>
                        `relative py-3 text-sm font-medium transition-colors hover:text-primary ${isActive
                            ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-[""]'
                            : 'text-muted-foreground'
                        }`
                    }
                >
                    Lists
                </NavLink>

                <NavLink
                    to="/challenges"
                    className={({ isActive }) =>
                        `relative py-3 text-sm font-medium transition-colors hover:text-primary ${isActive
                            ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-[""]'
                            : 'text-muted-foreground'
                        }`
                    }
                >
                    Challenges
                </NavLink>

                <NavLink
                    to="/news"
                    className={({ isActive }) =>
                        `relative py-3 text-sm font-medium transition-colors hover:text-primary ${isActive
                            ? 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:content-[""]'
                            : 'text-muted-foreground'
                        }`
                    }
                >
                    News
                </NavLink>
            </div>
        </nav>
    );
};

export default UserMenu;
