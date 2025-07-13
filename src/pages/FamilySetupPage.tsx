import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Users, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FamilySetupPageProps {
  user: any;
  onFamilySetup: (familyId: string) => void;
}

const FamilySetupPage = ({ user, onFamilySetup }: FamilySetupPageProps) => {
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingFamilies, setExistingFamilies] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingFamilies();
  }, []);

  const checkExistingFamilies = async () => {
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingFamilies(data || []);
    } catch (error: any) {
      console.error('Aile kontrolü hatası:', error);
    }
  };

  const createFamily = async () => {
    if (!familyName.trim()) {
      toast({
        title: "Hata",
        description: "Aile adını girin.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Debug: Auth durumunu kontrol et
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session);
      console.log('Session user:', session?.user);
      console.log('Auth UID:', session?.user?.id);
      
      if (sessionError || !session?.user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      console.log('Creating family with user ID:', session.user.id);

      // Aile oluştur - RLS politikası auth.uid() ile created_by'ı karşılaştırır
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: familyName.trim(),
          created_by: session.user.id
        }])
        .select()
        .single();

      if (familyError) {
        console.error('Family creation error:', familyError);
        throw familyError;
      }

      console.log('Family created successfully:', familyData);

      // Kullanıcı profilini güncelle
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ family_id: familyData.id })
        .eq('user_id', session.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      toast({
        title: "Başarılı!",
        description: `${familyName} ailesi oluşturuldu.`,
      });

      onFamilySetup(familyData.id);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Aile oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinFamily = async (familyId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ family_id: familyId })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Aileye katıldınız.",
      });

      onFamilySetup(familyId);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Aileye katılırken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">
              Aile Kurulumu
            </CardTitle>
            <CardDescription>
              Çocuk sağlığı takibi için bir aile oluşturun veya mevcut bir aileye katılın
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Yeni Aile Oluştur */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Yeni Aile Oluştur</h3>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="family-name">Aile Adı</Label>
                <Input
                  id="family-name"
                  type="text"
                  placeholder="Örn: Yılmaz Ailesi"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={loading}
                />
                <Button 
                  onClick={createFamily} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Oluşturuluyor..." : "Aile Oluştur"}
                </Button>
              </div>
            </div>

            {/* Mevcut Aileler */}
            {existingFamilies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Mevcut Ailelere Katıl</h3>
                </div>
                
                <div className="space-y-2">
                  {existingFamilies.map((family) => (
                    <div key={family.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        <h4 className="font-medium">{family.name}</h4>
                        <p className="text-sm text-gray-600">
                          Oluşturulma: {new Date(family.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <Button
                        onClick={() => joinFamily(family.id)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        Katıl
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FamilySetupPage;