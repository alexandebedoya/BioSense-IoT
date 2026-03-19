"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/iot/premium/login-screen"
import { AppHeader } from "@/components/iot/premium/app-header"
import { AppSidebar } from "@/components/iot/premium/app-sidebar"
import { BottomNavigation } from "@/components/iot/premium/bottom-navigation"
import { DashboardView } from "@/components/iot/premium/views/dashboard-view"
import { MonitoringView } from "@/components/iot/premium/views/monitoring-view"
import { AlertsView } from "@/components/iot/premium/views/alerts-view"
import { AnalysisView } from "@/components/iot/premium/views/analysis-view"
import { SensorsView } from "@/components/iot/premium/views/sensors-view"
import { RecommendationsView } from "@/components/iot/premium/views/recommendations-view"
import { ProfileView } from "@/components/iot/premium/views/profile-view"
import { useSensorData } from "@/hooks/use-sensor-data"
import { SensorData } from "@/lib/types"

// --- BLINDAJE DE EMERGENCIA PARA EL COMPILADOR ---
if (typeof window !== "undefined") {
  // @ts-ignore
  window.logout = () => { console.log("Global logout called"); };
  // @ts-ignore
  window.googleLogin = () => { console.log("Global googleLogin called"); };
}

type ViewType = "dashboard" | "monitoreo" | "analisis" | "alertas" | "sensores" | "recomendaciones" | "perfil"

export default function AirQualityApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: rawData, dataSource, isLoading } = useSensorData()
  const data: SensorData = rawData || {
    mq4: 0,
    mq7: 0,
    mq135: 0,
    nivel: 'NORMAL',
    timestamp: new Date().toISOString()
  };

  const handleLogin = () => setIsAuthenticated(true)
  const handleLogout = () => {
    setIsAuthenticated(false)
    setSidebarOpen(false)
    setCurrentView("dashboard")
  }

  // Función vacía para Google Login por si el componente la pide
  const handleGoogleLogin = () => {
    console.log("Google Login iniciado");
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView data={data} onNavigateToAlerts={() => setCurrentView("alertas")} onNavigateToRecommendations={() => setCurrentView("recomendaciones")} />
      case "monitoreo":
        return <MonitoringView data={data} />
      case "alertas":
        return <AlertsView />
      case "analisis":
        return <AnalysisView />
      case "sensores":
        return <SensorsView />
      case "recomendaciones":
        return <RecommendationsView data={data} />
      case "perfil":
        return <ProfileView onLogout={handleLogout} />
      default:
        return <DashboardView data={data} onNavigateToAlerts={() => setCurrentView("alertas")} onNavigateToRecommendations={() => setCurrentView("recomendaciones")} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={isLoading ? "Cargando..." : `BioSense IOT (${dataSource})`} onMenuClick={() => setSidebarOpen(true)} notificationCount={3} />
      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} />
      <main className="min-h-[calc(100vh-4rem)] max-w-lg mx-auto">{renderView()}</main>
      <BottomNavigation currentView={currentView} onNavigate={setCurrentView} alertCount={3} />
    </div>
  )
}