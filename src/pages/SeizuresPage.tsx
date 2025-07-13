import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SeizureModal from "@/components/SeizureModal";

interface ContextType {
  selectedChild: any;
}

const SeizuresPage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [seizures, setSeizures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const seizureLabels = {
    'Miyoklonik Absans Nöbeti': 'Miyoklonik Absans Nöbeti',
    'Miyoklonik Absans': 'Miyoklonik Absans',
    'Klonik': 'Klonik Nöbet',
    'Tonik': 'Tonik Nöbet',
    'Atonik': 'Atonik Nöbet',
    'Tonik-Klonik': 'Tonik-Klonik Nöbet',
    'Absans': 'Absans Nöbet'
  };

  useEffect(() => {
    if (selectedChild) {
      loadSeizures();
    }
  }, [selectedChild]);

  const loadSeizures = async () => {
    try {
      const { data, error } = await supabase
        .from('seizures')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      setSeizures(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Nöbet kayıtları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeizureAdded = () => {
    setShowModal(false);
    loadSeizures();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Nöbet kayıtları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Epilepsi Nöbetleri</h1>
          <p className="text-muted-foreground">{selectedChild.name} için nöbet kayıtları</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4" />
          Yeni Nöbet Kaydı
        </Button>
      </div>

      <div className="grid gap-4">
        {seizures.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz nöbet kaydı yok</h3>
              <p className="text-muted-foreground text-center mb-4">
                İlk nöbet kaydını eklemek için yukarıdaki butona tıklayın.
              </p>
              <Button onClick={() => setShowModal(true)} variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                <Plus className="h-4 w-4 mr-2" />
                İlk Kaydı Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          seizures.map((seizure) => (
            <Card key={seizure.id} className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  {seizure.seizure_type ? seizureLabels[seizure.seizure_type] || seizure.seizure_type : 'Nöbet'}
                  {seizure.emergency_action && (
                    <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
                  )}
                </CardTitle>
                <CardDescription>
                  {new Date(seizure.started_at).toLocaleString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {seizure.duration_seconds && (
                    <p><strong>Süre:</strong> {seizure.duration_seconds} saniye</p>
                  )}
                  {seizure.observations && (
                    <p><strong>Gözlemler:</strong> {seizure.observations}</p>
                  )}
                  {seizure.post_seizure_state && (
                    <p><strong>Nöbet sonrası durum:</strong> {seizure.post_seizure_state}</p>
                  )}
                  {seizure.emergency_action && (
                    <p className="text-red-600 font-semibold">⚠️ Acil müdahale gerekti</p>
                  )}
                  {seizure.notes && (
                    <p><strong>Notlar:</strong> {seizure.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <SeizureModal
          isOpen={showModal}
          onClose={handleSeizureAdded}
          childId={selectedChild.id}
        />
      )}
    </div>
  );
};

export default SeizuresPage;