import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HotelService } from '../../services/hotel.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

declare var google: any;

@Component({
  selector: 'app-hotel-detail',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './hotel-detail.html',
  styleUrl: './hotel-detail.css',
})
export class HotelDetail implements OnInit {
 hotel: any = null;

  // Image carousel
  selectedImageIndex: number = 0;
  autoSlideInterval: any;

  // Booking form
  booking = { checkin: '', checkout: '', guests: 1 };

  relatedHotels: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private hotelService: HotelService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadHotel(id);
    });
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }

  loadHotel(id: number) {
    this.hotel = this.hotelService.getHotelById(id);
    this.hotel.highlights ??= [
  "Beachfront location",
  "All-inclusive dining",
  "Outdoor pool & water slides",
  "Kids club & entertainment",
  "Free Wi-Fi throughout the resort"
];
this.hotel.rooms ??= [
  {
    name: "Double Room Garden View",
    image: this.hotel.images[0],
    description: "Comfortable room with balcony and garden view",
    capacity: 2,
    price: this.hotel.price + 20
  },
  {
    name: "Family Suite Sea View",
    image: this.hotel.images[1],
    description: "Spacious suite with stunning Mediterranean views",
    capacity: 4,
    price: this.hotel.price + 60
  }
];

this.hotel.nearby ??= [
  { name: "Djerba Golf Club", distance: "3 km" },
  { name: "Djerba Explore Park", distance: "2 km" },
  { name: "Midoun Souk", distance: "5 km" }
];

this.hotel.mapUrl ??=
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3214..."; // replace later

this.hotel.faq ??= [
  { question: "Is Wi-Fi free?", answer: "Yes, free in all areas.", open: false },
  { question: "Is parking available?", answer: "Private parking is free.", open: false },
  { question: "What time is check-in?", answer: "From 14:00", open: false }
];
    if (!this.hotel) {
      alert('Hotel not found!');
      this.router.navigate(['/hotel']);
      return;
    }

    this.selectedImageIndex = 0;
    this.booking = { checkin: '', checkout: '', guests: 1 };
    this.relatedHotels = this.hotelService.getHotels().filter(h => h.id !== id);

    this.startAutoSlide();
    window.scrollTo(0, 0);
  }

  startAutoSlide() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = setInterval(() => this.nextImage(), 4000);
  }

  // Carousel helpers
  get selectedImage(): string {
    if (!this.hotel?.images?.length) return '';
    return this.hotel.images[this.selectedImageIndex];
  }

  nextImage() {
    if (!this.hotel?.images?.length) return;
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.hotel.images.length;
    this.animateImage();
  }

  prevImage() {
    if (!this.hotel?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.hotel.images.length) % this.hotel.images.length;
    this.animateImage();
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
    this.animateImage();
    this.startAutoSlide();
  }

  animateImage() {
  const img = document.querySelector('.main-image img') as HTMLElement;
  if (!img) return;

  img.classList.add('fade');
  setTimeout(() => img.classList.remove('fade'), 500);
}

  bookHotel(event: Event) {
    event.preventDefault();
    alert(`Booking for ${this.hotel.name} submitted!`);
  }

  fadeImage() {
  const mainImageContainer = document.querySelector('.main-image') as HTMLElement;
  if (!mainImageContainer || !this.hotel) return;

  // Create a new img for crossfade
  const newImg = document.createElement('img');
  newImg.src = this.selectedImage;
  newImg.classList.add('fade-in');
  newImg.style.position = 'absolute';
  newImg.style.top = '0';
  newImg.style.left = '0';
  newImg.style.width = '100%';
  newImg.style.height = '100%';
  newImg.style.objectFit = 'cover';
  newImg.style.zIndex = '10';

  mainImageContainer.appendChild(newImg);

  // Animate opacity
  setTimeout(() => {
    newImg.style.opacity = '1';
  }, 10); // small delay to trigger CSS transition

  // Remove previous img after animation
  setTimeout(() => {
    const oldImg = mainImageContainer.querySelector('img:not(.fade-in)');
    if (oldImg) mainImageContainer.removeChild(oldImg);
    newImg.classList.remove('fade-in');
  }, 600); // match CSS transition
}

toggleFaq(index: number) {
  this.hotel.faq[index].open = !this.hotel.faq[index].open;
}

}
