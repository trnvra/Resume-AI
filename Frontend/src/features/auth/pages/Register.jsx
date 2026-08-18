import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({ username, email, password })
        navigate("/")
    }

    if (loading) {
        return (
            <main className="auth-page">
                <div className="form-container">
                    <div className="auth-brand">
                        <div className="brand-logo">
                            <span className="logo-dot"></span>
                            <span className="logo-text">Resume AI</span>
                        </div>
                        <h1>Loading…</h1>
                        <p className="auth-subtitle">Setting up your account</p>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="auth-page">
            <div className="form-container">

                {/* Brand */}
                <div className="auth-brand">
                    <div className="brand-logo">
                        <span className="logo-dot"></span>
                        <span className="logo-text">Resume AI</span>
                    </div>
                    <h1>Create account</h1>
                    <p className="auth-subtitle">Start building your perfect resume today</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <span className="input-icon">👤</span>
                            <input
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Choose a username"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email address</label>
                        <div className="input-wrapper">
                            <span className="input-icon">✉</span>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Create a strong password"
                            />
                        </div>
                    </div>

                    <button className="button primary-button" type="submit">
                        Get Started →
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-footer">
                    Already have an account?&nbsp;
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </main>
    )
}

export default Register