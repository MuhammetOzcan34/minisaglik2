import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any[];
}

const ReportModal = ({ isOpen, onClose, children }: ReportModalProps) => {
  const [reportData, setReportData] = useState<any>(null);
  const [selectedChild, setSelectedChild] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChild]);

  const generateReport = async () => {
    if (!selectedChild) {
      toast({
        title: "Hata",
        description: "Lütfen bir çocuk seçin.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Paralel olarak tüm verileri çek
      const [
        medicationsResult,
        nutritionResult, 
        temperaturesResult,
        activitiesResult,
        seizuresResult
      ] = await Promise.all([
        supabase
          .from('medications')
          .select('*, medication_doses(*)')
          .eq('child_id', selectedChild)
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end),
        
        supabase
          .from('nutrition_records')
          .select('*')
          .eq('child_id', selectedChild)
          .gte('meal_time', dateRange.start + 'T00:00:00')
          .lte('meal_time', dateRange.end + 'T23:59:59'),
        
        supabase
          .from('physical_measurements')
          .select('*')
          .eq('child_id', selectedChild)
          .not('temperature_celsius', 'is', null)
          .gte('measurement_date', dateRange.start)
          .lte('measurement_date', dateRange.end),
        
        supabase
          .from('activities')
          .select('*')
          .eq('child_id', selectedChild)
          .gte('activity_date', dateRange.start)
          .lte('activity_date', dateRange.end),
        
        supabase
          .from('seizures')
          .select('*')
          .eq('child_id', selectedChild)
          .gte('started_at', dateRange.start + 'T00:00:00')
          .lte('started_at', dateRange.end + 'T23:59:59')
      ]);

      const child = children.find(c => c.id === selectedChild);
      
      setReportData({
        child,
        period: `${dateRange.start} - ${dateRange.end}`,
        medications: medicationsResult.data || [],
        nutrition: nutritionResult.data || [],
        temperatures: temperaturesResult.data || [],
        activities: activitiesResult.data || [],
        seizures: seizuresResult.data || [],
        stats: {
          totalMeals: nutritionResult.data?.length || 0,
          avgTemperature: temperaturesResult.data?.length > 0 
            ? (temperaturesResult.data.reduce((sum, t) => sum + (t.temperature_celsius || 0), 0) / temperaturesResult.data.length).toFixed(1)
            : 'N/A',
          totalActivities: activitiesResult.data?.length || 0,
          totalSeizures: seizuresResult.data?.length || 0
        }
      });

    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Rapor oluşturulurken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const reportContent = `
    Çocuk Sağlık Raporu
    ===================
    
    Çocuk: ${reportData.child.name}
    Yaş: ${calculateAge(reportData.child.birth_date)}
    Cinsiyet: ${reportData.child.gender}
    Rapor Dönemi: ${reportData.period}
    
    ÖZET İSTATİSTİKLER
    ==================
    Total Beslenme Kayıtları: ${reportData.stats.totalMeals}
    Ortalama Ateş: ${reportData.stats.avgTemperature}°C
    Total Aktiviteler: ${reportData.stats.totalActivities}
    Total Nöbet Sayısı: ${reportData.stats.totalSeizures}
    
    İLAÇLAR
    =======
    ${reportData.medications.map(m => `- ${m.name} (${m.dosage})`).join('\n')}
    
    BESLENME KAYITLARI
    ==================
    ${reportData.nutrition.map(n => `- ${new Date(n.meal_time).toLocaleDateString('tr-TR')} - ${n.food_name} (${n.amount} ${n.unit})`).join('\n')}
    
    AKTİVİTELER
    ===========
    ${reportData.activities.map(a => `- ${new Date(a.activity_date).toLocaleDateString('tr-TR')} - ${a.activity_type} ${a.description ? '(' + a.description + ')' : ''}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.child.name}_saglik_raporu_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} gün`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} ay`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return months > 0 ? `${years} yaş ${months} ay` : `${years} yaş`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Sağlık Raporu
          </DialogTitle>
          <DialogDescription className="text-center">
            Detaylı sağlık raporu oluştur ve dışa aktar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtreler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="child">Çocuk</Label>
              <Select
                value={selectedChild}
                onValueChange={setSelectedChild}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Çocuk seçin" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Başlangıç</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Bitiş</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateReport}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? "Oluşturuluyor..." : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Rapor Oluştur
                </>
              )}
            </Button>
            
            {reportData && (
              <Button 
                onClick={exportReport}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </Button>
            )}
          </div>

          {/* Rapor İçeriği */}
          {reportData && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Özet İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{reportData.stats.totalMeals}</p>
                      <p className="text-sm text-gray-600">Beslenme</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{reportData.stats.avgTemperature}°C</p>
                      <p className="text-sm text-gray-600">Ortalama Ateş</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{reportData.stats.totalActivities}</p>
                      <p className="text-sm text-gray-600">Aktivite</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{reportData.stats.totalSeizures}</p>
                      <p className="text-sm text-gray-600">Nöbet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">İlaçlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.medications.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.medications.map((med: any) => (
                          <div key={med.id} className="p-2 bg-gray-50 rounded">
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Bu dönemde ilaç kaydı yok</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Son Beslenme Kayıtları</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reportData.nutrition.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {reportData.nutrition.slice(0, 5).map((nutrition: any) => (
                          <div key={nutrition.id} className="p-2 bg-gray-50 rounded">
                            <p className="font-medium">{nutrition.food_name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(nutrition.meal_time).toLocaleDateString('tr-TR')} - {nutrition.amount} {nutrition.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Bu dönemde beslenme kaydı yok</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;