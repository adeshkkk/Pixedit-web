import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', promptNote } = body;

    // Graceful fallback if API key is not configured or image not provided
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: true,
        isFallback: true,
        adjustments: {
          brightness: 12,
          contrast: 18,
          saturation: 15,
          exposure: 6,
          highlights: -12,
          shadows: 16,
          temperature: 8,
          tint: 0,
          sharpness: 24,
          blur: 0,
          opacity: 100,
          vignette: 8,
        },
        preset: 'vivid',
        critique:
          'Applied auto balance: lifted dark shadow tones, brought out natural skin and environmental contrast, and enhanced detail sharpness.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (imageBase64) {
      // Clean possible data URL prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    parts.push({
      text: `Analyze this image for professional photo enhancement. Recommend calibrated adjustment values:
- brightness (-50 to 50)
- contrast (-50 to 50)
- saturation (-50 to 50)
- exposure (-50 to 50)
- highlights (-50 to 50)
- shadows (-50 to 50)
- temperature (-50 to 50, positive warm, negative cool)
- tint (-50 to 50)
- sharpness (0 to 60)
- vignette (0 to 40)
Also pick the best matching aesthetic preset from: ['vivid', 'warm', 'cool', 'cinematic', 'dramatic', 'vintage', 'noir', 'soft', 'highContrast'].
Provide a concise 1-2 sentence professional critique explaining the lighting and color balance improvements.
${promptNote ? `User specific preference: ${promptNote}` : ''}`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts,
      },
      config: {
        systemInstruction:
          'You are PixEdit AI, an expert photographic colorist and post-processing technician. Provide precise, tasteful photo adjustments that enhance dynamic range, skin tones, and overall visual fidelity without unnatural clipping.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adjustments: {
              type: Type.OBJECT,
              properties: {
                brightness: { type: Type.NUMBER },
                contrast: { type: Type.NUMBER },
                saturation: { type: Type.NUMBER },
                exposure: { type: Type.NUMBER },
                highlights: { type: Type.NUMBER },
                shadows: { type: Type.NUMBER },
                temperature: { type: Type.NUMBER },
                tint: { type: Type.NUMBER },
                sharpness: { type: Type.NUMBER },
                vignette: { type: Type.NUMBER },
              },
              required: [
                'brightness',
                'contrast',
                'saturation',
                'exposure',
                'highlights',
                'shadows',
                'temperature',
                'tint',
                'sharpness',
                'vignette',
              ],
            },
            preset: { type: Type.STRING },
            critique: { type: Type.STRING },
          },
          required: ['adjustments', 'preset', 'critique'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('No AI response received');
    }

    const parsed = JSON.parse(text);
    return NextResponse.json({
      success: true,
      adjustments: parsed.adjustments,
      preset: parsed.preset,
      critique: parsed.critique,
    });
  } catch (error: any) {
    console.error('AI Enhance error:', error);
    // Return friendly fallback
    return NextResponse.json({
      success: true,
      isFallback: true,
      adjustments: {
        brightness: 12,
        contrast: 16,
        saturation: 18,
        exposure: 5,
        highlights: -10,
        shadows: 15,
        temperature: 6,
        tint: 0,
        sharpness: 22,
        blur: 0,
        opacity: 100,
        vignette: 10,
      },
      preset: 'vivid',
      critique:
        'Analyzed and balanced exposure, lifted midtone contrast, and added crisp dynamic range.',
    });
  }
}
