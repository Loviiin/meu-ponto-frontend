# Ponto Frontend em Vue.js

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-42B883?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js Version"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Version"/>
  <img src="https://img.shields.io/badge/Axios-000000?style=for-the-badge&logo=axios" alt="Axios Version"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License MIT"/>
</p>

## 📖 Sobre o Projeto

Este é o frontend da aplicação de Ponto Eletrônico, construído com **Vue.js 3** e **Vite**. O objetivo principal é fornecer uma interface de usuário intuitiva e reativa para consumir a **Ponto API em Go**, que segue uma arquitetura baseada em domínios.

O frontend foi projetado para ser modular e escalável, utilizando as melhores práticas do ecossistema Vue para garantir um desenvolvimento rápido e uma manutenção simplificada.

---

## 🏛️ Conceitos Chave da Arquitetura

Inspirado na Arquitetura Orientada a Domínios do backend, o frontend adota uma arquitetura de **Camada de Serviço (ou Camada de API)**.

* **Separação de Responsabilidades**: A lógica de comunicação com a API é completamente isolada da lógica de apresentação dos componentes. Os componentes da interface de usuário (`.vue`) não sabem como a API funciona, eles apenas chamam os métodos de um "serviço".
* **Gestão de Ambientes**: A configuração do ambiente (desenvolvimento, homologação, produção) é feita de forma centralizada usando variáveis de ambiente do Vite. Isso permite alternar facilmente entre diferentes URLs de API sem alterar o código dos componentes.
* **Componentes de Arquivo Único (SFC)**: A aplicação é construída com arquivos `.vue`, que encapsulam o HTML (`<template>`), a lógica (`<script>`) e o estilo (`<style>`) de cada componente, promovendo a modularidade e a coesão.

---

## 🚀 Tecnologias Utilizadas

| Categoria      | Tecnologia                                                                                             |
| :------------- | :----------------------------------------------------------------------------------------------------- |
| **Framework** | [Vue.js 3](https://vuejs.org/)                                                |
| **Bundler** | [Vite](https://vitejs.dev/)                                                     |
| **HTTP Client**| [Axios](https://axios-http.com/)                                                     |
| **Linguagem** | JavaScript                                                                                             |
| **Gerenciador de Pacotes** | npm |

---

## ⚙️ Guia de Instalação e Execução

Siga os passos abaixo para rodar o frontend localmente.

### Pré-requisitos

* Node.js (versão 14 ou superior)
* npm ou Yarn
* O backend da Ponto API deve estar em execução em `http://localhost:8083`

### Passos

1.  **Navegue para a pasta `frontend`**
    ```bash
    cd frontend
    ```
2.  **Instale as Dependências**
    ```bash
    npm install
    ```
3.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```
    O servidor estará rodando em `http://localhost:5173` (ou em outra porta disponível).

---

## 📄 Licença

Este projeto está sob a licença MIT.
