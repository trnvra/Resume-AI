import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/')
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
                        <p className="auth-subtitle">Please wait a moment</p>
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
                    <h1>Welcome back</h1>
                    <p className="auth-subtitle">Sign in to continue your career journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
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
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button className="button primary-button" type="submit">
                        Sign In →
                    </button>
                </form>

                {/* Footer */}
                <p className="auth-footer">
                    Don't have an account?&nbsp;
                    <Link to="/register">Create new account</Link>
                </p>
            </div>
        </main>
    )
}

export default Login
