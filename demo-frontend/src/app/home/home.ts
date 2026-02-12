import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

// Interface pour la réponse paginée de l'API
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Nos Produits</h2>
        <button *ngIf="isAdmin" class="btn btn-success" (click)="openAddModal()">
          <i class="bi bi-plus-circle me-1"></i> Ajouter un produit
        </button>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div *ngIf="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" *ngFor="let product of products">
          <div class="card h-100 product-card">
            <div class="position-relative">
              <img 
                [src]="product.imageUrl || 'https://placehold.co/300x200?text=Image+Non+Disponible'" 
                class="card-img-top product-image" 
                [alt]="product.name"
                (error)="handleImageError($event)"
                loading="eager">
              <div class="position-absolute top-0 end-0 p-2">
                <span class="badge bg-success">{{ product.price | currency:'EUR':'symbol':'1.2-2' }}</span>
              </div>
            </div>
            
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text flex-grow-1">{{ product.description || 'Aucune description disponible' }}</p>
              
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary flex-grow-1" (click)="addToCart(product)">
                  <i class="bi bi-cart-plus"></i> Ajouter
                </button>
                
                <button *ngIf="isAdmin" class="btn btn-outline-secondary" (click)="openEditModal(product)" title="Modifier">
                  <i class="bi bi-pencil"></i>
                </button>
                
                <button *ngIf="isAdmin" class="btn btn-outline-danger" (click)="onDeleteProduct(product.id)" title="Supprimer">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modale de modification/ajout de produit -->
      <div *ngIf="isEditModalOpen" class="edit-modal">
        <div class="modal-content">
          <h3>{{ isEditMode ? 'Modifier le produit' : 'Ajouter un nouveau produit' }}</h3>
          
          <div class="mb-3">
            <label for="productName" class="form-label">Nom</label>
            <input type="text" class="form-control" id="productName" [(ngModel)]="editedProduct.name" name="name">
          </div>
          
          <div class="mb-3">
            <label for="productDescription" class="form-label">Description</label>
            <textarea class="form-control" id="productDescription" [(ngModel)]="editedProduct.description" name="description" rows="3"></textarea>
          </div>
          
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="productPrice" class="form-label">Prix (€)</label>
              <input type="number" step="0.01" class="form-control" id="productPrice" [(ngModel)]="editedProduct.price" name="price">
            </div>
            <div class="col-md-6 mb-3">
              <label for="productStock" class="form-label">Stock</label>
              <input type="number" class="form-control" id="productStock" [(ngModel)]="editedProduct.stock" name="stock">
            </div>
          </div>
          
          <div class="mb-3">
            <label for="productImageUrl" class="form-label">URL de l'image</label>
            <input type="text" class="form-control" id="productImageUrl" [(ngModel)]="editedProduct.imageUrl" name="imageUrl">
            <div *ngIf="editedProduct.imageUrl" class="mt-2">
              <img [src]="editedProduct.imageUrl" (error)="handleImageError($event)" alt="Aperçu" style="max-width: 100px; max-height: 100px;">
            </div>
          </div>
          
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" (click)="closeModal()" [disabled]="isLoading">
              Annuler
            </button>
            <button type="button" class="btn btn-success" 
              (click)="saveProduct()" 
              [disabled]="isLoading || !editedProduct.name || !editedProduct.price">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
          
          <div *ngIf="errorMessage" class="alert alert-danger mt-3 mb-0">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .edit-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1050;
      }
      
      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      }
      
      .product-image {
        max-width: 100%;
        height: 200px;
        object-fit: cover;
      }
    </style>
  `,
  styles: [`
    .product-card {
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
    }
    .btn-group .btn {
      padding: 0.375rem 0.75rem;
    }

    /* Styles pour la modale */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
      padding: 1rem;
    }

    .modal-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .product-image-preview {
      max-height: 150px;
      object-fit: contain;
      margin-top: 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 5px;
      background-color: #f8f9fa;
    }
  `]
})
export default class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  products: Product[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  isAdmin = false;
  
  // Pour la modale d'édition
  isEditModalOpen = false;
  selectedProduct: Product | null = null;
  editedProduct: Partial<Product> = {};
  userRoles: string[] = [];
  isEditMode = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadProducts();
  }

  private checkAdminStatus(): void {
    const userData = localStorage.getItem('auth-user');
    console.log("Données utilisateur brutes:", userData);

    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userRoles = this.extractRoles(user);
        this.isAdmin = this.checkIfAdmin(this.userRoles);
        
        console.log("Rôles détectés:", this.userRoles);
        console.log("Est administrateur ?", this.isAdmin);
      } catch (error) {
        console.error('Erreur lors de l\'analyse des données utilisateur:', error);
      }
    }
  }

  private extractRoles(user: any): string[] {
    if (!user) return [];
    
    // Gestion de différents formats de rôles
    if (user.roles) {
      if (Array.isArray(user.roles)) return user.roles;
      if (typeof user.roles === 'string') return user.roles.split(',').map((r: string) => r.trim());
    }
    
    if (user.role) {
      if (Array.isArray(user.role)) return user.role;
      if (typeof user.role === 'string') return [user.role];
    }
    
    // Vérification dans le token JWT si disponible
    if (user.token) {
      try {
        const payload = JSON.parse(atob(user.token.split('.')[1]));
        return payload.roles || [];
      } catch (e) {
        console.error('Erreur lors du décodage du token JWT:', e);
      }
    }
    
    return [];
  }

  private checkIfAdmin(roles: string[]): boolean {
    return roles.some(role => 
      role && typeof role === 'string' && 
      (role.toUpperCase() === 'ADMIN' || 
       role.toUpperCase() === 'ROLE_ADMIN' ||
       role.toUpperCase().includes('ADMIN'))
    );
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.productService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Product[] | PaginatedResponse<Product>) => {
          if (Array.isArray(response)) {
            this.products = response;
          } else if (response && 'content' in response) {
            this.products = response.content || [];
          } else {
            this.products = [];
          }
          console.log(`${this.products.length} produits chargés`);
        },
        error: (error: Error) => {
          console.error('Erreur lors du chargement des produits', error);
          this.errorMessage = 'Impossible de charger les produits. Veuillez réessayer plus tard.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  handleImageError(event: any): void {
    event.target.src = 'https://placehold.co/300x200?text=Image+Non+Disponible';
  }

  openAddModal(): void {
    this.selectedProduct = null;
    this.editedProduct = { 
      name: '', 
      price: 0, 
      description: '', 
      imageUrl: '',
      stock: 0
    };
    this.isEditModalOpen = true;
    this.isEditMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openEditModal(product: Product): void {
    // Créer une copie profonde du produit pour éviter de modifier l'original
    this.selectedProduct = { ...product };
    this.editedProduct = { ...product };
    this.isEditModalOpen = true;
    this.isEditMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeModal(): void {
    this.isEditModalOpen = false;
    this.isEditMode = false;
    this.selectedProduct = null;
    this.editedProduct = {};
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProduct(): void {
    if (this.isEditMode && this.selectedProduct?.id) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  private updateProduct(): void {
    if (!this.selectedProduct?.id) {
      this.errorMessage = 'Aucun produit sélectionné pour la mise à jour';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.updateProduct(this.selectedProduct.id, this.editedProduct as Product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedProduct: Product) => {
          // Mise à jour de la liste des produits
          const index = this.products.findIndex(p => p.id === updatedProduct.id);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
          
          this.successMessage = 'Produit mis à jour avec succès';
          setTimeout(() => this.successMessage = '', 3000);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour du produit', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour du produit';
          this.isLoading = false;
        }
      });
  }

  private createProduct(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.addProduct(this.editedProduct as Product)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newProduct: Product) => {
          // Ajout du nouveau produit au début de la liste
          this.products.unshift(newProduct);
          
          this.successMessage = 'Produit créé avec succès';
          setTimeout(() => this.successMessage = '', 3000);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Erreur lors de la création du produit', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la création du produit';
          this.isLoading = false;
        }
      });
  }

  addToCart(product: Product): void {
    // TODO: Implémenter l'ajout au panier
    console.log('Ajout au panier:', product);
  }

  onImageUrlChange(): void {
    // Cette méthode est appelée lors de la modification de l'URL de l'image
    // pour forcer la mise à jour de l'aperçu
    if (this.editedProduct.imageUrl) {
      // Créer une nouvelle référence pour forcer la détection des changements
      const newImageUrl = this.editedProduct.imageUrl;
      this.editedProduct = { ...this.editedProduct, imageUrl: newImageUrl };
    }
  }

  onDeleteProduct(id: number | undefined): void {
    if (!id) {
      this.errorMessage = 'ID de produit invalide';
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    this.isLoading = true;
    this.productService.deleteProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (id) {
            this.products = this.products.filter(p => p.id !== id);
            this.successMessage = 'Produit supprimé avec succès';
            setTimeout(() => this.successMessage = '', 3000);
          }
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression du produit', error);
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression du produit';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}