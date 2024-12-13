import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Animal } from '../models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:3000';
  private animalsSubject = new BehaviorSubject<Animal[]>([]);
  private categoriesSubject = new BehaviorSubject<string[]>([]);
  private favoriteAnimalsSubject = new BehaviorSubject<Animal[]>([]);

  constructor(private http: HttpClient) {
    this.loadAnimals();
    this.loadCategories();
  }

  private loadAnimals() {
    this.http.get<Animal[]>(`${this.apiUrl}/animals`).subscribe(animals => {
      this.animalsSubject.next(animals);
      this.updateFavorites(animals);
    });
  }

  private loadCategories() {
    this.http.get<{data: string[]}>(`${this.apiUrl}/categories`).subscribe(response => {
      this.categoriesSubject.next(response.data);
    });
  }

  getAnimals(): Observable<Animal[]> {
    return this.animalsSubject.asObservable();
  }

  getCategories(): Observable<string[]> {
    return this.categoriesSubject.asObservable();
  }

  getFavoriteAnimals(): Observable<Animal[]> {
    return this.favoriteAnimalsSubject.asObservable();
  }

  addAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(`${this.apiUrl}/animals`, animal).pipe(
      map(newAnimal => {
        const currentAnimals = this.animalsSubject.value;
        this.animalsSubject.next([...currentAnimals, newAnimal]);
        return newAnimal;
      })
    );
  }

  updateAnimal(animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/animals/${animal.id}`, animal).pipe(
      map(updatedAnimal => {
        const currentAnimals = this.animalsSubject.value;
        const index = currentAnimals.findIndex(a => a.id === animal.id);
        if (index !== -1) {
          currentAnimals[index] = updatedAnimal;
          this.animalsSubject.next([...currentAnimals]);
          this.updateFavorites(currentAnimals);
        }
        return updatedAnimal;
      })
    );
  }

  deleteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/animals/${id}`).pipe(
      map(() => {
        const currentAnimals = this.animalsSubject.value.filter(a => a.id !== id);
        this.animalsSubject.next(currentAnimals);
        this.updateFavorites(currentAnimals);
      })
    );
  }

  addCategory(category: string): Observable<string[]> {
    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = [...currentCategories, category];
    return this.http.put<{data: string[]}>(`${this.apiUrl}/categories`, { data: updatedCategories }).pipe(
      map(response => {
        this.categoriesSubject.next(response.data);
        return response.data;
      })
    );
  }

  private updateFavorites(animals: Animal[]) {
    const favorites = animals.filter(animal => animal.isFavorite);
    this.favoriteAnimalsSubject.next(favorites);
  }

  toggleFavorite(animal: Animal): Observable<Animal> {
    const favorites = this.favoriteAnimalsSubject.value;
    if (!animal.isFavorite && favorites.length >= 3) {
      throw new Error('Maximum number of favorite animals reached (3)');
    }
    const updatedAnimal = { ...animal, isFavorite: !animal.isFavorite };
    return this.updateAnimal(updatedAnimal);
  }
}
