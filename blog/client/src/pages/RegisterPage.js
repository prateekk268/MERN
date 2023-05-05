import { useState } from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function register(ev) {
        ev.preventDefault();
        console.log(username, password);
        const response = await fetch("http://localhost:4000/register", {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: { 'Content-Type': 'application/json' },
        });
        console.log(response);
        if (response.status === 201) {
            alert('Registration Successful');
        } else {
            alert('Registration Failed');
        }
    }

    return (
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input type="text"
            placeholder="Username"
             value={username} 
             onChange={ev => setUsername(ev.target.value)} />
             <input type="password"
             placeholder="Password"
             value={password}
             onChange={ev => setPassword(ev.target.value)} />
             <button type="submit">Register</button>
        </form>
    )
}