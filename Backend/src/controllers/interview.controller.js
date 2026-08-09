const pdfParse = require('pdf-parse');
console.log("PDF Parse Content:", Object.keys(pdfParse));
console.log("PDF Parse type is:", typeof pdfParse);
const { 
    generateInterviewReport, 
    generateResumePdf, 
    evaluateAnswer, 
    optimizeResumeForJd 
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model")

async function parsePdf(buffer) {
    // 1. Agar library hi function hai
    if (typeof pdfParse === 'function') {
        return await pdfParse(buffer);
    }
    // 2. Agar PDFParse ek Class hai (jo constructor error de raha tha)
    if (pdfParse.PDFParse && typeof pdfParse.PDFParse === 'function') {
        try {
            const parser = new pdfParse.PDFParse(buffer);
            return await parser.parse();
        } catch (e) {
            // Fallback for some versions
            return await pdfParse.PDFParse(buffer);
        }
    }
    // 3. Agar default export use ho raha hai
    if (pdfParse.default && typeof pdfParse.default === 'function') {
        return await pdfParse.default(buffer);
    }
    throw new Error("PDF Library ko initialize nahi kiya ja saka.");
}


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    const { selfDescription, jobDescription } = req.body;

    let resumeContent = ""
    
    if (req.file && req.file.buffer) {
        // const parsed = await pdfParse.default(req.file.buffer);
        const parsed = await (pdfParse.default || pdfParse.PDFParse || pdfParse)(req.file.buffer);
        resumeContent = parsed.text;
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent,
        selfDescription,
        jobDescription
    });

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent,
        selfDescription,
        jobDescription,
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(
            interviewReportId
        )

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const {
            resume,
            jobDescription,
            selfDescription
        } = interviewReport

        const pdfBuffer = await generateResumePdf({
            resume,
            jobDescription,
            selfDescription
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        return res.status(200).send(pdfBuffer)

    } catch (error) {
        console.error("Generate Resume PDF Error:", error)

        return res.status(500).json({
            message: "Failed to generate resume PDF",
            error: error.message
        })
    }
}

// Safe Controller for Interactive Mock Evaluation
async function evaluateAnswerController(req, res) {
    try {
        const { question, userAnswer, jobDescription } = req.body || {};

        if (!question || !userAnswer) {
            return res.status(400).json({ 
                message: "Question and User Answer are required." 
            });
        }

        const evaluation = await evaluateAnswer({ 
            question, 
            userAnswer, 
            jobDescription: jobDescription || "" 
        });

        return res.status(200).json({
            message: "Answer evaluated successfully.",
            evaluation
        });
    } catch (error) {
        console.error("Evaluate Answer Controller Error:", error);
        return res.status(500).json({ 
            message: "Failed to evaluate answer.", 
            error: error.message 
        });
    }
}

async function optimizeResumeController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." });
        }

        const optimizationData = await optimizeResumeForJd({
            resume: interviewReport.resume,
            jobDescription: interviewReport.jobDescription
        });

        res.status(200).json({
            message: "Resume optimization plan generated.",
            optimizationData
        });
    } catch (error) {
        res.status(500).json({ message: "Optimization failed.", error: error.message });
    }
}

module.exports = { 
    generateInterViewReportController, 
    getInterviewReportByIdController, 
    getAllInterviewReportsController, 
    generateResumePdfController,
    evaluateAnswerController,
    optimizeResumeController
};