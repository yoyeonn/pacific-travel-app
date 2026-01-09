import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  hotels = [
  { 
    id: 1, 
    name: 'Manila Hotel', 
    location: 'Manila, Philippines', 
    price: 200, 
    days: 8, 
    stars: 5, 
    image: 'images/hotel-resto-1.jpg', 
    images: [
      'images/hotel-resto-1.jpg',
      'images/hotel-resto-2.jpg',
      'images/hotel-resto-3.jpg'
    ],
    facilities: ['2 baths', '3 beds', 'Near Mountain', 'Free Wifi', 'Swimming Pool', 'Gym'],
    description: 'Located in the heart of Manila, this luxury hotel offers top-notch amenities, spacious rooms, and beautiful views of the city. Perfect for business or leisure travelers.',
    reviews: [
      { name: 'Alice', stars: 5, comment: 'Amazing stay! Highly recommend.' },
      { name: 'Bob', stars: 4, comment: 'Very comfortable and clean rooms.' }
    ],
    lat: 14.5995,
    lng: 120.9842
  }
];



  constructor() { }

  getHotels() {
    return this.hotels;
  }

  getHotelById(id: number) {
  return this.hotels.find(h => h.id === id) || null;
}

  }

