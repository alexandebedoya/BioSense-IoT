"use client";

import { SensorStatusCard } from "@/components/iot/premium/sensor-status-card";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSensorData } from "@/hooks/use-sensor-data";
import { AlertCircle, Loader2 } from "lucide-react";

export function SensorsView() {
  const { data, isLoading } = useSensorData();

  if (isLoading) {
    return (
      <div className="p-4 pb-24">
        <Card className="p-8 border-dashed">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Cargando sensores de BioSense IOT...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 pb-24">
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-800">Error al conectar con la base de datos de sensores.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Detalle de Sensores</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Información de dispositivos BioSense IOT en tiempo real.
        </p>
      </div>

      <Tabs defaultValue="mq4" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 border">
          <TabsTrigger value="mq4">MQ-4</TabsTrigger>
          <TabsTrigger value="mq7">MQ-7</TabsTrigger>
          <TabsTrigger value="mq135">MQ-135</TabsTrigger>
        </TabsList>

        {/* --- MQ-4 --- */}
        <TabsContent value="mq4" className="mt-4">
          <SensorStatusCard
            id="1"
            name="Sensor MQ-4"
            type="Gas Metano"
            status={data.mq4 > 300 ? "warning" : "online"}
            location="Interior"
            battery={95}
            firmware="v1.0.2"
          />
          <div className="mt-4 p-4 bg-secondary/20 rounded-xl border">
             <p className="text-xs text-muted-foreground uppercase font-bold">Lectura Actual</p>
             <p className="text-3xl font-mono">{data.mq4} <span className="text-sm">ppm</span></p>
          </div>
        </TabsContent>

        {/* --- MQ-7 --- */}
        <TabsContent value="mq7" className="mt-4">
          <SensorStatusCard
            id="2"
            name="Sensor MQ-7"
            type="Monóxido de Carbono"
            status={data.mq7 > 200 ? "warning" : "online"}
            location="Interior"
            battery={88}
            firmware="v1.0.2"
          />
          <div className="mt-4 p-4 bg-secondary/20 rounded-xl border">
             <p className="text-xs text-muted-foreground uppercase font-bold">Lectura Actual</p>
             <p className="text-3xl font-mono">{data.mq7} <span className="text-sm">ppm</span></p>
          </div>
        </TabsContent>

        {/* --- MQ-135 --- */}
        <TabsContent value="mq135" className="mt-4">
          <SensorStatusCard
            id="3"
            name="Sensor MQ-135"
            type="Calidad Aire"
            status={(data.mq135 || 0) > 350 ? "warning" : "online"}
            location="Interior"
            battery={92}
            firmware="v1.0.2"
          />
          <div className="mt-4 p-4 bg-secondary/20 rounded-xl border">
             <p className="text-xs text-muted-foreground uppercase font-bold">Lectura Actual</p>
             <p className="text-3xl font-mono">{data.mq135 || 0} <span className="text-sm">ppm</span></p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}