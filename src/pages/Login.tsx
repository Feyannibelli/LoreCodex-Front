import React from "react"
import { Link } from "react-router-dom";

const Login = () => {
    return (
        <main>
            <h1>Iniciar Sesión</h1>
            <form>
                <input type="text" placeholder="Usuario"/> <br/>
                <input type="text" placeholder="Contraseña"/> <br/>
                <button type="submit">Enviar</button>
            </form>
            <nav>
                <Link to="/register" className="site-name">No Tienes una cuenta? Registrate aqui!</Link>
            </nav>
        </main>
    )
}

export default Login;