/**
 * Bank Statement Parser
 * 
 * Parses OCR text from bank statements to extract transaction data.
 * Supports various bank statement formats and extracts:
 * - Transaction dates
 * - Amounts (with credit/debit detection)
 * - Descriptions/merchants
 * - Transaction types
 * - Account balances
 * - Reference numbers
 */

export interface ParsedTransaction {
  date: Date;
  amount: number; // Positive for credits, negative for debits
  description: string;
  merchant?: string;
  transactionType?: string;
  balance?: number;
  referenceNumber?: string;
  currency: string;
}

interface ParseOptions {
  currency?: string;
  dateFormat?: "US" | "EU" | "ISO"; // US: MM/DD/YYYY, EU: DD/MM/YYYY, ISO: YYYY-MM-DD
}

/**
 * Parse bank statement text and extract transactions
 */
export function parseBankStatement(
  text: string,
  options: ParseOptions = {},
): ParsedTransaction[] {
  const { currency = "USD", dateFormat = "US" } = options;
  const transactions: ParsedTransaction[] = [];

  // Normalize text - remove extra whitespace and normalize line breaks
  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Split into lines for processing
  const lines = normalizedText.split("\n").map((line) => line.trim());

  // Common patterns for bank statements
  const datePatterns = {
    US: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // MM/DD/YYYY
    EU: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // DD/MM/YYYY (same pattern, different interpretation)
    ISO: /(\d{4})-(\d{1,2})-(\d{1,2})/g, // YYYY-MM-DD
  };

  // More flexible amount patterns - handles various formats
  const amountPattern = /([+-]?)\$?\s*([\d,]+\.?\d*)/g;
  // Also try patterns without $ sign
  const amountPatternNoSign = /([+-]?)([\d,]+\.?\d{2})\b/g;

  // Try to find transaction blocks
  // Common patterns:
  // 1. Date | Description | Amount | Balance
  // 2. Date Description Amount
  // 3. MM/DD Description $Amount

  let currentDate: Date | null = null;
  let currentBalance: number | undefined;
  let lastSeenDate: Date | null = null;

  // First pass: extract all dates and amounts, then match them
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // Try to extract date (more flexible - also try MM/DD format)
    const dateRegex = new RegExp(datePatterns[dateFormat]);
    const dateMatch = dateRegex.exec(line);
    
      // Also try MM/DD format (without year, assume current year)
      if (!dateMatch) {
        const shortDateRegex = /(\d{1,2})\/(\d{1,2})(?:\s|$)/;
        const shortMatch = shortDateRegex.exec(line);
        if (shortMatch) {
          const [, month, day] = shortMatch;
          if (month && day) {
            const now = new Date();
            currentDate = new Date(
              now.getFullYear(),
              parseInt(month, 10) - 1,
              parseInt(day, 10),
            );
            lastSeenDate = currentDate;
          }
        }
      } else {
      const dateStr = dateMatch[0];
      if (dateFormat === "US") {
        const datePartsRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
        const datePartsMatch = datePartsRegex.exec(dateStr);
        if (datePartsMatch) {
          const [, month, day, year] = datePartsMatch;
          if (month && day && year) {
            currentDate = new Date(
              parseInt(year, 10),
              parseInt(month, 10) - 1,
              parseInt(day, 10),
            );
            lastSeenDate = currentDate;
          }
        }
      } else if (dateFormat === "EU") {
        const datePartsRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
        const datePartsMatch = datePartsRegex.exec(dateStr);
        if (datePartsMatch) {
          const [, day, month, year] = datePartsMatch;
          if (day && month && year) {
            currentDate = new Date(
              parseInt(year, 10),
              parseInt(month, 10) - 1,
              parseInt(day, 10),
            );
            lastSeenDate = currentDate;
          }
        }
      } else if (dateFormat === "ISO") {
        currentDate = new Date(dateStr);
        lastSeenDate = currentDate;
      }
    }

    // Try to extract amount (try both patterns)
    let amountMatches = Array.from(line.matchAll(amountPattern));
    if (amountMatches.length === 0) {
      amountMatches = Array.from(line.matchAll(amountPatternNoSign));
    }

    // Use current date or last seen date
    const dateToUse = currentDate ?? lastSeenDate;

    if (amountMatches.length > 0 && dateToUse) {
      for (const match of amountMatches) {
        const sign = match[1] === "-" ? -1 : 1;
        const amountStr = match[2]?.replace(/,/g, "") ?? "";
        const amount = parseFloat(amountStr) * sign;

        // More lenient amount check - accept amounts > 0.001
        if (!isNaN(amount) && Math.abs(amount) > 0.001) {
          // Extract description (everything except date and amount)
          let description = line
            .replace(new RegExp(datePatterns[dateFormat]), "")
            .replace(amountPattern, "")
            .replace(amountPatternNoSign, "")
            .trim();

          // Clean up description
          description = description
            .replace(/\s+/g, " ")
            .replace(/^[^\w]+|[^\w]+$/g, "")
            .trim();

          // If description is empty, try to get context from previous/next lines
          if (description.length === 0 && i > 0) {
            description = lines[i - 1]?.trim() ?? "";
          }

          if (description.length > 0) {
            // Try to extract merchant name (usually first part of description)
            const merchantRegex = /^([A-Z][A-Z\s&]+)/;
            const merchantMatch = merchantRegex.exec(description);
            const merchant = merchantMatch?.[1]?.trim();

            // Try to extract transaction type
            const transactionType = extractTransactionType(description);

            // Try to extract reference number
            const refRegex = /(?:REF|REF#|REFERENCE)[\s:]*([A-Z0-9-]+)/i;
            const refMatch = refRegex.exec(description);
            const referenceNumber = refMatch?.[1];

            transactions.push({
              date: new Date(dateToUse),
              amount,
              description,
              merchant,
              transactionType,
              balance: currentBalance,
              referenceNumber,
              currency,
            });
          }
        }
      }
    }

    // Try to extract balance
    const balanceRegex = /balance[:\s]+([+-]?)\$?([\d,]+\.?\d*)/i;
    const balanceMatch = balanceRegex.exec(line);
    if (balanceMatch) {
      const sign = balanceMatch[1] === "-" ? -1 : 1;
      const balanceStr = balanceMatch[2]?.replace(/,/g, "") ?? "";
      currentBalance = parseFloat(balanceStr) * sign;
    }
  }

  // Sort transactions by date
  transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  return transactions;
}

/**
 * Extract transaction type from description
 */
function extractTransactionType(description: string): string | undefined {
  const lowerDesc = description.toLowerCase();

  // Common transaction types
  if (lowerDesc.includes("payment") || lowerDesc.includes("transfer")) {
    return "PAYMENT";
  }
  if (lowerDesc.includes("deposit") || lowerDesc.includes("credit")) {
    return "DEPOSIT";
  }
  if (lowerDesc.includes("withdrawal") || lowerDesc.includes("debit")) {
    return "WITHDRAWAL";
  }
  if (lowerDesc.includes("fee") || lowerDesc.includes("charge")) {
    return "FEE";
  }
  if (lowerDesc.includes("interest")) {
    return "INTEREST";
  }
  if (lowerDesc.includes("refund")) {
    return "REFUND";
  }
  if (lowerDesc.includes("subscription") || lowerDesc.includes("recurring")) {
    return "SUBSCRIPTION";
  }

  return undefined;
}

/**
 * Normalize merchant name from description
 */
export function normalizeMerchantName(description: string): string {
  return description
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .substring(0, 255); // Limit length
}


