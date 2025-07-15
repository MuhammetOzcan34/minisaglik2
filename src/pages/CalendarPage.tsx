import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  CalendarDays, Plus, Clock, AlertTriangle, CheckCircle, 
  Zap, Pill, Utensils, Bed, Thermometer, Activity, FileText, Bell
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContextType {
  selectedChild: any;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  event_type: string;
  color: string;
  is_recurring: boolean;
  reminder_minutes: number;
  is_completed: boolean;
  notes?: string;
}

const CalendarPage = () => {
  const { selectedChild } = useOutletContext<ContextType>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const { toast } = useToast();

  // Event form data
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '',
    event_type: '',
    color: '#3B82F6',
    is_recurring: false,
    reminder_minutes: 15,
    notes: ''
  });

  // Event types and colors
  const eventTypes = {
    seizure: { label: 'Nöbet', color: '#EF4444', icon: Zap },
    medication: { label: 'İlaç', color: '#3B82F6', icon: Pill },
    nutrition: { label: 'Beslenme', color: '#10B981', icon: Utensils },
    sleep: { label: 'Uyku', color: '#8B5CF6', icon: Bed },
    temperature: { label: 'Ateş', color: '#F59E0B', icon: Thermometer },
    appointment: { label: 'Randevu', color: '#06B6D4', icon: CalendarDays },
    test: { label: 'Tahlil', color: '#84CC16', icon: FileText },
    activity: { label: 'Aktivite', color: '#F97316', icon: Activity },
    reminder: { label: 'Hatırlatma', color: '#EC4899', icon: Bell },
    other: { label: 'Diğer', color: '#6B7280', icon: Clock }
  };

  useEffect(() => {
    if (selectedChild) {
      loadEvents();
    }
  }, [selectedChild, date]);

  const loadEvents = async () => {
    try {
      const startOfMonth = new Date(date!.getFullYear(), date!.getMonth(), 1);
      const endOfMonth = new Date(date!.getFullYear(), date!.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('child_id', selectedChild.id)
        .gte('event_date', startOfMonth.toISOString().split('T')[0])
        .lte('event_date', endOfMonth.toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Takvim olayları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.event_date === dateStr);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dayEvents = getEventsForDate(selectedDate);
      if (dayEvents.length > 0) {
        setSelectedEvent(dayEvents[0]);
        setShowEventDetails(true);
      }
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleAddEvent = () => {
    if (date) {
      setEventForm({
        ...eventForm,
        event_date: date.toISOString().split('T')[0]
      });
    }
    setShowEventModal(true);
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.event_date || !eventForm.event_type) {
      toast({
        title: "Hata",
        description: "Başlık, tarih ve tür zorunludur.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        child_id: selectedChild.id,
        title: eventForm.title,
        description: eventForm.description || null,
        event_date: eventForm.event_date,
        event_time: eventForm.event_time || null,
        event_type: eventForm.event_type,
        color: eventForm.color,
        is_recurring: eventForm.is_recurring,
        reminder_minutes: eventForm.reminder_minutes,
        notes: eventForm.notes || null
      };

      const { error } = await supabase
        .from('calendar_events')
        .insert([eventData]);

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Takvim olayı eklendi.",
      });

      setShowEventModal(false);
      setEventForm({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        event_time: '',
        event_type: '',
        color: '#3B82F6',
        is_recurring: false,
        reminder_minutes: 15,
        notes: ''
      });
      loadEvents();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Olay eklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleEventCompletion = async (event: CalendarEvent) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({ is_completed: !event.is_completed })
        .eq('id', event.id);

      if (error) throw error;

      loadEvents();
      toast({
        title: "Başarılı!",
        description: `Olay ${event.is_completed ? 'tamamlanmadı' : 'tamamlandı'} olarak işaretlendi.`,
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Olay güncellenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (event: CalendarEvent) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      setShowEventDetails(false);
      loadEvents();
      toast({
        title: "Başarılı!",
        description: "Olay silindi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Olay silinirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return events
      .filter(event => event.event_date >= todayStr && !event.is_completed)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 5);
  };

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
        <Button onClick={handleAddEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Olay
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Takvim */}
        <div className="lg:col-span-2">
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
                onSelect={handleDateSelect}
                className="rounded-md border"
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0,
                  isToday: (date) => date.toDateString() === new Date().toDateString()
                }}
                modifiersStyles={{
                  hasEvents: { 
                    backgroundColor: '#3B82F6', 
                    color: 'white',
                    fontWeight: 'bold'
                  },
                  isToday: { 
                    border: '2px solid #3B82F6',
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Seçili Tarih Olayları */}
          <Card>
            <CardHeader>
              <CardTitle>Seçili Tarih</CardTitle>
              <CardDescription>
                {date ? date.toLocaleDateString('tr-TR') : 'Tarih seçilmedi'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {date && getEventsForDate(date).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Bu tarih için olay yok
                  </p>
                ) : (
                  getEventsForDate(date).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEventClick(event)}
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {eventTypes[event.event_type]?.label}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {event.is_completed && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                          {event.reminder_minutes > 0 && (
                            <Bell className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Yaklaşan Olaylar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Yaklaşan Olaylar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingEvents().length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Yaklaşan olay yok
                  </p>
                ) : (
                  getUpcomingEvents().map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handleEventClick(event)}
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {eventTypes[event.event_type]?.label}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Renk Açıklamaları */}
          <Card>
            <CardHeader>
              <CardTitle>Renk Açıklamaları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(eventTypes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: value.color }}
                    />
                    <span className="text-sm">{value.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Olay Ekleme Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Takvim Olayı</DialogTitle>
            <DialogDescription>
              Takvime yeni bir olay ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                placeholder="Olay başlığı"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Olay Türü *</Label>
              <Select
                value={eventForm.event_type}
                onValueChange={(value) => {
                  setEventForm({
                    ...eventForm, 
                    event_type: value,
                    color: eventTypes[value as keyof typeof eventTypes]?.color || '#3B82F6'
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Olay türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: value.color }}
                        />
                        {value.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Tarih *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_time">Saat</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={eventForm.event_time}
                  onChange={(e) => setEventForm({...eventForm, event_time: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Olay açıklaması"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_minutes">Hatırlatma (dakika)</Label>
              <Select
                value={eventForm.reminder_minutes.toString()}
                onValueChange={(value) => setEventForm({
                  ...eventForm, 
                  reminder_minutes: parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Hatırlatma yok</SelectItem>
                  <SelectItem value="5">5 dakika önce</SelectItem>
                  <SelectItem value="15">15 dakika önce</SelectItem>
                  <SelectItem value="30">30 dakika önce</SelectItem>
                  <SelectItem value="60">1 saat önce</SelectItem>
                  <SelectItem value="120">2 saat önce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={eventForm.notes}
                onChange={(e) => setEventForm({...eventForm, notes: e.target.value})}
                placeholder="Ek notlar"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowEventModal(false)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button 
              onClick={saveEvent}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Olay Detayları Modal */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && new Date(selectedEvent.event_date).toLocaleDateString('tr-TR')}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  style={{ borderColor: selectedEvent.color, color: selectedEvent.color }}
                >
                  {eventTypes[selectedEvent.event_type]?.label}
                </Badge>
                {selectedEvent.is_completed && (
                  <Badge variant="default" className="bg-green-600">
                    Tamamlandı
                  </Badge>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Açıklama</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.event_time && (
                <div>
                  <h4 className="font-medium mb-2">Saat</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.event_time}</p>
                </div>
              )}

              {selectedEvent.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notlar</h4>
                  <p className="text-sm text-muted-foreground">{selectedEvent.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => toggleEventCompletion(selectedEvent)}
                  className="flex-1"
                >
                  {selectedEvent.is_completed ? 'Tamamlanmadı' : 'Tamamlandı'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => deleteEvent(selectedEvent)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;