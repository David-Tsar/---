import { GoogleGenAI } from "@google/genai";
import { SearchResult, GroundingSource } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey });

export const findBuyers = async (
  product: string, 
  region: string, 
  previousContext: string = ""
): Promise<SearchResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const regionText = region ? `в регионе ${region}` : "по всей стране";
  const continuationInstruction = previousContext 
    ? `Это продолжение поиска. Игнорируй покупателей, которые уже были найдены ранее (не дублируй информацию). Найди НОВЫЕ объявления, которых не было в предыдущем списке.` 
    : "";
  
  // Prompt engineering to focus on "WANTED" ads vs "FOR SALE" ads
  const prompt = `
    Ты - профессиональный помощник продавца (B2B/B2C). Твоя задача - найти потенциальных покупателей.
    
    Найди актуальные объявления о ПОКУПКЕ (спрос, "куплю", "закупаем", "ищем поставщика", "требуется") следующего товара: "${product}" ${regionText}.
    
    ${continuationInstruction}

    ВАЖНО:
    1. Игнорируй объявления о продаже (где люди продают этот товар). Ищи только тех, кто хочет КУПИТЬ.
    2. Используй Google Search для поиска свежих объявлений на досках объявлений (Avito, Agroserver и др.), форумах, порталах закупок.
    
    Формат ответа:
    Предоставь список найденных потенциальных покупателей (минимум 3-5 новых). Для каждого объявления используй следующую структуру:
    
    **Заголовок объявления**
    *   **Суть запроса:** (Что ищут, объем, нюансы)
    *   **Регион:** (Город или область)
    *   **Дата:** (Как можно точнее)
    *   **Источник:** (Название сайта и ссылка в формате [Номер источника])
    
    Если прямых контактов в тексте сниппета нет, так и напиши: "Контакты доступны по ссылке".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        // Use Google Search Grounding
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be JSON when using tools, so we parse text manually
      },
    });

    const text = response.text || "Не удалось получить текстовый ответ.";
    
    // Extract grounding chunks (sources)
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Перейти к объявлению",
          uri: chunk.web.uri,
        });
      }
    });

    // Deduplicate sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);

    return {
      text,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Не удалось выполнить поиск. Пожалуйста, попробуйте позже или уточните запрос.");
  }
};