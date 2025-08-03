import { useLocation } from "wouter";

export default function TabNavigation() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "업로드", icon: "fas fa-camera" },
    { path: "/medications", label: "나의 약", icon: "fas fa-pills" },
    { path: "/symptoms", label: "증상 기록", icon: "fas fa-chart-line" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = location === tab.path || 
            (tab.path === "/medications" && location.startsWith("/medications"));
          
          return (
            <a
              key={tab.path}
              href={tab.path}
              className={`flex-1 py-3 px-4 text-center border-b-2 font-medium ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className={`${tab.icon} block mb-1`}></i>
              <span className="text-xs">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
