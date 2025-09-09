import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject, Observable } from "rxjs";
import { Config } from "src/app/modules/configuracoes/configuracoes.component";
import { environment } from "src/environment/environment";

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private Api_URL = environment.apiUrl;
    private JWT_TOKEN = this.cookies.get('token')
    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.JWT_TOKEN}`,
        }),
    };

    private empresaSubject = new BehaviorSubject<Config | null>(null);
    empresa$ = this.empresaSubject.asObservable()

    constructor(
        private http: HttpClient,
        private cookies: CookieService
    ) { }

    atualizarEmpresa(config: Config){
        this.empresaSubject.next(config);
    }

    getConfig(): Observable<Config> {
        return this.http.get<Config>(`${this.Api_URL}/empresa/1`, this.httpOptions);
    }

    getLogo(): Observable<Blob> {
        return this.http.get(`${this.Api_URL}/empresa/1/logo`, { responseType: 'blob', headers: this.httpOptions.headers });
    }

    salvarConfig(formData: FormData): Observable<Config> {
        return this.http.post<Config>(`${this.Api_URL}/empresa/upload`, formData);
    }
}