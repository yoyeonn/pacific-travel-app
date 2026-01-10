import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  destinations = [
    {
      id: 1,
      name: 'Bangkok',
      country: 'Thailand',
      price: 800,
      days: 6,
      rating: 4.7,
      mainImage: 'images/destination-1.jpg',
      images: [
        'images/destination-1.jpg',
        'images/destination-2.jpg',
        'images/destination-3.jpg'
      ],
      description: 'Discover the city of temples,',
      about: `Bangkok is a lively capital known for its rich culture, floating markets, and incredible street food.`,
      activities: [
        { day: 1, activity: 'Arrival and river cruise' },
        { day: 2, activity: 'Grand Palace & Wat Pho temple visit' },
        { day: 3, activity: 'Floating market tour' },
        { day: 4, activity: 'Free day shopping' },
        { day: 5, activity: 'Night market and food tasting' },
        { day: 6, activity: 'Departure' }
      ]
    },
    {
      id: 2,
      name: 'Bali',
      country: 'Indonesia',
      price: 950,
      days: 7,
      rating: 4.8,
      mainImage: 'images/destination-4.jpg',
      images: [
        'images/destination-4.jpg',
        'images/destination-5.jpg',
        'images/destination-6.jpg'
      ],
      description: 'Paradise island with beaches, temples and nature.',
      about: `Bali is famous for its traditional dances, volcanic mountains, coral reefs, and peaceful beaches.`,
      activities: [
        { day: 1, activity: 'Airport pick-up and welcome dinner' },
        { day: 2, activity: 'Ubud rice terraces tour' },
        { day: 3, activity: 'Temple visits and beach relaxation' },
        { day: 4, activity: 'Water sports or spa' },
        { day: 5, activity: 'Balinese culture and shopping' },
        { day: 6, activity: 'Free day' },
        { day: 7, activity: 'Departure' }
      ]
    }
  ];

  getDestinations() {
    return this.destinations;
  }

  getDestinationById(id: number) {
    return this.destinations.find(d => d.id === id);
  }
}
