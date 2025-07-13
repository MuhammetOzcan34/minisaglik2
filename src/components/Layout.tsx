import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileNavigation from "@/components/MobileNavigation";
import ChildSelector from "@/components/ChildSelector";
import FamilySetup from "@/components/FamilySetup";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Layout = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [showFamilySetup, setShowFamilySetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        return;
      }

      setProfile(profileData);
      
      if (profileData.family_id) {
        loadChildren(profileData.family_id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    }
  };

  const loadChildren = async (familyId: string) => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId)
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
      navigate('/login');
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
    
    // Navigate to appropriate page
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
      case 'child-setup':
        setShowFamilySetup(true);
        break;
      case 'calendar':
        navigate('/calendar');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If no children, show setup screen
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
                <h1 className="text-3xl font-bold mb-4">
                  Hoş Geldiniz!
                </h1>
                <p className="text-muted-foreground mb-8">
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
            familyId={profile?.family_id}
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
            <Outlet context={{ selectedChild }} />
          </div>
        </main>
        <MobileNavigation
          selectedChild={selectedChild}
          onChangeChild={() => setShowChildSelector(true)}
          onLogout={handleLogout}
          onOpenModal={handleOpenModal}
        />
      </div>

      {/* Modals */}
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
          familyId={profile?.family_id}
        />
      )}
    </SidebarProvider>
  );
};

export default Layout;