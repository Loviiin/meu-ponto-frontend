<template>
  <div class="relatorio-geral-container">
    <div class="card shadow-lg">
      <div class="card-body">
        <h1 class="mb-4 text-center">
          <i class="bi bi-file-earmark-bar-graph me-2"></i>
          Relatório Geral de Ponto
        </h1>

        <!-- Toggle Modo Demonstração -->
        <div class="d-flex justify-content-end mb-3">
          <button class="btn btn-outline-warning btn-sm" @click="toggleDemo">
            <i class="bi" :class="isMock ? 'bi-toggle-on' : 'bi-toggle-off'"></i>
            <span class="ms-1">Modo demonstração</span>
          </button>
        </div>

        <!-- Mensagem de Demo -->
        <transition name="fade">
          <div v-if="isMock" class="alert alert-warning py-2 mb-3">
            <i class="bi bi-info-circle me-2"></i>
            Modo demonstração ativado. Exibindo dados fictícios.
          </div>
        </transition>

        <!-- Formulário de Filtros -->
        <form @submit.prevent="gerarRelatorio" class="filtros-form mb-4">
          <div class="row g-3 mb-3">
            <!-- Data Início -->
            <div class="col-md-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-calendar-event me-1"></i>Data Início
              </label>
              <input 
                type="date" 
                class="form-control" 
                v-model="filtros.dataInicio" 
                required 
              />
            </div>

            <!-- Data Fim -->
            <div class="col-md-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-calendar-check me-1"></i>Data Fim
              </label>
              <input 
                type="date" 
                class="form-control" 
                v-model="filtros.dataFim" 
                required 
              />
            </div>

            <!-- Seleção de Funcionário -->
            <div class="col-md-4">
              <label class="form-label fw-semibold">
                <i class="bi bi-person me-1"></i>Funcionário
              </label>
              <select 
                class="form-select" 
                v-model="filtros.usuarioId"
              >
                <option value="">Todos os Funcionários</option>
                <option 
                  v-for="usuario in listaUsuarios" 
                  :key="usuario.id" 
                  :value="usuario.id"
                >
                  {{ usuario.nome }} {{ usuario.sobrenome ? '- ' + usuario.sobrenome : '' }}
                </option>
              </select>
              <small class="text-muted">Deixe vazio para ver todos</small>
            </div>
          </div>

          <!-- Atalhos de Período -->
          <div class="quick-range mb-3">
            <div class="quick-label text-muted">Atalhos:</div>
            <div class="quick-buttons">
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('hoje')">Hoje</button>
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('ontem')">Ontem</button>
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('semana')">7 dias</button>
              <button type="button" class="btn btn-outline-light btn-sm" @click="setPeriodo('mes')">Este mês</button>
            </div>
          </div>

          <!-- Mensagens de Erro/Sucesso -->
          <transition name="fade">
            <div v-if="erro" class="alert alert-danger py-2 mb-3">
              <i class="bi bi-exclamation-triangle me-2"></i>{{ erro }}
            </div>
          </transition>

          <!-- Botões de Ação -->
          <div class="actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="!loading">
                <i class="bi bi-bar-chart-line me-2"></i>Gerar Relatório
              </span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Processando...
              </span>
            </button>
            <button type="button" class="btn btn-outline-warning" @click="limparFiltros" :disabled="loading">
              <i class="bi bi-arrow-clockwise me-1"></i>Limpar
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="voltar" :disabled="loading">
              <i class="bi bi-arrow-left me-1"></i>Voltar
            </button>
          </div>
        </form>

        <!-- Área de Exibição do Relatório -->
        <div v-if="relatorioData" class="relatorio-resultado">
          <div class="resultado-header mb-3">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h4>
                  <i class="bi bi-calendar-range me-2"></i>
                  Período: {{ formatarData(filtros.dataInicio) }} até {{ formatarData(filtros.dataFim) }}
                </h4>
                <small class="text-muted">
                  Total de registros: {{ contarTotalRegistros() }}
                </small>
              </div>
              
              <!-- Botões de Exportação Geral -->
              <div class="export-buttons d-flex gap-2 flex-wrap">
                <button 
                  class="btn btn-success btn-sm" 
                  @click="exportarGeral('PDF')"
                  :disabled="exportando"
                  title="Exportar todos em PDF"
                >
                  <i class="bi bi-file-earmark-pdf me-1"></i>
                  <span v-if="!exportando">Exportar PDF</span>
                  <span v-else class="spinner-border spinner-border-sm" role="status"></span>
                </button>
                <button 
                  class="btn btn-info btn-sm" 
                  @click="exportarGeral('CSV')"
                  :disabled="exportando"
                  title="Exportar todos em CSV"
                >
                  <i class="bi bi-file-earmark-spreadsheet me-1"></i>
                  <span v-if="!exportando">Exportar CSV</span>
                  <span v-else class="spinner-border spinner-border-sm" role="status"></span>
                </button>
              </div>
            </div>
          </div>

          <!-- Relatório para Múltiplos Usuários -->
          <div v-if="Array.isArray(relatorioData)" class="usuarios-lista">
            <div 
              v-for="(usuarioRelatorio, index) in relatorioData" 
              :key="index"
              class="usuario-card card mb-3"
            >
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <h5 class="mb-0">
                      <i class="bi bi-person-circle me-2"></i>
                      {{ usuarioRelatorio.usuario_nome }}
                    </h5>
                    <small class="text-muted">
                      <i class="bi bi-briefcase me-1"></i>{{ usuarioRelatorio.usuario_cargo || 'Cargo não informado' }}
                    </small>
                  </div>
                  
                  <!-- Botões de Exportação Individual -->
                  <div class="export-buttons-individual d-flex gap-2">
                    <button 
                      class="btn btn-outline-success btn-sm" 
                      @click="exportarUsuario(usuarioRelatorio.usuario_id, 'PDF')"
                      :disabled="exportando"
                      title="Exportar este usuário em PDF"
                    >
                      <i class="bi bi-file-pdf"></i>
                    </button>
                    <button 
                      class="btn btn-outline-info btn-sm" 
                      @click="exportarUsuario(usuarioRelatorio.usuario_id, 'CSV')"
                      :disabled="exportando"
                      title="Exportar este usuário em CSV"
                    >
                      <i class="bi bi-file-spreadsheet"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <!-- Totais do Usuário -->
                <div class="totais-grid mb-3">
                  <div class="total-item">
                    <span class="total-label">Horas Trabalhadas:</span>
                    <span class="total-value text-primary">{{ formatarHoras(usuarioRelatorio.total_horas_trabalhadas) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Horas Extras:</span>
                    <span class="total-value text-success">{{ formatarHoras(usuarioRelatorio.total_horas_extras) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Horas Faltantes:</span>
                    <span class="total-value text-danger">{{ formatarHoras(usuarioRelatorio.total_horas_faltantes) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Banco de Horas:</span>
                    <span class="total-value" :class="bancoHorasClass(usuarioRelatorio.banco_horas_periodo)">
                      {{ formatarHoras(usuarioRelatorio.banco_horas_periodo) }}
                    </span>
                  </div>
                </div>

                <!-- Tabela de Detalhes Diários -->
                <div class="detalhes-toggle mb-2">
                  <button 
                    class="btn btn-sm btn-outline-info" 
                    @click="toggleDetalhes(index)"
                  >
                    <i :class="detalhesVisiveis[index] ? 'bi-chevron-up' : 'bi-chevron-down'" class="bi me-1"></i>
                    {{ detalhesVisiveis[index] ? 'Ocultar' : 'Ver' }} Detalhes Diários
                  </button>
                </div>

                <transition name="slide">
                  <div v-if="detalhesVisiveis[index]" class="table-responsive">
                    <table class="table table-hover table-striped">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Dia Semana</th>
                          <th>Entrada</th>
                          <th>Saída</th>
                          <th>Horas Esperadas</th>
                          <th>Horas Trabalhadas</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(dia, diaIndex) in usuarioRelatorio.detalhes_dias" :key="diaIndex">
                          <td>{{ formatarData(dia.data) }}</td>
                          <td>{{ dia.dia_semana }}</td>
                          <td>{{ dia.primeiro_registro || '-' }}</td>
                          <td>{{ dia.ultimo_registro || '-' }}</td>
                          <td>{{ formatarHoras(dia.horas_esperadas_dia) }}</td>
                          <td :class="horasTrabalhadasClass(dia.total_horas_dia)">
                            {{ formatarHoras(dia.total_horas_dia) }}
                          </td>
                          <td>
                            <span :class="statusBadgeClass(dia.status)" class="badge">
                              {{ dia.status }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Mensagem se não houver dados -->
            <div v-if="relatorioData.length === 0" class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              Nenhum registro encontrado para o período selecionado.
            </div>
          </div>

          <!-- Relatório para Usuário Único -->
          <div v-else class="usuario-unico card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5 class="mb-0">
                    <i class="bi bi-person-circle me-2"></i>
                    {{ relatorioData.usuario_nome }}
                  </h5>
                  <small class="text-muted">
                    <i class="bi bi-briefcase me-1"></i>{{ relatorioData.usuario_cargo || 'Cargo não informado' }}
                  </small>
                </div>
                
                <!-- Botões de Exportação Individual -->
                <div class="export-buttons-individual d-flex gap-2">
                  <button 
                    class="btn btn-outline-success btn-sm" 
                    @click="exportarUsuario(relatorioData.usuario_id, 'PDF')"
                    :disabled="exportando"
                    title="Exportar em PDF"
                  >
                    <i class="bi bi-file-pdf me-1"></i>PDF
                  </button>
                  <button 
                    class="btn btn-outline-info btn-sm" 
                    @click="exportarUsuario(relatorioData.usuario_id, 'CSV')"
                    :disabled="exportando"
                    title="Exportar em CSV"
                  >
                    <i class="bi bi-file-spreadsheet me-1"></i>CSV
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <!-- Totais do Usuário -->
              <div class="totais-grid mb-4">
                <div class="total-item">
                  <span class="total-label">Horas Trabalhadas:</span>
                  <span class="total-value text-primary">{{ formatarHoras(relatorioData.total_horas_trabalhadas) }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">Horas Extras:</span>
                  <span class="total-value text-success">{{ formatarHoras(relatorioData.total_horas_extras) }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">Horas Faltantes:</span>
                  <span class="total-value text-danger">{{ formatarHoras(relatorioData.total_horas_faltantes) }}</span>
                </div>
                <div class="total-item">
                  <span class="total-label">Banco de Horas:</span>
                  <span class="total-value" :class="bancoHorasClass(relatorioData.banco_horas_periodo)">
                    {{ formatarHoras(relatorioData.banco_horas_periodo) }}
                  </span>
                </div>
              </div>

              <!-- Tabela de Detalhes Diários -->
              <h6 class="mb-3">Detalhes Diários</h6>
              <div class="table-responsive">
                <table class="table table-hover table-striped">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Dia Semana</th>
                      <th>Entrada</th>
                      <th>Saída</th>
                      <th>Horas Esperadas</th>
                      <th>Horas Trabalhadas</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(dia, index) in relatorioData.detalhes_dias" :key="index">
                      <td>{{ formatarData(dia.data) }}</td>
                      <td>{{ dia.dia_semana }}</td>
                      <td>{{ dia.primeiro_registro || '-' }}</td>
                      <td>{{ dia.ultimo_registro || '-' }}</td>
                      <td>{{ formatarHoras(dia.horas_esperadas_dia) }}</td>
                      <td :class="horasTrabalhadasClass(dia.total_horas_dia)">
                        {{ formatarHoras(dia.total_horas_dia) }}
                      </td>
                      <td>
                        <span :class="statusBadgeClass(dia.status)" class="badge">
                          {{ dia.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../axios'
import { gerarRelatorioGeral, exportarRelatorioGeral } from '../services/PontoRelatorioService'
import { toast } from '../toast'

export default {
  name: 'RelatorioGeral',
  data() {
    const hoje = new Date().toISOString().slice(0, 10)
    return {
      filtros: {
        dataInicio: hoje,
        dataFim: hoje,
        usuarioId: ''
      },
      listaUsuarios: [],
      relatorioData: null,
      loading: false,
      loadingUsuarios: false,
      erro: null,
      detalhesVisiveis: {}, // Controla visibilidade dos detalhes de cada usuário
      isMock: false, // Modo demonstração
      exportando: false // Controla estado de exportação
    }
  },
  async mounted() {
    await this.buscarUsuarios()
    // Definir período padrão como último mês
    this.setPeriodo('mes')
  },
  methods: {
    async buscarUsuarios() {
      this.loadingUsuarios = true
      try {
        const response = await api.get('/usuarios')
        this.listaUsuarios = response.data || []
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
        this.erro = 'Erro ao carregar lista de funcionários.'
      } finally {
        this.loadingUsuarios = false
      }
    },
    
    async gerarRelatorio() {
      if (!this.validarFiltros()) return
      
      // Se está em modo demo, usar dados fictícios
      if (this.isMock) {
        this.loading = true
        this.erro = null
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.relatorioData = this.getDadosDemonstracao()
        
        // Inicializar controle de visibilidade dos detalhes
        if (Array.isArray(this.relatorioData)) {
          this.detalhesVisiveis = this.relatorioData.reduce((acc, _, index) => {
            acc[index] = false
            return acc
          }, {})
        }
        
        this.loading = false
        return
      }
      
      // Fluxo normal com API
      this.loading = true
      this.erro = null
      this.relatorioData = null
      
      try {
        const usuarioId = this.filtros.usuarioId ? parseInt(this.filtros.usuarioId) : null
        const resultado = await gerarRelatorioGeral(
          this.filtros.dataInicio,
          this.filtros.dataFim,
          usuarioId
        )
        
        // Log para debug
        console.log('📊 Resultado da API:', {
          usuarioId,
          isArray: Array.isArray(resultado),
          tipo: typeof resultado,
          keys: typeof resultado === 'object' ? Object.keys(resultado) : 'N/A',
          dados: resultado
        })
        
        // Normalizar resposta
        if (!usuarioId) {
          // Quando "Todos os Funcionários", deve ser sempre array
          if (Array.isArray(resultado)) {
            this.relatorioData = resultado
            console.log(`✅ Array com ${resultado.length} usuários recebido`)
          } else if (typeof resultado === 'object' && resultado !== null) {
            // Se é objeto, pode ter a lista dentro de uma propriedade
            // Verificar estruturas comuns: results, data, usuarios, items, etc
            let usuariosArray = []
            
            if (Array.isArray(resultado.results)) {
              usuariosArray = resultado.results
              console.log(`✅ Extrato de resultado.results: ${usuariosArray.length} usuários`)
            } else if (Array.isArray(resultado.data)) {
              usuariosArray = resultado.data
              console.log(`✅ Extrato de resultado.data: ${usuariosArray.length} usuários`)
            } else if (Array.isArray(resultado.dados?.usuarios)) {
              // Estrutura: { dados: { usuarios: [...] } }
              usuariosArray = resultado.dados.usuarios
              console.log(`✅ Extrato de resultado.dados.usuarios: ${usuariosArray.length} usuários`)
            } else if (Array.isArray(resultado.usuarios)) {
              usuariosArray = resultado.usuarios
              console.log(`✅ Extrato de resultado.usuarios: ${usuariosArray.length} usuários`)
            } else if (Array.isArray(resultado.items)) {
              usuariosArray = resultado.items
              console.log(`✅ Extrato de resultado.items: ${usuariosArray.length} usuários`)
            } else {
              // Último recurso: verificar se é um objeto com IDs de usuário como chaves
              // Tipo { "1": {...}, "2": {...}, "3": {...}, "4": {...} }
              const valores = Object.values(resultado)
              if (valores.length > 0 && typeof valores[0] === 'object' && valores[0].usuario_nome) {
                usuariosArray = valores
                console.log(`✅ Extrato de valores do objeto: ${usuariosArray.length} usuários`)
              } else {
                // Se nada funcionar, colocar o objeto em array
                usuariosArray = [resultado]
                console.warn('⚠️ Estrutura desconhecida, colocando em array')
              }
            }
            
            // Normalizar os dados dos usuários para o formato esperado
            this.relatorioData = usuariosArray.map((user, idx) => {
              // Tentar encontrar os detalhes dos dias em várias propriedades possíveis
              const diasOriginais = user.dias || 
                                   user.detalhes_dias || 
                                   user.detalhes || 
                                   user.registros_dias ||
                                   user.days ||
                                   []
              
              console.log(`👤 Usuário ${idx + 1}:`, {
                nome: user.usuario?.nome || user.nome,
                detalhes_encontrados: diasOriginais.length,
                propriedades_user: Object.keys(user)
              })
              
              // Mapear os dias para o formato esperado pelo template
              const detalhes = diasOriginais.map(dia => {
                // Extrair entrada e saída das marcações
                let primeiroRegistro = '-'
                let ultimoRegistro = '-'
                let diaSemana = '-'
                
                if (dia.marcacoes && Array.isArray(dia.marcacoes) && dia.marcacoes.length > 0) {
                  // Pegar primeira entrada e última saída
                  const primeira = dia.marcacoes[0]
                  const ultima = dia.marcacoes[dia.marcacoes.length - 1]
                  
                  if (primeira?.entrada) {
                    primeiroRegistro = this.formatarHorario(primeira.entrada)
                  }
                  if (ultima?.saida) {
                    ultimoRegistro = this.formatarHorario(ultima.saida)
                  }
                }
                
                // Determinar o dia da semana
                if (dia.data) {
                  const date = new Date(dia.data + 'T00:00:00')
                  diaSemana = date.toLocaleDateString('pt-BR', { weekday: 'long' })
                }
                
                // Determinar status
                let status = 'AUSENTE'
                if (dia.inconsistente) {
                  status = 'INCOMPLETO'
                } else if (dia.total_trabalhado_minutos > 0) {
                  status = 'COMPLETO'
                } else if (dia.carga_esperada_minutos === 0) {
                  status = 'FOLGA'
                }
                
                return {
                  data: dia.data,
                  dia_semana: diaSemana,
                  primeiro_registro: primeiroRegistro,
                  ultimo_registro: ultimoRegistro,
                  horas_esperadas_dia: this.converterMinutosParaHoras(dia.carga_esperada_minutos || 0),
                  total_horas_dia: this.converterMinutosParaHoras(dia.total_trabalhado_minutos || 0),
                  status: status
                }
              })
              
              return {
                usuario_id: user.usuario?.id || user.id || user.usuario_id,
                usuario_nome: user.usuario?.nome || user.nome || user.usuario_nome || 'Nome não informado',
                usuario_cargo: user.usuario?.cargo_nome || user.cargo_nome || user.usuario_cargo || 'Cargo não informado',
                total_horas_trabalhadas: this.converterMinutosParaHoras(user.resumo?.total_horas_trabalhadas_minutos || user.total_horas_trabalhadas_minutos || 0),
                total_horas_extras: this.converterMinutosParaHoras(user.resumo?.total_horas_extras_minutos || user.total_horas_extras_minutos || 0),
                total_horas_faltantes: this.converterMinutosParaHoras(user.resumo?.total_horas_faltantes_minutos || user.total_horas_faltantes_minutos || 0),
                banco_horas_periodo: this.converterMinutosParaHoras(user.resumo?.banco_horas_minutos || user.banco_horas_minutos || user.banco_horas_periodo || 0),
                detalhes_dias: detalhes
              }
            })
            
            console.log(`✅ Dados normalizados: ${this.relatorioData.length} usuários`)
            console.log(`📋 Primeiro usuário completo:`, this.relatorioData[0])
          } else {
            this.relatorioData = resultado ? [resultado] : []
            console.warn('⚠️ Estrutura inesperada para "Todos"')
          }
        } else {
          // Quando usuário específico, pode ser objeto ou array com 1 item
          console.log('📊 Dados de usuário específico:', {
            tipo: typeof resultado,
            isArray: Array.isArray(resultado),
            keys: typeof resultado === 'object' ? Object.keys(resultado) : 'N/A',
            temDetalhes: !!(resultado?.detalhes_dias || resultado?.dias || resultado?.detalhes),
            quantidadeDetalhes: (resultado?.detalhes_dias || resultado?.dias || resultado?.detalhes || []).length
          })
          
          // Normalizar estrutura se necessário
          if (typeof resultado === 'object' && !Array.isArray(resultado)) {
            // Pegar dias originais
            const diasOriginais = resultado.detalhes_dias || 
                                 resultado.dias || 
                                 resultado.detalhes || 
                                 resultado.registros_dias ||
                                 resultado.days ||
                                 []
            
            console.log(`🔧 Processando ${diasOriginais.length} dias para usuário específico`)
            
            // Mapear os dias para o formato esperado
            resultado.detalhes_dias = diasOriginais.map(dia => {
              // Extrair entrada e saída das marcações
              let primeiroRegistro = '-'
              let ultimoRegistro = '-'
              let diaSemana = '-'
              
              if (dia.marcacoes && Array.isArray(dia.marcacoes) && dia.marcacoes.length > 0) {
                const primeira = dia.marcacoes[0]
                const ultima = dia.marcacoes[dia.marcacoes.length - 1]
                
                if (primeira?.entrada) {
                  primeiroRegistro = this.formatarHorario(primeira.entrada)
                }
                if (ultima?.saida) {
                  ultimoRegistro = this.formatarHorario(ultima.saida)
                }
              }
              
              // Determinar o dia da semana
              if (dia.data) {
                const date = new Date(dia.data + 'T00:00:00')
                diaSemana = date.toLocaleDateString('pt-BR', { weekday: 'long' })
              }
              
              // Determinar status
              let status = 'AUSENTE'
              if (dia.inconsistente) {
                status = 'INCOMPLETO'
              } else if (dia.total_trabalhado_minutos > 0) {
                status = 'COMPLETO'
              } else if (dia.carga_esperada_minutos === 0) {
                status = 'FOLGA'
              }
              
              return {
                data: dia.data,
                dia_semana: diaSemana,
                primeiro_registro: primeiroRegistro,
                ultimo_registro: ultimoRegistro,
                horas_esperadas_dia: this.converterMinutosParaHoras(dia.carga_esperada_minutos || 0),
                total_horas_dia: this.converterMinutosParaHoras(dia.total_trabalhado_minutos || 0),
                status: status
              }
            })
          }
          
          this.relatorioData = resultado
          console.log('✅ Dados de usuário específico processados:', this.relatorioData)
        }
        
        // Inicializar controle de visibilidade dos detalhes
        if (Array.isArray(this.relatorioData)) {
          this.detalhesVisiveis = this.relatorioData.reduce((acc, _, index) => {
            acc[index] = false
            return acc
          }, {})
        }
      } catch (error) {
        console.error('Erro ao gerar relatório:', error)
        if (error.response?.status === 403) {
          this.erro = 'Você não tem permissão para visualizar este relatório.'
        } else if (error.response?.status === 404) {
          this.erro = 'Nenhum registro encontrado para o período selecionado.'
        } else {
          this.erro = error.response?.data?.detail || 'Erro ao gerar relatório. Tente novamente.'
        }
      } finally {
        this.loading = false
      }
    },
    
    validarFiltros() {
      if (!this.filtros.dataInicio || !this.filtros.dataFim) {
        this.erro = 'Por favor, preencha as datas de início e fim.'
        return false
      }
      
      if (this.filtros.dataFim < this.filtros.dataInicio) {
        this.erro = 'A data de fim não pode ser anterior à data de início.'
        return false
      }
      
      return true
    },
    
    setPeriodo(tipo) {
      const hoje = new Date()
      let inicio = new Date(hoje)
      
      if (tipo === 'ontem') {
        inicio.setDate(inicio.getDate() - 1)
        hoje.setDate(hoje.getDate() - 1)
      } else if (tipo === 'semana') {
        inicio.setDate(inicio.getDate() - 6)
      } else if (tipo === 'mes') {
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      }
      
      this.filtros.dataInicio = inicio.toISOString().slice(0, 10)
      this.filtros.dataFim = hoje.toISOString().slice(0, 10)
    },
    
    limparFiltros() {
      const hoje = new Date().toISOString().slice(0, 10)
      this.filtros = {
        dataInicio: hoje,
        dataFim: hoje,
        usuarioId: ''
      }
      this.relatorioData = null
      this.erro = null
    },
    
    voltar() {
      this.$router.push('/home')
    },
    
    toggleDetalhes(index) {
      this.detalhesVisiveis[index] = !this.detalhesVisiveis[index]
    },
    
    formatarData(dataISO) {
      if (!dataISO) return '-'
      const [ano, mes, dia] = dataISO.split('-')
      return `${dia}/${mes}/${ano}`
    },
    
    formatarHorario(isoString) {
      if (!isoString) return '-'
      try {
        const date = new Date(isoString)
        const horas = String(date.getHours()).padStart(2, '0')
        const minutos = String(date.getMinutes()).padStart(2, '0')
        return `${horas}:${minutos}`
      } catch (e) {
        return '-'
      }
    },
    
    formatarHoras(horas) {
      if (horas === null || horas === undefined) return '00:00'
      
      const isNegativo = horas < 0
      const horasAbs = Math.abs(horas)
      const h = Math.floor(horasAbs)
      const m = Math.round((horasAbs - h) * 60)
      
      return `${isNegativo ? '-' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    },
    
    converterMinutosParaHoras(minutos) {
      if (minutos === null || minutos === undefined) return 0
      return minutos / 60 // Converte minutos para horas (decimal)
    },
    
    bancoHorasClass(horas) {
      if (!horas || horas === 0) return 'text-warning'
      return horas > 0 ? 'text-success' : 'text-danger'
    },
    
    horasTrabalhadasClass(horas) {
      if (!horas || horas === 0) return 'text-muted'
      return horas >= 8 ? 'text-success fw-bold' : 'text-warning'
    },
    
    statusBadgeClass(status) {
      const classes = {
        'COMPLETO': 'bg-success',
        'INCOMPLETO': 'bg-warning text-dark',
        'AUSENTE': 'bg-danger',
        'FOLGA': 'bg-info',
        'FERIADO': 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    },
    
    contarTotalRegistros() {
      if (!this.relatorioData) return 0
      
      if (Array.isArray(this.relatorioData)) {
        return this.relatorioData.reduce((total, usuario) => {
          return total + (usuario.detalhes_dias?.length || 0)
        }, 0)
      }
      
      return this.relatorioData.detalhes_dias?.length || 0
    },
    
    toggleDemo() {
      this.isMock = !this.isMock
      
      if (this.isMock) {
        // Ativar modo demo e gerar dados automaticamente
        this.relatorioData = this.getDadosDemonstracao()
        
        // Inicializar controle de visibilidade
        if (Array.isArray(this.relatorioData)) {
          this.detalhesVisiveis = this.relatorioData.reduce((acc, _, index) => {
            acc[index] = false
            return acc
          }, {})
        }
      } else {
        // Desativar modo demo e limpar dados
        this.relatorioData = null
        this.erro = null
      }
    },
    
    async exportarGeral(formato) {
      if (this.isMock) {
        toast.warning('Desative o modo demonstração para exportar dados reais.')
        return
      }
      
      this.exportando = true
      try {
        const usuarioId = this.filtros.usuarioId ? parseInt(this.filtros.usuarioId) : null
        
        await exportarRelatorioGeral(
          this.filtros.dataInicio,
          this.filtros.dataFim,
          formato,
          usuarioId
        )
        
        toast.success(`Relatório geral exportado em ${formato} com sucesso!`)
      } catch (error) {
        console.error('Erro ao exportar relatório geral:', error)
        
        if (error.response?.status === 403) {
          toast.error('Você não tem permissão para exportar este relatório.')
        } else if (error.response?.status === 404) {
          toast.error('Nenhum registro encontrado para exportação.')
        } else {
          toast.error(error.response?.data?.detail || 'Erro ao exportar relatório. Tente novamente.')
        }
      } finally {
        this.exportando = false
      }
    },
    
    async exportarUsuario(usuarioId, formato) {
      if (this.isMock) {
        toast.warning('Desative o modo demonstração para exportar dados reais.')
        return
      }
      
      this.exportando = true
      try {
        await exportarRelatorioGeral(
          this.filtros.dataInicio,
          this.filtros.dataFim,
          formato,
          usuarioId
        )
        
        toast.success(`Relatório do usuário exportado em ${formato} com sucesso!`)
      } catch (error) {
        console.error('Erro ao exportar relatório do usuário:', error)
        
        if (error.response?.status === 403) {
          toast.error('Você não tem permissão para exportar este relatório.')
        } else if (error.response?.status === 404) {
          toast.error('Nenhum registro encontrado para exportação.')
        } else {
          toast.error(error.response?.data?.detail || 'Erro ao exportar relatório. Tente novamente.')
        }
      } finally {
        this.exportando = false
      }
    },
    
    getDadosDemonstracao() {
      // Retorna dados fictícios para demonstração
      return [
        {
          usuario_id: 1,
          usuario_nome: 'João Silva',
          total_horas_trabalhadas: 176.5,
          total_horas_extras: 8.5,
          total_horas_faltantes: 0,
          banco_horas_periodo: 8.5,
          detalhes_dias: [
            {
              data: '2025-10-21',
              dia_semana: 'Segunda-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:30',
              horas_esperadas_dia: 8,
              total_horas_dia: 8.5,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-20',
              dia_semana: 'Domingo',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-19',
              dia_semana: 'Sábado',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-18',
              dia_semana: 'Sexta-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-17',
              dia_semana: 'Quinta-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            }
          ]
        },
        {
          usuario_id: 2,
          usuario_nome: 'Maria Santos',
          total_horas_trabalhadas: 168,
          total_horas_extras: 0,
          total_horas_faltantes: 8,
          banco_horas_periodo: -8,
          detalhes_dias: [
            {
              data: '2025-10-21',
              dia_semana: 'Segunda-feira',
              primeiro_registro: '08:15',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 7.75,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-20',
              dia_semana: 'Domingo',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-19',
              dia_semana: 'Sábado',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-18',
              dia_semana: 'Sexta-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-17',
              dia_semana: 'Quinta-feira',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 8,
              total_horas_dia: 0,
              status: 'AUSENTE'
            }
          ]
        },
        {
          usuario_id: 3,
          usuario_nome: 'Pedro Oliveira',
          total_horas_trabalhadas: 184,
          total_horas_extras: 16,
          total_horas_faltantes: 0,
          banco_horas_periodo: 16,
          detalhes_dias: [
            {
              data: '2025-10-21',
              dia_semana: 'Segunda-feira',
              primeiro_registro: '07:30',
              ultimo_registro: '18:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 9.5,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-20',
              dia_semana: 'Domingo',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-19',
              dia_semana: 'Sábado',
              primeiro_registro: '08:00',
              ultimo_registro: '12:00',
              horas_esperadas_dia: 0,
              total_horas_dia: 4,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-18',
              dia_semana: 'Sexta-feira',
              primeiro_registro: '07:45',
              ultimo_registro: '17:15',
              horas_esperadas_dia: 8,
              total_horas_dia: 8.5,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-17',
              dia_semana: 'Quinta-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            }
          ]
        },
        {
          usuario_id: 4,
          usuario_nome: 'Ana Costa',
          total_horas_trabalhadas: 160,
          total_horas_extras: 0,
          total_horas_faltantes: 0,
          banco_horas_periodo: 0,
          detalhes_dias: [
            {
              data: '2025-10-21',
              dia_semana: 'Segunda-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-20',
              dia_semana: 'Domingo',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-19',
              dia_semana: 'Sábado',
              primeiro_registro: null,
              ultimo_registro: null,
              horas_esperadas_dia: 0,
              total_horas_dia: 0,
              status: 'FOLGA'
            },
            {
              data: '2025-10-18',
              dia_semana: 'Sexta-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            },
            {
              data: '2025-10-17',
              dia_semana: 'Quinta-feira',
              primeiro_registro: '08:00',
              ultimo_registro: '17:00',
              horas_esperadas_dia: 8,
              total_horas_dia: 8,
              status: 'COMPLETO'
            }
          ]
        }
      ]
    }
  }
}
</script>

<style scoped>
.relatorio-geral-container {
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 20px;
}

.card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.92);
}

.card-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px 16px 0 0 !important;
  color: rgba(255, 255, 255, 0.95);
}

/* Título com gradiente igual ao Home e BancoHoras */
h1 {
  font-weight: 800;
  background: linear-gradient(90deg, #d4af37, #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
}

h2, h3, h4, h5, h6 {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
}

p, span, label, small {
  color: rgba(255, 255, 255, 0.9);
}

.form-control,
.form-select {
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-control:focus,
.form-select:focus {
  background: rgba(0, 0, 0, 0.35);
  border-color: #66afe9;
  box-shadow: 0 0 0 0.2rem rgba(102, 175, 233, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.form-select option {
  background: #1a242d;
  color: #fff;
}

.form-label {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.quick-range {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.quick-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.actions .btn {
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(90deg, #007bff, #0056b3);
  border: none;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(90deg, #0056b3, #004085);
}

.btn-outline-secondary {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.btn-outline-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline-warning {
  border-color: #b38600;
  color: #ffce3d;
}

.btn-outline-warning:hover {
  background: #b38600;
  color: #000;
  border-color: #b38600;
}

.btn-outline-light {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-outline-info {
  border-color: #17a2b8;
  color: #17a2b8;
}

.btn-outline-info:hover {
  background: #17a2b8;
  color: #fff;
}

.resultado-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.usuario-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.usuario-unico {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.totais-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.total-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.total-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.total-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.table {
  color: rgba(255, 255, 255, 0.92);
  margin-bottom: 0;
  background: transparent;
}

.table thead th {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.table tbody td {
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.table-striped tbody tr:nth-of-type(odd) {
  background: rgba(255, 255, 255, 0.02);
}

.table-hover tbody tr:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* Garantir que todas as células da tabela sejam transparentes */
.table > :not(caption) > * > * {
  background-color: transparent !important;
  box-shadow: none !important;
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.85rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Alertas com melhor contraste */
.alert {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
}

.alert-warning {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.15);
  border-color: rgba(220, 53, 69, 0.3);
  color: #ff6b6b;
}

.alert-info {
  background: rgba(13, 202, 240, 0.15);
  border-color: rgba(13, 202, 240, 0.3);
  color: #0dcaf0;
}

/* Botões de exportação */
.export-buttons .btn,
.export-buttons-individual .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.export-buttons-individual .btn {
  min-width: auto;
  padding: 0.375rem 0.75rem;
}

.btn-success {
  background: linear-gradient(90deg, #198754, #146c43);
  border: none;
  color: #fff;
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(90deg, #146c43, #0f5132);
}

.btn-info {
  background: linear-gradient(90deg, #0dcaf0, #0aa2c0);
  border: none;
  color: #000;
}

.btn-info:hover:not(:disabled) {
  background: linear-gradient(90deg, #0aa2c0, #087990);
  color: #fff;
}

.btn-outline-success {
  border-color: #198754;
  color: #198754;
}

.btn-outline-success:hover:not(:disabled) {
  background: #198754;
  color: #fff;
  border-color: #198754;
}

.btn-outline-info {
  border-color: #0dcaf0;
  color: #0dcaf0;
}

.btn-outline-info:hover:not(:disabled) {
  background: #0dcaf0;
  color: #000;
  border-color: #0dcaf0;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.6rem;
  }
  
  .totais-grid {
    grid-template-columns: 1fr;
  }
  
  .actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions .btn {
    width: 100%;
  }
  
  .table-responsive {
    font-size: 0.85rem;
  }
}

@media (min-width: 1400px) {
  .relatorio-geral-container {
    max-width: 1600px;
  }
}
</style>
