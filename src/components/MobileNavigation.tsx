
import { useState } from 'react';
import { Home, Plus, Calendar, User, Menu, X, Heart, Activity, FileText, Settings, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

interface MobileNavigationProps {
  selectedChild: any;
  onChangeChild: () => void;
  onLogout: () => void;
  onOpenModal: (modalType: string) => void;
}

const MobileNavigation = ({ selectedChild, onChangeChild, onLogout, onOpenModal }: MobileNavigationProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const quickActions = [
    {
      title: "Ana Sayfa",
      icon: Home,
      action: () => {},
      isActive: true
    },
    {
      title: "Ekle",
      icon: Plus,
      action: () => onOpenModal('routine')
    },
    {
      title: "Takvim",
      icon: Calendar,
      action: () => {}
    },
    {
      title: "Menü",
      icon: Menu,
      action: () => setIsDrawerOpen(true)
    }
  ];

  const drawerMenuItems = [
    {
      title: "Günlük Rutin",
      icon: Heart,
      action: () => {
        onOpenModal('routine');
        setIsDrawerOpen(false);
      }
    },
    {
      title: "Beslenme Takibi",
      icon: Calendar,
      action: () => {
        onOpenModal('nutrition');
        setIsDrawerOpen(false);
      }
    },
    {
      title: "İlaç Takibi",
      icon: Activity,
      action: () => {
        onOpenModal('medication');
        setIsDrawerOpen(false);
      }
    },
    {
      title: "Ateş Ölçümü",
      icon: FileText,
      action: () => {
        onOpenModal('temperature');
        setIsDrawerOpen(false);
      }
    },
    {
      title: "Çocuk Değiştir",
      icon: User,
      action: () => {
        onChangeChild();
        setIsDrawerOpen(false);
      }
    },
    {
      title: "Ayarlar",
      icon: Settings,
      action: () => {
        setIsDrawerOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {quickActions.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className={`flex flex-col items-center p-2 h-auto ${
                item.isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
              onClick={item.action}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Drawer Menu */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <DrawerTitle className="text-lg font-semibold">Sağlık Takibi</DrawerTitle>
                  {selectedChild && (
                    <p className="text-sm text-gray-600">{selectedChild.name}</p>
                  )}
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {drawerMenuItems.map((item) => (
                <Button
                  key={item.title}
                  variant="ghost"
                  className="w-full justify-start h-12"
                  onClick={item.action}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Button>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  onLogout();
                  setIsDrawerOpen(false);
                }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileNavigation;
