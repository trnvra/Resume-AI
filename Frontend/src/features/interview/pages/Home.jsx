import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

// ── Typewriter Loading Screen ──────────────────────────────────────────────────
const LOADING_LINES = [
    'Analyzing job requirements…',
    'Scanning your profile & resume…',
    'Identifying skill gaps…',
    'Crafting technical questions…',
    'Building your roadmap…',
    'Calculating match score…',
    'Finalizing your interview plan…',
]

const LoadingScreen = () => {
    const [lineIndex, setLineIndex] = useState(0)
    const [displayed, setDisplayed] = useState('')
    const [charIndex, setCharIndex] = useState(0)

    // Typewriter effect
    useEffect(() => {
        const line = LOADING_LINES[lineIndex]
        if (charIndex < line.length) {
            const t = setTimeout(() => {
                setDisplayed(prev => prev + line[charIndex])
                setCharIndex(c => c + 1)
            }, 38)
            return () => clearTimeout(t)
        } else {
            // Pause then move to next line
            const t = setTimeout(() => {
                setLineIndex(i => (i + 1) % LOADING_LINES.length)
                setDisplayed('')
                setCharIndex(0)
            }, 1600)
            return () => clearTimeout(t)
        }
    }, [charIndex, lineIndex])

    return (
        <div className="ai-loading-page">
            <div className="ai-loading-card">
                {/* Animated orb */}
                <div className="ai-loading-orb">
                    <div className="ai-loading-orb__ring ring-1" />
                    <div className="ai-loading-orb__ring ring-2" />
                    <div className="ai-loading-orb__ring ring-3" />
                    <div className="ai-loading-orb__core">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                    </div>
                </div>

                <div className="ai-loading-text">
                    <h2>AI is working its magic</h2>
                    <div className="ai-loading-typewriter">
                        <span className="ai-loading-line">{displayed}</span>
                        <span className="ai-loading-cursor">|</span>
                    </div>
                </div>

                <div className="ai-loading-dots">
                    <span /><span /><span />
                </div>
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [charCount, setCharCount] = useState(0)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    // ── File Handlers ────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) setUploadedFile(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
            setUploadedFile(file)
            // Sync with hidden input
            const dt = new DataTransfer()
            dt.items.add(file)
            resumeInputRef.current.files = dt.files
        }
    }

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = () => setIsDragging(false)

    const handleRemoveFile = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setUploadedFile(null)
        resumeInputRef.current.value = ''
    }

    // ── Generate Report ──────────────────────────────────────────────────────
    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })

        if (data) {
            const existingSessions = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]')
            const newSession = {
                sessionId: 'session_' + Date.now(),
                interviewId: data._id,
                date: new Date().toLocaleDateString('en-GB'),
                jobRole: data.jobTitle || "Software Engineer",
                jobDescription: jobDescription || "",
                matchScore: data.matchScore || 80,
                savedAnswers: []
            }
            existingSessions.unshift(newSession)
            localStorage.setItem('user_interview_sessions', JSON.stringify(existingSessions))
            navigate(`/interview/${data._id}`)
        }
    }

    // ── Loading Screen ───────────────────────────────────────────────────────
    if (loading) return <LoadingScreen />

    // ── Main UI ──────────────────────────────────────────────────────────────
    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => {
                                setJobDescription(e.target.value)
                                setCharCount(e.target.value.length)
                            }}
                            className='panel__textarea'
                            placeholder="Paste the full job description here..."
                            maxLength={5000}
                        />
                        <div className='char-counter'>{charCount} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            {/* Dropzone */}
                            <label
                                className={`dropzone ${isDragging ? 'dropzone--dragging' : ''} ${uploadedFile ? 'dropzone--filled' : ''}`}
                                htmlFor='resume'
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                {uploadedFile ? (
                                    // File selected state
                                    <>
                                        <span className='dropzone__icon dropzone__icon--success'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </span>
                                        <p className='dropzone__title dropzone__title--success'>{uploadedFile.name}</p>
                                        <p className='dropzone__subtitle'>
                                            {(uploadedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                        <button className='dropzone__remove' onClick={handleRemoveFile}>
                                            ✕ Remove
                                        </button>
                                    </>
                                ) : (
                                    // Default state
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF or DOCX (Max 5MB)</p>
                                    </>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button onClick={handleGenerateReport} className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms of Service</a>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home