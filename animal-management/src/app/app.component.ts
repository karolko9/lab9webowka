import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AnimalListComponent } from './components/animal-list/animal-list.component';
import { SummaryComponent } from './components/summary/summary.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    RouterOutlet,
    MatToolbarModule,
    AnimalListComponent,
    SummaryComponent,
    CommonModule
  ],
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'animal-management';
}
