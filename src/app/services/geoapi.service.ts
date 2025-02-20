import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Feature, FeatureCollection, Point, Polygon, Position } from 'geojson';
import { LatLng } from 'leaflet';
import { firstValueFrom } from 'rxjs';

const urlCommune = 'https://geo.api.gouv.fr/communes'

@Injectable()
export class GeoapiService {

  constructor(private httpClient: HttpClient) { }

  async getCommune(postalCode: string): Promise<[Feature<Polygon, GeoPropertiesForCommune>, Feature<Point, GeoPropertiesForCommune>]> {
    const urlContour = `${urlCommune}?codePostal=${postalCode}&format=geojson&geometry=contour`
    const urlMairie  = `${urlCommune}?codePostal=${postalCode}&format=geojson&geometry=mairie`

    const PC = firstValueFrom( this.httpClient.get<FeatureCollection<Polygon, GeoPropertiesForCommune>>( urlContour ) )
    const PM = firstValueFrom(this.httpClient.get<FeatureCollection<Point, GeoPropertiesForCommune>>(urlMairie))

    return Promise.all([
      PC.then(fg => fg.features.length > 0 ? fg.features[0] : Promise.reject(`No commune found for postal code ${postalCode}`)),
      PM.then(fg => fg.features.length > 0 ? fg.features[0] : Promise.reject(`No commune found for postal code ${postalCode}`)),
    ]);
  }
}

export function PositionToLatLng(p: Position): LatLng {
  return new LatLng(p[1], p[0])
}

export interface GeoPropertiesForCommune {
  readonly code: string;
  readonly codeDepartement: string;
  readonly codeEpci: string;
  readonly codeRegion: string;
  readonly codesPostaux: readonly string[];
  readonly nom: string;
  readonly population: number;
  readonly siren: string;
}
