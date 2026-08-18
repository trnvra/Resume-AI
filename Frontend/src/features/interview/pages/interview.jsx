import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import axios from 'axios'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index, jobDescription, report }) => {
    const [ open, setOpen ] = useState(false)
    const [ userAnswer, setUserAnswer ] = useState('')
    const [ evaluation, setEvaluation ] = useState(null)
    const [ loadingEval, setLoadingEval ] = useState(false)
    const [ errorMsg, setErrorMsg ] = useState('')

     const handleEvaluate = async () => {

        if (!userAnswer.trim()) return
         setLoadingEval(true)
         setErrorMsg('')
         try {
             // Token localstorage / cookies dono se try karte hain
             const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            
             const response = await axios.post('https://resume-ai-rore.onrender.com/api/interview/evaluate-answer', {
                 question: item.question,
                 userAnswer,
                 jobDescription
             }, {
                 headers: { 
                    Authorization: token ? `Bearer ${token}` : '' 
                },
                withCredentials: true // Cookie-based auth ke liye zaroori hai
             })

           console.log("Evaluation Response:", response.data);
             if(response.data && response.data.evaluation) {
                 const evalData = response.data.evaluation;
                 setEvaluation(evalData);

                 // 🎯 Day 4 Task: LocalStorage me save karne ke liye yaha call karein
                 saveInterviewToLocalStorage(
                     report?.jobTitle || "Software Developer", // jobRole
                     jobDescription,                          // jobDescription
                     report?.matchScore || 80,                // matchScore
                    item.question,                           // question
                    userAnswer,                              // userAnswer
                     evalData.score,                          // aiScore
                     evalData.feedback,
                     interviewId                       // aiFeedback
                 );
             }
         } catch (error) {
             console.error("Evaluation Error:", error)
             setErrorMsg(error.response?.data?.message || "Auth error: Please re-login or check token.")
         } finally {
             setLoadingEval(false)
        }
    }
    //

//     const saveInterviewToLocalStorage = (jobRole, jobDescription, matchScore, question, userAnswer, aiScore, aiFeedback) => {
//     // 1. Existing sessions load karein ya empty array lein
//     const existingSessions = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]');

//     // 2. Latest session dhoondhein ya naya banayein
//     let currentSession = existingSessions[0];

//     if (!currentSession || currentSession.jobRole !== jobRole) {
//         currentSession = {
//             sessionId: 'session_' + Date.now(),
//             date: new Date().toLocaleDateString('en-GB'),
//             jobRole: jobRole || "Software Developer",
//             jobDescription: jobDescription || "",
//             matchScore: matchScore || 80,
//             savedAnswers: []
//         };
//         existingSessions.unshift(currentSession);
//     }

//     // 3. Naya Answer add karein
//     currentSession.savedAnswers.push({
//         questionId: 'q_' + Date.now(),
//         question: question,
//         userAnswer: userAnswer,
//         score: aiScore,
//         feedback: aiFeedback
//     });

//     // 4. LocalStorage me wapas save kar dein
//     localStorage.setItem('user_interview_sessions', JSON.stringify(existingSessions));
// };
    // const saveInterviewToLocalStorage = (jobRole, jobDescription, matchScore, question, userAnswer, aiScore, aiFeedback, interviewId) => {
    //     const existingSessions = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]');
    //     let currentSession = existingSessions.find(s => s.interviewId === interviewId);

    //     if (!currentSession) {
    //         currentSession = {
    //             sessionId: 'session_' + Date.now(),
    //             interviewId: interviewId, // 👈 Interview ID link kiya
    //             date: new Date().toLocaleDateString('en-GB'),
    //             jobRole: jobRole || "Software Developer",
    //             jobDescription: jobDescription || "",
    //             matchScore: matchScore || 80,
    //             savedAnswers: []
    //         };
    //         existingSessions.unshift(currentSession);
    //     }

    //     currentSession.savedAnswers.push({
    //         questionId: 'q_' + Date.now(),
    //         question: question,
    //         userAnswer: userAnswer,
    //         score: aiScore,
    //         feedback: aiFeedback
    //     });

    //     localStorage.setItem('user_interview_sessions', JSON.stringify(existingSessions));
    // };
    const saveInterviewToLocalStorage = (jobRole, jobDescription, matchScore, question, userAnswer, aiScore, aiFeedback, interviewId) => {
    let existingSessions = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]');

    if (existingSessions.length === 0) return;

    // 1. Pehle interviewId ke basis par session dhoondho
    let targetSessionIndex = existingSessions.findIndex(s => s.interviewId === interviewId || s.sessionId === interviewId);

    // 2. Agar interviewId se match nahi mila, toh sabse LATEST (pehla) session pakdo
    if (targetSessionIndex === -1) {
        targetSessionIndex = 0;
    }

    // Ensure karo ki savedAnswers array initialized ho
    if (!existingSessions[targetSessionIndex].savedAnswers) {
        existingSessions[targetSessionIndex].savedAnswers = [];
    }

    // Duplicate answer overwrite ya new entry push
    const answerEntry = {
        questionId: 'q_' + Date.now(),
        question: question,
        userAnswer: userAnswer,
        score: aiScore,
        feedback: aiFeedback
    };

    // Check karo agar ye same question pehle se saved hai toh use update kar do
    const existingQIndex = existingSessions[targetSessionIndex].savedAnswers.findIndex(a => a.question === question);

    if (existingQIndex > -1) {
        existingSessions[targetSessionIndex].savedAnswers[existingQIndex] = answerEntry;
    } else {
        existingSessions[targetSessionIndex].savedAnswers.push(answerEntry);
    }

    // LocalStorage me save karo
    localStorage.setItem('user_interview_sessions', JSON.stringify(existingSessions));
    }; 
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>

                    {/* Interactive Practice Mode */}
                    <div className='q-card__section mock-practice-box'>
                        <span className='practice-tag'>🎯 Practice Answer (Mock Interview)</span>
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here to get live AI feedback..."
                            rows={3}
                        />
                        <button
                            className='eval-btn'
                            onClick={handleEvaluate}
                            disabled={loadingEval || !userAnswer.trim()}
                        >
                            {loadingEval ? 'Evaluating…' : 'Submit Answer for AI Review'}
                        </button>

                        {evaluation && (
                            <div className='eval-result'>
                                <p className='eval-score'>AI Score: {evaluation.score}/100</p>
                                <p className='eval-feedback'><strong>Feedback:</strong> {evaluation.feedback}</p>
                                {evaluation.improvements?.length > 0 && (
                                    <ul className='eval-improvements'>
                                        {evaluation.improvements.map((imp, idx) => (
                                            <li key={idx}>{imp}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='q-card__section' style={{ marginTop: '12px' }}>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    const [showHistory, setShowHistory] = useState(false);
    const [savedSessions, setSavedSessions] = useState([]);

    const navigate = useNavigate();
    const handleOpenHistory = (e) => {
        e.stopPropagation(); // Event bubble na ho
        e.preventDefault();  // Kisi default behavior ko roko
        navigate('/history');
    }

    // const handleOpenHistory = () => {
    //     const data = JSON.parse(localStorage.getItem('user_interview_sessions') || '[]');
    //     setSavedSessions(data);
    //     setShowHistory(true);
    // };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    if (loading || !report) {
        return (
            <div className='interview-page'>
                <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', flex:1 }}>
                    <h1 style={{ fontSize:'1.1rem', fontWeight:600, color:'#9494a8' }}>Loading your interview plan…</h1>
                </div>
            </div>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className="nav-content">
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => { getResumePdf(interviewId) }}
                        className='button primary-button' >
                        <svg height={"0.8rem"} style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
                        Download Resume
                    </button>

                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} jobDescription={report.jobDescription} report={report} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} jobDescription={report.jobDescription} report={report} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar' style={{ position: 'relative', height: '100%' }}>
                     

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${scoreColor}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className='match-score__sub'>Strong match for this role</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps?.map((gap, i) => (
                                <span key={i} className={`skill-tag skill-tag--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleOpenHistory}
                        className='button primary-button'
                        style={{ 
                            position: 'absolute', 
                            bottom: '1.5rem', 
                            left: '1.5rem', 
                            width: 'calc(100% - 3rem)',
                            cursor: 'pointer'
                        }}
                    >
                        📜 View Saved History
                    </button>

                </aside>
            </div>

            {showHistory && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', border: '1px solid #334155', color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '18px', margin: 0 }}>Saved Interview History</h2>
                            <button onClick={() => setShowHistory(false)} style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                        </div>

                        {savedSessions.length === 0 ? (
                            <p style={{ color: '#94a3b8' }}>Koi saved session nahi mila. Pehle kisi question ka answer submit karein!</p>
                        ) : (
                            savedSessions.map((session, sIdx) => (
                                <div key={sIdx} style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                                    <h4 style={{ color: '#38bdf8', margin: '0 0 4px 0' }}>{session.jobRole} ({session.date})</h4>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Match Score: {session.matchScore}%</p>
                                    
                                    <div style={{ marginTop: '10px' }}>
                                        <strong style={{ fontSize: '13px' }}>Saved Answers ({session.savedAnswers?.length || 0}):</strong>
                                        {session.savedAnswers?.map((ans, aIdx) => (
                                            <div key={aIdx} style={{ background: '#0f172a', padding: '10px', marginTop: '6px', borderRadius: '6px', fontSize: '13px' }}>
                                                <p style={{ margin: '0 0 4px 0' }}><strong>Q:</strong> {ans.question}</p>
                                                <p style={{ margin: '0 0 4px 0', color: '#cbd5e1' }}><strong>Your Answer:</strong> {ans.userAnswer}</p>
                                                <p style={{ color: '#22c55e', margin: '0 0 4px 0' }}><strong>Score:</strong> {ans.score}/100</p>
                                                <p style={{ margin: 0, color: '#94a3b8' }}><strong>Feedback:</strong> {ans.feedback}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Interview