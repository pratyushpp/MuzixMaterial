import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Track } from '../classes/track';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  private lastFmUrl: string;
  private country: string;
  private apiKey: string;
  private format: string;
  private limit: string;

  private  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  private  microServiceUrl: string;

  private track: Track;
  private tracks: Array<Track>;
  private tracksSubject: BehaviorSubject<Track[]>;

  private errorMsg: string;
  private errorStatus: string;
  private errorBody: string;

  constructor(private http: HttpClient) {
    this.lastFmUrl = 'http://ws.audioscrobbler.com/2.0/?method=geo.gettoptracks';
    this.country = '&country=';
    this.apiKey = '&api_key=0e197c0085c6c947d16ee02969146315';
    this.format = '&format=json';
    this.limit = '&limit=';
    this.microServiceUrl = 'http://localhost:8098/api/v1/';

    this.tracksSubject = new BehaviorSubject(this.tracks);
  }

  getTopTracksFromLastFM(country: string, limit: number) {
    const url = this.lastFmUrl + this.country + country + this.apiKey + this.format + this.limit + limit;
    this.tracks = [];
    this.http.get(url).subscribe(response => {
      console.log(response);
      const trackList = response['tracks']['track'];
      trackList.forEach( data => {
        this.track = new Track();
        const tName = '' + data.name;
        const sName = '' + data.artist.name;
        this.track.trackId = tName.replace(' ', '_') + '_' + sName.replace(' ' , '_');
        this.track.trackName = data.name;
        this.track.trackUrl = data.url;
        this.track.trackSinger = data.artist.name;
        this.track.trackImageUrl = data.image[3]['#text'];
        this.track.comment = '';

        this.tracks.push(this.track);
      });
      // console.log(this.tracks);
      this.tracksSubject.next(this.tracks);
    });
    return this.tracksSubject;
  }

  addToPlayList(track: Track) {
    console.log(track);
    return this.http
    .post(this.microServiceUrl + 'track', track, { observe: 'response' })
    .pipe(catchError(this.handleError));
  }

  getAddedTracks() {
    return this.http.get(this.microServiceUrl + 'tracks');
  }

  updateAddedTrack(track: Track) {
    return this.http
    .put(this.microServiceUrl + 'tracks/track', track, { observe: 'response' })
    .pipe(catchError(this.handleError));
  }

  deleteTrackFromPlayList(trackId: string) {
    console.log(this.microServiceUrl + '/track/{trackId}' + trackId);
    return this.http.delete(this.microServiceUrl + 'tracks/track/' + trackId, { observe: 'response' })
    .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.log('An error occured :', error.error.message);
    } else {
      this.errorStatus = `${error.status}`;
      console.log('Error msg', this.errorStatus);
      this.errorBody = `${error.error}`;
      console.log(
        `Backened returned code ${error.status},` + `body was :${error.error}`
      );
    }

    return throwError(this.errorStatus);
  }

}
