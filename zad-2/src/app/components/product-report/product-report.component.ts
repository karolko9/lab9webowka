import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';

interface Product {
  nazwa: string;
  marka?: string;
}

interface CategoryProducts {
  category: string;
  products: Product[];
}

@Component({
  selector: 'app-product-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatListModule
  ],
  templateUrl: './product-report.component.html',
  styleUrls: ['./product-report.component.scss']
})
export class ProductReportComponent implements OnInit, OnDestroy {
  categoryInput = new FormControl('');
  categories: string[] = [];
  categoryProducts: CategoryProducts[] = [];
  selectedProducts: Product[] = [];
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.categoryInput.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => {
        this.categories = value ? value.split(',').map(cat => cat.trim()).filter(cat => cat) : [];
        return this.productService.getProductsByCategories(this.categories);
      })
    ).subscribe(products => {
      this.categoryProducts = products;
      // Remove products from selected if their category is no longer present
      this.selectedProducts = this.selectedProducts.filter(selected => 
        this.categoryProducts.some(cat => 
          cat.products.some(prod => prod.nazwa === selected.nazwa)
        )
      );
    });
  }

  selectProduct(product: Product) {
    if (!this.selectedProducts.some(p => p.nazwa === product.nazwa)) {
      this.selectedProducts.push(product);
    }
  }

  selectCategory(category: string) {
    const categoryData = this.categoryProducts.find(c => c.category === category);
    if (categoryData) {
      categoryData.products.forEach(product => {
        if (!this.selectedProducts.some(p => p.nazwa === product.nazwa)) {
          this.selectedProducts.push(product);
        }
      });
    }
  }

  removeSelected(product: Product) {
    this.selectedProducts = this.selectedProducts.filter(p => p.nazwa !== product.nazwa);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
