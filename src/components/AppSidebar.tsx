
import { Home, User, Calendar, Settings, PlusCircle, Heart, Activity, FileText, LogOut, Utensils, Clock, Pill, Thermometer, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  selectedChild: any;
  onChangeChild: () => void;
  onLogout: () => void;
  onOpenModal: (modalType: string) => void;
}

const AppSidebar = ({ selectedChild, onChangeChild, onLogout, onOpenModal }: AppSidebarProps) => {
  const mainMenuItems = [
    {
      title: "Ana Sayfa",
      icon: Home,
      action: () => {},
      isActive: true
    },
    {
      title: "Günlük Rutin",
      icon: Clock,
      action: () => onOpenModal('routine')
    },
    {
      title: "Beslenme",
      icon: Utensils,
      action: () => onOpenModal('nutrition')
    },
    {
      title: "Epilepsi Nöbetleri",
      icon: Zap,
      action: () => onOpenModal('seizure')
    },
    {
      title: "İlaç Takibi",
      icon: Pill,
      action: () => onOpenModal('medication')
    },
    {
      title: "Ateş Ölçümü",
      icon: Thermometer,
      action: () => onOpenModal('temperature')
    },
    {
      title: "Takvim",
      icon: Calendar,
      action: () => onOpenModal('calendar')
    }
  ];

  const settingsItems = [
    {
      title: "Çocuk Değiştir",
      icon: User,
      action: onChangeChild
    },
    {
      title: "Ayarlar",
      icon: Settings,
      action: () => {}
    }
  ];

  return (
    <Sidebar className="w-64 border-r bg-white">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Sağlık Takibi</h2>
            {selectedChild && (
              <p className="text-sm text-gray-600">{selectedChild.name}</p>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Ana Menü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.action}
                    isActive={item.isActive}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Profil & Ayarlar
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={item.action}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t">
        <Button 
          variant="ghost" 
          onClick={onLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Çıkış Yap
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
