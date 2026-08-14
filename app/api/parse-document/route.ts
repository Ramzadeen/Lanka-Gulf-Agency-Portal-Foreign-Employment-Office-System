import { GoogleGenAI, Type, Schema } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const documentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullNameEnglish: {
      type: Type.STRING,
      description: 'Full legal name in English as written on the Sri Lankan passport or NIC.',
    },
    fullNameSinhala: {
      type: Type.STRING,
      description: 'Full name transcribed or extracted in Sinhala script (සිංහල).',
    },
    fullNameTamil: {
      type: Type.STRING,
      description: 'Full name transcribed or extracted in Tamil script (தமிழ்).',
    },
    passportNumber: {
      type: Type.STRING,
      description: 'Sri Lankan Passport number starting with N, L, or similar.',
    },
    nicNumber: {
      type: Type.STRING,
      description: 'Old format (9 digits + V/X) or New format (12 digits) National Identity Card number.',
    },
    dateOfBirth: {
      type: Type.STRING,
      description: 'Date of birth strictly in YYYY-MM-DD format.',
    },
    gender: {
      type: Type.STRING,
      enum: ['Male', 'Female'],
      description: 'Candidate gender.',
    },
    address: {
      type: Type.STRING,
      description: 'Permanent residential address in Sri Lanka.',
    },
    suggestedJobCategory: {
      type: Type.STRING,
      description: 'Inferred or stated occupation/trade (e.g., Driver, Housemaid, Electrician, Welder).',
    },
  },
  required: ['fullNameEnglish', 'passportNumber', 'nicNumber', 'dateOfBirth', 'gender'],
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No document image file provided.' },
        { status: 400 }
      );
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a JPEG, PNG, WEBP, or PDF.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    const prompt = `
      You are an expert document verification specialist for Sri Lankan foreign employment agencies regulated by the SLBFE.
      Analyze the provided document (Sri Lankan Passport, National Identity Card / NIC, or Vocational Certificate).
      
      Tasks:
      1. Extract all identity parameters with high precision.
      2. If Sinhala or Tamil script is present, extract it directly. If only English is present, provide phonetically accurate transliterations into both Sinhala (සිංහල) and Tamil (தமிழ்).
      3. Standardize dates to YYYY-MM-DD.
      4. Ensure passport numbers follow the Sri Lankan Department of Immigration standard format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: documentSchema,
      },
    });

    if (!response.text) {
      throw new Error('Empty response received from document analysis engine.');
    }

    const parsedData = JSON.parse(response.text);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Document parsing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
