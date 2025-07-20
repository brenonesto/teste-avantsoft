import { Factory, Model, Response, createServer } from 'miragejs'
import { faker } from '@faker-js/faker'

// Define the shape of our Cliente model
interface ClienteAttrs {
  info: {
    nomeCompleto: string
    detalhes: {
      email: string
      nascimento: string
    }
  },
  estatisticas: {
    vendas: [
      {
        data: string
        valor: number
      }
    ]
  }
}

interface UserAttrs {
  email: string
  password: string
}

// Create the Cliente model class
const ClienteModel = Model.extend<ClienteAttrs>({});

const UserModel = Model.extend<UserAttrs>({});

export function makeServer({ environment = 'development' }) {
  const server = createServer({
    environment,

    models: {
      cliente: ClienteModel,
      user: UserModel,
    },

    factories: {
      cliente: Factory.extend({
        info() {
          return {
            nomeCompleto: faker.person.fullName(),
            detalhes: {
              email: faker.internet.email(),
              nascimento: faker.date.birthdate().toISOString().split('T')[0],
            }
          }
        },
        estatisticas() {
          const numeroDeVendas = faker.number.int({ min: 1, max: 15 });
          const vendas = [];
          
          for (let i = 0; i < numeroDeVendas; i++) {
            vendas.push({
              data: faker.date.recent({ days: 4 }).toISOString().split('T')[0],
              valor: faker.number.int({ min: 1, max: 200 }),
            });
          }
          
          return {
            vendas,
          }
        },
      }),
    },


    routes() {  
      this.namespace = 'api'

      this.get('/clientes', (schema: any) => {
        return schema.clientes.all()
      })

      this.post('/clientes', (schema: any, request: any) => {
        const attributes = JSON.parse(request.requestBody)
        return schema.clientes.create(attributes)
      })

      this.post('/login', (schema: any, request: any) => {
        const { email, password } = JSON.parse(request.requestBody)

        const user = schema.users.findBy({ email })

        if (!user || user.password !== password) {
          return new Response(401, {}, { message: 'Invalid credentials' })
        }

        const token = "valid-token"

        return {
          token,
          user: { id: user.id, email: user.email }
        }
      })
    },

    seeds(server: any) {
      server.createList("cliente", 10)
      server.create("user", { email: 'breno@avantsoft.com', password: 'password123' })
    }
  })

  return server
}