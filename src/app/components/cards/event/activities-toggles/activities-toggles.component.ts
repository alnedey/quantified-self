import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {EventInterface} from 'quantified-self-lib/lib/events/event.interface';
import {ActivityInterface} from 'quantified-self-lib/lib/activities/activity.interface';
import {EventColorService} from '../../../../services/color/app.event.color.service';
import {ActivitySelectionService} from '../../../../services/activity-selection-service/activity-selection.service';
import {Subscription} from 'rxjs';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {User} from 'quantified-self-lib/lib/users/user';

@Component({
  selector: 'app-activities-toggles',
  templateUrl: './activities-toggles.component.html',
  styleUrls: ['./activities-toggles.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // @todo not sure
})

export class ActivitiesTogglesComponent{
  @Input() isOwner?: boolean;
  @Input() event: EventInterface;
  @Input() user?: User;

  constructor() {
  }
}
