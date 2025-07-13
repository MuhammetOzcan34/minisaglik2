import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PillIcon, Plus, Clock, Calendar, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
}

const MedicationModal = ({ isOpen, onClose, childId }: MedicationModalProps) => {
  const [activeTab, setActiveTab] = useState('add-medication');
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationDoses, setMedicationDoses] = useState<any[]>([]);
  
  // İlaç ekleme formu
  const [medicationForm, setMedicationForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    instructions: ''
  });

  // Doz verme formu
  const [doseForm, setDoseForm] = useState({
    medication_id: '',
    dosage: '',
    given_at: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && childId) {
      loadMedications();
      loadTodayDoses();
    }
  }, [isOpen, childId]);

  const loadMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "İlaçlar yüklenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const loadTodayDoses = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('medication_doses')
        .select(`
          *,
          medications (name)
        `)
        .gte('given_at', today + 'T00:00:00')
        .lt('given_at', today + 'T23:59:59')
        .order('given_at', { ascending: false });

      if (error) throw error;
      setMedicationDoses(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Doz kayıtları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationForm.name || !medicationForm.dosage || !medicationForm.frequency) {
      toast({
        title: "Hata",
        description: "Gerekli alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          child_id: childId,
          name: medicationForm.name,
          dosage: medicationForm.dosage,
          frequency: medicationForm.frequency,
          start_date: medicationForm.start_date,
          end_date: medicationForm.end_date || null,
          instructions: medicationForm.instructions || null,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `${medicationForm.name} ilaç listesine eklendi.`,
      });

      setMedicationForm({
        name: '',
        dosage: '',
        frequency: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        instructions: ''
      });

      loadMedications();
      setActiveTab('give-dose');
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İlaç eklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGiveDose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doseForm.medication_id || !doseForm.dosage || !doseForm.given_at) {
      toast({
        title: "Hata",
        description: "Gerekli alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('medication_doses')
        .insert([{
          medication_id: doseForm.medication_id,
          given_at: doseForm.given_at,
          dosage: doseForm.dosage,
          notes: doseForm.notes || null
        }]);

      if (error) throw error;

      const selectedMed = medications.find(m => m.id === doseForm.medication_id);
      toast({
        title: "Doz kaydedildi!",
        description: `${selectedMed?.name} dozu başarıyla kaydedildi.`,
      });

      setDoseForm({
        medication_id: '',
        dosage: '',
        given_at: new Date().toISOString().slice(0, 16),
        notes: ''
      });

      loadTodayDoses();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Doz kaydedilirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMedicationStatus = async (medicationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ is_active: !currentStatus })
        .eq('id', medicationId);

      if (error) throw error;

      toast({
        title: "Güncellendi",
        description: `İlaç ${!currentStatus ? 'aktif' : 'pasif'} duruma getirildi.`,
      });

      loadMedications();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PillIcon className="h-5 w-5" />
            İlaç Takibi
          </DialogTitle>
          <DialogDescription>
            İlaç ekleyin, doz verin ve takip edin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-medication">İlaç Ekle</TabsTrigger>
            <TabsTrigger value="give-dose">Doz Ver</TabsTrigger>
            <TabsTrigger value="history">Geçmiş</TabsTrigger>
          </TabsList>

          {/* İlaç Ekleme */}
          <TabsContent value="add-medication" className="space-y-4">
            <form onSubmit={handleAddMedication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">İlaç Adı *</Label>
                  <Input
                    id="name"
                    placeholder="Örn: Paracetamol"
                    value={medicationForm.name}
                    onChange={(e) => setMedicationForm({...medicationForm, name: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Doz *</Label>
                  <Input
                    id="dosage"
                    placeholder="Örn: 5ml, 1 tablet"
                    value={medicationForm.dosage}
                    onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Kullanım Sıklığı *</Label>
                <Select 
                  value={medicationForm.frequency} 
                  onValueChange={(value) => setMedicationForm({...medicationForm, frequency: value})}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sıklık seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Günde 1 kez">Günde 1 kez</SelectItem>
                    <SelectItem value="Günde 2 kez">Günde 2 kez</SelectItem>
                    <SelectItem value="Günde 3 kez">Günde 3 kez</SelectItem>
                    <SelectItem value="8 saatte bir">8 saatte bir</SelectItem>
                    <SelectItem value="12 saatte bir">12 saatte bir</SelectItem>
                    <SelectItem value="Gerektiğinde">Gerektiğinde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={medicationForm.start_date}
                    onChange={(e) => setMedicationForm({...medicationForm, start_date: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Bitiş Tarihi</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={medicationForm.end_date}
                    onChange={(e) => setMedicationForm({...medicationForm, end_date: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Kullanım Talimatları</Label>
                <Textarea
                  id="instructions"
                  placeholder="Yemek öncesi/sonrası, özel talimatlar..."
                  value={medicationForm.instructions}
                  onChange={(e) => setMedicationForm({...medicationForm, instructions: e.target.value})}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Ekleniyor..." : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    İlaç Ekle
                  </>
                )}
              </Button>
            </form>

            {/* Mevcut İlaçlar */}
            {medications.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Mevcut İlaçlar</h3>
                {medications.map((med) => (
                  <Card key={med.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{med.name}</h4>
                          <Badge variant={med.is_active ? "default" : "secondary"}>
                            {med.is_active ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleMedicationStatus(med.id, med.is_active)}
                      >
                        {med.is_active ? "Pasif Yap" : "Aktif Yap"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Doz Verme */}
          <TabsContent value="give-dose" className="space-y-4">
            {medications.filter(m => m.is_active).length === 0 ? (
              <div className="text-center py-8">
                <PillIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Önce bir ilaç ekleyin.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('add-medication')}
                  className="mt-2"
                >
                  İlaç Ekle
                </Button>
              </div>
            ) : (
              <form onSubmit={handleGiveDose} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medication_id">İlaç Seçin *</Label>
                  <Select 
                    value={doseForm.medication_id} 
                    onValueChange={(value) => {
                      const selectedMed = medications.find(m => m.id === value);
                      setDoseForm({
                        ...doseForm, 
                        medication_id: value,
                        dosage: selectedMed?.dosage || ''
                      });
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İlaç seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {medications.filter(m => m.is_active).map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} ({med.dosage})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dose_amount">Verilen Doz *</Label>
                    <Input
                      id="dose_amount"
                      placeholder="Örn: 5ml, 1 tablet"
                      value={doseForm.dosage}
                      onChange={(e) => setDoseForm({...doseForm, dosage: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="given_at">Verilme Zamanı *</Label>
                    <Input
                      id="given_at"
                      type="datetime-local"
                      value={doseForm.given_at}
                      onChange={(e) => setDoseForm({...doseForm, given_at: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dose_notes">Notlar</Label>
                  <Textarea
                    id="dose_notes"
                    placeholder="Çocuğun reaksiyonu, özel durumlar..."
                    value={doseForm.notes}
                    onChange={(e) => setDoseForm({...doseForm, notes: e.target.value})}
                    disabled={loading}
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? "Kaydediliyor..." : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Doz Verildi
                    </>
                  )}
                </Button>
              </form>
            )}
          </TabsContent>

          {/* Geçmiş */}
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Bugünkü Dozlar</h3>
              {medicationDoses.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Bugün henüz doz kaydı yok.</p>
                </div>
              ) : (
                medicationDoses.map((dose) => (
                  <Card key={dose.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{dose.medications?.name}</h4>
                        <p className="text-sm text-gray-600">
                          {dose.dosage} - {new Date(dose.given_at).toLocaleString('tr-TR')}
                        </p>
                        {dose.notes && (
                          <p className="text-xs text-gray-500 mt-1">{dose.notes}</p>
                        )}
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </Card>
                ))
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

export default MedicationModal;