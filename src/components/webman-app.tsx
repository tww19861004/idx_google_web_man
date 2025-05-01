'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { KeyValuePair, RequestData, ResponseData } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestPanel } from '@/components/request-panel';
import { ResponsePanel } from '@/components/response-panel';
import { HistoryPanel } from '@/components/history-panel';
import { sendHttpRequest } from '@/services/http-client';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const LOCAL_STORAGE_HISTORY_KEY = 'webman_request_history';
const LOCAL_STORAGE_CURRENT_REQUEST_KEY = 'webman_current_request';

export function WebmanApp() {
  const [requestData, setRequestData] = useState<RequestData>(() => {
    // Load initial state from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const savedRequest = localStorage.getItem(LOCAL_STORAGE_CURRENT_REQUEST_KEY);
      if (savedRequest) {
        try {
          const parsedRequest = JSON.parse(savedRequest);
          // Ensure headers and params are arrays of KeyValuePair
          parsedRequest.headers = parsedRequest.headers || [];
          parsedRequest.params = parsedRequest.params || [];
          return parsedRequest;
        } catch (e) {
          console.error("Failed to parse saved request:", e);
        }
      }
    }
    return {
      id: Date.now().toString(), // Initial ID
      method: 'GET',
      url: '',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      params: [],
      body: '',
      name: 'New Request' // Default name for new requests
    };
  });

  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequestData[]>([]);
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');
  const { toast } = useToast();

  // Load history from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse history from localStorage:", e);
          setHistory([]); // Reset history if parsing fails
        }
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    }
  }, [history]);

   // Save current request details to localStorage whenever they change
   useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only save if it's not the initial empty state or a restored history item
       if (requestData.url || requestData.body || requestData.headers.length > 1 || requestData.params.length > 0 || requestData.method !== 'GET') {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_REQUEST_KEY, JSON.stringify(requestData));
      }
    }
  }, [requestData]);


  const updateRequestData = (field: keyof RequestData, value: any) => {
    setRequestData(prev => ({ ...prev, [field]: value }));
  };

  const updateKeyValuePairs = (type: 'headers' | 'params', index: number, key: string, value: string) => {
    setRequestData(prev => {
      const updatedPairs = [...prev[type]];
      updatedPairs[index] = { key, value };
      return { ...prev, [type]: updatedPairs };
    });
  };

  const addKeyValuePair = (type: 'headers' | 'params') => {
    setRequestData(prev => ({
      ...prev,
      [type]: [...prev[type], { key: '', value: '' }]
    }));
  };

  const removeKeyValuePair = (type: 'headers' | 'params', index: number) => {
    setRequestData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setResponseData(null); // Clear previous response

    const { url, method, headers, params, body } = requestData;

    if (!url) {
      toast({
        title: "Error",
        description: "URL cannot be empty.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Construct URL with query parameters
    const urlWithParams = new URL(url);
    params.forEach(param => {
      if (param.key) { // Only add params with a key
        urlWithParams.searchParams.append(param.key, param.value);
      }
    });

    // Construct headers object
    const requestHeaders: Record<string, string> = {};
    headers.forEach(header => {
      if (header.key) { // Only add headers with a key
        requestHeaders[header.key] = header.value;
      }
    });

    try {
      const response = await sendHttpRequest({
        url: urlWithParams.toString(),
        method,
        headers: requestHeaders,
        body: method !== 'GET' && method !== 'HEAD' ? body : null,
      });

       const responseData: ResponseData = {
        status: response.statusCode,
        headers: response.headers,
        body: response.body,
        // Add timing and size later if needed
        time: 0,
        size: response.body ? new Blob([response.body]).size : 0, // Calculate size
      };

      setResponseData(responseData);

       // Add to history
      const newHistoryEntry: RequestData = {
        ...requestData,
        id: Date.now().toString(), // Assign a new unique ID for the history entry
        name: requestData.name || `${requestData.method} ${requestData.url.split('?')[0].substring(0, 30)}...`, // Use existing name or generate one
        timestamp: new Date().toISOString(),
      };

      setHistory(prevHistory => {
        // Avoid duplicates based on a composite key (method+url+body) or maybe just keep latest 50?
        const uniqueHistory = [newHistoryEntry, ...prevHistory.filter(h => !(h.method === newHistoryEntry.method && h.url === newHistoryEntry.url && h.body === newHistoryEntry.body))];
        return uniqueHistory.slice(0, 50); // Limit history size
      });

    } catch (error: any) {
      console.error("Request failed:", error);
       const errorMessage = error.message || 'An unknown error occurred';
       setResponseData({
         status: 0, // Indicate error
         headers: {},
         body: JSON.stringify({ error: errorMessage }, null, 2),
         time: 0,
         size: 0,
       });
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = useCallback((historyItem: RequestData) => {
    // Create a copy to avoid modifying the history state directly
    const requestToLoad = { ...historyItem };
    // Ensure headers/params are initialized if missing in the history item
    requestToLoad.headers = requestToLoad.headers || [{ key: 'Content-Type', value: 'application/json' }];
    requestToLoad.params = requestToLoad.params || [];

    setRequestData(requestToLoad);
    setResponseData(null); // Clear response when loading from history
    setActiveTab('request'); // Switch back to request tab
    toast({
      title: "Loaded from History",
      description: `Loaded request: ${historyItem.name || historyItem.url}`,
    });
  }, [toast]);

   const clearHistory = () => {
    setHistory([]);
    toast({
        title: "History Cleared",
        description: "Request history has been cleared.",
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="w-1/4 border-r border-border p-4 flex flex-col">
         <HistoryPanel
          history={history}
          onSelectHistory={loadFromHistory}
          onClearHistory={clearHistory}
          />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center p-4 border-b border-border bg-card">
          <RequestPanel
              requestData={requestData}
              onUpdate={updateRequestData}
              onUpdateKeyValue={updateKeyValuePairs}
              onAddKeyValue={addKeyValuePair}
              onRemoveKeyValue={removeKeyValuePair}
            />
          <Button
            onClick={handleSendRequest}
            disabled={loading || !requestData.url}
            className="ml-4 min-w-[100px]"
            aria-label="Send Request"
            variant="default" // Use default accent color
          >
            <Send className="mr-2 h-4 w-4" />
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {loading && <div className="text-center p-4">Loading...</div>}
          {responseData && <ResponsePanel responseData={responseData} />}
           {!loading && !responseData && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Send a request to see the response here.
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
