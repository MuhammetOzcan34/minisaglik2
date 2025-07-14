import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Calendar, BookOpen, Gamepad2, Dumbbell, Bath, Tooth, Users, Bed } from 'lucide-react';
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
    completion_status: 'completed',
    subject: '',
    activity_subtype: '',
    bedtime: '',
    wake_time: '',
    sleep_quality: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Yemek bölümü kaldırıldı
  const activityTypes = [
    'uyku', 'oyun', 'egzersiz', 'okuma', 'banyo', 'dis_fircalama', 'ders', 'sosyal', 'diger'
  ];

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

  // Aktivite türüne göre dinamik alanlar
  const getDynamicFields = () => {
    switch (formData.activity_type) {
      case 'uyku':
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bedtime">Yatma Zamanı</Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={formData.bedtime}
                  onChange={(e) => setFormData({...formData, bedtime: e.target.value})}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wake_time">Uyanma Zamanı</Label>
                <Input
                  id="wake_time"
                  type="time"
                  value={formData.wake_time}
                  onChange={(e) => setFormData({...formData, wake_time: e.target.value})}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleep_quality">Uyku Kalitesi</Label>
              <Select
                value={formData.sleep_quality}
                onValueChange={(value) => setFormData({...formData, sleep_quality: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Uyku kalitesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="çok iyi">Çok İyi</SelectItem>
                  <SelectItem value="iyi">İyi</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="kötü">Kötü</SelectItem>
                  <SelectItem value="çok kötü">Çok Kötü</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'ders':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Hangi Ders</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({...formData, subject: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ders seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matematik">Matematik</SelectItem>
                  <SelectItem value="türkçe">Türkçe</SelectItem>
                  <SelectItem value="fen">Fen Bilgisi</SelectItem>
                  <SelectItem value="sosyal">Sosyal Bilgiler</SelectItem>
                  <SelectItem value="ingilizce">İngilizce</SelectItem>
                  <SelectItem value="müzik">Müzik</SelectItem>
                  <SelectItem value="resim">Resim</SelectItem>
                  <SelectItem value="beden">Beden Eğitimi</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity_subtype">Aktivite Türü</Label>
              <Select
                value={formData.activity_subtype}
                onValueChange={(value) => setFormData({...formData, activity_subtype: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Aktivite türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ödev">Ödev</SelectItem>
                  <SelectItem value="tekrar">Tekrar</SelectItem>
                  <SelectItem value="çalışma">Çalışma</SelectItem>
                  <SelectItem value="proje">Proje</SelectItem>
                  <SelectItem value="sınav">Sınav Hazırlığı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Çalışma Süresi (dakika)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="Örn: 45"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                disabled={loading}
                min="1"
              />
            </div>
          </>
        );

      case 'oyun':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="activity_subtype">Oyun Türü</Label>
              <Select
                value={formData.activity_subtype}
                onValueChange={(value) => setFormData({...formData, activity_subtype: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Oyun türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ev oyunu">Ev Oyunu</SelectItem>
                  <SelectItem value="bahçe oyunu">Bahçe Oyunu</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="bilgisayar">Bilgisayar Oyunu</SelectItem>
                  <SelectItem value="tablet">Tablet Oyunu</SelectItem>
                  <SelectItem value="puzzle">Puzzle</SelectItem>
                  <SelectItem value="lego">Lego</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Oyun Süresi (dakika)</Label>
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
          </>
        );

      case 'egzersiz':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="activity_subtype">Egzersiz Türü</Label>
              <Select
                value={formData.activity_subtype}
                onValueChange={(value) => setFormData({...formData, activity_subtype: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Egzersiz türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yürüyüş">Yürüyüş</SelectItem>
                  <SelectItem value="koşu">Koşu</SelectItem>
                  <SelectItem value="bisiklet">Bisiklet</SelectItem>
                  <SelectItem value="yüzme">Yüzme</SelectItem>
                  <SelectItem value="spor">Spor</SelectItem>
                  <SelectItem value="dans">Dans</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Egzersiz Süresi (dakika)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="Örn: 20"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                disabled={loading}
                min="1"
              />
            </div>
          </>
        );

      case 'okuma':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="activity_subtype">Okuma Türü</Label>
              <Select
                value={formData.activity_subtype}
                onValueChange={(value) => setFormData({...formData, activity_subtype: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Okuma türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitap">Kitap</SelectItem>
                  <SelectItem value="hikaye">Hikaye</SelectItem>
                  <SelectItem value="masal">Masal</SelectItem>
                  <SelectItem value="gazete">Gazete</SelectItem>
                  <SelectItem value="dergi">Dergi</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Okuma Süresi (dakika)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="Örn: 15"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                disabled={loading}
                min="1"
              />
            </div>
          </>
        );

      case 'sosyal':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="activity_subtype">Sosyal Aktivite Türü</Label>
              <Select
                value={formData.activity_subtype}
                onValueChange={(value) => setFormData({...formData, activity_subtype: value})}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sosyal aktivite türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arkadaş ziyareti">Arkadaş Ziyareti</SelectItem>
                  <SelectItem value="aile ziyareti">Aile Ziyareti</SelectItem>
                  <SelectItem value="doğum günü">Doğum Günü</SelectItem>
                  <SelectItem value="parti">Parti</SelectItem>
                  <SelectItem value="sinema">Sinema</SelectItem>
                  <SelectItem value="tiyatro">Tiyatro</SelectItem>
                  <SelectItem value="müze">Müze</SelectItem>
                  <SelectItem value="diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Aktivite Süresi (dakika)</Label>
              <Input
                id="duration_minutes"
                type="number"
                placeholder="Örn: 120"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                disabled={loading}
                min="1"
              />
            </div>
          </>
        );

      default:
        return (
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
        );
    }
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
          completion_status: formData.completion_status,
          subject: formData.subject || null,
          activity_subtype: formData.activity_subtype || null,
          bedtime: formData.bedtime || null,
          wake_time: formData.wake_time || null,
          sleep_quality: formData.sleep_quality || null
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
        completion_status: 'completed',
        subject: '',
        activity_subtype: '',
        bedtime: '',
        wake_time: '',
        sleep_quality: ''
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

  const ActivityIcon = activityIcons[formData.activity_type] || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <ActivityIcon className="h-8 w-8 text-blue-600" />
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

          {/* Dinamik alanlar */}
          {formData.activity_type && getDynamicFields()}

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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
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