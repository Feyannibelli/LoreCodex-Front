import React from 'react';
import './/LoreCodex-Front/src/style.css';

const App: React.FC = () => {
    return (
        <div className="home-container">
            <header className="header">
                <h1>Bienvenido a Mi Sitio</h1>
                <nav>
                    <ul>
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#servicios">Servicios</a></li>
                        <li><a href="#acerca">Acerca de</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h2>Mi Página de Inicio</h2>
                    <p>Esta es una página de inicio creada con React y TypeScript</p>
                    <button className="cta-button">Comenzar</button>
                </section>

                <section className="features">
                    <div className="feature">
                        <h3>Característica 1</h3>
                        <p>Descripción de la primera característica de tu sitio web.</p>
                    </div>
                    <div className="feature">
                        <h3>Característica 2</h3>
                        <p>Descripción de la segunda característica de tu sitio web.</p>
                    </div>
                    <div className="feature">
                        <h3>Característica 3</h3>
                        <p>Descripción de la tercera característica de tu sitio web.</p>
                    </div>
                </section>
            </main>

            <footer>
                <p>&copy; 2025 Mi Sitio. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default App;