import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Pack, PacksService } from '../../services/packs.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-packs-detail',
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './packs-detail.html',
  styleUrl: './packs-detail.css',
})
export class PacksDetail implements OnInit{
pack: Pack | undefined;

  // Carousel
  selectedImageIndex: number = 0;
  autoSlideInterval: any;

  // Booking selection
  selectedPackage = { adults: 1, children: 0 };

  relatedPacks: Pack[] = [];

  constructor(
    private route: ActivatedRoute,
    private packsService: PacksService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.loadPack(id);
    });
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }

  loadPack(id: number) {
    this.pack = this.packsService.getPackById(id);

    if (!this.pack) {
      alert('Pack not found!');
      this.router.navigate(['/packs']);
      return;
    }

    this.selectedImageIndex = 0;
    this.selectedPackage = { adults: 1, children: 0 };

    this.relatedPacks = this.packsService.getPacks().filter(p => p.id !== id);

    this.startAutoSlide();
    window.scrollTo(0, 0);
  }

  // Carousel
  get selectedImage(): string {
    if (!this.pack?.images?.length) return '';
    return this.pack.images[this.selectedImageIndex];
  }

  nextImage() {
    if (!this.pack?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.pack.images.length;
  }

  prevImage() {
    if (!this.pack?.images?.length) return;
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.pack.images.length) % this.pack.images.length;
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  startAutoSlide() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    this.autoSlideInterval = setInterval(() => this.nextImage(), 4000);
  }

  // Booking
  bookPack() {
    if (!this.pack) return;
    alert(`
Booking confirmed for ${this.pack.name}!

Travelers: ${this.selectedPackage.adults} adult(s), ${this.selectedPackage.children} child(ren)
Duration: ${this.pack.days} days
Total price: $${this.pack.price}
    `);
  }
}
