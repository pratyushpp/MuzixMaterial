import { Component, OnInit } from '@angular/core';
import { TrackService } from '../../services/track.service';
import { Track } from '../../classes/track';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private tracks: Array<Track>;
  private statusCode: number;
  private errorStatus: string;

  constructor(private trackService: TrackService, private snackBar: MatSnackBar) {
    this.tracks = [];
  }

  ngOnInit() {
    this.trackService.getTopTracksFromLastFM('india', 10).subscribe((res: any) => {
    this.tracks = res;
    console.log(this.tracks);
    });
  }

  addToPlayList(track) {
    this.trackService.addToPlayList(track).subscribe(
      response => {
        this.statusCode = response.status;
        if (this.statusCode === 200) {
          console.log('Success', this.statusCode);
          this.snackBar.open('Track Successfully added !!!', '', {
            duration: 1500
          });
        }
      },
      err => {
        const errorStatus = err;
        this.statusCode = parseInt(errorStatus, 10);
        if (this.statusCode === 409) {
          this.snackBar.open('Track already added', '', {
            duration: 1500
          });
          this.statusCode = 0;
        }
    });
  }

}
