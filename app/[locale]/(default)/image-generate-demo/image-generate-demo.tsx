"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import Icon from "@/components/icon";

// 导入简化后的组件
import ImageGenerate from "@/components/feature/image-generate";

export default function ImageGenerateDemo() {
  const t = useTranslations();
  const [eventLog, setEventLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]); // 最多保持20条日志
  };

  // 处理生成完成
  const handleGenerateComplete = (result: { imageUrl: string }) => {
    addToLog(`Image generation completed! URL: ${result.imageUrl.substring(0, 50)}...`);
  };

  // 处理生成错误
  const handleGenerateError = (error: string) => {
    addToLog(`Image generation failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">AI Image Generator</h1>
            <p className="text-muted-foreground text-lg">
              Create stunning images with AI - Text to Image and Image to Image
            </p>
          </div>

          {/* 使用说明 */}
          <Alert>
            <Icon name="RiInformationLine" className="h-4 w-4" />
            <AlertDescription>
              This is a simplified version of the <code>ImageGenerate</code> component with default configuration.
              It supports both text-to-image and image-to-image generation with FLUX models.
            </AlertDescription>
          </Alert>

          {/* 主要演示区域 - 独占一行 */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="RiSparkling2Line" className="w-5 h-5" />
                  AI Image Generator
                </CardTitle>
                <CardDescription>
                  Generate high-quality images using advanced AI models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageGenerate
                  onGenerateComplete={handleGenerateComplete}
                  onGenerateError={handleGenerateError}
                />
              </CardContent>
            </Card>
          </div>

          {/* 事件日志和使用说明 - 下方排列 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 事件日志 */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="RiTerminalLine" className="w-5 h-5" />
                    Event Log
                  </CardTitle>
                  <CardDescription>
                    Real-time component events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {eventLog.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No events yet. Start generating images to see logs.
                      </p>
                    ) : (
                      eventLog.map((log, index) => (
                        <div
                          key={index}
                          className="text-xs p-2 bg-muted rounded font-mono"
                        >
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* 使用说明 */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="RiCodeLine" className="w-5 h-5" />
                    Basic Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{`import ImageGenerate from "@/components/feature/image-generate";

// Basic usage
<ImageGenerate 
  onGenerateComplete={(result) => {
    console.log('Generated:', result.imageUrl);
  }}
  onGenerateError={(error) => {
    console.error('Error:', error);
  }}
/>`}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* 功能特性 */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="RiStarLine" className="w-5 h-5" />
                    Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Icon name="RiCheckLine" className="w-4 h-4 text-green-500" />
                      Text to Image generation
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="RiCheckLine" className="w-4 h-4 text-green-500" />
                      Image to Image transformation
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="RiCheckLine" className="w-4 h-4 text-green-500" />
                      Adjustable parameters
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="RiCheckLine" className="w-4 h-4 text-green-500" />
                      Real-time progress tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="RiCheckLine" className="w-4 h-4 text-green-500" />
                      Image download & sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon name="RiCheckLine" className="w-4 h-4 text-green-500" />
                      Drag & drop file upload
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 技术说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="RiRocketLine" className="w-5 h-5" />
                  Simplified Design
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This version removes complex configuration options and uses sensible defaults 
                  for a streamlined user experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="RiSettings3Line" className="w-5 h-5" />
                  Default Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Built-in defaults for FLUX models, API endpoints, parameter ranges, 
                  and UI settings for immediate use.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="RiPuzzleLine" className="w-5 h-5" />
                  Easy Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Simple props interface with optional callbacks for handling 
                  generation results and errors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}