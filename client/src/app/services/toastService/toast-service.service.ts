import { Injectable } from '@angular/core';
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';

@Injectable({
  providedIn: 'root',
})
export class ToastServiceService {
  positions = NbGlobalPhysicalPosition;
  messageIcon: string = 'message-square-outline';

  constructor(private toastrService: NbToastrService) {}

  showToast(name: string, message: string) {
    this.toastrService.show(name, message, {
      position: this.positions.TOP_RIGHT,
      duration: 6000,
      toastClass: 'custom-toast',
      icon: this.messageIcon,
    });
  }
}
