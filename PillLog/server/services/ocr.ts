import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    const [result] = await client.textDetection({
      image: {
        content: imageBuffer,
      },
      imageContext: {
        languageHints: ['ko', 'en'], // Korean and English
      },
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      throw new Error('No text detected in image');
    }

    // The first annotation contains the entire detected text
    return detections[0].description || '';
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}
