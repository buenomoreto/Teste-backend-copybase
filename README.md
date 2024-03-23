### Projeto Backend para Manipulação de Cobranças Recorrentes

Este projeto consiste em um código backend capaz de lidar com a manipulação de arquivos no formato xlsx ou .csv, os quais contêm dados de cobranças recorrentes. O código analisa esses arquivos, extrai os dados relevantes e os salva em uma tabela no banco de dados. Além disso, implementa duas métricas importantes: MRR (Receita Mensal Recorrente) e Churn Rate (Taxa de Cancelamento).

## Campos no model principal são:

| Campo               | Tipo      | Descrição                                   |
| :------------------ | :-------- | :------------------------------------------ |
| `quantity`          | `Int`     | Quantidade de cobranças                     |
| `chargedIntervalDays` | `Int`   | Dias de intervalo entre cobranças           |
| `start`             | `DateTime`| Data de início da cobrança                  |
| `status`            | `String`  | Estado da cobrança                          |
| `statusDate`        | `DateTime`| Data do estado da cobrança (opcional)       |
| `cancellationDate`  | `DateTime`| Data de cancelamento da cobrança (opcional) |
| `amount`            | `Float`   | Valor da cobrança                           |
| `nextCycle`         | `DateTime`| Próximo ciclo de cobrança                   |
| `userId`            | `String`  | ID do usuário relacionado à cobrança        |


## Recursos Desenvolvidos:

- Capacidade de processar arquivos nos formatos xlsx ou .csv.
- Processamento dos dados extraídos dos arquivos e sua subsequente inserção no banco de dados.
- Possibilidade de listar todos os usuários cadastrados juntamente com suas respectivas cobranças.
- Incorporação das métricas de Receita Mensal Recorrente (MRR) e Taxa de Cancelamento (Churn Rate).

## Stack utilizada:

<table>
  <tr>
    <td>NestJS</td>
    <td>Prisma</td>
    <td>Typescript</td>
    <td>SQLite</td>
  </tr>
  <tr>
    <td>9</td>
    <td>5.11</td>
    <td>5.1</td>
    <td>3</td>
  </tr>
</table>

## Como executar o projeto:

1) npm install
2) npx prisma db push
3) npm run start
3) npx prisma studio

## Documentação da API

#### Upload de Arquivo

```http
  POST /api/upload
```

| Parâmetro   | Tipo            | Descrição                           |
| :---------- | :-------------- | :---------------------------------- |
| `file`      | `.xlsx or .csv` | **Obrigatório**.    |

#### Response
```JSON
{
  "message": "Arquivo carregado com sucesso!"
}
```
#### Link para o arquivo de exemplo.
[![excel]](https://github.com/buenomoreto/Teste-backend-copybase/blob/main/mock/billings.xlsx/)

#### Retorna os calculos das métricas MRR & Churn Rate

```http
  GET /api/metrics
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `start`     | `Date`     | **Obrigatório**.Data de início do período de análise|
| `end`       | `Date`     | **Obrigatório**.Data de fim do período de análise   |

#### Response

```JSON
{
  "records": [
    {
      "month": {
        "value": 0,
        "label": "janeiro"
      },
      "mrr": {
        "total": "66389.98"
      },
      "churn": {
        "total": 0
      }
    }
  ],
  "total": "66389.98",
  "churn": {
    "total": "0.00"
  }
}
```

#### Listagem de Cobranças

```http
  GET /api/listing
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `page`      | `number`     | **Obrigatório**. Número da página para a listagem paginada. |
| `status`    | `string`     | **Obrigatório**. Retorna os itens com base no status selecionado |

#### Response
```JSON
{
  "billings": [
      {
          "id": 13386,
          "quantity": 1,
          "chargedIntervalDays": 365,
          "start": "2022-01-02T10:52:00.000Z",
          "status": "Ativa",
          "statusDate": "2022-02-13T09:33:00.000Z",
          "cancellationDate": null,
          "amount": 4750.35,
          "nextCycle": "2023-02-14T03:00:00.000Z",
          "userId": "user_10"
      },
      {
          "id": 13387,
          "quantity": 1,
          "chargedIntervalDays": 30,
          "start": "2022-08-06T02:17:00.000Z",
          "status": "Cancelada",
          "statusDate": "2022-06-14T12:36:00.000Z",
          "cancellationDate": "2022-06-14T12:36:00.000Z",
          "amount": 367.6,
          "nextCycle": "2022-08-06T03:00:00.000Z",
          "userId": "user_100"
      },
  ],
  "currentPage": "1",
  "itemsPerPage": 15
}


