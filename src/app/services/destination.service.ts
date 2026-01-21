import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Destinations } from '../models/destinations';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private BASE_URL = 'http://localhost:9090/api/destinations';
  private RESERVATIONS_URL = 'http://localhost:9090/api/destination-reservations';
  constructor(private http: HttpClient) {}

  getdestinations(): Observable<Destinations[]> {
    return this.http.get<any>(this.BASE_URL).pipe(
      map(res => res.data as Destinations[])
    );
  }

  getdestinationById(id: number): Observable<Destinations> {
    return this.http.get<any>(`${this.BASE_URL}/${id}`).pipe(
      map(res => res.data as Destinations)
    );
  }

  searchDestinations(q?: string, maxPrice?: number | null, checkIn?: string, checkOut?: string) {
  let params = new HttpParams();
  if (q && q.trim()) params = params.set('q', q.trim());
  if (maxPrice != null) params = params.set('maxPrice', maxPrice);
  if (checkIn) params = params.set('checkIn', checkIn);
  if (checkOut) params = params.set('checkOut', checkOut);

  return this.http.get<any>(`${this.BASE_URL}/search`, { params }).pipe(
    map(res => res.data as Destinations[])
  );
}
reserveDestination(payload: any): Observable<any> {
  const token = localStorage.getItem('token');

  const headers = token
    ? new HttpHeaders({ Authorization: `Bearer ${token}` })
    : new HttpHeaders();

  return this.http.post<any>(this.RESERVATIONS_URL, payload, { headers });
}


}
