import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SeizureModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
}

const SeizureModal = ({ isOpen, onClose, childId }: SeizureModalProps) => {
  const [formData, setFormData] = useState({
    started_at: '',
    duration_minutes: '',
    seizure_type: '',
    observations: '',
    post_seizure_state: '',
    emergency_action: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const seizureTypes = [
    'tonik_klonik',
    'absence',
    'fokal',
    'miyoklonik',
    'atonik',
    'infantil_spazm',
    'diger'
  ];

  const seizureLabels = {
    'tonik_klonik': 'Tonik-Klonik (Büyük Nöbet)',
    'absence': 'Absence (Küçük Nöbet)',
    'fokal': 'Fokal Nöbet',
    'miyoklonik': 'Miyoklonik Nöbet',
    'atonik': 'Atonik Nöbet',
    'infantil_spazm': 'İnfantil Spazm',
    'diger': 'Diğer'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.started_at) {
      toast({
        title: "Hata",
        description: "Nöbet başlama zamanı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('seizures')
        .insert([{
          child_id: childId,
          started_at: formData.started_at,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          seizure_type: formData.seizure_type || null,
          observations: formData.observations || null,
          post_seizure_state: formData.post_seizure_state || null,
          emergency_action: formData.emergency_action,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Nöbet kaydı eklendi.",
      });

      onClose();
      setFormData({
        started_at: '',
        duration_minutes: '',
        seizure_type: '',
        observations: '',
        post_seizure_state: '',
        emergency_action: false,
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Kayıt eklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Nöbet Kaydı Ekle
          </DialogTitle>
          <DialogDescription className="text-center">
            Nöbet bilgilerini kaydet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="started_at">Nöbet Başlama Zamanı *</Label>
            <Input
              id="started_at"
              type="datetime-local"
              value={formData.started_at}
              onChange={(e) => setFormData({...formData, started_at: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Süre (dakika)</Label>
            <Input
              id="duration_minutes"
              type="number"
              placeholder="Örn: 2"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
              disabled={loading}
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seizure_type">Nöbet Türü</Label>
            <Select
              value={formData.seizure_type}
              onValueChange={(value) => setFormData({...formData, seizure_type: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nöbet türü seçin" />
              </SelectTrigger>
              <SelectContent>
                {seizureTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {seizureLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Gözlemler</Label>
            <Textarea
              id="observations"
              placeholder="Nöbet sırasında gözlemlenen belirtiler"
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="post_seizure_state">Nöbet Sonrası Durum</Label>
            <Textarea
              id="post_seizure_state"
              placeholder="Nöbet sonrası çocuğun durumu"
              value={formData.post_seizure_state}
              onChange={(e) => setFormData({...formData, post_seizure_state: e.target.value})}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emergency_action"
              checked={formData.emergency_action}
              onCheckedChange={(checked) => setFormData({...formData, emergency_action: checked === true})}
              disabled={loading}
            />
            <Label htmlFor="emergency_action" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Acil müdahale gerekti
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ek Notlar</Label>
            <Textarea
              id="notes"
              placeholder="Diğer önemli bilgiler"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SeizureModal;