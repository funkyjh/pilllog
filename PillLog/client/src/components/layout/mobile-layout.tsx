import { ReactNode } from "react";
import TabNavigation from "./tab-navigation";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">MedTracker</h1>
          <div className="flex items-center space-x-3">
            <button className="text-white hover:text-gray-200">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <button className="text-white hover:text-gray-200">
              <i className="fas fa-user-circle text-2xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <a href="/" className="flex flex-col items-center py-2 px-4 text-primary">
            <i className="fas fa-camera text-lg"></i>
            <span className="text-xs mt-1">업로드</span>
          </a>
          <a href="/medications" className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-primary">
            <i className="fas fa-pills text-lg"></i>
            <span className="text-xs mt-1">나의 약</span>
          </a>
          <a href="/symptoms" className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-primary">
            <i className="fas fa-chart-line text-lg"></i>
            <span className="text-xs mt-1">증상 기록</span>
          </a>
          <button className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-primary">
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">내 정보</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
