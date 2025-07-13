import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import LoginPage from './LoginPage';
import FamilySetupPage from './FamilySetupPage';
import DashboardPage from './DashboardPage';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth durumunu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleFamilySetup = (familyId: string) => {
    // Profili yeniden yükle
    if (user) {
      loadUserProfile(user.id);
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

  // Kullanıcı giriş yapmamışsa login sayfasını göster
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Kullanıcı giriş yapmış ama aile kurulumu yapılmamışsa family setup göster
  if (!profile || !profile.family_id) {
    return <FamilySetupPage user={user} onFamilySetup={handleFamilySetup} />;
  }

  // Normal dashboard göster
  return <DashboardPage user={user} profile={profile} />;
};

export default Index;