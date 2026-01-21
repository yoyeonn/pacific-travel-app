import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DestinationService } from '../../services/destination.service';
import { CommonModule } from '@angular/common';
import { Destinations } from '../../models/destinations';
import { FormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-destination',
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './destination.html',
  styleUrl: './destination.css',
})
export class Destination implements OnInit, OnDestroy {
ngAfterViewInit(): void {
    this.contentWayPoint();
    this.initOwlCarousel();
  }

  private contentWayPoint(): void {
    if ($('.ftco-animate').length === 0) return;

    $('.ftco-animate').toArray().forEach((el: HTMLElement) => {
      const $el = $(el);
      $el.waypoint((direction: string) => {
        if (direction === 'down' && !$el.hasClass('ftco-animated')) {
          $el.addClass('item-animate');
          setTimeout(() => {
            $('body .ftco-animate.item-animate').toArray().forEach((el2: HTMLElement, k: number) => {
              const $el2 = $(el2);
              const effect = $el2.data('animate-effect');
              if (effect === 'fadeIn') $el2.addClass('fadeIn ftco-animated');
              else if (effect === 'fadeInLeft') $el2.addClass('fadeInLeft ftco-animated');
              else if (effect === 'fadeInRight') $el2.addClass('fadeInRight ftco-animated');
              else $el2.addClass('fadeInUp ftco-animated');

              $el2.removeClass('item-animate');
            });
          }, 100);
        }
      }, { offset: '95%' });
    });

    // Trigger reflow to fix initial layout
    setTimeout(() => {
      $(window).trigger('resize').trigger('scroll');
    }, 100);
  }

  private initOwlCarousel(): void {
    // Make sure jQuery and Owl Carousel are loaded
    if ($('.owl-carousel').length === 0) return;

    $('.owl-carousel').owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      dots: true,
      autoplay: true,
      autoplayTimeout: 3000,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 }
      }
    });
  }

  destinations: Destinations[] = [];
  private clickListener!: () => void;
    constructor(private destinationService: DestinationService, private cd: ChangeDetectorRef, private zone: NgZone) {}


  ngOnInit(): void {
  this.loadAllDestinations();

  this.clickListener = () => {
    this.zone.run(() => {
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
      this.cd.detectChanges();
    });
  };

  document.addEventListener('click', this.clickListener);
}
ngOnDestroy(): void {
  document.removeEventListener('click', this.clickListener);
}


loadAllDestinations() {
    this.destinationService.getdestinations().subscribe({
    next: (data) => {
      this.destinations = data;
      this.allDestinations = data;
      setTimeout(() => {
        this.contentWayPoint();
        this.initOwlCarousel();
      });
      this.cd.detectChanges();
    },
    error: (err) => console.error(err)
  });
  }


observeCards() {
  const cards = document.querySelectorAll('.ftco-animate');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => observer.observe(card));
}

allDestinations: Destinations[] = [];
suggestions: Destinations[] = [];
showSuggestions = false;
activeSuggestionIndex: number = -1;

searchQuery = '';
checkIn = '';
checkOut = '';
maxPrice: number | null = null;

onSearch() {
  this.destinationService.searchDestinations(this.searchQuery, this.maxPrice, this.checkIn, this.checkOut)
    .subscribe({
      next: (data) => {
        this.destinations = data;
        setTimeout(() => {
          this.contentWayPoint();
          this.initOwlCarousel();
        });
        this.cd.detectChanges();
      },
      error: (err) => console.error(err)
    });
}

resetSearch() {
  this.searchQuery = '';
  this.checkIn = '';
  this.checkOut = '';
  this.maxPrice = null;

  this.loadAllDestinations();
}
onDestinationInput() {
  const q = this.searchQuery.trim().toLowerCase();

  if (!q) {
    this.suggestions = [];
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
    this.resetSearch();
    return;
  }

  this.suggestions = this.allDestinations
    .filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q)
    )
    .slice(0, 6);

  this.showSuggestions = this.suggestions.length > 0;
  this.activeSuggestionIndex = -1;
}



selectSuggestion(d: Destinations) {
  this.searchQuery = d.name;
  this.showSuggestions = false;
  this.suggestions = [];
  this.onSearch();
}


hideSuggestions() {
  setTimeout(() => {
    this.showSuggestions = false;
  }, 150);
}

onKeyDown(event: KeyboardEvent) {
  if (!this.suggestions.length) return;

  if (event.key === 'ArrowDown') {
    this.activeSuggestionIndex = Math.min(this.activeSuggestionIndex + 1, this.suggestions.length - 1);
    event.preventDefault();
  } else if (event.key === 'ArrowUp') {
    this.activeSuggestionIndex = Math.max(this.activeSuggestionIndex - 1, 0);
    event.preventDefault();
  } else if (event.key === 'Enter') {
    if (this.activeSuggestionIndex >= 0) {
      this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
      event.preventDefault();
    } else {
      this.onSearch();
    }
  }
}
today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

}
