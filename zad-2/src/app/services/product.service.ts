import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, map } from 'rxjs';

interface Product {
  nazwa: string;
  marka?: string;
}

interface CategoryProducts {
  category: string;
  products: Product[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly urls = [
    'http://localhost:3000/A',
    'http://localhost:3000/B',
    'http://localhost:3000/C'
  ];

  constructor(private http: HttpClient) {}

  getProductsByCategories(categories: string[]): Observable<CategoryProducts[]> {
    if (!categories.length) return new Observable(subscriber => subscriber.next([]));

    return forkJoin(
      this.urls.map(url => this.http.get(url))
    ).pipe(
      map(responses => {
        const result: CategoryProducts[] = [];
        
        categories.forEach(category => {
          const products = new Set<string>();
          const categoryProducts: Product[] = [];

          responses.forEach((response: any) => {
            if (response[category]) {
              response[category].forEach((product: Product) => {
                if (!products.has(product.nazwa)) {
                  products.add(product.nazwa);
                  categoryProducts.push(product);
                }
              });
            }
          });

          if (categoryProducts.length > 0) {
            result.push({
              category,
              products: categoryProducts
            });
          }
        });

        return result;
      })
    );
  }
}
