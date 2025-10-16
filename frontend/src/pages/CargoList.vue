<template>
  <div class="table-responsive">
    <h2>Cargos</h2>
    <button
      class="btn btn-primary btn-sm"
      style="margin-bottom: 10px;"
      @click="$router.push('/cargo/new')"
    >
      Novo Cargo
      <i class="bi bi-briefcase"></i>
    </button>

  <table class="table table-striped table-dark table-mobile">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Empresa</th>
          <th>Carga Horária (min)</th>
          <th>Entrada Esperada (min)</th>
          <th>Saída Esperada (min)</th>
          <th>Almoço (min)</th>
          <th>Permissões</th>
          <th width="180">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cargo in cargos" :key="cargo.id">
          <td :data-label="'ID'">{{ cargo.id }}</td>
          <td :data-label="'Nome'">{{ cargo.nome }}</td>
          <td :data-label="'Empresa'">{{ cargo.empresa_id }}</td>
          <td :data-label="'Carga Horária (min)'">{{ cargo.carga_horaria_diaria_minutos }}</td>
          <td :data-label="'Entrada Esperada (min)'">{{ cargo.entrada_esperada_minutos }}</td>
          <td :data-label="'Saída Esperada (min)'">{{ cargo.saida_esperada_minutos }}</td>
          <td :data-label="'Almoço (min)'">{{ cargo.minutos_almoco_esperado }}</td>
          <td :data-label="'Permissões'">
            <ul class="mb-0">
              <li v-for="perm in cargo.permissoes" :key="perm.id">
                {{ perm.nome }}
              </li>
            </ul>
          </td>
          <td class="text-nowrap" :data-label="'Ações'">
            <div class="btn-group" role="group">
              <a
                class="btn btn-primary btn-sm"
                title="Consultar"
                @click="$router.push(`/cargo/detail/${cargo.id}`)"
              >
                <i class="bi bi-eye"></i>
              </a>
              <a
                @click="$router.push(`/cargo/edit/${cargo.id}`)"
                class="btn btn-warning btn-sm"
                title="Editar"
              >
                <i class="bi bi-pencil-square"></i>
              </a>
              <a
                @click="deleteCargo(cargo.id)"
                class="btn btn-danger btn-sm"
                title="Excluir"
              >
                <i class="bi bi-trash"></i>
              </a>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '../axios'

export default {
  name: 'CargoList',
  data() {
    return {
      cargos: []
    }
  },
  async mounted() {
    await this.fetchCargos()
  },
  methods: {
    async fetchCargos() {
      try {
        const res = await api.get('/cargos')
        this.cargos = res.data
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$router.push('/login')
        }
      }
    },
    async deleteCargo(id) {
      if (confirm('Tem certeza que deseja excluir este cargo?')) {
        try {
          await api.delete(`/cargos/${id}`)
          this.cargos = this.cargos.filter(c => c.id !== id)
        } catch (error) {
          console.error('Erro ao excluir cargo', error)
        }
      }
    }
  }
}
</script>
