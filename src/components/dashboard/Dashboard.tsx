"use client";
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RobotMap } from './RobotMap';
import { ControlPanel } from './ControlPanel';
import { RobotProvider } from '@/lib/robot-context';
import { RobotData } from '@/lib/types';
import { StatusPanel } from './StatusPanel';

interface DashboardProps {
  initialStatus?: RobotData;
}

export function Dashboard({ initialStatus }: DashboardProps) {
  return (
    <RobotProvider initialStatus={initialStatus}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Sidebar />
        <div className="ml-16">
          <Header />
          <main className="p-6 flex flex-col">
            <div className="flex justify-between mb-6">
              <div className="flex-1 mr-6">
                <RobotMap />
              </div>
              <ControlPanel />
            </div>
            <StatusPanel />
          </main>
        </div>
      </div>
    </RobotProvider>
  );
} 