import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AnimalService } from '../../services/animal.service';

@Component({
  selector: 'app-summary',
  template: `
    <div class="summary-container">
      <div class="summary-card">
        <div class="summary-header">Summary</div>
        <div class="summary-content">
          <div class="summary-item">
            <span>Total Animals:</span>
            <span class="count">{{totalAnimals$ | async}}</span>
          </div>
          <div class="summary-item">
            <span>Favorite Animals:</span>
            <span class="count">{{totalFavorites$ | async}}/3</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 1000;
    }
    .summary-card {
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 16px;
      min-width: 200px;
    }
    .summary-header {
      font-size: 1.2em;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .summary-item:last-child {
      margin-bottom: 0;
    }
    .count {
      font-weight: 500;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class SummaryComponent {
  totalAnimals$: Observable<number>;
  totalFavorites$: Observable<number>;

  constructor(private animalService: AnimalService) {
    this.totalAnimals$ = this.animalService.getAnimals().pipe(
      map(animals => animals.length)
    );

    this.totalFavorites$ = this.animalService.getAnimals().pipe(
      map(animals => animals.filter(animal => animal.isFavorite).length)
    );
  }
}
