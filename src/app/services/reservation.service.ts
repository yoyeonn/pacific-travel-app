import { Injectable } from '@angular/core';
import axios from 'axios';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type ReservationRow = {
  id: number;
  createdAt: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  mealPlan: string;
  roomNames: string;
};

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private RES_URL = 'http://localhost:9090/api/reservations';

  constructor(private http: HttpClient) {}


  private authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getMyReservations(): Promise<ReservationRow[]> {
  const token = localStorage.getItem('token');

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : undefined;

  return await firstValueFrom(
    this.http.get<ReservationRow[]>(`${this.RES_URL}/me`, { headers })
  );
}


  async downloadInvoice(reservationId: number): Promise<Blob> {
    const res = await axios.get(`${this.RES_URL}/${reservationId}/invoice`, {
      headers: this.authHeaders(),
    });
    return res.data;
  }
}
