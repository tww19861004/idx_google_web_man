import type { HttpRequest, HttpResponse } from '@/lib/types'; // Assuming types are defined here

/**
 * Sends an HTTP request using the native fetch API and returns the response.
 *
 * @param request The HTTP request configuration.
 * @returns A promise that resolves to an HttpResponse object.
 * @throws Throws an error if the fetch request itself fails (e.g., network error).
 */
export async function sendHttpRequest(request: HttpRequest): Promise<HttpResponse> {
  const { url, method, headers, body } = request;

  const requestOptions: RequestInit = {
    method: method,
    headers: headers,
    // Only include body for methods that allow it
    body: (method !== 'GET' && method !== 'HEAD') ? body : undefined,
  };

  try {
    const response = await fetch(url, requestOptions);

    // Process headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Read response body as text
    const responseBody = await response.text();

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: responseBody,
      // TODO: Add timing and accurate size calculation if needed
      time: 0, // Placeholder
      size: responseBody ? new Blob([responseBody]).size : 0, // Estimate size
    };
  } catch (error) {
    // Handle network errors or other fetch-related issues
    console.error("HTTP Request failed:", error);
    // Re-throw the error or return a custom error response
     if (error instanceof Error) {
        throw new Error(`Network error: ${error.message}`);
    } else {
        throw new Error("An unknown network error occurred");
    }
  }
}
