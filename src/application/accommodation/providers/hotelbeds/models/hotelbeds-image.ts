export interface HotelbedsImageSize {
  readonly url?: string;
  readonly type?: string;
  readonly width?: number;
  readonly height?: number;
}

export interface HotelbedsImageText {
  readonly content?: string;
  readonly languageCode?: string;
}

export interface HotelbedsImage {
  readonly path?: string;
  readonly imageTypeCode?: string;
  readonly imageType?: string;
  readonly order?: number;
  readonly visualOrder?: number;
  readonly roomCode?: string;
  readonly roomType?: string;
  readonly characteristicCode?: string;
  readonly destinationCode?: string;
  readonly lastUpdate?: string;
  readonly sizes?: ReadonlyArray<HotelbedsImageSize>;
  readonly description?: ReadonlyArray<HotelbedsImageText>;
}