import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from 'next/server'

const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(req, res) {
    let body = await req.json()

    console.log(body.engine)

    async function main() {

        if (body.engine == 'claude') {
            const anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY
            });

            const completion = await anthropic.completions.create({
                model: "claude-2.1",
                max_tokens_to_sample: 1000,
                temperature: 0,
                prompt: `${Anthropic.HUMAN_PROMPT} 

        Here is the text to analyze:
        ${body.prompt.text}

        Review the text for errors, including grammar, capitalization, spelling, accuracy, flow, and anything you find you need to change. Respond in JSON format, appending each issue to a list 'issues'. Each issue should be a JSON object with 'snippet', 'reason', 'solution' (array with original and corrected text), and a color code ('red' for major, 'orange/yellow' for moderate, 'green' for positive, 'purple' for unrelated). Be critical but optimistic.
        YOU MAY ONLY RESPOND IN THIS JSON FORMAT! DO NOT WRITE ANYTHING ELSE BUT THIS JSON! THIS MEANS NO TEXT BEFORE OR AFTER THE JSON!        
        Example JSON response:

        {
        "issues": [
            //snippets should only be made if there is a problem with the section of the text
            {
            "snippet": "concise error in the text", //this MUST BE: as conise as possible, as few words as possible, and no special punctuation (such as dashes)
            "reason": "Explanation of why it's an error",
            //solutions should do the minimal amount of change to fix it. So, no new ideas, just fix the error
            //the solution must make sense if they were to exactly switch the problematic snippet to the new snippet
            "solution": ["snippet that is problematic", "a concise new snippet that fixes the problem"],
            "color": "red"
            },
            // Additional issues follow the same structure
        ],
        
        "report": {
            "analysis": "A brief analysis of what the writer did well and can work on.",
            //all scores are out of 10. NO TEXT, JUST NUMBERS/10 written as a string (example: "5/10" or "10/10")
            "score": ["score on grammar, spelling, etc", "score on accuracy, flow, etc", "overall score"]
        }
        }
        YOU MAY ONLY RESPOND IN THIS JSON FORMAT! DO NOT WRITE ANYTHING ELSE BUT THIS JSON! THIS MEANS NO TEXT BEFORE OR AFTER THE JSON!
         ${Anthropic.AI_PROMPT}`,
            });
            console.log(completion);
            return completion
        } else {

            const genAI = new GoogleGenerativeAI(process.env.GEMINI);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
            Here is the text to analyze:
        ${body.prompt.text}

        Review the text for errors, including grammar, capitalization, spelling, accuracy, flow, and anything you find you need to change. Respond in JSON format, appending each issue to a list 'issues'. Each issue should be a JSON object with 'snippet', 'reason', 'solution' (array with original and corrected text), and a color code ('red' for major, 'orange/yellow' for moderate, 'green' for positive, 'purple' for unrelated). Be critical but optimistic.
        YOU MAY ONLY RESPOND IN THIS JSON FORMAT! DO NOT WRITE ANYTHING ELSE BUT THIS JSON! THIS MEANS NO TEXT BEFORE OR AFTER THE JSON!        
        Example JSON response:

        {
        "issues": [
            //snippets should only be made if there is a problem with the section of the text
            {
            "snippet": "concise error in the text", //this MUST BE: as conise as possible, as few words as possible, and no special punctuation (such as dashes)
            "reason": "Explanation of why it's an error",
            //solutions should do the minimal amount of change to fix it. So, no new ideas, just fix the error
            //the solution must make sense if they were to exactly switch the problematic snippet to the new snippet
            "solution": ["snippet that is problematic", "a concise new snippet that fixes the problem"],
            "color": "red"
            },
            // Additional issues follow the same structure
        ],
        
        "report": {
            "analysis": "A brief analysis of what the writer did well and can work on.",
            //all scores are out of 10. NO TEXT, JUST NUMBERS/10 written as a string (example: "5/10" or "10/10")
            "score": ["score on grammar, spelling, etc", "score on accuracy, flow, etc", "overall score"]
        }
        }
        YOU MAY ONLY RESPOND IN THIS JSON FORMAT! DO NOT WRITE ANYTHING ELSE BUT THIS JSON! THIS MEANS NO TEXT BEFORE OR AFTER THE JSON!
        `

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return {completion: text}
        }
    }
    let a = await main()
    console.log(a)
    return NextResponse.json(a)
}