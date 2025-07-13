import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Baby } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FamilySetupProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: (child: any) => void;
  familyId: string;
}

const FamilySetup = ({ isOpen, onClose, onChildAdded, familyId }: FamilySetupProps) => {
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    blood_type: '',
    medical_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birth_date || !formData.gender) {
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
        .from('children')
        .insert([{
          family_id: familyId,
          name: formData.name,
          birth_date: formData.birth_date,
          gender: formData.gender,
          blood_type: formData.blood_type || null,
          medical_notes: formData.medical_notes || null
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `${formData.name} profili oluşturuldu.`,
      });

      onChildAdded(data);
      onClose();
      setFormData({
        name: '',
        birth_date: '',
        gender: '',
        blood_type: '',
        medical_notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Çocuk profili oluşturulurken hata oluştu.",
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
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Baby className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Çocuk Profili Oluştur</DialogTitle>
          <DialogDescription className="text-center">
            Çocuğunuzun sağlık takibi için profil bilgilerini girin
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Çocuğun Adı *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Örn: Ahmet"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Doğum Tarihi *</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Cinsiyet *</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => setFormData({...formData, gender: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cinsiyet seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="erkek">Erkek</SelectItem>
                <SelectItem value="kız">Kız</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blood_type">Kan Grubu</Label>
            <Select 
              value={formData.blood_type} 
              onValueChange={(value) => setFormData({...formData, blood_type: value})}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kan grubu seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A Rh+</SelectItem>
                <SelectItem value="A-">A Rh-</SelectItem>
                <SelectItem value="B+">B Rh+</SelectItem>
                <SelectItem value="B-">B Rh-</SelectItem>
                <SelectItem value="AB+">AB Rh+</SelectItem>
                <SelectItem value="AB-">AB Rh-</SelectItem>
                <SelectItem value="O+">O Rh+</SelectItem>
                <SelectItem value="O-">O Rh-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_notes">Tıbbi Notlar</Label>
            <Textarea
              id="medical_notes"
              placeholder="Önemli tıbbi bilgiler, alerjiler vb. (opsiyonel)"
              value={formData.medical_notes}
              onChange={(e) => setFormData({...formData, medical_notes: e.target.value})}
              disabled={loading}
              rows={3}
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
              {loading ? "Oluşturuluyor..." : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Profil Oluştur
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FamilySetup;