import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from 'next/server'

const { GoogleGenerativeAI } = require("@google/generative-ai");



export async function POST(req, res) {
    let body = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});


    console.log(body.prompt.text)

    async function main() {
        const prompt = `Here is the text to analyze:
        ${body.prompt.text}

        Review the text for errors, including grammar, capitalization, punctuation, spelling, accuracy, flow between paragraphs and ideas, FIND FACTUAL ACCURACY ERRORS, THE STRENGTH OF THEIR ARGUMENT, and anything you find you need to change. BE SUPER HARSH BUT POSITIVE, TRY TO FIND SOMETHING MEANINGFUL TO CHANGE. Respond in JSON format, appending each issue to a list 'issues'. Each issue should be a JSON object with 'snippet', 'reason', 'solution' (array with original and corrected text), and a color code ('red' for major, 'orange/yellow' for moderate, 'green' for positive, 'purple' for unrelated). Be critical but optimistic.
        YOU MAY ONLY RESPOND IN THIS JSON FORMAT! DO NOT WRITE ANYTHING ELSE BUT THIS JSON! THIS MEANS NO TEXT BEFORE OR AFTER THE JSON! IF NO ERROR IS FOUND, DO NOT ADD IT TO THE JSON!!!        
        YOU MUST FIND EXAMPLES FOR SNIPPETS UNLESS THE TEXT IS PERFECT! AND NO MARKDOWN!
        Example JSON response:

        {
        "issues": [
            //snippets should only be made if there is a problem with the section of the text
            {
            "snippet": "Example error in the text",
            "reason": "Explanation of why it's an error",
            //solutions should do the minimal amount of change to fix it. So, no new ideas, just fix the error
            "solution": ["Incorrect version", "Corrected version"],
            "color": "red"
            },
            // Additional issues follow the same structure
        ],
        
        "report": {
            "analysis": "A brief analysis of what the writer did well and can work on.",
            //all scores are out of 10. NO TEXT or N/A, JUST NUMBERS/10 written as a string (example: "5/10" or "10/10")
            "score": ["score on grammar, spelling, etc", "score on accuracy, flow, etc", "overall score"]
        }
        }
        YOU MAY ONLY RESPOND IN THIS JSON FORMAT! DO NOT WRITE ANYTHING ELSE BUT THIS JSON! THIS MEANS NO TEXT BEFORE OR AFTER THE JSON! DO NOT RETURN AS A JSON BLOCK, BUT INSTEAD AS VALID JSON!!!
        `

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log(text);
        return text
    }

    let a = await main()
    return NextResponse.json(a)
}