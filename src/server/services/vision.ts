import { Storage } from "@google-cloud/storage";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { env } from "~/env";
import { randomUUID } from "crypto";

interface VisionClientOptions {
  projectId: string;
  keyFilename: string;
}

let visionClient: ImageAnnotatorClient | null = null;
let storageClient: Storage | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (visionClient) {
    return visionClient;
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
  visionClient = new ImageAnnotatorClient(
    credentials as ConstructorParameters<typeof ImageAnnotatorClient>[0],
  );

  return visionClient;
}

function getStorageClient(): Storage {
  if (storageClient) {
    return storageClient;
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

  storageClient = new Storage(
    credentials as ConstructorParameters<typeof Storage>[0],
  );

  return storageClient;
}

/**
 * Extract text from PDF using Google Cloud Storage and Vision API
 * Uploads PDF to GCS, processes with Vision API async batch annotation, then cleans up
 * @param pdfBuffer - Buffer containing the PDF file
 * @returns Extracted text from all pages of the PDF
 */
export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  if (!env.GOOGLE_CLOUD_STORAGE_BUCKET) {
    throw new Error(
      "GOOGLE_CLOUD_STORAGE_BUCKET is required. Please set the GCS bucket name in your environment variables.",
    );
  }

  const bucketName = env.GOOGLE_CLOUD_STORAGE_BUCKET;
  const fileId = randomUUID();
  const fileName = `pdfs/${fileId}.pdf`;
  const resultPrefix = `results/${fileId}`;
  const gcsUri = `gs://${bucketName}/${fileName}`;

  const storage = getStorageClient();
  const vision = getVisionClient();
  const bucket = storage.bucket(bucketName);

  // Declare file outside try block for cleanup
  const file = bucket.file(fileName);
  let resultFiles: string[] = [];

  try {
    // Upload PDF to GCS
    await file.save(pdfBuffer, {
      contentType: "application/pdf",
    });

    // Start async batch annotation
    const [operation] = await vision.asyncBatchAnnotateFiles({
      requests: [
        {
          inputConfig: {
            gcsSource: {
              uri: gcsUri,
            },
            mimeType: "application/pdf",
          },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          outputConfig: {
            gcsDestination: {
              uri: `gs://${bucketName}/${resultPrefix}/`,
            },
            batchSize: 1,
          },
        },
      ],
    });

    // Wait for operation to complete
    // The promise() method returns a promise that resolves when the operation is done
    const [response] = await operation.promise();
    
    if (!response) {
      throw new Error("Operation completed but no response was returned");
    }

    // Get results from GCS
    const [files] = await bucket.getFiles({
      prefix: resultPrefix,
    });

    // Find the result file (should be JSON)
    const resultFile = files.find((f: { name: string }) => f.name.endsWith(".json"));
    if (!resultFile) {
      throw new Error("No result file found in GCS");
    }

    // Track result files for cleanup
    resultFiles = files.map((f: { name: string }) => f.name);

    // Download and parse results
    const [resultContent] = await resultFile.download();
    const resultJson = JSON.parse(resultContent.toString()) as {
      responses?: Array<{
        responses?: Array<{
          fullTextAnnotation?: {
            text?: string;
          };
        }>;
      }>;
    };

    // Extract text from all pages
    const textParts: string[] = [];
    for (const response of resultJson.responses ?? []) {
      for (const annotation of response.responses ?? []) {
        if (annotation.fullTextAnnotation?.text) {
          textParts.push(annotation.fullTextAnnotation.text);
        }
      }
    }

    const extractedText = textParts.join("\n\n").trim();

    if (!extractedText) {
      throw new Error(
        "No text could be extracted from the PDF. The PDF may be empty or corrupted.",
      );
    }

    return extractedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF: Unknown error");
  } finally {
    // Clean up: delete uploaded PDF and result files
    try {
      await file.delete().catch(() => {
        // Ignore if file doesn't exist
      });
      await Promise.all(
        resultFiles.map((fileName) =>
          bucket.file(fileName).delete().catch(() => {
            // Ignore if file doesn't exist
          }),
        ),
      );
    } catch (cleanupError) {
      // Log but don't throw - cleanup errors shouldn't fail the operation
      console.error("Error cleaning up GCS files:", cleanupError);
    }
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
