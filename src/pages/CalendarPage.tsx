import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from 'lucide-react';

interface ContextType {
  selectedChild: any;
}

const CalendarPage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [date, setDate] = useState<Date | undefined>(new Date());

  if (!selectedChild) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Önce bir çocuk seçin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Takvim</h1>
          <p className="text-muted-foreground">{selectedChild.name} için etkinlik takvimi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Takvim
            </CardTitle>
            <CardDescription>
              Tarih seçmek için takvimi kullanın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seçili Tarih</CardTitle>
            <CardDescription>
              {date ? date.toLocaleDateString('tr-TR') : 'Tarih seçilmedi'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Bu tarih için kayıtlar görüntülenecek...
              </p>
              {/* Buraya seçili tarihteki kayıtlar eklenebilir */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;