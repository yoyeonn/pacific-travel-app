import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PacksService } from '../../services/packs.service';
import { Pack } from '../../models/pack';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Room } from '../../models/hotel';

@Component({
  selector: 'app-packs-detail',
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './packs-detail.html',
  styleUrl: './packs-detail.css',
})
export class PacksDetail implements OnInit, OnDestroy {
  pack!: Pack;
  selectedImageIndex: number = 0;
  autoSlideInterval: any;

  selectedPackage = { adults: 1, children: 0, checkIn: '', checkOut: '' };
  relatedPacks: Pack[] = [];

  bookingRooms: { room: Room; adults: number; children: number; babies: number }[] = [];
  selectedRoomToAdd: Room | null = null;
  
  booking = { checkin: '', checkout: '', guests: 1 };
  showRoomModal = false;

  constructor(
    private route: ActivatedRoute,
    private packsService: PacksService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      const id = Number(params.get('id'));
      if (!id) return;

      try {
        const allPacks = await this.packsService.getPacks();

        this.pack = await this.packsService.getPacksById(id);
        if (!this.pack) {
          this.router.navigate(['/packs']);
          return;
        }

        if (!this.pack.rooms) {
      this.pack.rooms = [];
    }

        this.relatedPacks = allPacks.filter(h => h.id !== id);

        if (this.pack.hotel?.rooms?.length) {
          this.bookingRooms = this.pack.hotel.rooms.map((r) => ({
            room: r,
            adults: Math.min(1, r.capacity),
            children: 0,
            babies: 0,
          }));
        }

        this.selectedImageIndex = 0;
        if (this.pack.images.length > 1) {
          this.startAutoSlide();
        }

        window.scrollTo(0, 0);
        this.cd.detectChanges();

      } catch (err) {
        console.error(err);
        this.router.navigate(['/packs']);
      }
    });
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
    document.body.style.overflow = 'auto';
  }

  get selectedImage(): string {
    if (!this.pack?.images?.length) return '';
    return 'images/' + this.pack.images[this.selectedImageIndex];
  }

  nextImage() {
    this.selectedImageIndex = (this.selectedImageIndex + 1) % this.pack.images.length;
    this.cd.detectChanges();
  }

  prevImage() {
    this.selectedImageIndex = (this.selectedImageIndex - 1 + this.pack.images.length) % this.pack.images.length;
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
    if (this.pack.images.length <= 1) return;
    this.startAutoSlide();
  }

  toggleFaq(index: number) {
    if (this.pack.faq) this.pack.faq[index].open = !this.pack.faq[index].open;
  }

  bookPack() {
    if (!this.selectedPackage.checkIn || !this.selectedPackage.checkOut) {
      alert('Please select check-in and check-out dates!');
      return;
    }
    if (new Date(this.selectedPackage.checkOut) <= new Date(this.selectedPackage.checkIn)) {
      alert('Check-out must be after check-in!');
      return;
    }

    const roomsSummary = this.bookingRooms
      .map(
        (r) => `${r.room.name}: ${r.adults} adults, ${r.children} children, ${r.babies} babies`
      )
      .join('\n');

    alert(`Booking confirmed for ${this.pack.name}!\n` +
      `Hotel: ${this.pack.hotel?.name || 'N/A'}\n` +
      `Destination: ${this.pack.destination?.name || 'N/A'}\n` +
      `Check-in: ${this.selectedPackage.checkIn}\n` +
      `Check-out: ${this.selectedPackage.checkOut}\n\nRooms:\n${roomsSummary}`);
  }

  addRoom(selectedRoom: Room | null) {
    if (!selectedRoom) return;
    this.bookingRooms.push({
      room: selectedRoom,
      adults: Math.min(selectedRoom.capacity, 2),
      children: 0,
      babies: 0
    });

    this.selectedRoomToAdd = null;
  }


  removeRoom(index: number) {
    this.bookingRooms.splice(index, 1);
  }

  openRoomModal() {
    this.showRoomModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeRoomModal() {
    this.showRoomModal = false;
    document.body.style.overflow = 'auto';
  }
}
