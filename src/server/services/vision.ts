import { ImageAnnotatorClient } from "@google-cloud/vision";
import { env } from "~/env";

interface VisionClientOptions {
  projectId: string;
  keyFilename: string;
}

let client: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (client) {
    return client;
  }

  if (!env.GOOGLE_VISION_PROJECT_ID) {
    throw new Error(
      "GOOGLE_VISION_PROJECT_ID is required. Please configure your Google Cloud Vision service account.",
    );
  }

  if (!env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS is required. Please set the path to your service account JSON file.",
    );
  }

  const credentials: VisionClientOptions = {
    projectId: env.GOOGLE_VISION_PROJECT_ID,
    keyFilename: env.GOOGLE_APPLICATION_CREDENTIALS,
  };

  // Type assertion needed because Google Cloud client constructor accepts flexible options
  client = new ImageAnnotatorClient(
    credentials as ConstructorParameters<typeof ImageAnnotatorClient>[0],
  );

  return client;
}

/**
 * Extract text from PDF using service account authentication
 * Note: Google Vision API requires PDFs to be in Google Cloud Storage for native PDF support.
 * For now, we use pdf-parse for text extraction. For scanned PDFs, consider converting
 * pages to images and using the Vision API client's documentTextDetection method.
 * @param pdfBuffer - Buffer containing the PDF file
 * @returns Extracted text from all pages of the PDF
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Ensure service account client is initialized (validates credentials)
    getVisionClient();

    // For text-based PDFs, use pdf-parse
    // Note: For full Vision API PDF support with service account, PDFs need to be in GCS
    // and processed via asyncBatchAnnotateFiles. For scanned PDFs, convert pages to images
    // and use the Vision API client's documentTextDetection method.
    const pdfParseModule = await import("pdf-parse");
    
    // pdf-parse exports the function - handle both ESM default and direct export
    const pdfParse = (pdfParseModule as unknown as { default?: unknown })?.default ?? pdfParseModule;
    
    if (typeof pdfParse !== "function") {
      throw new Error(
        `Failed to load pdf-parse: expected function but got ${typeof pdfParse}. Please ensure pdf-parse is properly installed.`,
      );
    }
    
    const data = await (pdfParse as (buffer: Buffer) => Promise<{ text: string }>)(pdfBuffer);
    const text = data.text?.trim() ?? "";

    if (text.length > 100) {
      return text;
    }

    // If pdf-parse didn't work, the PDF is likely scanned
    // For scanned PDFs, you would need to:
    // 1. Convert PDF pages to images
    // 2. Use getVisionClient().documentTextDetection() for each image
    throw new Error(
      "Unable to extract text from PDF. This PDF appears to be scanned or image-based. Please use a PDF with selectable text, or implement image conversion for scanned PDFs.",
    );
  } catch (error) {
    if (error instanceof Error) {
      // If it's already our error, re-throw it
      if (
        error.message.includes("Unable to extract text") ||
        error.message.includes("GOOGLE_VISION_PROJECT_ID")
      ) {
        throw error;
      }
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF: Unknown error");
  }
}

/**
 * Extract structured data from PDF
 * @param pdfBuffer - Buffer containing the PDF file
 * @returns Structured data including text and pages
 */
export async function extractStructuredDataFromPdf(
  pdfBuffer: Buffer,
): Promise<{
  text: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    blocks: Array<{
      blockType: string;
      confidence: number;
      boundingBox: unknown;
    }>;
  }>;
}> {
  try {
    const text = await extractTextFromPdf(pdfBuffer);
    
    return {
      text,
      pages: [
        {
          pageNumber: 1,
          text,
          blocks: [],
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to extract structured data from PDF: ${error.message}`,
      );
    }
    throw new Error(
      "Failed to extract structured data from PDF: Unknown error",
    );
  }
}
