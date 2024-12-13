import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { AnimalService } from '../../services/animal.service';
import { AnimalFormComponent } from '../animal-form/animal-form.component';
import { Animal } from '../../models/animal.model';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-animal-list',
  templateUrl: './animal-list.component.html',
  styleUrls: ['./animal-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule
  ]
})
export class AnimalListComponent implements OnInit {
  animals$: Observable<Animal[]>;
  categories$: Observable<string[]>;
  filterForm: FormGroup;
  private refreshTrigger = new BehaviorSubject<void>(undefined);

  constructor(
    private animalService: AnimalService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      selectedCategories: [[]]
    });

    this.categories$ = this.animalService.getCategories();
    
    // Combine animals with filter
    this.animals$ = combineLatest([
      this.animalService.getAnimals().pipe(
        startWith([]) // Initialize with empty array while loading
      ),
      this.filterForm.get('selectedCategories')!.valueChanges.pipe(
        startWith([]) // Initialize with empty array for initial render
      ),
      this.refreshTrigger // Add refresh trigger to the stream
    ]).pipe(
      map(([animals, selectedCategories]) => {
        if (!selectedCategories || selectedCategories.length === 0) {
          return animals;
        }
        return animals.filter(animal => 
          selectedCategories.includes(animal.category)
        );
      })
    );
  }

  ngOnInit(): void {
    // Trigger initial load
    this.refreshTrigger.next();
  }

  openAnimalForm(animal?: Animal): void {
    const dialogRef = this.dialog.open(AnimalFormComponent, {
      width: '400px',
      data: animal || {},
      autoFocus: false,
      restoreFocus: true,
      closeOnNavigation: true,
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (animal) {
          this.animalService.updateAnimal(result).subscribe(() => {
            this.refreshTrigger.next(); // Refresh after update
          });
        } else {
          this.animalService.addAnimal(result).subscribe(() => {
            this.refreshTrigger.next(); // Refresh after add
          });
        }
      }
    });
  }

  deleteAnimal(id: number): void {
    if (confirm('Are you sure you want to delete this animal?')) {
      this.animalService.deleteAnimal(id).subscribe(() => {
        this.refreshTrigger.next(); // Refresh after delete
      });
    }
  }

  toggleFavorite(animal: Animal): void {
    this.animalService.toggleFavorite(animal).subscribe(() => {
      this.refreshTrigger.next(); // Refresh after toggle
    });
  }

  get selectedCategoriesControl(): FormControl<string[]> {
    return this.filterForm.get('selectedCategories') as FormControl<string[]>;
  }
}
