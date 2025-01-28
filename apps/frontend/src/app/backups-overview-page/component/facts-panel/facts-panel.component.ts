import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, shareReplay, Subject, takeUntil } from 'rxjs';
import { BasicInformation } from '../../../shared/types/basicInformation';
import { InformationServiceService } from '../../../shared/services/information-service/information-service.service';
import { shortenBytes } from '../../../shared/utils/shortenBytes';

@Component({
  selector: 'app-facts-panel',
  templateUrl: './facts-panel.component.html',
  styleUrl: './facts-panel.component.css',
})
export class FactsPanelComponent implements OnDestroy, OnInit {
  private readonly destroy$ = new Subject<void>();
  basicInformations$: Observable<BasicInformation> = of();

  constructor(private readonly informationService: InformationServiceService) {}

  ngOnInit() {
    this.loadBasicInformations();
    this.informationService
      .getRefreshObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadBasicInformations();
      });
  }
  /**
   * Loads the basic informations about the page
   */
  loadBasicInformations(): void {
    this.basicInformations$ = this.informationService
      .getBasicInformations()
      .pipe(takeUntil(this.destroy$), shareReplay(1));
  }

  protected readonly shortenBytes = shortenBytes;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
