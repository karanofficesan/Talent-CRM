import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Model, Client, Requirement, Quotation, Booking,
  Invoice, Payment, User, ActivityLog, Notification, DashboardStats
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ── Models ──────────────────────────────────────────────────────────────
  private _models = new BehaviorSubject<Model[]>([
    { id:'m1', fullName:'Priya Sharma', gender:'Female', dateOfBirth:'1999-03-15', age:25,
      mobile:'9876543210', email:'priya@email.com', city:'Mumbai', nationality:'Indian',
      height:170, weight:55, chest:34, waist:26, hips:36, shoeSize:7,
      hairColor:'Black', eyeColor:'Brown', skinTone:'Fair',
      experience:4, categories:['Fashion','Ramp Walk','Commercial'], reference:'Agency Direct',
      coverImage:'https://i.pravatar.cc/300?img=47',
      portfolioImages:['https://picsum.photos/seed/p1a/400/500','https://picsum.photos/seed/p1b/400/500'],
      portfolioVideos:[], instagramLink:'https://instagram.com/priyasharma',
      modelCharges:15000, internalNotes:'Top model, very professional', status:'Active',
      createdAt:'2026-01-10', updatedAt:'2026-06-01' },
    { id:'m2', fullName:'Arjun Mehta', gender:'Male', dateOfBirth:'1997-07-22', age:27,
      mobile:'9812345678', email:'arjun@email.com', city:'Delhi', nationality:'Indian',
      height:183, weight:78, chest:40, waist:32, hips:38, shoeSize:10,
      hairColor:'Black', eyeColor:'Brown', skinTone:'Medium',
      experience:6, categories:['TV Commercial','Actor','Commercial'], reference:'Self',
      coverImage:'https://i.pravatar.cc/300?img=12',
      portfolioImages:['https://picsum.photos/seed/p2a/400/500'],
      portfolioVideos:[], instagramLink:'https://instagram.com/arjunmehta',
      modelCharges:20000, internalNotes:'Experienced actor', status:'Active',
      createdAt:'2026-02-05', updatedAt:'2026-05-15' },
    { id:'m3', fullName:'Sneha Patel', gender:'Female', dateOfBirth:'2001-11-08', age:23,
      mobile:'9988776655', email:'sneha@email.com', city:'Ahmedabad', nationality:'Indian',
      height:165, weight:52, chest:33, waist:25, hips:35, shoeSize:6,
      hairColor:'Brown', eyeColor:'Brown', skinTone:'Light',
      experience:2, categories:['Print','Influencer'], reference:'Instagram',
      coverImage:'https://i.pravatar.cc/300?img=44',
      portfolioImages:['https://picsum.photos/seed/p3a/400/500','https://picsum.photos/seed/p3b/400/500'],
      portfolioVideos:[], instagramLink:'https://instagram.com/sneha_official',
      modelCharges:10000, internalNotes:'Good social media reach', status:'Active',
      createdAt:'2026-03-12', updatedAt:'2026-06-10' },
    { id:'m4', fullName:'Rohan Kapoor', gender:'Male', dateOfBirth:'1995-05-30', age:29,
      mobile:'9845678901', email:'rohan@email.com', city:'Mumbai', nationality:'Indian',
      height:178, weight:72, chest:38, waist:30, hips:36, shoeSize:9,
      hairColor:'Black', eyeColor:'Hazel', skinTone:'Medium',
      experience:8, categories:['Fashion','Ramp Walk','TV Commercial','Actor'], reference:'Agency',
      coverImage:'https://i.pravatar.cc/300?img=8',
      portfolioImages:['https://picsum.photos/seed/p4a/400/500'],
      portfolioVideos:[], instagramLink:'https://instagram.com/rohankapoor',
      modelCharges:25000, internalNotes:'Senior model, premium rates', status:'Active',
      createdAt:'2023-11-01', updatedAt:'2026-06-05' },
    { id:'m5', fullName:'Naina Gupta', gender:'Female', dateOfBirth:'2000-09-18', age:24,
      mobile:'9765432198', email:'naina@email.com', city:'Bangalore', nationality:'Indian',
      height:168, weight:54, chest:34, waist:26, hips:36, shoeSize:6,
      hairColor:'Black', eyeColor:'Brown', skinTone:'Olive',
      experience:3, categories:['Bridal','Fashion','Print'], reference:'Client Referral',
      coverImage:'https://i.pravatar.cc/300?img=48',
      portfolioImages:['https://picsum.photos/seed/p5a/400/500'],
      portfolioVideos:[], instagramLink:'https://instagram.com/naina.gupta',
      modelCharges:12000, internalNotes:'Specializes in bridal shoots', status:'Active',
      createdAt:'2026-01-28', updatedAt:'2026-05-20' },
    { id:'m6', fullName:'Vikram Singh', gender:'Male', dateOfBirth:'1998-12-25', age:26,
      mobile:'9654321987', email:'vikram@email.com', city:'Jaipur', nationality:'Indian',
      height:180, weight:75, chest:39, waist:31, hips:37, shoeSize:10,
      hairColor:'Black', eyeColor:'Brown', skinTone:'Tan',
      experience:5, categories:['Commercial','Fitness'], reference:'Gym',
      coverImage:'https://i.pravatar.cc/300?img=15',
      portfolioImages:['https://picsum.photos/seed/p6a/400/500'],
      portfolioVideos:[], instagramLink:'https://instagram.com/vikram_fit',
      modelCharges:18000, internalNotes:'Fitness model', status:'Inactive',
      createdAt:'2026-02-14', updatedAt:'2026-04-30' },
  ]);

  // ── Clients ─────────────────────────────────────────────────────────────
  private _clients = new BehaviorSubject<Client[]>([
    { id:'c1', companyName:'Zara India Pvt Ltd', contactPerson:'Rahul Verma',
      mobile:'9900112233', email:'rahul@zaraindia.com', gstNumber:'27AABCZ1234F1Z5',
      billingAddress:'123 BKC, Mumbai 400051', paymentTerms:'Net 30', creditDays:30,
      remarks:'Premium client, always pays on time', status:'Active',
      createdAt:'2026-01-05', updatedAt:'2026-06-12' },
    { id:'c2', companyName:'Lakme Fashion Week', contactPerson:'Pooja Nair',
      mobile:'9811223344', email:'pooja@lakmefashion.com', gstNumber:'07AABLF9876H1Z3',
      billingAddress:'456 Connaught Place, Delhi 110001', paymentTerms:'Net 15', creditDays:15,
      remarks:'Event-based requirements', status:'Active',
      createdAt:'2026-02-10', updatedAt:'2026-05-28' },
    { id:'c3', companyName:'Myntra Studios', contactPerson:'Amit Shah',
      mobile:'9722334455', email:'amit@myntra.com', gstNumber:'29AABCM5678K1Z7',
      billingAddress:'789 Embassy Tech Park, Bangalore 560066', paymentTerms:'Net 45', creditDays:45,
      remarks:'High volume shoots', status:'Active',
      createdAt:'2026-03-01', updatedAt:'2026-06-01' },
    { id:'c4', companyName:'Titan Company', contactPerson:'Suresh Kumar',
      mobile:'9633445566', email:'suresh@titan.com', gstNumber:'33AABCT2345L1Z2',
      billingAddress:'1 Titan Park, Chennai 600032', paymentTerms:'Net 30', creditDays:30,
      remarks:'Watch & jewellery campaigns', status:'Active',
      createdAt:'2026-01-20', updatedAt:'2026-06-08' },
  ]);

  // ── Requirements ─────────────────────────────────────────────────────────
  private _requirements = new BehaviorSubject<Requirement[]>([
    { id:'r1', clientId:'c1', clientName:'Zara India Pvt Ltd', projectName:'Summer Collection 2026',
      shootDate:'2026-07-20', shootLocation:'Mumbai Studio', gender:'Female',
      ageMin:20, ageMax:28, heightMin:165, heightMax:175, category:'Fashion',
      modelsRequired:3, budget:60000, additionalRequirements:'Fair skin, western wear comfort',
      status:'Shortlisting', createdAt:'2026-06-10', updatedAt:'2026-06-12' },
    { id:'r2', clientId:'c2', clientName:'Lakme Fashion Week', projectName:'Bridal Show',
      shootDate:'2026-08-05', shootLocation:'Delhi Convention Centre', gender:'Female',
      ageMin:22, ageMax:30, heightMin:168, heightMax:178, category:'Ramp Walk',
      modelsRequired:5, budget:120000, additionalRequirements:'Bridal experience preferred',
      status:'Quotation Sent', createdAt:'2026-06-05', updatedAt:'2026-06-11' },
    { id:'r3', clientId:'c3', clientName:'Myntra Studios', projectName:'Q3 Catalogue Shoot',
      shootDate:'2026-07-15', shootLocation:'Bangalore Studio', gender:'Any',
      ageMin:18, ageMax:35, heightMin:160, heightMax:185, category:'Commercial',
      modelsRequired:8, budget:200000, additionalRequirements:'Diverse looks required',
      status:'Confirmed', createdAt:'2026-05-28', updatedAt:'2026-06-09' },
    { id:'r4', clientId:'c4', clientName:'Titan Company', projectName:'Festive Campaign',
      shootDate:'2026-09-10', shootLocation:'Chennai', gender:'Any',
      ageMin:25, ageMax:40, heightMin:162, heightMax:180, category:'Commercial',
      modelsRequired:2, budget:50000, additionalRequirements:'Elegant look, professional',
      status:'New', createdAt:'2026-06-14', updatedAt:'2026-06-14' },
  ]);

  // ── Quotations ───────────────────────────────────────────────────────────
  private _quotations = new BehaviorSubject<Quotation[]>([
    { id:'q1', quotationNumber:'QT-2026-001', clientId:'c1', clientName:'Zara India Pvt Ltd',
      requirementId:'r1', projectName:'Summer Collection 2026',
      models:[
        { modelId:'m1', modelName:'Priya Sharma', coverImage:'https://i.pravatar.cc/300?img=47',
          height:170, age:25, categories:['Fashion','Ramp Walk'], experience:4,
          instagramLink:'https://instagram.com/priyasharma', sellingPrice:22000, modelCharges:15000 },
        { modelId:'m5', modelName:'Naina Gupta', coverImage:'https://i.pravatar.cc/300?img=48',
          height:168, age:24, categories:['Bridal','Fashion'], experience:3,
          instagramLink:'https://instagram.com/naina.gupta', sellingPrice:18000, modelCharges:12000 },
      ],
      termsAndConditions:'50% advance required. Cancellation 48hrs prior.', totalSellingPrice:40000,
      totalModelCharges:27000, grossProfit:13000, status:'Sent', modelAgreementSigned:true,
      notes:'Client needs portfolio asap', validUntil:'2026-07-01',
      createdAt:'2026-06-11', updatedAt:'2026-06-12' },
    { id:'q2', quotationNumber:'QT-2026-002', clientId:'c2', clientName:'Lakme Fashion Week',
      requirementId:'r2', projectName:'Bridal Show',
      models:[
        { modelId:'m1', modelName:'Priya Sharma', coverImage:'https://i.pravatar.cc/300?img=47',
          height:170, age:25, categories:['Fashion','Ramp Walk'], experience:4,
          instagramLink:'https://instagram.com/priyasharma', sellingPrice:25000, modelCharges:15000 },
        { modelId:'m3', modelName:'Sneha Patel', coverImage:'https://i.pravatar.cc/300?img=44',
          height:165, age:23, categories:['Print','Influencer'], experience:2,
          instagramLink:'https://instagram.com/sneha_official', sellingPrice:15000, modelCharges:10000 },
      ],
      termsAndConditions:'Full payment before shoot. Travel extra.', totalSellingPrice:40000,
      totalModelCharges:25000, grossProfit:15000, status:'Approved', modelAgreementSigned:true,
      notes:'', validUntil:'2026-07-15',
      createdAt:'2026-06-08', updatedAt:'2026-06-10' },
    { id:'q3', quotationNumber:'QT-2026-003', clientId:'c3', clientName:'Myntra Studios',
      requirementId:'r3', projectName:'Q3 Catalogue Shoot',
      models:[
        { modelId:'m2', modelName:'Arjun Mehta', coverImage:'https://i.pravatar.cc/300?img=12',
          height:183, age:27, categories:['TV Commercial','Actor'], experience:6,
          instagramLink:'https://instagram.com/arjunmehta', sellingPrice:28000, modelCharges:20000 },
        { modelId:'m4', modelName:'Rohan Kapoor', coverImage:'https://i.pravatar.cc/300?img=8',
          height:178, age:29, categories:['Fashion','Ramp Walk'], experience:8,
          instagramLink:'https://instagram.com/rohankapoor', sellingPrice:35000, modelCharges:25000 },
      ],
      termsAndConditions:'Net 45 payment terms apply.', totalSellingPrice:63000,
      totalModelCharges:45000, grossProfit:18000, status:'Approved', modelAgreementSigned:true,
      notes:'Long-term contract', validUntil:'2026-07-30',
      createdAt:'2026-06-01', updatedAt:'2026-06-09' },
  ]);

  // ── Bookings ─────────────────────────────────────────────────────────────
  private _bookings = new BehaviorSubject<Booking[]>([
    { id:'b1', bookingNumber:'BK-2026-001', clientId:'c2', clientName:'Lakme Fashion Week',
      quotationId:'q2', projectName:'Bridal Show',
      selectedModels:[
        { modelId:'m1', modelName:'Priya Sharma', coverImage:'https://i.pravatar.cc/300?img=47',
          height:170, age:25, categories:['Fashion'], experience:4,
          instagramLink:'', sellingPrice:25000, modelCharges:15000 },
      ],
      shootDate:'2026-08-05', shootTime:'09:00', venue:'Delhi Convention Centre',
      coordinator:'Rahul (9876543210)', sellingPrice:40000,
      notes:'Bridal collection showcase', status:'Confirmed',
      createdAt:'2026-06-10', updatedAt:'2026-06-10' },
    { id:'b2', bookingNumber:'BK-2026-002', clientId:'c3', clientName:'Myntra Studios',
      quotationId:'q3', projectName:'Q3 Catalogue Shoot',
      selectedModels:[
        { modelId:'m2', modelName:'Arjun Mehta', coverImage:'https://i.pravatar.cc/300?img=12',
          height:183, age:27, categories:['Commercial'], experience:6,
          instagramLink:'', sellingPrice:28000, modelCharges:20000 },
        { modelId:'m4', modelName:'Rohan Kapoor', coverImage:'https://i.pravatar.cc/300?img=8',
          height:178, age:29, categories:['Fashion'], experience:8,
          instagramLink:'', sellingPrice:35000, modelCharges:25000 },
      ],
      shootDate:'2026-07-15', shootTime:'08:00', venue:'Bangalore Studio',
      coordinator:'Priya (9988776655)', sellingPrice:63000,
      notes:'Full day shoot', status:'In Progress',
      createdAt:'2026-06-09', updatedAt:'2026-06-09' },
  ]);

  // ── Invoices ─────────────────────────────────────────────────────────────
  private _invoices = new BehaviorSubject<Invoice[]>([
    { id:'i1', invoiceNumber:'INV-2026-001', clientId:'c2', clientName:'Lakme Fashion Week',
      bookingId:'b1', bookingNumber:'BK-2026-001', projectName:'Bridal Show',
      amount:40000, gstPercent:18, gstAmount:7200, totalAmount:47200,
      dueDate:'2026-08-20', status:'Pending', paidAmount:0,
      notes:'Due 15 days after shoot', createdAt:'2026-06-10', updatedAt:'2026-06-10' },
    { id:'i2', invoiceNumber:'INV-2026-002', clientId:'c3', clientName:'Myntra Studios',
      bookingId:'b2', bookingNumber:'BK-2026-002', projectName:'Q3 Catalogue Shoot',
      amount:63000, gstPercent:18, gstAmount:11340, totalAmount:74340,
      dueDate:'2026-08-29', status:'Partially Paid', paidAmount:37170,
      notes:'50% advance received', createdAt:'2026-06-09', updatedAt:'2026-06-15' },
    { id:'i3', invoiceNumber:'INV-2026-003', clientId:'c1', clientName:'Zara India Pvt Ltd',
      bookingId:'b1', bookingNumber:'BK-2026-003', projectName:'Winter Shoot 2023',
      amount:35000, gstPercent:18, gstAmount:6300, totalAmount:41300,
      dueDate:'2026-01-30', status:'Paid', paidAmount:41300,
      notes:'', createdAt:'2026-01-15', updatedAt:'2026-01-30' },
  ]);

  // ── Payments ─────────────────────────────────────────────────────────────
  private _payments = new BehaviorSubject<Payment[]>([
    { id:'p1', invoiceId:'i2', invoiceNumber:'INV-2026-002', clientId:'c3', clientName:'Myntra Studios',
      amount:37170, paymentMethod:'Razorpay', transactionId:'pay_LMNOP12345',
      paymentDate:'2026-06-15', status:'Received', paymentLink:'', notes:'Advance payment via Razorpay',
      createdAt:'2026-06-15' },
    { id:'p2', invoiceId:'i3', invoiceNumber:'INV-2026-003', clientId:'c1', clientName:'Zara India Pvt Ltd',
      amount:41300, paymentMethod:'Bank Transfer', transactionId:'UTR987654321',
      paymentDate:'2026-01-28', status:'Received', paymentLink:'', notes:'',
      createdAt:'2026-01-28' }
  ]);

  // ── Users ────────────────────────────────────────────────────────────────
  private _users = new BehaviorSubject<User[]>([
    { id:'u1', name:'Rahul Negi', email:'rahul@talentcrm.com', role:'Super Admin',
      mobile:'9876543210', status:'Active', avatar:'RN', lastLogin:'2026-06-15 10:30',
      createdAt:'2026-01-01' },
    { id:'u2', name:'Anjali Singh', email:'anjali@talentcrm.com', role:'Admin',
      mobile:'9812345670', status:'Active', avatar:'AS', lastLogin:'2026-06-15 09:15',
      createdAt:'2026-01-15' },
    { id:'u3', name:'Deepak Rao', email:'deepak@talentcrm.com', role:'Talent Manager',
      mobile:'9734567890', status:'Active', avatar:'DR', lastLogin:'2026-06-14 18:00',
      createdAt:'2026-02-01' },
    { id:'u4', name:'Meera Joshi', email:'meera@talentcrm.com', role:'Finance',
      mobile:'9645678901', status:'Active', avatar:'MJ', lastLogin:'2026-06-15 08:45',
      createdAt:'2026-02-15' },
    { id:'u5', name:'Sunil Das', email:'sunil@talentcrm.com', role:'Viewer',
      mobile:'9556789012', status:'Inactive', avatar:'SD', lastLogin:'2026-05-20 14:00',
      createdAt:'2026-03-01' },
  ]);

  // ── Notifications ─────────────────────────────────────────────────────────
  private _notifications = new BehaviorSubject<Notification[]>([
    { id:'n1', title:'Payment Received', message:'₹37,170 received from Myntra Studios', type:'success', isRead:false, timestamp:'2026-06-15 09:00' },
    { id:'n2', title:'Invoice Overdue', message:'INV-2026-001 is due in 3 days', type:'warning', isRead:false, timestamp:'2026-06-15 08:30' },
    { id:'n3', title:'Booking Confirmed', message:'BK-2026-001 confirmed for Lakme Fashion Week', type:'info', isRead:true, timestamp:'2026-06-14 16:00' },
    { id:'n4', title:'New Requirement', message:'Titan Company added a new requirement', type:'info', isRead:false, timestamp:'2026-06-14 12:00' },
    { id:'n5', title:'Quotation Approved', message:'QT-2026-002 approved by Lakme Fashion Week', type:'success', isRead:true, timestamp:'2026-06-13 11:00' },
  ]);

  // ── Activity Logs ─────────────────────────────────────────────────────────
  private _activities: ActivityLog[] = [
    { id:'a1', userId:'u1', userName:'Rahul Negi', action:'Invoice Generated', module:'Invoice', details:'INV-2026-002 created for Myntra Studios', timestamp:'2026-06-15 09:30', icon:'receipt', color:'purple' },
    { id:'a2', userId:'u2', userName:'Anjali Singh', action:'Booking Confirmed', module:'Booking', details:'BK-2026-001 confirmed for Lakme Fashion Week', timestamp:'2026-06-14 16:00', icon:'event_available', color:'green' },
    { id:'a3', userId:'u3', userName:'Deepak Rao', action:'Quotation Sent', module:'Quotation', details:'QT-2026-001 sent to Zara India', timestamp:'2026-06-13 11:00', icon:'send', color:'blue' },
    { id:'a4', userId:'u1', userName:'Rahul Negi', action:'Model Created', module:'Models', details:'New model Naina Gupta added', timestamp:'2026-06-12 14:00', icon:'person_add', color:'pink' },
    { id:'a5', userId:'u2', userName:'Anjali Singh', action:'Client Updated', module:'Clients', details:'Myntra Studios contact updated', timestamp:'2026-06-11 10:30', icon:'business', color:'orange' },
  ];

  // ── Public Getters ─────────────────────────────────────────────────────────
  getModels(): Observable<Model[]> { return this._models.asObservable(); }
  getClients(): Observable<Client[]> { return this._clients.asObservable(); }
  getRequirements(): Observable<Requirement[]> { return this._requirements.asObservable(); }
  getQuotations(): Observable<Quotation[]> { return this._quotations.asObservable(); }
  getBookings(): Observable<Booking[]> { return this._bookings.asObservable(); }
  getInvoices(): Observable<Invoice[]> { return this._invoices.asObservable(); }
  getPayments(): Observable<Payment[]> { return this._payments.asObservable(); }
  getUsers(): Observable<User[]> { return this._users.asObservable(); }
  getNotifications(): Observable<Notification[]> { return this._notifications.asObservable(); }
  getUnreadCount(): Observable<number> { return this._notifications.pipe(map(n => n.filter(x=>!x.isRead).length)); }

  getDashboardStats(): Observable<DashboardStats> {
    const models = this._models.value;
    const quotations = this._quotations.value;
    const invoices = this._invoices.value;
    const bookings = this._bookings.value;
    return of({
      totalModels: models.length,
      activeModels: models.filter(m=>m.status==='Active').length,
      availableModels: 4,
      bookedModels: 3,
      upcomingShoots: bookings.filter(b=>b.status==='Confirmed').length,
      pendingQuotations: quotations.filter(q=>q.status==='Draft'||q.status==='Sent').length,
      approvedQuotations: quotations.filter(q=>q.status==='Approved').length,
      pendingInvoices: invoices.filter(i=>i.status==='Pending'||i.status==='Partially Paid').length,
      pendingPayments: invoices.filter(i=>i.status!=='Paid').reduce((s,i)=>s+(i.totalAmount-i.paidAmount),0),
      monthlyRevenue: 127000,
      monthlyRevenueChange: 18.5,
      recentActivities: this._activities
    }).pipe(delay(300));
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  addModel(m: Model) { this._models.next([...this._models.value, m]); }
  updateModel(m: Model) { this._models.next(this._models.value.map(x=>x.id===m.id?m:x)); }
  deleteModel(id: string) { this._models.next(this._models.value.filter(x=>x.id!==id)); }

  addClient(c: Client) { this._clients.next([...this._clients.value, c]); }
  updateClient(c: Client) { this._clients.next(this._clients.value.map(x=>x.id===c.id?c:x)); }
  deleteClient(id: string) { this._clients.next(this._clients.value.filter(x=>x.id!==id)); }

  addRequirement(r: Requirement) { this._requirements.next([...this._requirements.value, r]); }
  updateRequirement(r: Requirement) { this._requirements.next(this._requirements.value.map(x=>x.id===r.id?r:x)); }

  addQuotation(q: Quotation) { this._quotations.next([q, ...this._quotations.value]); }
  updateQuotation(q: Quotation) { this._quotations.next(this._quotations.value.map(x=>x.id===q.id?q:x)); }
  deleteQuotation(id: string) { this._quotations.next(this._quotations.value.filter(x=>x.id!==id)); }

  addBooking(b: Booking) { this._bookings.next([...this._bookings.value, b]); }
  updateBooking(b: Booking) { this._bookings.next(this._bookings.value.map(x=>x.id===b.id?b:x)); }

  addInvoice(i: Invoice) { this._invoices.next([...this._invoices.value, i]); }
  updateInvoice(i: Invoice) { this._invoices.next(this._invoices.value.map(x=>x.id===i.id?i:x)); }
  deleteInvoice(id: string) { this._invoices.next(this._invoices.value.filter(x=>x.id!==id)); }

  addPayment(p: Payment) { this._payments.next([...this._payments.value, p]); }
  updatePayment(p: Payment) { this._payments.next(this._payments.value.map(x=>x.id===p.id?p:x)); }

  addUser(u: User) { this._users.next([...this._users.value, u]); }
  updateUser(u: User) { this._users.next(this._users.value.map(x=>x.id===u.id?u:x)); }
  deleteUser(id: string) { this._users.next(this._users.value.filter(x=>x.id!==id)); }

  markNotificationRead(id: string) {
    this._notifications.next(this._notifications.value.map(n=>n.id===id?{...n,isRead:true}:n));
  }
  markAllRead() {
    this._notifications.next(this._notifications.value.map(n=>({...n,isRead:true})));
  }

  generateId(prefix: string): string {
    return prefix + Date.now().toString(36).toUpperCase();
  }

  generateInvoiceNumber(): string {
    const count = this._invoices.value.length + 1;
    return `INV-2026-${count.toString().padStart(3,'0')}`;
  }
  generateQuotationNumber(): string {
    const count = this._quotations.value.length + 1;
    return `QT-2026-${count.toString().padStart(3,'0')}`;
  }
  generateBookingNumber(): string {
    const count = this._bookings.value.length + 1;
    return `BK-2026-${count.toString().padStart(3,'0')}`;
  }
}
