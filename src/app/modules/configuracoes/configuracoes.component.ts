import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { Subject } from 'rxjs';
import { TipoEmpresa } from 'src/app/models/enums/empresa/TipoEmpresa.enum';
import { DropDownOptionsTipoEmpresa } from 'src/app/models/interfaces/empresa/DropDownOptionsTipoEmpresa';
import { ConfigService } from 'src/app/services/configuracoes/configuracoes.service';

export interface Config {
  codigo?: number;
  nomeEmpresa: string;
  logo?: File | string; // URL da imagem ou base64
  tipoEmpresa: TipoEmpresa;
}

@Component({
  selector: 'app-config',
  templateUrl: './configuracoes.component.html',
  styleUrls: [],
})
export class ConfigComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject<void>();

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  logo!: string;
  nomeEmpresa!: string;
  config!: Config;
  tipoEmpresa !: DropDownOptionsTipoEmpresa[];
  tipoEmpresaSelecionado!: TipoEmpresa | null;

  public configForm = this.formBuilder.group({
    codigo: [null as number | null],
    nomeEmpresa: ['', [Validators.required]],
    logo: [''],
    logoFile: [null],
    tipoEmpresa: [null as TipoEmpresa | null, [Validators.required]],
  });

  constructor(
    private configService: ConfigService,
    private formBuilder: FormBuilder,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.obterInformacoes();
    this.getNomeEmpresa();

    this.tipoEmpresa = Object.keys(TipoEmpresa).map((key) => ({
      label: key,
      value: key,
    }));
  }

  getNomeEmpresa() {
    this.configService.getConfig().subscribe((config) => {
      this.nomeEmpresa = config.nomeEmpresa;
      this.tipoEmpresaSelecionado = config.tipoEmpresa;
    });
  }

  obterInformacoes(): void {
    this.configService.getLogo().subscribe(
      (blob) => {
        console.log('Blob recebido:', blob);
        const reader = new FileReader();
        reader.onload = () => {
          this.logo = reader.result as string;
        };
        reader.readAsDataURL(blob);
      },
      (error) => {
        console.error('Erro ao carregar logo', error);
        this.logo = 'assets/default-logo.png';
      }
    );
  }

  salvarConfiguracoes() {
    if (this.configForm.valid) {
      const formData = new FormData();

      if (this.configForm.value.logoFile) {
        formData.append('file', this.configForm.value.logoFile);
      }

      formData.append('nomeEmpresa', this.configForm.value.nomeEmpresa ?? '');

      formData.append('tipoEmpresa', this.configForm.value.tipoEmpresa ??  '');

      this.configService.salvarConfig(formData).subscribe({
        next: (response) => {
          console.log('Configurações salvas com sucesso!', response);
        
          this.configService.atualizarEmpresa({
            nomeEmpresa: response?.nomeEmpresa,
            logo: response.logo ? `data:image/png;base64,${response.logo}` : (this.configForm.value.logo ?? undefined),
            tipoEmpresa: response.tipoEmpresa
          });
    
          this.message.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Configurações salvas com sucesso!',
            life: 5000,
          });

          if(this.fileUpload){
            this.fileUpload.clear()
          }
        },
        error: (err) => {
          console.error('Erro ao salvar configurações', err);
        },
      });
    }
  }

  onLogoUpload(event: any) {
    const file = event.files[0];
    if (file) {
      // guarda o arquivo para enviar ao backend
      this.configForm.get('logoFile')?.setValue(file);

      // cria uma pré-visualização
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string' || reader.result === null) {
          this.configForm.get('logo')?.setValue(reader.result); // base64 string
        }
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
