import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import '../style/history.scss'

const History = () => {
    const [sessions, setSessions] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]')
        setSessions(data)
    }, [])

    const handleDeleteSession = (sessionId, e) => {
        e.stopPropagation()
        if (window.confirm('Kya aap is interview session ko delete karna chahte hain?')) {
            const updated = sessions.filter(s => s.sessionId !== sessionId)
            setSessions(updated)
            localStorage.setItem('user_interview_sessions', JSON.stringify(updated))
        }
    }

    const handleViewSession = (session) => {
        if (session.interviewId) {
            navigate(`/interview/${session.interviewId}`)
        } else {
            alert('Is session ki ID missing hai.')
        }
    }

    return (
        <div className="history-page">
            <div className="history-inner">

                {/* ── Header ── */}
                <div className="history-header">
                    <div className="history-header__text">
                        <h1 className="history-header__title">
                            <span>📜</span> Saved Interview History
                        </h1>
                        <p className="history-header__sub">
                            Aapke saare purane job descriptions, match scores aur practice responses.
                        </p>
                    </div>
                    <button className="history-header__btn" onClick={() => navigate('/')}>
                        + New Interview
                    </button>
                </div>

                {/* ── Content ── */}
                {sessions.length === 0 ? (
                    <div className="history-empty">
                        <span className="history-empty__icon">🗂️</span>
                        <h3>Koi saved interview history nahi mila!</h3>
                        <p>Home page par jaakar pehle naya Job Description submit karein.</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {sessions.map((session) => (
                            <div className="session-card" key={session.sessionId}>

                                {/* Card Header */}
                                <div className="session-card__header">
                                    <div className="session-card__meta">
                                        <h2 className="session-card__role">
                                            {session.jobRole || 'Software Engineer'}
                                        </h2>
                                        <p className="session-card__date">📅 {session.date}</p>
                                    </div>

                                    <div className="session-card__actions">
                                        <span className="match-badge">
                                            ✦ Match: {session.matchScore}%
                                        </span>

                                        {session.interviewId && (
                                            <button
                                                className="action-btn action-btn--view"
                                                onClick={() => handleViewSession(session)}
                                            >
                                                👁 View Report
                                            </button>
                                        )}

                                        <button
                                            className="action-btn action-btn--delete"
                                            onClick={(e) => handleDeleteSession(session.sessionId, e)}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Job Description Preview */}
                                {session.jobDescription && (
                                    <div className="jd-preview">
                                        <p className="jd-preview__label">Job Description</p>
                                        <p className="jd-preview__text">{session.jobDescription}</p>
                                    </div>
                                )}

                                {/* Practiced Questions */}
                                <div className="practiced-section">
                                    <h4 className="practiced-section__heading">
                                        Practiced Questions
                                        <span className="count-badge">
                                            {session.savedAnswers?.length || 0}
                                        </span>
                                    </h4>

                                    {session.savedAnswers && session.savedAnswers.length > 0 ? (
                                        session.savedAnswers.map((ans, idx) => (
                                            <div className="answer-item" key={idx}>
                                                <p className="answer-item__question">Q: {ans.question}</p>
                                                <p className="answer-item__answer">
                                                    <strong>Your Answer:</strong> {ans.userAnswer}
                                                </p>
                                                <div className="answer-item__meta">
                                                    <span className="answer-item__score">
                                                        ✦ AI Score: {ans.score}/100
                                                    </span>
                                                    <span className="answer-item__feedback">
                                                        {ans.feedback}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="practiced-section__empty">
                                            Is session mein abhi koi practice answer submit nahi kiya gaya.
                                        </p>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default History