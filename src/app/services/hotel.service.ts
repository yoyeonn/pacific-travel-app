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
    
    // About the city
    apropos: `Manila is the bustling capital of the Philippines, rich in history and culture. Visitors can explore Intramuros, Rizal Park, and the vibrant markets, enjoying a mix of heritage, shopping, and nightlife.`,

    programme: [
      { day: 1, activity: 'Arrival and check-in, welcome drink at the lounge' },
      { day: 2, activity: 'City tour of Manila and shopping excursion' },
      { day: 3, activity: 'Beach day with water sports and evening BBQ' },
      { day: 4, activity: 'Free day to explore or relax at the spa' },
    ],

    reviews: [
      { name: 'Alice', stars: 5, comment: 'Amazing stay! Highly recommend.' },
      { name: 'Bob', stars: 4, comment: 'Very comfortable and clean rooms.' }
    ],
    lat: 14.5995,
    lng: 120.9842
  },
  { 
    id: 2, 
    name: 'Cebu Grand Hotel', 
    location: 'Cebu, Philippines', 
    price: 500, 
    days: 10, 
    stars: 4, 
    image: 'images/hotel-resto-2.jpg', 
    images: [
      'images/hotel-resto-4.jpg',
      'images/hotel-resto-5.jpg',
      'images/hotel-resto-6.jpg'
    ],
    facilities: ['2 baths', '3 beds', 'Near Mountain', 'Free Wifi', 'Swimming Pool', 'Gym'],
    description: 'A modern hotel located near the heart of Cebu city, offering comfort and convenience for travelers.',
    
    // About the city
    apropos: `Cebu is a lively island city in the Philippines known for its beautiful beaches, historical landmarks, and delicious local cuisine. Guests can explore Magellan’s Cross, Fort San Pedro, and relax on nearby tropical islands.`,

    programme: [
      { day: 1, activity: 'Arrival and check-in, welcome cocktail' },
      { day: 2, activity: 'Historical city tour of Cebu and shopping' },
      { day: 3, activity: 'Island hopping and snorkeling adventure' },
      { day: 4, activity: 'Leisure day at the hotel pool and spa' },
    ],

    reviews: [
      { name: 'Alice', stars: 5, comment: 'Beautiful views and excellent service.' },
      { name: 'John', stars: 4, comment: 'Very comfortable rooms, enjoyed the location.' }
    ],
    lat: 10.3157,
    lng: 123.8854
  },
  { 
    id: 3, 
    name: 'Boracay Beach Resort', 
    location: 'Boracay, Philippines', 
    price: 350, 
    days: 6, 
    stars: 5, 
    image: 'images/hotel-resto-9.jpg', 
    images: [
      'images/hotel-resto-7.jpg',
      'images/hotel-resto-8.jpg',
      'images/hotel-resto-9.jpg'
    ],
    facilities: ['2 baths', '3 beds', 'Near Beach', 'Free Wifi', 'Swimming Pool', 'Water Sports'],
    description: 'An exclusive beachfront resort offering luxury villas and breathtaking ocean views.',

    // About the city
    apropos: `Boracay is a world-famous island in the Philippines known for its white sandy beaches, crystal-clear waters, and vibrant nightlife. Guests can enjoy water sports, sunset sailing, and explore local restaurants and markets.`,

    programme: [
      { day: 1, activity: 'Arrival and check-in, beach welcome reception' },
      { day: 2, activity: 'Water sports activities and island exploration' },
      { day: 3, activity: 'Relaxation on White Beach and sunset cruise' },
      { day: 4, activity: 'Optional spa and cultural show at the resort' },
    ],

    reviews: [
      { name: 'Alice', stars: 5, comment: 'Amazing beachfront location and service!' },
      { name: 'John', stars: 3, comment: 'Lovely resort, though crowded at peak season.' }
    ],
    lat: 11.9674,
    lng: 121.9247
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

