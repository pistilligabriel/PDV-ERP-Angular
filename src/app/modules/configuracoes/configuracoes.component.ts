import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { ConfigService } from "src/app/services/configuracoes/configuracoes.service";

export interface Config {
    codigo?: number;
    nomeEmpresa: string;
    logo?: File | string; // URL da imagem ou base64
}

@Component({
    selector: 'app-config',
    templateUrl: './configuracoes.component.html',
    styleUrls: []
})
export class ConfigComponent implements OnInit, OnDestroy {
    private readonly destroy$: Subject<void> = new Subject<void>();

    logo!: string;
    config!: Config;

    public configForm = this.formBuilder.group({
        codigo: [null as number | null],
        nomeEmpresa: ['', [Validators.required]],
        logo: ['', [Validators.required]]
    })

    constructor(
        private configService: ConfigService,
        private formBuilder: FormBuilder
    ) { }
    
    ngOnInit(): void {
        this.configService.getLogo().subscribe(blob => {
            const reader = new FileReader();
            reader.onload = () => {
                this.logo = reader.result as string; // Armazena a URL base64
            };
            reader.readAsDataURL(blob); // Converte o Blob para base64
        });
    }

    salvarConfiguracoes() {
        if (this.configForm.valid) {
            const formData = new FormData();

            formData.append('file', this.configForm.value.logo as File | string);

            // Append campos do config (nomeEmpresa, etc.)
            formData.append('nomeEmpresa', this.configForm.value.nomeEmpresa as string);

            this.configService.salvarConfig(formData).subscribe({
                next: (response) => {
                    console.log('Configurações salvas com sucesso!', response);
                    this.configForm.reset();
                    window.location.reload();
                },
                error: (err) => {
                    console.error('Erro ao salvar configurações', err);
                }
            });
        } else {
            console.error('Logo não foi carregada corretamente.');
        }
    }



    onLogoUpload(event: any) {
        const file = event.files[0];
        if (file) {
            this.configForm.get('logo')?.setValue(file);
        }
    }

    getNomeEmpresa() {
    this.configService.getConfig().subscribe(config => {
      this.nomeEmpresa = config.nomeEmpresa;
    });
  }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

}