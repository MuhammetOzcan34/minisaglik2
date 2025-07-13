import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Thermometer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TemperatureModal from "@/components/TemperatureModal";

interface ContextType {
  selectedChild: any;
}

const TemperaturePage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedChild) {
      loadTemperatureMeasurements();
    }
  }, [selectedChild]);

  const loadTemperatureMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('physical_measurements')
        .select('*')
        .eq('child_id', selectedChild.id)
        .not('temperature_celsius', 'is', null)
        .order('measurement_date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Ateş ölçümleri yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementAdded = () => {
    setShowModal(false);
    loadTemperatureMeasurements();
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 38.5) return 'text-red-600';
    if (temp >= 37.5) return 'text-orange-600';
    return 'text-green-600';
  };

  if (!selectedChild) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Önce bir çocuk seçin.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Ateş ölçümleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ateş Takibi</h1>
          <p className="text-muted-foreground">{selectedChild.name} için ateş ölçümleri</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Ateş Ölçümü
        </Button>
      </div>

      <div className="grid gap-4">
        {measurements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Thermometer className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz ateş ölçümü yok</h3>
              <p className="text-muted-foreground text-center mb-4">
                İlk ateş ölçümünü eklemek için yukarıdaki butona tıklayın.
              </p>
              <Button onClick={() => setShowModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                İlk Ölçümü Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          measurements.map((measurement) => (
            <Card key={measurement.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  <span className={getTemperatureColor(measurement.temperature_celsius)}>
                    {measurement.temperature_celsius}°C
                  </span>
                </CardTitle>
                <CardDescription>
                  {new Date(measurement.measurement_date).toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {measurement.height_cm && (
                    <p><strong>Boy:</strong> {measurement.height_cm} cm</p>
                  )}
                  {measurement.weight_kg && (
                    <p><strong>Kilo:</strong> {measurement.weight_kg} kg</p>
                  )}
                  {measurement.head_circumference_cm && (
                    <p><strong>Baş çevresi:</strong> {measurement.head_circumference_cm} cm</p>
                  )}
                  {measurement.notes && (
                    <p><strong>Notlar:</strong> {measurement.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <TemperatureModal
          isOpen={showModal}
          onClose={handleMeasurementAdded}
          childId={selectedChild.id}
        />
      )}
    </div>
  );
};

export default TemperaturePage;