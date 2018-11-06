export interface Event {
  _id?: string;
  name: string;
  venue_name: string;
  venue_image: {
    url: string;
    thumb: string;
  },
  user: string;
  page_fb_id: string;
  image: {
    url: string;
    thumb: string;
  };
  page_access_token: string;

  start_period: Date;
  end_period: Date;
  hours_type: 'REGULAR_HOURS' | 'REGULAR_HOURS';
  is_limited_period: boolean;
  //start_time: string;
  //end_time: string;
  location: Address,
  days: Days;
}

export type HOUR_TYPES = 'REGULAR_HOURS' | 'SELECTED_HOURS';

export interface Address {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  street: string;
  zip: string;
}

export interface Day {
  is_opened: boolean;
  name: string;
  start_time: Date;
  end_time: Date;
  image: {
    url: string;
    thumb: string;
  },
  day_name?: string; // helper property
}

export interface Days {
  'Monday': Day;
  'Tuesday': Day;
  'Wednesday': Day;
  'Thursday': Day;
  'Friday': Day;
  'Saturday': Day;
  'Sunday': Day;
}
