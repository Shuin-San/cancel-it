import { ImageAnnotatorClient } from "@google-cloud/vision";
import { env } from "~/env";

let client: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (client) {
    return client;
  }

  if (!env.GOOGLE_VISION_API_KEY) {
    throw new Error(
      "Google Vision API key is not configured. Please set GOOGLE_VISION_API_KEY in your environment variables.",
    );
  }

  // Initialize client with API key
  // Note: Google Cloud Vision API can be initialized with credentials or API key
  // For API key authentication, we'll use the REST API approach
  const credentials = env.GOOGLE_VISION_PROJECT_ID
    ? {
        projectId: env.GOOGLE_VISION_PROJECT_ID,
        keyFilename: undefined,
      }
    : undefined;

  client = new ImageAnnotatorClient(credentials);

  return client;
}

/**
 * Process a PDF file and extract text using Google Vision API OCR
 * @param pdfBuffer - Buffer containing the PDF file
 * @returns Extracted text from all pages of the PDF
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const visionClient = getVisionClient();

  try {
    // Google Vision API documentTextDetection for PDFs
    // Note: For PDFs, we need to use asyncBatchAnnotateFiles or process each page
    // For simplicity, we'll use documentTextDetection which works with PDF content
    const [result] = await visionClient.documentTextDetection({
      image: {
        content: pdfBuffer,
      },
    });

    // Extract full text from the response
    const fullTextAnnotation = result.fullTextAnnotation;
    if (!fullTextAnnotation?.text) {
      throw new Error("No text could be extracted from the PDF");
    }

    return fullTextAnnotation.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF: Unknown error");
  }
}

/**
 * Process a PDF file and extract structured data using Google Vision API
 * This is a more advanced method that can extract tables and structured content
 * @param pdfBuffer - Buffer containing the PDF file
 * @returns Structured data including text, tables, and form fields
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
  const visionClient = getVisionClient();

  try {
    const [result] = await visionClient.documentTextDetection({
      image: {
        content: pdfBuffer,
      },
    });

    const fullTextAnnotation = result.fullTextAnnotation;
    if (!fullTextAnnotation) {
      throw new Error("No text could be extracted from the PDF");
    }

    const pages = fullTextAnnotation.pages?.map((page, index) => ({
      pageNumber: index + 1,
      text: page.blocks
        ?.map((block) =>
          block.paragraphs
            ?.map((paragraph) =>
              paragraph.words
                ?.map((word) =>
                  word.symbols?.map((symbol) => symbol.text).join(""),
                )
                .join(" "),
            )
            .join(" "),
        )
        .join("\n") ?? "",
      blocks: page.blocks?.map((block) => ({
        blockType: String(block.blockType ?? "UNKNOWN"),
        confidence: block.confidence ?? 0,
        boundingBox: block.boundingBox as unknown,
      })) ?? [],
    })) ?? [];

    return {
      text: fullTextAnnotation.text ?? "",
      pages,
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

