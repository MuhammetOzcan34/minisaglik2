
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Baby, Calendar, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  weight: string;
  height: string;
  allergies: string;
  medications: string;
  conditions: string;
  notes: string;
}

interface ChildFormProps {
  onChildAdded: (child: Child) => void;
  onCancel: () => void;
}

const ChildForm = ({ onChildAdded, onCancel }: ChildFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    weight: '',
    height: '',
    allergies: '',
    medications: '',
    conditions: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthDate && formData.gender) {
      const newChild: Child = {
        id: Date.now().toString(),
        ...formData
      };
      onChildAdded(newChild);
      toast({
        title: "Çocuk profili oluşturuldu!",
        description: `${formData.name} profili başarıyla eklendi.`,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4 py-6">
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Baby className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-800">
            Çocuk Profili Oluştur
          </CardTitle>
          <CardDescription>
            Çocuğunuzun temel bilgilerini girerek takip sürecini başlatın
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Çocuğun Adı *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Doğum Tarihi *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Cinsiyet *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="erkek">Erkek</SelectItem>
                    <SelectItem value="kiz">Kız</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Mevcut Kilo (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Örn: 15.5"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Mevcut Boy (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Örn: 85"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Bilinen Alerjiler</Label>
                <Textarea
                  id="allergies"
                  placeholder="Gıda, ilaç veya çevresel alerjiler..."
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Kullandığı İlaçlar</Label>
                <Textarea
                  id="medications"
                  placeholder="Düzenli kullandığı ilaçlar ve dozları..."
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Sağlık Durumları / Tanılar</Label>
                <Textarea
                  id="conditions"
                  placeholder="Epilepsi, astım gibi tanılar..."
                  value={formData.conditions}
                  onChange={(e) => handleInputChange('conditions', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ek Notlar</Label>
                <Textarea
                  id="notes"
                  placeholder="Önemli notlar, özel durumlar..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <User className="h-4 w-4 mr-2" />
                Çocuk Profili Oluştur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildForm;
