import React from "react";

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
        </main>
    )
}

export default Register;