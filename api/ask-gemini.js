// Este é o código para uma função de servidor que funciona como um proxy.
// Ele deve ser hospedado em um serviço como Vercel, Cloudflare Workers, etc.
// Isso protege sua chave de API e resolve problemas de CORS.

import { GoogleGenerativeAI } from "@google/generative-ai";

// Use uma variável de ambiente para a sua chave de API
// Isso é CRUCIAL para a segurança!
// No Vercel, você pode configurá-la em "Settings > Environment Variables"
const API_KEY = process.env.GEMINI_API_KEY;

// Inicializa a API do Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20", tools: [{ "google_search": {} }] });
const systemPrompt = "Você é um especialista em direito tributário brasileiro. Responda às perguntas sobre o IBC e a CBS com base nas informações mais recentes e de forma clara e objetiva. Mantenha as respostas focadas nos impostos citados.";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'O "prompt" é necessário na requisição.' });
        }

        const chat = model.startChat({
            history: [],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        });
        
        const result = await chat.sendMessage(prompt);
        const responseText = await result.response.text();
        
        res.status(200).json({ text: responseText });
    } catch (error) {
        console.error('Erro na chamada da API:', error);
        res.status(500).json({ error: 'Falha ao processar sua requisição. Por favor, tente novamente.' });
    }
}
