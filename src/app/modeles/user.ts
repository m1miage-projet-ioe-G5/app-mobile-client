export type MobilityProfile = 'standard' | 'wheelchair' | 'crutches' | 'elderly';


export interface UserCreationRequest {
  numero: string;
  nom: string;
  prenom: string;
  //profile: MobilityProfile;
}

export interface UserResponse {
  numero: string;
  nom: string;
  prenom: string;
  //profile: MobilityProfile;

}
