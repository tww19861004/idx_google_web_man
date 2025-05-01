'use client';

import React from 'react';
import type { RequestData, KeyValuePair } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestPanelProps {
  requestData: RequestData;
  onUpdate: (field: keyof RequestData, value: any) => void;
  onUpdateKeyValue: (type: 'headers' | 'params', index: number, key: string, value: string) => void;
  onAddKeyValue: (type: 'headers' | 'params') => void;
  onRemoveKeyValue: (type: 'headers' | 'params', index: number) => void;
}

export function RequestPanel({
  requestData,
  onUpdate,
  onUpdateKeyValue,
  onAddKeyValue,
  onRemoveKeyValue,
}: RequestPanelProps) {

  const renderKeyValueInputs = (type: 'headers' | 'params') => (
    <div className="space-y-2">
      {requestData[type].map((item, index) => (
        <div key={`${type}-${index}`} className="flex items-center space-x-2">
          <Input
            placeholder="Key"
            value={item.key}
            onChange={(e) => onUpdateKeyValue(type, index, e.target.value, item.value)}
            className="flex-1"
            aria-label={`${type.slice(0, -1)} Key ${index + 1}`}
          />
          <Input
            placeholder="Value"
            value={item.value}
            onChange={(e) => onUpdateKeyValue(type, index, item.key, e.target.value)}
            className="flex-1"
            aria-label={`${type.slice(0, -1)} Value ${index + 1}`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveKeyValue(type, index)}
            aria-label={`Remove ${type.slice(0, -1)} ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAddKeyValue(type)} aria-label={`Add ${type.slice(0, -1)}`}>
        <Plus className="mr-2 h-4 w-4" /> Add {type.slice(0, -1)}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col space-y-4 w-full">
       {/* Request Name Input */}
        <div className="mb-2">
          <Label htmlFor="requestName" className="sr-only">Request Name</Label>
          <Input
            id="requestName"
            placeholder="Request Name (e.g., Get Users)"
            value={requestData.name || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

      {/* URL and Method Input */}
      <div className="flex space-x-2">
        <Select value={requestData.method} onValueChange={(value) => onUpdate('method', value)}>
          <SelectTrigger className="w-[120px]" aria-label="HTTP Method">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="HEAD">HEAD</SelectItem>
            <SelectItem value="OPTIONS">OPTIONS</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Enter request URL"
          value={requestData.url}
          onChange={(e) => onUpdate('url', e.target.value)}
          className="flex-1"
          aria-label="Request URL"
        />
      </div>

      {/* Tabs for Params, Headers, Body */}
      <Tabs defaultValue="params" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        <TabsContent value="params" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Query Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              {renderKeyValueInputs('params')}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="headers" className="mt-4">
           <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Headers</CardTitle>
            </CardHeader>
            <CardContent>
             {renderKeyValueInputs('headers')}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="body" className="mt-4">
          <Card>
            <CardHeader>
               <CardTitle className="text-base">Request Body</CardTitle>
            </CardHeader>
             <CardContent>
              <Textarea
                placeholder="Enter request body (e.g., JSON)"
                value={requestData.body}
                onChange={(e) => onUpdate('body', e.target.value)}
                rows={6}
                className="font-mono text-sm"
                aria-label="Request Body"
                disabled={requestData.method === 'GET' || requestData.method === 'HEAD'}
              />
              {(requestData.method === 'GET' || requestData.method === 'HEAD') && (
                <p className="text-xs text-muted-foreground mt-2">
                  Body is not applicable for {requestData.method} requests.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
