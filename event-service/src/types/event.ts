export interface TangoEvent {
  id?: string;
  title: string;
  description?: string;
  location: string;
  start_date: Date;
  end_date: Date;
  price_euro: number;
  organizer_id: string;
  created_at?: Date;
}