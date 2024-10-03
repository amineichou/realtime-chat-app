import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import Cookies from 'universal-cookie';
import '../styles-global/login.css';

const Login = ({ setIsAuthenticated }) => {
    const cookies = new Cookies();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form submission from reloading the page

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Store the user's token in cookies
            cookies.set('auth-token', userCredential.user.refreshToken);
            setIsAuthenticated(true); // Update the authentication state
        } catch (error) {
            setError(error.message); // Capture and set any errors
            console.error("Login Error:", error.message);
        }
    };

    return (
        <div className='login-page'>
            <h1>Welcome Back</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>} {/* Display error message if any */}
                <button type='submit'>Sign In</button>
            </form>
        </div>
    );
};

export default Login;
