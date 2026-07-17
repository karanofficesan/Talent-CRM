import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  login(email: string, pass: string): boolean {
    if (email === 'admin@talentcrm.com' && pass === 'password123') {
      // Mocking a JWT token payload
      const payload = {
        email: email,
        role: 'Super Admin',
        name: 'Rahul Negi',
        exp: Date.now() + 86400000 // 1 day expiry
      };
      // Create a fake JWT token: Header.Payload.Signature
      const fakeJwt = btoa(JSON.stringify({alg:'HS256',typ:'JWT'})) + '.' + 
                      btoa(JSON.stringify(payload)) + '.' + 
                      'fake_signature_hash';
      
      localStorage.setItem('talentcrm_token', fakeJwt);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('talentcrm_token');
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('talentcrm_token');
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp > Date.now();
    } catch (e) {
      return false;
    }
  }
}
