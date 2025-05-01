'use client';

import React from 'react';
import type { ResponseData } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ResponsePanelProps {
  responseData: ResponseData;
}

export function ResponsePanel({ responseData }: ResponsePanelProps) {
  const { status, headers, body, time, size } = responseData;

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-yellow-500';
    if (status >= 400 && status < 500) return 'bg-orange-500';
    if (status >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  }

  let formattedBody = body;
  try {
    // Attempt to parse and prettify if it's JSON
    const parsedJson = JSON.parse(body);
    formattedBody = JSON.stringify(parsedJson, null, 2);
  } catch (e) {
    // If parsing fails, keep the original body (could be HTML, plain text, etc.)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Response</CardTitle>
        <div className="flex items-center space-x-4 text-sm">
           {status > 0 && (
             <Badge variant={status >= 400 ? "destructive" : "secondary"} className={`${getStatusColor(status)} text-white`}>
               Status: {status}
             </Badge>
           )}
           {/* <Badge variant="outline">Time: {time}ms</Badge> */}
           <Badge variant="outline">Size: {formatBytes(size)}</Badge>
         </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs defaultValue="body" className="h-full flex flex-col">
          <TabsList className="px-4 border-b">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers ({Object.keys(headers).length})</TabsTrigger>
          </TabsList>
          <TabsContent value="body" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                {formattedBody || <span className="text-muted-foreground">No response body.</span>}
              </pre>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="headers" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Header</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(headers).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium break-all">{key}</TableCell>
                      <TableCell className="break-all">{value}</TableCell>
                    </TableRow>
                  ))}
                  {Object.keys(headers).length === 0 && (
                     <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                         No headers received.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
