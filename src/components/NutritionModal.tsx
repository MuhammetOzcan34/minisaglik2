import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Utensils, Plus, Clock, AlertTriangle, Apple } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: string;
}

const NutritionModal = ({ isOpen, onClose, childId }: NutritionModalProps) => {
  const [activeTab, setActiveTab] = useState('add-meal');
  const [loading, setLoading] = useState(false);
  const [nutritionRecords, setNutritionRecords] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);

  // Beslenme formu
  const [nutritionForm, setNutritionForm] = useState({
    meal_time: new Date().toISOString().slice(0, 16),
    meal_type: '',
    food_name: '',
    amount: '',
    unit: '',
    allergic_reaction: false,
    reaction_notes: '',
    notes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && childId) {
      loadTodayNutrition();
      loadAllergies();
    }
  }, [isOpen, childId]);

  const loadTodayNutrition = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('nutrition_records')
        .select('*')
        .eq('child_id', childId)
        .gte('meal_time', today + 'T00:00:00')
        .lt('meal_time', today + 'T23:59:59')
        .order('meal_time', { ascending: false });

      if (error) throw error;
      setNutritionRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Beslenme kayıtları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const loadAllergies = async () => {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllergies(data || []);
    } catch (error: any) {
      console.error('Alerjiler yüklenirken hata:', error);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutritionForm.meal_type || !nutritionForm.food_name || !nutritionForm.amount || !nutritionForm.unit) {
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
        .from('nutrition_records')
        .insert([{
          child_id: childId,
          meal_time: nutritionForm.meal_time,
          meal_type: nutritionForm.meal_type,
          food_name: nutritionForm.food_name,
          amount: nutritionForm.amount,
          unit: nutritionForm.unit,
          allergic_reaction: nutritionForm.allergic_reaction,
          reaction_notes: nutritionForm.reaction_notes || null,
          notes: nutritionForm.notes || null
        }]);

      if (error) throw error;

      // Eğer alerjik reaksiyon varsa ve bu allergen henüz kayıtlı değilse ekle
      if (nutritionForm.allergic_reaction && nutritionForm.reaction_notes) {
        const existingAllergen = allergies.find(a => 
          a.allergen.toLowerCase() === nutritionForm.food_name.toLowerCase()
        );
        
        if (!existingAllergen) {
          await supabase.from('allergies').insert([{
            child_id: childId,
            allergen: nutritionForm.food_name,
            severity: 'hafif',
            symptoms: nutritionForm.reaction_notes
          }]);
          
          toast({
            title: "Yeni Allerji Eklendi",
            description: `${nutritionForm.food_name} allerji listesine eklendi.`,
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Beslenme kaydedildi!",
        description: `${nutritionForm.food_name} başarıyla kaydedildi.`,
      });

      setNutritionForm({
        meal_time: new Date().toISOString().slice(0, 16),
        meal_type: '',
        food_name: '',
        amount: '',
        unit: '',
        allergic_reaction: false,
        reaction_notes: '',
        notes: ''
      });

      loadTodayNutrition();
      loadAllergies();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Beslenme kaydedilirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mealTypes = [
    { value: 'Ana Yemek', label: 'Ana Yemek', color: 'bg-blue-100 text-blue-800' },
    { value: 'Ara Öğün', label: 'Ara Öğün', color: 'bg-green-100 text-green-800' },
    { value: 'Atıştırmalık', label: 'Atıştırmalık', color: 'bg-orange-100 text-orange-800' }
  ];

  const units = [
    'Bardak', 'Kase', 'Tabak', 'Kaşık', 'Gram', 'ml', 'Adet', 'Dilim', 'Porsiyon'
  ];

  const getMealTypeColor = (mealType: string) => {
    const type = mealTypes.find(t => t.value === mealType);
    return type?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Beslenme Takibi
          </DialogTitle>
          <DialogDescription>
            Yemek ve içecek kayıtları ekleyin, alerjileri takip edin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-meal">Öğün Ekle</TabsTrigger>
            <TabsTrigger value="allergies">Alerjiler</TabsTrigger>
            <TabsTrigger value="history">Günlük Geçmiş</TabsTrigger>
          </TabsList>

          {/* Öğün Ekleme */}
          <TabsContent value="add-meal" className="space-y-4">
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meal_time">Yemek Zamanı *</Label>
                  <Input
                    id="meal_time"
                    type="datetime-local"
                    value={nutritionForm.meal_time}
                    onChange={(e) => setNutritionForm({...nutritionForm, meal_time: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal_type">Öğün Türü *</Label>
                  <Select 
                    value={nutritionForm.meal_type} 
                    onValueChange={(value) => setNutritionForm({...nutritionForm, meal_type: value})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Öğün türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="food_name">Yiyecek/İçecek Adı *</Label>
                <Input
                  id="food_name"
                  placeholder="Örn: Elma püresi, süt, pilav"
                  value={nutritionForm.food_name}
                  onChange={(e) => setNutritionForm({...nutritionForm, food_name: e.target.value})}
                  required
                  disabled={loading}
                />
                {/* Allerji uyarısı */}
                {allergies.some(a => a.allergen.toLowerCase().includes(nutritionForm.food_name.toLowerCase()) && nutritionForm.food_name.length > 2) && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Dikkat! Bu gıda allerji listesinde bulunuyor.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Miktar *</Label>
                  <Input
                    id="amount"
                    placeholder="Örn: 1, 50, 2.5"
                    value={nutritionForm.amount}
                    onChange={(e) => setNutritionForm({...nutritionForm, amount: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Birim *</Label>
                  <Select 
                    value={nutritionForm.unit} 
                    onValueChange={(value) => setNutritionForm({...nutritionForm, unit: value})}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Birim seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Alerjik Reaksiyon */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allergic_reaction"
                    checked={nutritionForm.allergic_reaction}
                    onCheckedChange={(checked) => setNutritionForm({...nutritionForm, allergic_reaction: checked})}
                    disabled={loading}
                  />
                  <Label htmlFor="allergic_reaction" className="text-sm font-medium">
                    Alerjik reaksiyon gözlendi
                  </Label>
                </div>
                
                {nutritionForm.allergic_reaction && (
                  <div className="space-y-2">
                    <Label htmlFor="reaction_notes">Reaksiyon Belirtileri *</Label>
                    <Textarea
                      id="reaction_notes"
                      placeholder="Kaşıntı, kızarıklık, kusma, ishal vb."
                      value={nutritionForm.reaction_notes}
                      onChange={(e) => setNutritionForm({...nutritionForm, reaction_notes: e.target.value})}
                      disabled={loading}
                      rows={2}
                      required={nutritionForm.allergic_reaction}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  placeholder="Çocuğun tepkisi, özel durumlar..."
                  value={nutritionForm.notes}
                  onChange={(e) => setNutritionForm({...nutritionForm, notes: e.target.value})}
                  disabled={loading}
                  rows={2}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Beslenme Kaydet
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Alerjiler */}
          <TabsContent value="allergies" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Bilinen Alerjiler</h3>
              {allergies.length === 0 ? (
                <div className="text-center py-8">
                  <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz allerji kaydı yok.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Beslenme kaydı sırasında reaksiyon bildirirseniz otomatik olarak eklenecektir.
                  </p>
                </div>
              ) : (
                allergies.map((allergy) => (
                  <Card key={allergy.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{allergy.allergen}</h4>
                          <Badge 
                            variant={
                              allergy.severity === 'şiddetli' ? 'destructive' : 
                              allergy.severity === 'orta' ? 'default' : 'secondary'
                            }
                          >
                            {allergy.severity}
                          </Badge>
                        </div>
                        {allergy.symptoms && (
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Belirtiler:</strong> {allergy.symptoms}
                          </p>
                        )}
                        {allergy.notes && (
                          <p className="text-sm text-gray-500">
                            <strong>Notlar:</strong> {allergy.notes}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Eklenme: {new Date(allergy.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Günlük Geçmiş */}
          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Bugünkü Beslenme</h3>
              {nutritionRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Bugün henüz beslenme kaydı yok.</p>
                </div>
              ) : (
                nutritionRecords.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{record.food_name}</h4>
                          <Badge className={getMealTypeColor(record.meal_type)}>
                            {record.meal_type}
                          </Badge>
                          {record.allergic_reaction && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Reaksiyon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {record.amount} {record.unit} - {new Date(record.meal_time).toLocaleString('tr-TR')}
                        </p>
                        {record.reaction_notes && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Reaksiyon:</strong> {record.reaction_notes}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Notlar:</strong> {record.notes}
                          </p>
                        )}
                      </div>
                      <Utensils className="h-5 w-5 text-gray-400 flex-shrink-0" />
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

export default NutritionModal;