import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  children: any[];
}

const ReminderModal = ({ isOpen, onClose, familyId, children }: ReminderModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    remind_at: '',
    reminder_type: '',
    child_id: '',
    is_recurring: false,
    recurrence_pattern: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reminderTypes = [
    'medication',
    'appointment',
    'measurement',
    'feeding',
    'activity',
    'other'
  ];

  const reminderLabels = {
    'medication': 'İlaç',
    'appointment': 'Randevu',
    'measurement': 'Ölçüm',
    'feeding': 'Beslenme',
    'activity': 'Aktivite',
    'other': 'Diğer'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.remind_at) {
      toast({
        title: "Hata",
        description: "Başlık ve hatırlatma zamanı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('reminders')
        .insert([{
          family_id: familyId,
          title: formData.title,
          description: formData.description || null,
          remind_at: formData.remind_at,
          reminder_type: formData.reminder_type || null,
          child_id: formData.child_id || null,
          is_recurring: formData.is_recurring,
          recurrence_pattern: formData.recurrence_pattern || null
        }]);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Hatırlatma oluşturuldu.",
      });

      onClose();
      setFormData({
        title: '',
        description: '',
        remind_at: '',
        reminder_type: '',
        child_id: '',
        is_recurring: false,
        recurrence_pattern: ''
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Hatırlatma oluşturulurken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Hatırlatma Oluştur
          </DialogTitle>
          <DialogDescription className="text-center">
            Yeni hatırlatma ekle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              placeholder="Örn: İlaç zamanı"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remind_at">Hatırlatma Zamanı *</Label>
            <Input
              id="remind_at"
              type="datetime-local"
              value={formData.remind_at}
              onChange={(e) => setFormData({...formData, remind_at: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reminder_type">Tür</Label>
              <Select
                value={formData.reminder_type}
                onValueChange={(value) => setFormData({...formData, reminder_type: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent>
                  {reminderTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {reminderLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="child_id">Çocuk</Label>
              <Select
                value={formData.child_id}
                onValueChange={(value) => setFormData({...formData, child_id: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Çocuk seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Çocuklar</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              placeholder="Hatırlatma detayları"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked === true})}
                disabled={loading}
              />
              <Label htmlFor="is_recurring">Tekrarlayan hatırlatma</Label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrence_pattern">Tekrar Sıklığı</Label>
                <Select
                  value={formData.recurrence_pattern}
                  onValueChange={(value) => setFormData({...formData, recurrence_pattern: value})}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sıklık seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Her gün</SelectItem>
                    <SelectItem value="weekly">Her hafta</SelectItem>
                    <SelectItem value="monthly">Her ay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Oluşturuluyor..." : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;