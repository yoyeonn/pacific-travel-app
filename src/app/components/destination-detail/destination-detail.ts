import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Destinations } from '../../models/destinations';
import { forkJoin, map, Subject, switchMap, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-destination-detail',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './destination-detail.html',
  styleUrl: './destination-detail.css',
})
export class DestinationDetail implements OnInit, OnDestroy {
  destination!: Destinations;
  relatedDestinations: Destinations[] = [];
  selectedImageIndex: number = 0;
  autoSlideInterval: any;
  selectedPackage = { adults: 1, children: 0, checkIn: '', checkOut: '' };
  private destroy$ = new Subject<void>();

  today!: string;
  bookingMessage = '';
  bookingMessageType: 'error' | 'success' = 'error';

  constructor(
    private route: ActivatedRoute,
    private destinationService: DestinationService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];
    this.route.paramMap
      .pipe(
        map(params => Number(params.get('id'))),
        switchMap(id => {
          if (!id) {
            this.router.navigate(['/destination']);
            throw new Error('Invalid id');
          }

          // load destination + list in parallel
          return forkJoin({
            dest: this.destinationService.getdestinationById(id),
            all: this.destinationService.getdestinations(),
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ dest, all }) => {
          this.destination = dest;
          this.relatedDestinations = all.filter(d => d.id !== dest.id);

          this.selectedImageIndex = 0;

          if (this.destination.images?.length > 1) {
            this.startAutoSlide();
          } else {
            this.pauseAutoSlide();
          }

          window.scrollTo(0, 0);
          this.cd.detectChanges();
        },
        error: () => {
          this.router.navigate(['/destination']);
        },
      });
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    document.body.style.overflow = 'auto';
  }

  get selectedImage(): string {
    if (!this.destination?.images?.length) return '';
    return 'images/' + this.destination.images[this.selectedImageIndex];
  }

  nextImage() {
    this.selectedImageIndex =
      (this.selectedImageIndex + 1) % this.destination.images.length;

    this.cd.detectChanges();
  }

  prevImage() {
    this.selectedImageIndex =
      (this.selectedImageIndex - 1 + this.destination.images.length) %
      this.destination.images.length;

    this.cd.detectChanges();
  }

  selectImage(index: number) {
    if (index === this.selectedImageIndex) return;
    this.selectedImageIndex = index;
    this.restartAutoSlide();
    this.cd.detectChanges();
  }

  startAutoSlide() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);

    this.autoSlideInterval = setInterval(() => {
      this.nextImage();
    }, 4000);
  }
  restartAutoSlide() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    this.startAutoSlide();
  }

  pauseAutoSlide() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }

  resumeAutoSlide() {
    if (this.destination.images.length <= 1) return;
    this.startAutoSlide();
  }

  toggleFaq(index: number) {
    if (this.destination.faq) this.destination.faq[index].open = !this.destination.faq[index].open;
  }

  bookTrip(event?: Event) {
  event?.preventDefault();

  // reset msg
  this.bookingMessage = '';

  // 1) auth check
  if (!this.authService.isLoggedIn()) {
    this.bookingMessageType = 'error';
    this.bookingMessage = "Vous devez être connecté pour réserver.";
    const returnUrl = this.router.url;
    this.router.navigate(['/login'], { queryParams: { returnUrl } });
    return;
  }

  // 2) validation
  const { checkIn, checkOut, adults, children } = this.selectedPackage;

  if (!checkIn || !checkOut) {
    this.bookingMessageType = 'error';
    this.bookingMessage = "Veuillez choisir les dates d'arrivée et de départ.";
    return;
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    this.bookingMessageType = 'error';
    this.bookingMessage = "La date de départ doit être après la date d’arrivée.";
    return;
  }

  const totalPeople = (adults || 0) + (children || 0);
  if (totalPeople <= 0) {
    this.bookingMessageType = 'error';
    this.bookingMessage = "Veuillez sélectionner au moins 1 voyageur.";
    return;
  }

  // 3) compute total
  const nights = this.daysBetween(checkIn, checkOut);
  const totalAmount = totalPeople * (this.destination.price || 0) * nights;

  const payload = {
    destinationId: this.destination.id,
    checkIn,
    checkOut,
    adults,
    children,
    totalAmount,
  };

  // 4) save in DB
  this.destinationService.reserveDestination(payload).subscribe({
    next: (saved) => {
  this.bookingMessageType = 'success';
  this.bookingMessage = "Réservation enregistrée ✅";

  this.downloadDestinationFacturePdf();
},
    error: (err) => {
      console.error(err);
      this.bookingMessageType = 'error';

      if (err?.status === 401) {
        this.bookingMessage = "Session expirée. Veuillez vous reconnecter.";
        const returnUrl = this.router.url;
        this.router.navigate(['/login'], { queryParams: { returnUrl } });
        return;
      }

      this.bookingMessage = "Erreur lors de l'enregistrement de la réservation.";
    }
  });
}

