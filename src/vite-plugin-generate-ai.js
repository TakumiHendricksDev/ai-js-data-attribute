// vite-plugin-generate-ai.js
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { JSDOM } from 'jsdom'; // If needed for DOM parsing

dotenv.config();

// Function to extract pure JavaScript code
function extractPureJavaScript(responseText) {
  let cleanedText = responseText
    .replace(/^[\s\S]*?```(js|javascript)?/i, '')
    .replace(/```[\s\S]*$/i, '')
    .replace(/^[\s\n]*/g, '')
    .replace(/`/g, '')
    .trim();
  return cleanedText || responseText.trim();
}

async function generateAIJavaScript() {
  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Read the HTML file (adjust the path as needed)
  const inputHTML = fs.readFileSync('index.html', 'utf-8');

  // Use JSDOM to simulate a DOM in Node
  const dom = new JSDOM(inputHTML);
  const tempDiv = dom.window.document.createElement('div');
  tempDiv.innerHTML = inputHTML;

  // Find all elements with the AI attribute
  const aiElements = tempDiv.querySelectorAll('[ai]');
  let outputJS = '// Generated JS from AI instructions\n\n';

  for (const [index, el] of Array.from(aiElements).entries()) {
    const instruction = el.getAttribute('ai');
    const buttonId = el.getAttribute('id') || `auto_ai_btn_${index}`;
    el.setAttribute('id', buttonId);

    // Construct the prompt
    const prompt = `Generate a JavaScript event listener for a button.
Instruction: ${instruction}
Button ID: ${buttonId}

Respond ONLY with the JavaScript code snippet. No explanations, no markdown.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.2,
      });

      const rawResponseText = response.choices[0].message.content;

      console.log('Generated raw response:', rawResponseText);
      const codeSnippet = extractPureJavaScript(rawResponseText);

      if (codeSnippet) {
        outputJS += `\n${codeSnippet}\n`;
        console.log('Generated code snippet:', codeSnippet);
      } else {
        console.warn(`⚠️ No valid code generated for instruction: "${instruction}"`);
      }
    } catch (err) {
      console.error("Error calling OpenAI API:", err);
    }
  }

  // Ensure src directory exists
  const srcDir = path.resolve('src');
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir);
  }

  // Write generated JS to file
  fs.writeFileSync(path.resolve(srcDir, 'ai-generated.js'), outputJS);
  console.log('✅ AI-generated JavaScript written to src/ai-generated.js');
}

export default function generateAiPlugin() {
  return {
    name: 'vite:generate-ai',
    async buildStart() {
      await generateAIJavaScript();
    },
  };
}