import { useState, useEffect } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileNavigation from "@/components/MobileNavigation";
import DashboardOverview from "@/components/DashboardOverview";
import { useNavigate } from "react-router-dom";
import ChildSelector from "@/components/ChildSelector";
import FamilySetup from "@/components/FamilySetup";
import DailyRoutineModal from "@/components/DailyRoutineModal";
import NutritionModal from "@/components/NutritionModal";
import MedicationModal from "@/components/MedicationModal";
import TemperatureModal from "@/components/TemperatureModal";
import SeizureModal from "@/components/SeizureModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DashboardPageProps {
  user: any;
  profile: any;
}

const DashboardPage = ({ user, profile }: DashboardPageProps) => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('birth_date', { ascending: false });

      if (error) throw error;
      
      setChildren(data || []);
      if (data && data.length > 0 && !selectedChild) {
        setSelectedChild(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Çocuk bilgileri yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleChildAdded = (newChild: any) => {
    setChildren(prev => [...prev, newChild]);
    setSelectedChild(newChild);
    setShowFamilySetup(false);
  };

  const handleOpenModal = (type: string) => {
    if (!selectedChild && type !== 'child-setup') {
      toast({
        title: "Uyarı",
        description: "Önce bir çocuk seçin veya ekleyin.",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to appropriate page instead of opening modal
    switch (type) {
      case 'nutrition':
        navigate('/nutrition');
        break;
      case 'routine':
        navigate('/routine');
        break;
      case 'seizure':
        navigate('/seizures');
        break;
      case 'medication':
        navigate('/medications');
        break;
      case 'temperature':
        navigate('/temperature');
        break;
      default:
        setModalType(type);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Çocuk bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Çocuk yoksa kurulum ekranını göster
  if (children.length === 0) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar
            selectedChild={null}
            onChangeChild={() => {}}
            onLogout={handleLogout}
            onOpenModal={() => setShowFamilySetup(true)}
          />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Hoş Geldiniz!
                </h1>
                <p className="text-gray-600 mb-8">
                  Çocuk sağlığı takibine başlamak için ilk çocuğunuzu ekleyin.
                </p>
                <button
                  onClick={() => setShowFamilySetup(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Çocuk Ekle
                </button>
              </div>
            </div>
          </main>
          <MobileNavigation
            selectedChild={null}
            onChangeChild={() => {}}
            onLogout={handleLogout}
            onOpenModal={() => setShowFamilySetup(true)}
          />
        </div>
        
      {showFamilySetup && (
        <FamilySetup
          isOpen={showFamilySetup}
          onClose={() => setShowFamilySetup(false)}
          onChildAdded={handleChildAdded}
          familyId={profile.family_id}
        />
      )}
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          selectedChild={selectedChild}
          onChangeChild={() => setShowChildSelector(true)}
          onLogout={handleLogout}
          onOpenModal={handleOpenModal}
        />
        <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <DashboardOverview />
          </div>
        </main>
        <MobileNavigation
          selectedChild={selectedChild}
          onChangeChild={() => setShowChildSelector(true)}
          onLogout={handleLogout}
          onOpenModal={handleOpenModal}
        />
      </div>

      {/* Modaller */}
      {showChildSelector && (
        <ChildSelector
          isOpen={showChildSelector}
          onClose={() => setShowChildSelector(false)}
          children={children}
          selectedChild={selectedChild}
          onChildSelect={setSelectedChild}
          onAddChild={() => {
            setShowChildSelector(false);
            setShowFamilySetup(true);
          }}
        />
      )}

      {showFamilySetup && (
        <FamilySetup
          isOpen={showFamilySetup}
          onClose={() => setShowFamilySetup(false)}
          onChildAdded={handleChildAdded}
          familyId={profile.family_id}
        />
      )}

      {modalType === 'routine' && (
        <DailyRoutineModal
          isOpen={true}
          onClose={handleCloseModal}
          childId={selectedChild?.id}
        />
      )}

      {modalType === 'nutrition' && (
        <NutritionModal
          isOpen={true}
          onClose={handleCloseModal}
          childId={selectedChild?.id}
        />
      )}

      {modalType === 'medication' && (
        <MedicationModal
          isOpen={true}
          onClose={handleCloseModal}
          childId={selectedChild?.id}
        />
      )}

      {modalType === 'temperature' && (
        <TemperatureModal
          isOpen={true}
          onClose={handleCloseModal}
          childId={selectedChild?.id}
        />
      )}

      {modalType === 'seizure' && (
        <SeizureModal
          isOpen={true}
          onClose={handleCloseModal}
          childId={selectedChild?.id}
        />
      )}
    </SidebarProvider>
  );
};

export default DashboardPage;