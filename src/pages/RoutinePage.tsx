import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, BookOpen, Gamepad2, Dumbbell, Bath, Tooth, Users, Bed } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DailyRoutineModal from "@/components/DailyRoutineModal";

interface ContextType {
  selectedChild: any;
}

const RoutinePage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const activityLabels = {
    'uyku': 'Uyku',
    'oyun': 'Oyun',
    'egzersiz': 'Egzersiz', 
    'okuma': 'Okuma',
    'banyo': 'Banyo',
    'dis_fircalama': 'Diş Fırçalama',
    'ders': 'Ders/Ödev',
    'sosyal': 'Sosyal Aktivite',
    'diger': 'Diğer'
  };

  const activityIcons = {
    'uyku': Bed,
    'oyun': Gamepad2,
    'egzersiz': Dumbbell,
    'okuma': BookOpen,
    'banyo': Bath,
    'dis_fircalama': Tooth,
    'ders': BookOpen,
    'sosyal': Users,
    'diger': Clock
  };

  const completionStatusLabels = {
    'completed': 'Tamamlandı',
    'partial': 'Kısmen Tamamlandı',
    'skipped': 'Atlandı'
  };

  const sleepQualityLabels = {
    'çok iyi': 'Çok İyi',
    'iyi': 'İyi',
    'orta': 'Orta',
    'kötü': 'Kötü',
    'çok kötü': 'Çok Kötü'
  };

  useEffect(() => {
    if (selectedChild) {
      loadActivities();
    }
  }, [selectedChild]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Aktiviteler yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivityAdded = () => {
    setShowModal(false);
    loadActivities();
  };

  const getActivityDetails = (activity: any) => {
    const details = [];

    // Aktivite türüne göre özel alanlar
    if (activity.activity_type === 'uyku') {
      if (activity.bedtime) details.push(`Yatma: ${activity.bedtime}`);
      if (activity.wake_time) details.push(`Uyanma: ${activity.wake_time}`);
      if (activity.sleep_quality) details.push(`Kalite: ${sleepQualityLabels[activity.sleep_quality]}`);
    } else if (activity.activity_type === 'ders') {
      if (activity.subject) details.push(`Ders: ${activity.subject}`);
      if (activity.activity_subtype) details.push(`Tür: ${activity.activity_subtype}`);
    } else if (activity.activity_subtype) {
      details.push(`Tür: ${activity.activity_subtype}`);
    }

    // Genel alanlar
    if (activity.duration_minutes) details.push(`Süre: ${activity.duration_minutes} dakika`);
    if (activity.completion_status) details.push(`Durum: ${completionStatusLabels[activity.completion_status]}`);

    return details;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Aktiviteler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Günlük Rutin</h1>
          <p className="text-muted-foreground">{selectedChild.name} için günlük aktiviteler</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Aktivite
        </Button>
      </div>

      <div className="grid gap-4">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz aktivite kaydı yok</h3>
              <p className="text-muted-foreground text-center mb-4">
                İlk aktiviteyi eklemek için yukarıdaki butona tıklayın.
              </p>
              <Button onClick={() => setShowModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                İlk Aktiviteyi Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => {
            const ActivityIcon = activityIcons[activity.activity_type] || Clock;
            const activityDetails = getActivityDetails(activity);
            
            return (
              <Card key={activity.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5 text-blue-600" />
                    {activity.activity_type ? activityLabels[activity.activity_type] || activity.activity_type : 'Aktivite'}
                  </CardTitle>
                  <CardDescription>
                    {new Date(activity.activity_date).toLocaleDateString('tr-TR')}
                    {activity.activity_time && ` • ${activity.activity_time}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activityDetails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activityDetails.map((detail, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                    {activity.description && (
                      <p><strong>Açıklama:</strong> {activity.description}</p>
                    )}
                    {activity.notes && (
                      <p><strong>Notlar:</strong> {activity.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {showModal && (
        <DailyRoutineModal
          isOpen={showModal}
          onClose={handleActivityAdded}
          childId={selectedChild.id}
        />
      )}
    </div>
  );
};

export default RoutinePage;