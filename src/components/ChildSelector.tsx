import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Baby, Plus, User, Calendar } from 'lucide-react';

interface ChildSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  children: any[];
  selectedChild: any;
  onChildSelect: (child: any) => void;
  onAddChild: () => void;
}

const ChildSelector = ({ isOpen, onClose, children, selectedChild, onChildSelect, onAddChild }: ChildSelectorProps) => {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} gün`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} ay`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return months > 0 ? `${years} yaş ${months} ay` : `${years} yaş`;
    }
  };

  const handleChildSelect = (child: any) => {
    onChildSelect(child);
    onClose();
  };

  const handleAddChild = () => {
    onClose();
    onAddChild();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Çocuk Seçimi</DialogTitle>
          <DialogDescription className="text-center">
            Takip etmek istediğiniz çocuğu seçin
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 mt-4">
          {children.map((child) => (
            <div 
              key={child.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedChild?.id === child.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleChildSelect(child)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Baby className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{child.name}</h3>
                  <p className="text-sm text-gray-600">
                    {calculateAge(child.birth_date)} • {child.gender === 'erkek' ? 'Erkek' : 'Kız'}
                  </p>
                  {child.blood_type && (
                    <p className="text-xs text-gray-500">Kan Grubu: {child.blood_type}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(child.birth_date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Yeni çocuk ekleme seçeneği */}
          <div 
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50"
            onClick={handleAddChild}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-700">Yeni Çocuk Ekle</h3>
                <p className="text-sm text-gray-500">
                  Yeni bir çocuk profili oluşturun
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            İptal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChildSelector;