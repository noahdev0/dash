'use client';

import { ManualControl } from "@/components/ManualControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ManualPage() {
  return (
    <div className="min-h-max bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manual Control</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ManualControl />
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">WebSocket Server</span>
                    <span className="text-sm text-muted-foreground">192.168.33.97:3000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ESP32 IP</span>
                    <span className="text-sm text-muted-foreground">192.168.33.97</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                  <li>Always ensure the robot is in a safe area before controlling</li>
                  <li>Keep hands and objects away from moving parts</li>
                  <li>Use the stop button immediately if any issues occur</li>
                  <li>Monitor battery levels and connection status</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
