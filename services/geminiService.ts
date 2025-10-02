
import { GoogleGenAI } from "@google/genai";
import type { DataSource, DataSourceDetails, FollowUpResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const findDataSourcesPrompt = (projectDescription: string) => `
As an expert data science assistant, your task is to find relevant data sources for a project based on the user's description. Use Google Search to find up-to-date and accurate information.

Project Description: "${projectDescription}"

Based on your search, provide a list of the top 3-5 most relevant data sources. For each source, provide a name, a concise one-sentence description, and the primary access method (e.g., 'Public API', 'Website Download', 'FTP Server').

IMPORTANT: Format your response as a valid JSON array of objects. Do not include any text, code block markers, or explanations before or after the JSON array. Each object in the array must have the keys: "name", "description", and "accessMethod".

Example Response:
[
  {
    "name": "Solar Dynamics Observatory (SDO)",
    "description": "Provides high-resolution images and data of the Sun from NASA's SDO mission.",
    "accessMethod": "Public API (SunPy), Website Download"
  },
  {
    "name": "GOES Solar Ultraviolet Imager (SUVI)",
    "description": "Data from NOAA's Geostationary Operational Environmental Satellite (GOES) series focusing on the Sun's atmosphere.",
    "accessMethod": "Website Download, Data Archives"
  }
]
`;

const generateCodePrompt = (source: DataSource, projectDescription: string, language: string) => `
Write a complete, runnable ${language} code snippet to download or access data from the source named "${source.name}".

Project Context: The data is needed for a project to "${projectDescription}".
Data Source Description: "${source.description}".
Access Method: "${source.accessMethod}".

The code should be well-commented, include necessary imports, and handle basic error checking if possible. Output only the code block itself, with no surrounding text, explanations, or markdown code block markers like \`\`\`${language.toLowerCase()}\`\`\`.
`;

const getDetailsPrompt = (source: DataSource) => `
As a data science expert, provide detailed information about the following data source using Google Search:

Source Name: "${source.name}"
Description: "${source.description}"

Find the following details:
1.  dataFormats: An array of common data formats available (e.g., ["CSV", "JSON", "NetCDF"]).
2.  updateFrequency: How often the data is updated (e.g., "Real-time", "Daily", "Monthly").
3.  usageRestrictions: A brief description of usage restrictions (e.g., "API key required", "Public domain").
4.  documentationUrl: A direct URL to the primary documentation page. Omit if not found.

IMPORTANT: Format your response as a single, valid JSON object. Do not include any text or explanations. The object must have the keys: "dataFormats", "updateFrequency", "usageRestrictions", and optionally "documentationUrl".

Example Response:
{
  "dataFormats": ["netCDF", "FITS", "JPEG2000"],
  "updateFrequency": "Near real-time",
  "usageRestrictions": "Data is public, citation required.",
  "documentationUrl": "https://sdo.gsfc.nasa.gov/data/rules.php"
}
`;

const getFollowUpPrompt = (source: DataSource, question: string) => `
As a data science expert, answer a follow-up question about a specific data source. Use Google Search to find the answer.

Data Source: "${source.name}" (${source.description})
User's Question: "${question}"

Provide a concise and direct answer to the user's question. Format the response as a single JSON object with one key, "answer".

Example Response:
{
  "answer": "Yes, the SDO mission provides historical data going back to its launch in 2010. You can access it via the Joint Science Operations Center (JSOC) portal."
}
`;


export const findDataSources = async (projectDescription: string): Promise<DataSource[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: findDataSourcesPrompt(projectDescription),
            config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text.trim();
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error finding data sources:", error);
        throw new Error("Failed to parse data sources from AI response. The format might be invalid.");
    }
};

export const generateCodeForSource = async (source: DataSource, projectDescription: string, language: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generateCodePrompt(source, projectDescription, language),
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating code:", error);
        throw new Error("Failed to generate code from AI.");
    }
};

export const getDataSourceDetails = async (source: DataSource): Promise<DataSourceDetails> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: getDetailsPrompt(source),
            config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text.trim();
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error getting data source details:", error);
        throw new Error("Failed to parse data source details from AI response. The format might be invalid.");
    }
};

export const getFollowUpAnswer = async (source: DataSource, question: string): Promise<FollowUpResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: getFollowUpPrompt(source, question),
             config: {
              tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text.trim();
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        
        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error getting follow-up answer:", error);
        throw new Error("Failed to parse follow-up answer from AI response.");
    }
};
