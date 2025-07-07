import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Config } from "src/app/modules/configuracoes/configuracoes.component";
import { environment } from "src/environment/environment";

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private Api_URL = environment.apiUrl;
    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    constructor(
        private http: HttpClient,
    ) { }

    getConfig(): Observable<Config> {
        return this.http.get<Config>(`${this.Api_URL}/empresa/1`, this.httpOptions);
    }

    getLogo(): Observable<Blob> {
        return this.http.get(`${this.Api_URL}/empresa/1/logo`, { responseType: 'blob' });
    }

    salvarConfig(formData: FormData): Observable<Config> {
        return this.http.post<Config>(`${this.Api_URL}/empresa/upload`, formData);
    }
}