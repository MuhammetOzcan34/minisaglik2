import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DailyRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
}

const DailyRoutineModal = ({ isOpen, onClose, childId }: DailyRoutineModalProps) => {
  const [formData, setFormData] = useState({
    activity_type: '',
    activity_time: '',
    activity_date: new Date().toISOString().split('T')[0],
    duration_minutes: '',
    description: '',
    notes: '',
    completion_status: 'completed'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activityTypes = [
    'uyku', 'yemek', 'oyun', 'egzersiz', 'okuma',
    'banyo', 'dis_fircalama', 'ders', 'sosyal', 'diger'
  ];

  const activityLabels = {
    'uyku': 'Uyku',
    'yemek': 'Yemek',
    'oyun': 'Oyun',
    'egzersiz': 'Egzersiz', 
    'okuma': 'Okuma',
    'banyo': 'Banyo',
    'dis_fircalama': 'Diş Fırçalama',
    'ders': 'Ders/Ödev',
    'sosyal': 'Sosyal Aktivite',
    'diger': 'Diğer'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity_type || !formData.activity_date) {
      toast({
        title: "Hata",
        description: "Aktivite türü ve tarih zorunludur.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('activities')
        .insert([{
          child_id: childId,
          activity_type: formData.activity_type,
          activity_date: formData.activity_date,
          activity_time: formData.activity_time || null,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          description: formData.description || null,
          notes: formData.notes || null,
          completion_status: formData.completion_status
        }]);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Günlük rutin kaydedildi.",
      });

      onClose();
      setFormData({
        activity_type: '',
        activity_time: '',
        activity_date: new Date().toISOString().split('T')[0],
        duration_minutes: '',
        description: '',
        notes: '',
        completion_status: 'completed'
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Günlük Rutin Ekle
          </DialogTitle>
          <DialogDescription className="text-center">
            Günlük aktivite kaydet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity_type">Aktivite Türü *</Label>
            <Select
              value={formData.activity_type}
              onValueChange={(value) => setFormData({...formData, activity_type: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aktivite türü seçin" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {activityLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="activity_date">Tarih *</Label>
              <Input
                id="activity_date"
                type="date"
                value={formData.activity_date}
                onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_time">Saat</Label>
              <Input
                id="activity_time"
                type="time"
                value={formData.activity_time}
                onChange={(e) => setFormData({...formData, activity_time: e.target.value})}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Süre (dakika)</Label>
            <Input
              id="duration_minutes"
              type="number"
              placeholder="Örn: 30"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
              disabled={loading}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion_status">Durum</Label>
            <Select
              value={formData.completion_status}
              onValueChange={(value) => setFormData({...formData, completion_status: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="partial">Kısmen Tamamlandı</SelectItem>
                <SelectItem value="skipped">Atlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              placeholder="Aktivite detayları"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notlar</Label>
            <Textarea
              id="notes"
              placeholder="Ek notlar"
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
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
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

export default DailyRoutineModal;