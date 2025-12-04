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
    // Verify bucket exists
    const [bucketExists] = await bucket.exists();
    if (!bucketExists) {
      throw new Error(
        `Bucket "${bucketName}" does not exist. Please create the bucket or check the bucket name.`,
      );
    }

    // Upload PDF to GCS
    await file.save(pdfBuffer, {
      contentType: "application/pdf",
      metadata: {
        cacheControl: "no-cache",
      },
    });

    // Verify file was uploaded
    const [fileExists] = await file.exists();
    if (!fileExists) {
      throw new Error(
        `Failed to upload file to GCS. File ${fileName} was not found after upload.`,
      );
    }

    console.log(`PDF uploaded to GCS: ${gcsUri}`);

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

    console.log("Vision API operation started, waiting for completion...");

    // Wait for operation to complete
    // The promise() method returns a promise that resolves when the operation is done
    const [response] = await operation.promise();
    
    if (!response) {
      throw new Error("Operation completed but no response was returned");
    }

    console.log("Vision API operation completed, fetching results from GCS...");

    // Wait a bit for results to be written to GCS (sometimes there's a delay)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get results from GCS
    const [files] = await bucket.getFiles({
      prefix: resultPrefix,
    });

    console.log(`Found ${files.length} result file(s) in GCS with prefix ${resultPrefix}`);

    if (files.length === 0) {
      // List all files in results/ to help debug
      const [allResultFiles] = await bucket.getFiles({
        prefix: "results/",
      });
      console.log(
        `Available result files: ${allResultFiles.map((f) => f.name).join(", ")}`,
      );
      throw new Error(
        `No result files found in GCS with prefix "${resultPrefix}". Operation may have failed.`,
      );
    }

    // Find the result file (should be JSON)
    const resultFile = files.find((f: { name: string }) => f.name.endsWith(".json"));
    if (!resultFile) {
      console.log(
        `Available files: ${files.map((f) => f.name).join(", ")}`,
      );
      throw new Error(
        `No JSON result file found. Found files: ${files.map((f) => f.name).join(", ")}`,
      );
    }

    // Track result files for cleanup
    resultFiles = files.map((f: { name: string }) => f.name);

    // Download and parse results
    const [resultContent] = await resultFile.download();
    const resultJsonString = resultContent.toString();
    
    console.log(`Result file size: ${resultContent.length} bytes`);
    
    let resultJson: unknown;

    try {
      resultJson = JSON.parse(resultJsonString);
    } catch (parseError) {
      console.error("Failed to parse result JSON:", resultJsonString.substring(0, 500));
      throw new Error(
        `Failed to parse result JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
      );
    }

    // Log the structure for debugging
    const jsonKeys = Object.keys(resultJson as Record<string, unknown>);
    console.log("Result JSON keys:", jsonKeys);
    console.log("Result JSON sample (first 2000 chars):", JSON.stringify(resultJson, null, 2).substring(0, 2000));

    // Check for errors first
    const errorObj = (resultJson as { error?: unknown })?.error;
    if (errorObj) {
      console.error("Vision API returned an error:", JSON.stringify(errorObj, null, 2));
      throw new Error(
        `Vision API error: ${JSON.stringify(errorObj)}`,
      );
    }

    // Extract text from all pages
    // Vision API async batch annotation can return different structures:
    // Structure 1: { responses: [{ responses: [{ fullTextAnnotation: { text: "..." } }] }] }
    // Structure 2: { responses: [{ fullTextAnnotation: { text: "..." } }] } (flatter)
    const textParts: string[] = [];
    
    const responses = (resultJson as { responses?: unknown })?.responses;
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.error("No responses array found. Full JSON:", JSON.stringify(resultJson, null, 2));
      throw new Error(
        "No responses found in Vision API result. The PDF may be empty or the operation may have failed.",
      );
    }

    console.log(`Processing ${responses.length} response(s) from Vision API`);

    // Process each response (each file/page)
    // Type assertion: we've verified responses is an array, but elements are unknown
    const responsesArray = responses as Array<Record<string, unknown>>;
    for (let i = 0; i < responsesArray.length; i++) {
      const fileResponse = responsesArray[i];
      
      if (!fileResponse || typeof fileResponse !== "object") {
        console.log(`Response ${i} is not an object, skipping`);
        continue;
      }

      // Check for errors in this response
      const responseError = (fileResponse as { error?: unknown })?.error;
      if (responseError) {
        console.error(`Response ${i} has error:`, JSON.stringify(responseError, null, 2));
        continue;
      }

      // Try nested structure first: response.responses[]
      let annotations: unknown[] = [];
      const nestedResponses = (fileResponse as { responses?: unknown })?.responses;
      
      // If nested responses exist and is an array, use it
      if (Array.isArray(nestedResponses)) {
        annotations = nestedResponses;
      } else {
        // If no nested responses, try direct structure: response is the annotation itself
        console.log(`Response ${i} has no nested responses, trying direct structure`);
        annotations = [fileResponse];
      }

      console.log(`Response ${i} has ${annotations.length} annotation(s)`);

      // Process each annotation (each page)
      for (let j = 0; j < annotations.length; j++) {
        const annotation = annotations[j];
        
        if (!annotation || typeof annotation !== "object") {
          console.log(`Annotation ${j} in response ${i} is not an object, skipping`);
          continue;
        }

        // Check for error in annotation
        const annotationError = (annotation as { error?: unknown })?.error;
        if (annotationError) {
          console.error(`Annotation ${j} in response ${i} has error:`, JSON.stringify(annotationError, null, 2));
          continue;
        }

        // Try to get fullTextAnnotation
        const fullTextAnnotation = (annotation as { fullTextAnnotation?: unknown })
          ?.fullTextAnnotation;

        if (fullTextAnnotation && typeof fullTextAnnotation === "object") {
          const text = (fullTextAnnotation as { text?: string })?.text;
          if (text && typeof text === "string" && text.trim()) {
            console.log(`Found text in annotation ${j} of response ${i}: ${text.substring(0, 100)}...`);
            textParts.push(text.trim());
          } else {
            console.log(`Annotation ${j} in response ${i} has fullTextAnnotation but no text property`);
          }
        } else {
          console.log(`Annotation ${j} in response ${i} has no fullTextAnnotation. Keys:`, Object.keys(annotation));
        }
      }
    }

    console.log(`Extracted text from ${textParts.length} page(s)`);

    const extractedText = textParts.join("\n\n").trim();

    if (!extractedText) {
      console.error("Full result JSON structure:", JSON.stringify(resultJson, null, 2));
      throw new Error(
        "No text could be extracted from the PDF. The PDF may be empty, corrupted, or the Vision API may not have detected any text. Check the console logs for the full response structure.",
      );
    }

    console.log(`Successfully extracted ${extractedText.length} characters from PDF`);
    return extractedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF: Unknown error");
  } finally {
    // Clean up: delete uploaded PDF and result files from GCS
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
      console.log(
        `Cleaned up GCS files: ${fileName} and ${resultFiles.length} result file(s)`,
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

