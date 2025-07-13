import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Utensils } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NutritionModal from "@/components/NutritionModal";

interface ContextType {
  selectedChild: any;
}

const NutritionPage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedChild) {
      loadNutritionRecords();
    }
  }, [selectedChild]);

  const loadNutritionRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_records')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('meal_time', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Beslenme kayıtları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAdded = () => {
    setShowModal(false);
    loadNutritionRecords();
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
          <p>Beslenme kayıtları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Beslenme Takibi</h1>
          <p className="text-muted-foreground">{selectedChild.name} için beslenme kayıtları</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Beslenme Kaydı
        </Button>
      </div>

      <div className="grid gap-4">
        {records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Utensils className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz beslenme kaydı yok</h3>
              <p className="text-muted-foreground text-center mb-4">
                İlk beslenme kaydını eklemek için yukarıdaki butona tıklayın.
              </p>
              <Button onClick={() => setShowModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                İlk Kaydı Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  {record.food_name}
                </CardTitle>
                <CardDescription>
                  {new Date(record.meal_time).toLocaleString('tr-TR')}
                  {record.meal_type && ` • ${record.meal_type}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Miktar:</strong> {record.amount} {record.unit}</p>
                  {record.allergic_reaction && (
                    <p className="text-red-600 font-semibold">⚠️ Alerjik reaksiyon gözlendi</p>
                  )}
                  {record.reaction_notes && (
                    <p><strong>Reaksiyon notları:</strong> {record.reaction_notes}</p>
                  )}
                  {record.notes && (
                    <p><strong>Notlar:</strong> {record.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <NutritionModal
          isOpen={showModal}
          onClose={handleRecordAdded}
          childId={selectedChild.id}
        />
      )}
    </div>
  );
};

export default NutritionPage;