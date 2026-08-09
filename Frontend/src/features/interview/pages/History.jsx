import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

const History = () => {
    const [sessions, setSessions] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        // LocalStorage se saved sessions load karna
        const data = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]')
        setSessions(data)
    }, [])

    // Specific Session Delete Handler
    const handleDeleteSession = (sessionId, e) => {
        e.stopPropagation(); // Card click event prevent karne ke liye
        if (window.confirm("Kya aap is interview session ko delete karna chahte hain?")) {
            const updatedSessions = sessions.filter(session => session.sessionId !== sessionId)
            setSessions(updatedSessions)
            localStorage.setItem('user_interview_sessions', JSON.stringify(updatedSessions))
        }
    }

    // Single Session Report Open Karne Ka Handler
    const handleViewSession = (session) => {
        if (session.interviewId) {
            navigate(`/interview/${session.interviewId}`);
        } else {
            alert("Is session ki ID missing hai.");
        }
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#fff', minHeight: '100vh' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>📜 Saved Interview History</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
                        Aapke saare purane job descriptions, match scores aur practice responses.
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/')} 
                    style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + New Interview (Home)
                </button>
            </div>

            {/* Sessions List */}
            {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b' }}>
                    <h3>Koi saved interview history nahi mila!</h3>
                    <p style={{ color: '#64748b', marginTop: '8px' }}>Home page par jaakar pehle naya Job Description submit karein.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sessions.map((session) => (
                        <div 
                            key={session.sessionId} 
                            style={{ 
                                background: '#0f172a', 
                                borderRadius: '12px', 
                                padding: '1.5rem', 
                                border: '1px solid #1e293b', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', color: '#38bdf8', margin: 0 }}>{session.jobRole || "Software Engineer"}</h2>
                                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Date: {session.date}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: '#1e293b', padding: '6px 14px', borderRadius: '20px', color: '#22c55e', fontWeight: 'bold', fontSize: '14px', border: '1px solid #334155' }}>
                                        Match: {session.matchScore}%
                                    </span>
                                    {session.interviewId && (
                                        <button 
                                            onClick={() => handleViewSession(session)}
                                            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                        >
                                            View Report 👁️
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                                        style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                    >
                                        Delete 🗑️
                                    </button>
                                </div>
                            </div>

                            {/* Job Description Preview */}
                            {session.jobDescription && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Job Description:</p>
                                    <p style={{ fontSize: '13px', color: '#cbd5e1', background: '#1e293b', padding: '10px', borderRadius: '6px', margin: 0, maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {session.jobDescription}
                                    </p>
                                </div>
                            )}

                            {/* Saved Evaluated Questions */}
                            <div>
                                <h4 style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '0.8rem' }}>
                                    Practiced Questions ({session.savedAnswers?.length || 0}):
                                </h4>
                                
                                {session.savedAnswers && session.savedAnswers.length > 0 ? (
                                    session.savedAnswers.map((ans, idx) => (
                                        <div key={idx} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '0.8rem' }}>
                                            <p style={{ fontWeight: '600', color: '#f8fafc', margin: '0 0 4px 0', fontSize: '14px' }}>Q: {ans.question}</p>
                                            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 8px 0' }}>
                                                <strong style={{ color: '#cbd5e1' }}>Your Answer:</strong> {ans.userAnswer}
                                            </p>
                                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', alignItems: 'center' }}>
                                                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>AI Score: {ans.score}/100</span>
                                                <span style={{ color: '#cbd5e1' }}>| Feedback: {ans.feedback}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ fontSize: '12px', color: '#64748b' }}>Is session me abhi koi practice answer submit nahi kiya gaya hai.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default History