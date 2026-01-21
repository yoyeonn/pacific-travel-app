import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { AuthService } from '../../services/auth.service';
import { ReservationRow, ReservationService } from '../../services/reservation.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type InvoiceJson = {
  roomPrices: string;   // "140.5,180.5,100.0"
  roomIds: string;      // "1,2,3"
  roomNames: string;    // "Double..., Family..., Standard..."
  adults: number;
  children: number;
  babies: number;
  hotelId: number;
  hotelName: string;
  createdAt: string;    // ISO
  totalAmount: number;
  checkIn: string;      // "YYYY-MM-DD"
  checkOut: string;     // "YYYY-MM-DD"
  id: number;           // reservation id
  mealPlan: string;     // "AI"
};

type RoomLine = {
  roomId: number | null;
  roomName: string;
  pricePerPerson: number;   // from roomPrices
};
function downloadFacturePdfFromJson(data: any) {
  const doc = new jsPDF();

  // ---- helpers ----
  const parseCsv = (s: string) =>
    (s || '')
      .split(',')
      .map(x => x.trim())
      .filter(x => x.length > 0);

  const parseRoomLines = (d: InvoiceJson): RoomLine[] => {
    const ids = parseCsv(d.roomIds).map(v => Number(v));
    const names = parseCsv(d.roomNames);
    const prices = parseCsv(d.roomPrices).map(v => Number(v));

    const n = Math.max(ids.length, names.length, prices.length);
    const lines: RoomLine[] = [];

    for (let i = 0; i < n; i++) {
      lines.push({
        roomId: Number.isFinite(ids[i]) ? ids[i] : null,
        roomName: names[i] ?? `Chambre ${i + 1}`,
        pricePerPerson: Number.isFinite(prices[i]) ? prices[i] : 0,
      });
    }
    return lines;
  };

  const daysBetween = (checkIn: string, checkOut: string) => {
    // Parse as local midnight to avoid timezone shifts
    const [y1, m1, d1] = checkIn.split('-').map(Number);
    const [y2, m2, d2] = checkOut.split('-').map(Number);
    const a = new Date(y1, (m1 || 1) - 1, d1 || 1);
    const b = new Date(y2, (m2 || 1) - 1, d2 || 1);
    const ms = b.getTime() - a.getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  };

  const mealPlanLabel = (plan: string) => {
    switch (plan) {
      case 'ROOM_ONLY': return 'Chambre';
      case 'BB': return 'Petit-déjeuner';
      case 'HB': return 'Demi-pension';
      case 'FB': return 'Pension complète';
      case 'AI': return 'Tout compris';
      case 'UAI': return 'Ultra tout compris';
      default: return plan || '-';
    }
  };

  // If you still have your own logic, plug it here.
  // With your JSON we don't have enough info to compute per-room meal extras,
  // so we keep it at 0 unless you define it.
  const mealPlanExtra = (_plan: string) => 0; // TND / person / night

  // ---- data ----
  const now = new Date();
  const factureNumber = `FAC-${data.id}`; // or `${now.getTime()}`
  const nights = daysBetween(data.checkIn, data.checkOut);
  const planExtra = mealPlanExtra(data.mealPlan);

  const rooms = parseRoomLines(data);

  // distribute total paying guests across rooms (best-effort)
  const payingGuestsTotal = (data.adults || 0) + (data.children || 0);
  const perRoomGuests = rooms.length > 0 ? Math.floor(payingGuestsTotal / rooms.length) : 0;
  let remainder = rooms.length > 0 ? (payingGuestsTotal % rooms.length) : 0;

  const roomRows = rooms.map((r, i) => {
    const guests = perRoomGuests + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder--;

    const adults = i === 0 ? (data.adults || 0) : 0;       // reservation-level info
    const children = i === 0 ? (data.children || 0) : 0;   // shown once (optional)
    const babies = i === 0 ? (data.babies || 0) : 0;

    // We ONLY know "pricePerPerson" from roomPrices. So:
    const roomBasePerNight = r.pricePerPerson * guests;
    const mealPerNight = planExtra * guests;
    const totalPerNight = roomBasePerNight + mealPerNight;

    return [
      `${i + 1}`,
      r.roomName,
      `${adults}`,
      `${children}`,
      `${babies}`,
      `${guests}`,
      `${r.pricePerPerson.toFixed(2)} TND`,
      `${roomBasePerNight.toFixed(2)} TND`,
      `${mealPerNight.toFixed(2)} TND`,
      `${totalPerNight.toFixed(2)} TND`,
    ];
  });

  // If backend already gives totalAmount, we can trust it:
  const total = Number(data.totalAmount) || 0;
  const totalPerNight = nights > 0 ? total / nights : total;

  // ---- PDF ----
  doc.setFontSize(16);
  doc.text('FACTURE - Réservation Hôtel', 14, 18);

  doc.setFontSize(10);
  doc.text(`N° Facture: ${factureNumber}`, 14, 26);
  doc.text(`Date: ${now.toLocaleDateString()}`, 14, 32);

  doc.setFontSize(12);
  doc.text(`Hôtel: ${data.hotelName || '-'}`, 14, 44);
  doc.setFontSize(10);
  doc.text(`ID Hôtel: ${data.hotelId ?? '-'}`, 14, 50);

  doc.text(`Arrivée: ${data.checkIn}`, 14, 60);
  doc.text(`Départ: ${data.checkOut}`, 14, 66);
  doc.text(`Nuits: ${nights}`, 14, 72);

  doc.text(`Formule: ${mealPlanLabel(data.mealPlan)}`, 14, 80);
  doc.text(`Supplément formule: ${planExtra.toFixed(2)} TND / personne / nuit`, 14, 86);

  autoTable(doc, {
    startY: 96,
    head: [[
      '#', 'Chambre', 'Adultes', 'Enfants', 'Bébés', 'Payants',
      'Prix/pers', 'Chambre/nuit', 'Formule/nuit', 'Total/nuit'
    ]],
    body: roomRows,
    styles: { fontSize: 8 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 96;

  doc.setFontSize(12);
  doc.text(`Total / nuit: ${totalPerNight.toFixed(2)} TND`, 14, finalY + 14);
  doc.text(`Total (${nights} nuits): ${total.toFixed(2)} TND`, 14, finalY + 22);

  doc.setFontSize(9);
  doc.text(`Note: Les bébés (0-2 ans) ne sont pas inclus dans la capacité ni dans le prix.`, 14, finalY + 32);

  doc.save(`${factureNumber}.pdf`);
}
function matchPasswords(group: AbstractControl): ValidationErrors | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  if (!np || !cp) return null;
  return np !== cp ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  user: any = null;

  reservations: ReservationRow[] = [];
  loading = false;
  error = '';

  pwdMsg = '';
  pwdMsgType: 'success' | 'error' = 'error';

  pwdForm;

  constructor(
    private auth: AuthService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private http: HttpClient,
      private cdr: ChangeDetectorRef
  ) {
    this.pwdForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: matchPasswords }
    );
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(u => (this.user = u));
    this.loadReservations();
  }

  async loadReservations() {
  this.loading = true;
  this.error = '';
  this.cdr.markForCheck(); // (safe) update UI immediately

  try {
    this.reservations = await this.reservationService.getMyReservations();
    console.log(this.reservations);
  } catch (e: any) {
    this.error = e?.error?.message || e?.message || 'Erreur chargement historique.';
  } finally {
    this.loading = false;

    // Force UI refresh right now (this fixes “updates only after click”)
    this.cdr.detectChanges();
    // or use this.cdr.markForCheck(); (usually enough for OnPush)
  }
}


  mealPlanLabel(plan: string) {
    switch (plan) {
      case 'ROOM_ONLY': return 'Chambre';
      case 'BB': return 'Petit-déjeuner';
      case 'HB': return 'Demi-pension';
      case 'FB': return 'Pension complète';
      case 'AI': return 'Tout compris';
      case 'UAI': return 'Ultra tout compris';
      default: return plan;
    }
  }

  async onDownload(r: ReservationRow) {
    try {
      const result = await this.reservationService.downloadInvoice(r.id);
      console.log(result);
      downloadFacturePdfFromJson(result);

    } catch (e: any) {
      alert(e?.error?.message || e?.message || 'Téléchargement échoué.');
    }
  }

  async onChangePassword() {
    this.pwdMsg = '';
    this.pwdForm.markAllAsTouched();

    if (this.pwdForm.invalid) {
      this.pwdMsgType = 'error';
      this.pwdMsg = this.pwdForm.errors?.['mismatch']
        ? 'Confirmation incorrecte.'
        : 'Remplir tous les champs.';
      return;
    }

    const currentPassword = (this.pwdForm.value.currentPassword || '').trim();
    const newPassword = (this.pwdForm.value.newPassword || '').trim();

    const token = localStorage.getItem('token');

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    try {
      // HttpClient returns Observable -> convert to Promise
      await this.http
        .post(
          'http://localhost:9090/api/auth/change-password',
          { currentPassword, newPassword },
          { headers }
        )
        .toPromise();

      this.pwdMsgType = 'success';
      this.pwdMsg = 'Mot de passe changé ✅';
      this.pwdForm.reset();
    } catch (e: any) {
      this.pwdMsgType = 'error';
      this.pwdMsg = e?.error || e?.error?.message || 'Erreur changement mot de passe.';
    }
  }
}
