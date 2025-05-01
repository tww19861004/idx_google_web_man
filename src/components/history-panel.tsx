'use client';

import React from 'react';
import type { RequestData } from '@/lib/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // For relative time

interface HistoryPanelProps {
  history: RequestData[];
  onSelectHistory: (item: RequestData) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({ history, onSelectHistory, onClearHistory }: HistoryPanelProps) {

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-green-500';
      case 'POST': return 'text-blue-500';
      case 'PUT': return 'text-yellow-500';
      case 'DELETE': return 'text-red-500';
      case 'PATCH': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">History</CardTitle>
         {history.length > 0 && (
             <Button variant="ghost" size="sm" onClick={onClearHistory} className="text-destructive hover:text-destructive">
                 <Trash2 className="h-4 w-4 mr-1" /> Clear All
            </Button>
         )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No request history yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className="w-full h-auto justify-start p-2 text-left flex flex-col items-start space-y-1"
                    onClick={() => onSelectHistory(item)}
                  >
                     <div className="flex justify-between w-full">
                      <span className={`font-semibold text-xs ${getMethodColor(item.method)}`}>{item.method}</span>
                      {item.timestamp && (
                         <span className="text-xs text-muted-foreground">
                           {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                       )}
                     </div>
                    <span className="text-sm font-medium truncate w-full" title={item.name || item.url}>
                       {item.name || item.url}
                     </span>
                    <span className="text-xs text-muted-foreground truncate w-full" title={item.url}>
                      {item.url}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