daysBetween(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}


  getStars(n: number): number[] {
  return Array.from({ length: Math.round(n) }, (_, i) => i + 1);
  }

  get averageRating(): number {
    if (!this.destination?.reviews?.length) return 0;
    const total = this.destination.reviews.reduce((sum, r) => sum + r.stars, 0);
    return total / this.destination.reviews.length;
  }

  getAverageRating(dest: Destinations): number {
  if (!dest?.reviews?.length) return 0;
  const total = dest.reviews.reduce((sum, r) => sum + r.stars, 0);
  return total / dest.reviews.length;
}


  fullStars(stars: number): number[] {
    return Array(Math.floor(stars)).fill(0);
  }

  hasHalfStar(stars: number): boolean {
    return stars % 1 >= 0.5;
  }

  emptyStars(stars: number): number[] {
    const totalStars = 5;
    const full = Math.floor(stars);
    const half = this.hasHalfStar(stars) ? 1 : 0;
    return Array(totalStars - full - half).fill(0);
  }

  onCheckInChange() {
  if (this.selectedPackage.checkOut && this.selectedPackage.checkOut < this.selectedPackage.checkIn) {
    this.selectedPackage.checkOut = '';
  }
}


downloadDestinationFacturePdf() {
  const doc = new jsPDF();
  const now = new Date();
  const factureNumber = `DEST-${now.getTime()}`;

  const nights = this.daysBetween(this.selectedPackage.checkIn, this.selectedPackage.checkOut);
  const adults = this.selectedPackage.adults || 0;
  const children = this.selectedPackage.children || 0;
  const people = adults + children;

  const pricePerPerson = this.destination?.price || 0;
  const total = pricePerPerson * people * nights;

  // Header
  doc.setFontSize(16);
  doc.text('FACTURE - Réservation Destination', 14, 18);

  doc.setFontSize(10);
  doc.text(`N° Facture: ${factureNumber}`, 14, 26);
  doc.text(`Date: ${now.toLocaleDateString()}`, 14, 32);

  // Destination info
  doc.setFontSize(12);
  doc.text(`Destination: ${this.destination?.name || '-'}`, 14, 44);

  doc.setFontSize(10);
  doc.text(`Pays: ${this.destination?.country || '-'}`, 14, 50);
  doc.text(`Lieu: ${this.destination?.location || '-'}`, 14, 56);

  // Booking info
  doc.text(`Arrivée: ${this.selectedPackage.checkIn}`, 14, 66);
  doc.text(`Départ: ${this.selectedPackage.checkOut}`, 14, 72);
  doc.text(`Nuits: ${nights}`, 14, 78);

  doc.text(`Voyageurs: ${adults} adulte(s), ${children} enfant(s)`, 14, 86);
  doc.text(`Prix: ${pricePerPerson.toFixed(2)} TND / personne / nuit`, 14, 92);

  // Table
  autoTable(doc, {
    startY: 102,
    head: [['Type', 'Nombre', 'Prix (TND)', 'Nuits', 'Total (TND)']],
    body: [
      ['Adultes', `${adults}`, `${pricePerPerson.toFixed(2)}`, `${nights}`, `${(adults * pricePerPerson * nights).toFixed(2)}`],
      ['Enfants', `${children}`, `${pricePerPerson.toFixed(2)}`, `${nights}`, `${(children * pricePerPerson * nights).toFixed(2)}`],
    ],
    styles: { fontSize: 9 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 102;

  doc.setFontSize(12);
  doc.text(`TOTAL: ${total.toFixed(2)} TND`, 14, finalY + 14);

  doc.save(`${factureNumber}.pdf`);
}

}
