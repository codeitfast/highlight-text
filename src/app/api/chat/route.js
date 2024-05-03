import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from 'next/server'

const { GoogleGenerativeAI } = require("@google/generative-ai");

export async function POST(req, res) {
    let body = await req.json()

    console.log(body.engine)

    async function main() {

        console.log(body.engine)

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
            I will give you a very specific text below. I want you to be the best possible editor that you can be for the writer. For instance, try to find grammer errors, accuracy with their statements, how convincing their essay is, or whatever you think will make their work really shine. Make sure their writing is formal and professional -- this means proper punctuation, spelling, capitalization, and anything else needed to be as professional as possible.
            In order for this to work, you need to respond in a JSON format. This is really important, you may only respond in a JSON format. Do not add markdown symbols or extra text or make a code block. THIS MEANS NO \`\`\` before or after the code block!!! Just make a simple JSON variable that you return as plaintext. The JSON format is as below: 
            {
                issues: [
                    {
                        "snippet": "problematic text, concise as possible",
                        "reason": "why is the snippet problematic?",
                        "solution": "a corrected snippet that could perfectly replace the problematic snippet. for instance, if the snippet has no punctuation at the end, the solution shouldn't either because then the program will interpret it to have double periods or commas. It should be as concise as possible.",
                        "color": "whatever color you think portrays this well, it should be interpretable in HEX"
                    },
                    {
                        //if there are multiple issues, append more of these dictionaries in here
                    }
                ],
                report: {
                    analysis: "a brief, concise and constructive analysis, no bulletpoints or markdown, just plaintext",
                    "score": ["score on grammar", "score on accuracy and flow", "overall score"] /* scores have the format "n/10", such as "0/10" or "5/10". the better the grammar score, the higher the value you give. try giving non-zero answers, try to be enouraging in analysis and score.*/
                }
            }

            IMPORTANT:
            NO \`\`\`
            NO \`\`\`json
            NO \`\`\` JSON
            IT *MUST* BE PLAINTEXT!

            HERE IS THE TEXT TO ANALYZE:

        ${body.prompt.text}`

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return { completion: text }
        }
    }
    let a = await main()
    console.log(a)
    return NextResponse.json(a)
}