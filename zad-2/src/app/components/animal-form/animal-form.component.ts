import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Animal } from '../../models/animal.model';
import { AnimalService } from '../../services/animal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-animal-form',
  templateUrl: './animal-form.component.html',
  styleUrls: ['./animal-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class AnimalFormComponent implements OnInit {
  animalForm: FormGroup;
  categories$: Observable<string[]>;
  newCategory: string = '';

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    public dialogRef: MatDialogRef<AnimalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Animal>
  ) {
    this.categories$ = this.animalService.getCategories();
    
    this.animalForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      weight: ['', [Validators.required, Validators.min(0)]],
      favoriteFood: ['', Validators.required],
      isFavorite: [false]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.animalForm.patchValue(this.data);
    }
  }

  onSubmit() {
    if (this.animalForm.valid) {
      const animal: Animal = {
        ...this.animalForm.value,
        id: this.data?.id
      };
      this.dialogRef.close(animal);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  addNewCategory() {
    if (this.newCategory.trim()) {
      this.animalService.addCategory(this.newCategory.trim()).subscribe(() => {
        this.animalForm.get('category')?.setValue(this.newCategory.trim());
        this.newCategory = '';
      });
    }
  }
}
