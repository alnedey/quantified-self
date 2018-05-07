import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnChanges, OnInit,
  ViewChild,
} from '@angular/core';
import {EventInterface} from '../../../../../entities/events/event.interface';
import {AgmMap, LatLngBoundsLiteral} from '@agm/core';
import {PointInterface} from '../../../../../entities/points/point.interface';
import {AppEventColorService} from '../../../../../services/color/app.event.color.service';
import {ActivityInterface} from '../../../../../entities/activities/activity.interface';
import {LapInterface} from '../../../../../entities/laps/lap.interface';
import {GoogleMapsAPIWrapper} from '@agm/core/services/google-maps-api-wrapper';

@Component({
  selector: 'app-event-card-map-agm',
  templateUrl: './event.card.map.agm.component.html',
  styleUrls: ['./event.card.map.agm.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EventCardMapAGMComponent implements OnChanges, OnInit {
  @ViewChild(AgmMap) agmMap;
  @Input() event: EventInterface;
  @Input() selectedActivities: ActivityInterface[];
  @Input() isVisible: boolean;


  public mapData: {
    activity: ActivityInterface,
    activityPoints: PointInterface[],
    activityStartPoint: PointInterface,
    lapsWithPosition: {
      lap: LapInterface,
      lapPoints: PointInterface[],
      lapEndPoint: PointInterface
    }[]
  }[] = [];

  public openedLapMarkerInfoWindow: LapInterface;
  public openedActivityStartMarkerInfoWindow: ActivityInterface;

  constructor(private changeDetectorRef: ChangeDetectorRef, public eventColorService: AppEventColorService) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.cacheNewData();
    if (this.isVisible) {
      this.agmMap.triggerResize().then(() => {
        const googleMaps: GoogleMapsAPIWrapper = this.agmMap._mapsWrapper;
        googleMaps.fitBounds(this.getBounds());
      });
    }
  }

  private cacheNewData() {
    this.mapData = [];
    this.selectedActivities.forEach((activity) => {
      const activityPoints = this.event.getPointsWithPosition(void 0, void 0, [activity]);
      // If the activity has no points skip
      if (!activityPoints.length) {
        return;
      }
      // Check for laps with position
      const lapsWithPosition = activity.getLaps().reduce((lapsArray, lap) => {
        const lapPoints = this.event.getPointsWithPosition(lap.startDate, lap.endDate, [activity]);
        if (lapPoints.length) {
          lapsArray.push({
            lap: lap,
            lapPoints: lapPoints,
            lapEndPoint: lapPoints[lapPoints.length - 1],
          })
        }
        return lapsArray;
      }, []);
      // Create the object
      this.mapData.push({
        activity: activity,
        activityPoints: activityPoints,
        activityStartPoint: activityPoints[0],
        lapsWithPosition: lapsWithPosition,
      });
    });
  }

  getBounds(): LatLngBoundsLiteral {
    const pointsWithPosition = this.mapData.reduce((pointsArray, activityData) => pointsArray.concat(activityData.activityPoints), []);
    if (!pointsWithPosition.length) {
      return <LatLngBoundsLiteral>{
        east: 0,
        west: 0,
        north: 0,
        south: 0,
      };
    }
    const mostEast = pointsWithPosition.reduce((acc: PointInterface, point: PointInterface) => {
      return (acc.getPosition().longitudeDegrees < point.getPosition().longitudeDegrees) ? point : acc;
    });
    const mostWest = pointsWithPosition.reduce((acc: any, point: PointInterface) => {
      return (acc.getPosition().longitudeDegrees > point.getPosition().longitudeDegrees) ? point : acc;
    });
    const mostNorth = pointsWithPosition.reduce((acc: any, point: PointInterface) => {
      return (acc.getPosition().latitudeDegrees < point.getPosition().latitudeDegrees) ? point : acc;
    });
    const mostSouth = pointsWithPosition.reduce((acc: any, point: PointInterface) => {
      return (acc.getPosition().latitudeDegrees > point.getPosition().latitudeDegrees) ? point : acc;
    });
    return <LatLngBoundsLiteral>{
      east: mostEast.getPosition().longitudeDegrees,
      west: mostWest.getPosition().longitudeDegrees,
      north: mostNorth.getPosition().latitudeDegrees,
      south: mostSouth.getPosition().latitudeDegrees,
    };
  }

  openLapMarkerInfoWindow(lap) {
    this.openedLapMarkerInfoWindow = lap;
    this.openedActivityStartMarkerInfoWindow = void 0;
  }

  openActivityStartMarkerInfoWindow(activity) {
    this.openedActivityStartMarkerInfoWindow = activity;
    this.openedLapMarkerInfoWindow = void 0;
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width) {
    this.agmMap.triggerResize().then(() => {
      this.agmMap._mapsWrapper.fitBounds(this.getBounds())
    });
  }
}

