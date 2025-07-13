import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Plus, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TemperatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
}

const TemperatureModal = ({ isOpen, onClose, childId }: TemperatureModalProps) => {
  const [loading, setLoading] = useState(false);
  const [temperatureRecords, setTemperatureRecords] = useState<any[]>([]);
  const [temperatureForm, setTemperatureForm] = useState({
    measurement_date: new Date().toISOString().split('T')[0],
    temperature_celsius: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && childId) {
      loadTemperatureRecords();
    }
  }, [isOpen, childId]);

  const loadTemperatureRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('physical_measurements')
        .select('*')
        .eq('child_id', childId)
        .not('temperature_celsius', 'is', null)
        .order('measurement_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTemperatureRecords(data || []);
    } catch (error: any) {
      console.error('Ateş kayıtları yüklenirken hata:', error);
    }
  };

  const handleAddTemperature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!temperatureForm.temperature_celsius) return;

    const tempValue = parseFloat(temperatureForm.temperature_celsius);
    if (isNaN(tempValue) || tempValue < 30 || tempValue > 45) {
      toast({
        title: "Hata",
        description: "Geçerli bir ateş değeri girin (30-45°C arası).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('physical_measurements')
        .insert([{
          child_id: childId,
          measurement_date: temperatureForm.measurement_date,
          temperature_celsius: tempValue,
          notes: temperatureForm.notes || null
        }]);

      if (error) throw error;

      toast({
        title: tempValue >= 38.0 ? "Yüksek ateş kaydedildi!" : "Ateş kaydedildi!",
        description: `${tempValue}°C başarıyla kaydedildi.`,
        variant: tempValue >= 38.0 ? "destructive" : "default"
      });

      setTemperatureForm({
        measurement_date: new Date().toISOString().split('T')[0],
        temperature_celsius: '',
        notes: ''
      });

      loadTemperatureRecords();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Ateş kaydedilirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp >= 38.0) return { status: 'Yüksek Ateş', color: 'bg-red-100 text-red-800' };
    if (temp >= 37.5) return { status: 'Hafif Ateş', color: 'bg-orange-100 text-orange-800' };
    if (temp >= 36.5) return { status: 'Normal', color: 'bg-green-100 text-green-800' };
    return { status: 'Düşük', color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Ateş Ölçümü
          </DialogTitle>
          <DialogDescription>
            Ateş değerlerini kaydedin ve takip edin
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="add-temperature" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-temperature">Ateş Ekle</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>

          <TabsContent value="add-temperature" className="space-y-4">
            <form onSubmit={handleAddTemperature} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="measurement_date">Ölçüm Tarihi *</Label>
                  <Input
                    id="measurement_date"
                    type="date"
                    value={temperatureForm.measurement_date}
                    onChange={(e) => setTemperatureForm({...temperatureForm, measurement_date: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature_celsius">Ateş (°C) *</Label>
                  <Input
                    id="temperature_celsius"
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    placeholder="Örn: 36.8"
                    value={temperatureForm.temperature_celsius}
                    onChange={(e) => setTemperatureForm({...temperatureForm, temperature_celsius: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  placeholder="Çocuğun durumu, ölçüm yöntemi..."
                  value={temperatureForm.notes}
                  onChange={(e) => setTemperatureForm({...temperatureForm, notes: e.target.value})}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? "Kaydediliyor..." : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ateş Kaydet
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Ateş Geçmişi</h3>
              {temperatureRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz ateş ölçümü yok.</p>
                </div>
              ) : (
                temperatureRecords.map((record) => {
                  const status = getTemperatureStatus(record.temperature_celsius);
                  return (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl font-bold">{record.temperature_celsius}°C</span>
                            <Badge className={status.color}>{status.status}</Badge>
                            {record.temperature_celsius >= 38.0 && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(record.measurement_date).toLocaleDateString('tr-TR')}
                          </p>
                          {record.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              <strong>Notlar:</strong> {record.notes}
                            </p>
                          )}
                        </div>
                        <Thermometer className="h-5 w-5 text-gray-400" />
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemperatureModal;