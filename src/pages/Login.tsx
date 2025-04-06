import React from "react";

const Login = () => {
    return (
        <main>
            <h1>Iniciar Sesión</h1>
            <form>
                <input type="text" placeholder="Usuario"/> <br/>
                <input type="text" placeholder="Contraseña"/> <br/>
                <button type="submit">Enviar</button>
            </form>
        </main>
    )
}

export default Login;