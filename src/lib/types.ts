export interface KeyValuePair {
  key: string;
  value: string;
}

export interface RequestData {
  id: string; // Unique identifier for the request/history item
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  name?: string; // Optional user-defined name for the request
  timestamp?: string; // For history items
}

export interface ResponseData {
  status: number;
  headers: Record<string, string>;
  body: string;
  time: number; // Response time in milliseconds
  size: number; // Response size in bytes
}


/**
 * Represents the structure of an HTTP request for the client function.
 */
export interface HttpRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

/**
 * Represents the structure of an HTTP response from the client function.
 */
export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  time: number; // Optional: include timing info if desired
  size: number; // Optional: include size info if desired
}
