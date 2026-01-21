import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PacksService } from '../../services/packs.service';
import { Pack } from '../../models/pack';
declare var $: any;

@Component({
  selector: 'app-packs',
  imports: [RouterModule,CommonModule],
  templateUrl: './packs.html',
  styleUrl: './packs.css',
})
export class Packs implements OnInit{
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


  packs: Pack[] = [];

  constructor(private packsService: PacksService , private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadPacks();
  }

  async loadPacks() {
  try {
    this.packs = await this.packsService.getPacks();
    setTimeout(() => {
      this.contentWayPoint();
      this.initOwlCarousel();
    });
    this.cd.detectChanges();
  } catch (err) {
    console.error('Failed to load packs', err);
  }
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
}
