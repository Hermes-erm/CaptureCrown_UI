import { Injectable } from '@angular/core';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root',
})
export class ToastServiceService {
  positions = NbGlobalPhysicalPosition;
  messageIcon: string = '';

  constructor(private toastrService: NbToastrService) {}

  showToast(position: any, message: string) {
    this.toastrService.show('info', message, {
      position: position,
      duration: 3000,
      toastClass: 'custom-toast',
      icon: this.messageIcon,
    });
  }
}
