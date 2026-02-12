import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent {
  @Output() productAdded = new EventEmitter<void>();
  
  newProduct: Omit<Product, 'id' | 'imageUrl'> & { sku?: string } = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'DEFAULT',
    sku: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private productService: ProductService) {}

  saveProduct(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.addProduct(this.newProduct).subscribe({
      next: () => {
        this.successMessage = 'Produit ajouté avec succès !';
        this.resetForm();
        this.productAdded.emit();
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du produit', error);
        this.errorMessage = 'Une erreur est survenue lors de l\'ajout du produit';
        if (error.error?.message) {
          this.errorMessage += `: ${error.error.message}`;
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  public isFormValid(): boolean {
    return (
      this.newProduct.name.trim() !== '' &&
      this.newProduct.price > 0 &&
      (!this.newProduct.sku || this.newProduct.sku.trim() !== '')
    );
  }

  public resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'DEFAULT',
      sku: ''
    };
    this.isLoading = false;
  }
}
