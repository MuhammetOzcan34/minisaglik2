import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pill } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MedicationModal from "@/components/MedicationModal";

interface ContextType {
  selectedChild: any;
}

const MedicationsPage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedChild) {
      loadMedications();
    }
  }, [selectedChild]);

  const loadMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('child_id', selectedChild.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "İlaç kayıtları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationAdded = () => {
    setShowModal(false);
    loadMedications();
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>İlaç kayıtları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İlaç Takibi</h1>
          <p className="text-muted-foreground">{selectedChild.name} için ilaç kayıtları</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni İlaç
        </Button>
      </div>

      <div className="grid gap-4">
        {medications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Pill className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz ilaç kaydı yok</h3>
              <p className="text-muted-foreground text-center mb-4">
                İlk ilacı eklemek için yukarıdaki butona tıklayın.
              </p>
              <Button onClick={() => setShowModal(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                İlk İlacı Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          medications.map((medication) => (
            <Card key={medication.id} className={medication.is_active ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-400'}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  {medication.name}
                  {!medication.is_active && (
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">Pasif</span>
                  )}
                </CardTitle>
                <CardDescription>
                  {new Date(medication.start_date).toLocaleDateString('tr-TR')}
                  {medication.end_date && ` - ${new Date(medication.end_date).toLocaleDateString('tr-TR')}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Doz:</strong> {medication.dosage}</p>
                  <p><strong>Sıklık:</strong> {medication.frequency}</p>
                  {medication.instructions && (
                    <p><strong>Kullanım talimatları:</strong> {medication.instructions}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <MedicationModal
          isOpen={showModal}
          onClose={handleMedicationAdded}
          childId={selectedChild.id}
        />
      )}
    </div>
  );
};

export default MedicationsPage;