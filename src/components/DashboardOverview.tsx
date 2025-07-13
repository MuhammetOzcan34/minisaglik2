import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Calendar, Baby, Pill, Utensils, Thermometer } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ContextType {
  selectedChild: any;
}

const DashboardOverview = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [todayStats, setTodayStats] = useState({
    medications: { taken: 0, total: 0 },
    meals: 0,
    lastTemperature: null as number | null
  });

  useEffect(() => {
    if (selectedChild) {
      loadTodayStats();
    }
  }, [selectedChild]);

  const loadTodayStats = async () => {
    if (!selectedChild) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // İlaç istatistikleri
      const { data: medications } = await supabase
        .from('medications')
        .select('id')
        .eq('child_id', selectedChild.id)
        .eq('is_active', true);

      const { data: medicationDoses } = await supabase
        .from('medication_doses')
        .select('id')
        .in('medication_id', medications?.map(m => m.id) || [])
        .gte('given_at', today + 'T00:00:00')
        .lt('given_at', today + 'T23:59:59');

      // Beslenme istatistikleri
      const { data: nutritionRecords } = await supabase
        .from('nutrition_records')
        .select('id')
        .eq('child_id', selectedChild.id)
        .gte('meal_time', today + 'T00:00:00')
        .lt('meal_time', today + 'T23:59:59');

      // Son ateş ölçümü
      const { data: lastTempRecord } = await supabase
        .from('physical_measurements')
        .select('temperature_celsius')
        .eq('child_id', selectedChild.id)
        .not('temperature_celsius', 'is', null)
        .order('measurement_date', { ascending: false })
        .limit(1);

      setTodayStats({
        medications: {
          taken: medicationDoses?.length || 0,
          total: medications?.length || 0
        },
        meals: nutritionRecords?.length || 0,
        lastTemperature: lastTempRecord?.[0]?.temperature_celsius || null
      });
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
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
    <div className="mb-8">
      {/* Child Profile Card */}
      {selectedChild && (
        <Card className="mb-6 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Aktif Çocuk Profili</CardTitle>
            <CardDescription>
              Seçili çocuğun temel bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Baby className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800">{selectedChild.name}</h3>
                  <p className="text-sm text-gray-600">
                    {calculateAge(selectedChild.birth_date)} • {selectedChild.gender === 'erkek' ? 'Erkek' : 'Kız'}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Doğum: {new Date(selectedChild.birth_date).toLocaleDateString('tr-TR')}</span>
                    {selectedChild.blood_type && <span>Kan Grubu: {selectedChild.blood_type}</span>}
                  </div>
                </div>
              </div>
              {selectedChild.medical_notes && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <strong>Tıbbi Notlar:</strong> {selectedChild.medical_notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Bugünkü İlaçlar</p>
                <p className="text-2xl font-bold">
                  {todayStats.medications.taken}/{todayStats.medications.total}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Pill className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Öğün Sayısı</p>
                <p className="text-2xl font-bold">{todayStats.meals}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Utensils className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Son Ateş</p>
                <p className="text-2xl font-bold">
                  {todayStats.lastTemperature ? `${todayStats.lastTemperature}°C` : '-'}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Thermometer className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;