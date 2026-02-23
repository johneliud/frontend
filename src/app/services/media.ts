import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Media } from '../models/media';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private apiUrl = 'http://localhost:8083/api/media';

  constructor(private http: HttpClient) {}

  getMediaByProduct(productId: string): Observable<Media[]> {
    return this.http
      .get<any>(`${this.apiUrl}/product/${productId}`)
      .pipe(map((response) => response.data || response || []));
  }

  getSellerMedia(productId?: string): Observable<Media[]> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('productId', productId);
    }
    return this.http
      .get<any>(`${this.apiUrl}/my-media`, { params })
      .pipe(map((response) => response.data || []));
  }

  uploadMedia(file: File, productId: string): Observable<Media> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('productId', productId);
    return this.http
      .post<any>(`${this.apiUrl}/upload`, formData)
      .pipe(map((response) => response.data));
  }

  deleteMedia(id: string): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(map(() => undefined));
  }

  getMediaUrl(id: string): string {
    return `${this.apiUrl}/${id}`;
  }

  getImage(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}`, { responseType: 'blob' });
  }
}
