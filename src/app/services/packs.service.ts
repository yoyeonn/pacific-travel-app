import { Injectable } from '@angular/core';
export interface Activity {
  day: number;
  activity: string;
}

export interface Pack {
  id: number;
  name: string;
  price: number;
  days: number;
  rating: number;
  mainImage: string;
  images: string[];
  description: string;
  activities: Activity[];
}
@Injectable({
  providedIn: 'root',
})
export class PacksService {
  private packs: Pack[] = [
    {
      id: 1,
      name: 'Adventure Pack',
      price: 1200,
      days: 5,
      rating: 4.8,
      mainImage: 'images/destination-3.jpg',
      images: ['images/destination-3.jpg', 'images/destination-3.jpg', 'images/destination-3.jpg'],
      description: 'Thrilling adventure activities for 5 days.',
      activities: [
        { day: 1, activity: 'Mountain hiking' },
        { day: 2, activity: 'River rafting' },
        { day: 3, activity: 'Camping under stars' },
        { day: 4, activity: 'Safari tour' },
        { day: 5, activity: 'Departure' }
      ]
    },
    {
      id: 2,
      name: 'Relaxation Pack',
      price: 1500,
      days: 7,
      rating: 4.9,
      mainImage: 'images/destination-3.jpg',
      images: ['images/destination-3.jpg', 'images/destination-3.jpg', 'images/destination-3.jpg'],
      description: 'Relaxing wellness and spa activities for 7 days.',
      activities: [
        { day: 1, activity: 'Arrival and welcome dinner' },
        { day: 2, activity: 'Yoga and meditation sessions' },
        { day: 3, activity: 'Spa day' },
        { day: 4, activity: 'Beach relaxation' },
        { day: 5, activity: 'Local cultural tour' },
        { day: 6, activity: 'Cooking class and free time' },
        { day: 7, activity: 'Departure' }
      ]
    }
  ];

  getPacks(): Pack[] {
    return this.packs;
  }

  getPackById(id: number): Pack | undefined {
    return this.packs.find(p => p.id === id);
  }
}
