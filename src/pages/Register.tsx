import React from "react"
import { Link } from "react-router-dom";


const Register = () => {
    return (
        <main>
            <h1>Registrarse</h1>
            <form>
                <input type="text" placeholder="Usuario" /><br />
                <input type="email" placeholder="Email" /><br />
                <input type="password" placeholder="Contraseña" /><br />
                <button type="submit">Crear cuenta</button>
            </form>
            <nav>
                <Link to="/login" className="site-name">Ya tienes una cuenta? entra aqui!</Link>
            </nav>
        </main>
    )
}

export default Register;