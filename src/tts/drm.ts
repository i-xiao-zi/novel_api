// @ts-ignore
import crypto from 'isomorphic-crypto';


const WIN_EPOCH = 11644473600;
const S_TO_NS = 1e9;

export class DRM {
  private static clockSkewSeconds = 0.0;

  static adjClockSkewSeconds(skewSeconds: number) {
    DRM.clockSkewSeconds += skewSeconds;
  }

  static getUnixTimestamp(): number {
    return Date.now() / 1000 + DRM.clockSkewSeconds;
  }

  static parseRfc2616Date(date: string): number | null {
    try {

      return new Date(date).getTime() / 1000;
    } catch (e) {
      return null;
    }
  }

  /**
   * Handles client response errors by adjusting clock skew based on server date.
   * @param e - Axios error containing server response headers
   * @throws {Error} If server date is missing or invalid
   */
  // static handleClientResponseError(e: Error) {
  //   if (!e.response || !e.response.headers) {
  //     throw new Error("No server date in headers.");
  //   }
  //   const serverDate = e.response.headers["date"];
  //   if (!serverDate || typeof serverDate !== 'string') {
  //     throw new Error("No server date in headers.");
  //   }
  //   const serverDateParsed = DRM.parseRfc2616Date(serverDate);
  //   if (serverDateParsed === null) {
  //     throw new Error(`Failed to parse server date: ${serverDate}`);
  //   }
  //   const clientDate = DRM.getUnixTimestamp();
  //   DRM.adjClockSkewSeconds(serverDateParsed - clientDate);
  // }

  static generateSecMsGec(): string {
    let ticks = DRM.getUnixTimestamp();
    ticks += WIN_EPOCH;
    ticks -= ticks % 300;
    ticks *= S_TO_NS / 100;

    const strToHash = `${ticks.toFixed(0)}6A5AA1D4EAFF4E9FB37E23D68491D6F4`;
    return crypto.createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
  }
} 