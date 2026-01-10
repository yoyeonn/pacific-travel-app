import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-destination-detail',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.css',
})
export class DestinationDetail implements OnInit {
  destination: any = null;

  // Carousel
  selectedImageIndex: number = 0;
  autoSlideInterval: any;

  // Program selection
  selectedPackage = { adults: 1, children: 0 };

  relatedDestinations: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private destinationService: DestinationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadDestination(id);
    });
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }

  loadDestination(id: number) {
    this.destination = this.destinationService.getDestinationById(id);

    if (!this.destination) {
      alert('Destination not found!');
      this.router.navigate(['/destinations']);
      return;
    }

    // Fallbacks
    this.destination.activities ??= [
      { day: 1, activity: 'Arrival and welcome' },
      { day: 2, activity: 'Full city tour' },
      { day: 3, activity: 'Beach relaxation' }
    ];

    this.destination.faq ??= [
      { question: 'Best time to visit?', answer: 'March to September.', open: false },
      { question: 'Meals included?', answer: 'Breakfast included.', open: false }
    ];

this.destination.stars ??= 5; // default stars if missing
this.destination.reviews ??= [
  { name: 'Alice', stars: 5, comment: 'Amazing tour!' },
  { name: 'Bob', stars: 4, comment: 'Really enjoyed it.' }
];
this.destination.days ??= 3; // default days if missing



    this.selectedImageIndex = 0;
    this.selectedPackage = { adults: 1, children: 0 };

    this.relatedDestinations = this.destinationService.getDestinations()
      .filter(d => d.id !== id);

    this.startAutoSlide();
    window.scrollTo(0, 0);
  }

  // Carousel helpers
  get selectedImage(): string {
    if (!this.destination?.images?.length) return '';
    return this.destination.images[this.selectedImageIndex];
  }

  nextImage() {
    if (!this.destination?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.destination.images.length;
    this.fadeImage();
  }

  prevImage() {
    if (!this.destination?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.destination.images.length) %
      this.destination.images.length;
    this.fadeImage();
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
    this.fadeImage();
    this.startAutoSlide();
  }

  startAutoSlide() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = setInterval(() => this.nextImage(), 4000);
  }

  toggleFaq(index: number) {
    this.destination.faq[index].open = !this.destination.faq[index].open;
  }

  bookTrip() {
    alert(`
Booking confirmed for ${this.destination.name}!

Travelers: ${this.selectedPackage.adults} adult(s), ${this.selectedPackage.children} child(ren)
Duration: ${this.destination.days} days
Total price: ${this.destination.price}$
    `);
  }

  fadeImage() {
  const img = document.querySelector('.main-image img') as HTMLImageElement;
  if (!img) return;

  img.style.opacity = '0'; // fade out
  setTimeout(() => {
    img.src = this.selectedImage; // update image
    img.style.opacity = '1';     // fade in
  }, 200); // 200ms fade duration
}


}
