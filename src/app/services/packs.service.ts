import { Injectable } from '@angular/core';
import axios from 'axios';
import { Pack } from '../models/pack';

@Injectable({
  providedIn: 'root',
})
export class PacksService {
  private BASE_URL = 'http://localhost:9090/api/packs';
  constructor() {}

  async getPacks(): Promise<Pack[]> {
    try {
      const response = await axios.get(`${this.BASE_URL}`);
      return response.data.data as Pack[];
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getPacksById(id: number): Promise<Pack> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${id}`);
      return response.data.data as Pack;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }
}
