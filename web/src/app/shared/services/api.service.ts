import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export type QueryParams = Record<string, string | number | boolean | ReadonlyArray<string | number | boolean> | null | undefined>;

export interface ApiOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | QueryParams;
  withCredentials?: boolean;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(endpoint: string, params?: QueryParams | HttpParams, options: Partial<ApiOptions> = {}): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(endpoint), {
        ...this.createRequestOptions(options),
        params: this.buildParams(params),
      })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown, options: Partial<ApiOptions> = {}): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(endpoint), body, this.createRequestOptions(options))
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown, options: Partial<ApiOptions> = {}): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(endpoint), body, this.createRequestOptions(options))
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown, options: Partial<ApiOptions> = {}): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(endpoint), body, this.createRequestOptions(options))
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options: Partial<ApiOptions> = {}): Observable<T> {
    return this.http
      .delete<T>(this.buildUrl(endpoint), this.createRequestOptions(options))
      .pipe(catchError(this.handleError));
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl.replace(/\/$/, '')}/${normalizedEndpoint}`;
  }

  private buildParams(params?: QueryParams | HttpParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    if (params instanceof HttpParams) {
      return params;
    }

    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          httpParams = httpParams.append(key, String(item));
        });
        return;
      }

      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }

  private createRequestOptions(options: Partial<ApiOptions>): { headers?: HttpHeaders | Record<string, string | string[]>; params?: HttpParams; withCredentials?: boolean; responseType?: 'json' | 'text' | 'blob' | 'arraybuffer'; } {
    return {
      headers: options.headers,
      params: this.buildParams(options.params as QueryParams | HttpParams | undefined),
      withCredentials: options.withCredentials,
      responseType: options.responseType,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error instanceof ErrorEvent
        ? `Client error: ${error.error.message}`
        : `Server error: ${error.status} - ${error.message}`;

    console.error('[ApiService]', message);
    return throwError(() => new Error(message));
  }
}
